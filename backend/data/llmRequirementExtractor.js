/**
 * CLOUDEx - LLM-assisted requirement extraction
 *
 * Complements the rule-based extraction in slotTracker.js: asks the model to
 * read the user's latest message (plus the question it answers) and return the
 * requirement slots it states or clearly implies, as JSON. Results only fill
 * gaps in the slot state; explicit rule-based values always win.
 *
 * Fails soft: any error, timeout or malformed output returns {} so the Advisor
 * keeps working on rule-based extraction alone. Disable with
 * ADVISOR_LLM_EXTRACTION=off.
 */

const { SLOT_DEFINITIONS } = require("./slotTracker");

const EXTRACTION_MODEL = process.env.ADVISOR_EXTRACTION_MODEL || "openai/gpt-oss-120b";
const DEFAULT_TIMEOUT_MS = 8000;

// Canonical values so downstream code (fuzzy preferences, prompt) sees consistent text.
const LEVEL_VALUES = {
    budgetSensitivity: {
        very_high: "Cost Priority: Very High (Free Tier / Sub-$10 Preferred)",
        high: "Cost Priority: Very High (Free Tier / Sub-$10 Preferred)",
        moderate: "Cost Priority: Moderate ($25-$200/mo)",
        flexible: "Cost Priority: Flexible / Enterprise"
    },
    availabilityNeeds: {
        high: "High (24/7, minimal downtime)",
        standard: "Standard (occasional downtime acceptable)"
    },
    simplicityPreference: {
        high: "High (Beginner / Zero-DevOps Preferred)",
        moderate: "Moderate (Developer Control)",
        low: "Low (Advanced / Custom Infrastructure)"
    }
};

const SLOT_GUIDE = {
    workloadType: "what is being built, e.g. 'E-commerce Web Application', 'Mobile App Backend', 'Static Website / Frontend', 'AI / Machine Learning Application', 'Backend API / Microservices', 'Web Application / Full-Stack'",
    projectPurpose: "'College / Academic Project', 'Personal / Hobby Project', 'Business / Startup (commercial)' or 'Production / Enterprise'",
    expectedUsers: "approximate number of users, e.g. 'approximately 500 users' (keep the user's number; never invent one)",
    trafficPattern: "'Steady / predictable' or 'Spiky / seasonal peaks'",
    concurrentUsers: "users active at the same moment, only if stated",
    userAccounts: "whether users log in: 'Yes (...)' or 'None (...)'",
    databaseNeeds: "whether data must be stored: 'Yes (...)' or 'None (...)'",
    databaseType: "specific database engine if named",
    storageNeeds: "disk/storage volume if stated",
    fileStorageNeeds: "whether users upload files/media: 'Yes (...)' or 'None (...)'",
    aiGpuNeeds: "'Dedicated GPU Acceleration' or 'External AI API Integration Only (CPU sufficient)'",
    geographicNeeds: "main region of users, e.g. 'Europe', 'India / South Asia', 'North America'",
    complianceNeeds: "legal/compliance needs, e.g. 'GDPR / Data residency', or 'None (standard best practice)'",
    availabilityNeeds: "level: 'high' (24/7, no downtime) or 'standard'",
    budgetSensitivity: "level: 'very_high' (cost must be low/limited budget), 'moderate', or 'flexible'",
    simplicityPreference: "level: 'high' (wants simple/managed), 'moderate' (wants some control), or 'low' (wants full custom infra)",
    technicalPreference: "how much server management they accept, only if stated",
    deploymentPreference: "deployment method if stated (git deploys, Docker, VMs)",
    architecturePreference: "monolith / microservices / serverless if stated"
};

function withTimeout(promise, ms) {
    let timer;
    return Promise.race([
        promise,
        new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("LLM extraction timeout")), ms); })
    ]).finally(() => clearTimeout(timer));
}

function parseJsonObject(text) {
    if (typeof text !== "string") return null;
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end <= start) return null;
    try {
        return JSON.parse(text.slice(start, end + 1));
    } catch (e) {
        return null;
    }
}

function normalizeSlots(raw) {
    const out = {};
    if (!raw || typeof raw !== "object") return out;
    const slots = raw.slots && typeof raw.slots === "object" ? raw.slots : raw;
    Object.keys(slots).forEach((key) => {
        if (!SLOT_DEFINITIONS[key]) return;
        const entry = slots[key];
        let value = null;
        let evidence = null;
        let confidence = 0.8;
        if (typeof entry === "string") {
            value = entry;
        } else if (entry && typeof entry === "object") {
            value = typeof entry.value === "string" ? entry.value : (typeof entry.level === "string" ? entry.level : null);
            evidence = typeof entry.evidence === "string" ? entry.evidence : null;
            if (typeof entry.confidence === "number") confidence = entry.confidence;
        }
        if (!value || /^(?:unknown|null|none mentioned|not (?:stated|mentioned|specified)|n\/a)$/i.test(value.trim())) return;
        if (confidence < 0.6) return;
        const levelMap = LEVEL_VALUES[key];
        if (levelMap) {
            const lvl = value.toLowerCase().trim().replace(/[\s-]+/g, "_");
            if (levelMap[lvl]) value = levelMap[lvl];
        }
        out[key] = { value, evidence, confidence };
    });
    return out;
}

/**
 * @param {object} groq        Groq client
 * @param {object} args        { message, lastAssistantMessage }
 * @returns {Promise<object>}  { slotKey: { value, evidence, confidence } }
 */
async function extractRequirementsWithLLM(groq, { message, lastAssistantMessage = "" } = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
    if (!groq || typeof message !== "string" || !message.trim()) return {};
    if (String(process.env.ADVISOR_LLM_EXTRACTION || "").toLowerCase() === "off") return {};

    const guide = Object.keys(SLOT_GUIDE).map((k) => `- ${k}: ${SLOT_GUIDE[k]}`).join("\n");
    const system = `You extract cloud-hosting requirements from ONE user message for a cloud advisor.
Return ONLY a JSON object of the form {"slots": {"<slotKey>": {"value": "...", "evidence": "<exact words from the message>", "confidence": 0.0-1.0}}}.
Rules:
- Include a slot ONLY if the user's message states it or clearly implies it. Omit everything else.
- If the message is a short answer, interpret it as an answer to the advisor's previous question.
- "I don't know", "not sure", "you decide" are NOT values: omit the slot.
- Never invent numbers. Keep the user's own numbers.
Slot keys:
${guide}`;

    const user = `Advisor's previous message (context only):\n"""${String(lastAssistantMessage || "").slice(0, 600)}"""\n\nUser message to extract from:\n"""${message.slice(0, 2000)}"""`;

    try {
        const completion = await withTimeout(
            groq.chat.completions.create({
                model: EXTRACTION_MODEL,
                messages: [
                    { role: "system", content: system },
                    { role: "user", content: user }
                ],
                temperature: 0,
                max_tokens: 700,
                reasoning_effort: "low"
            }),
            timeoutMs
        );
        const text = completion && completion.choices && completion.choices[0] && completion.choices[0].message
            ? completion.choices[0].message.content
            : "";
        return normalizeSlots(parseJsonObject(text));
    } catch (error) {
        console.warn("LLM requirement extraction skipped:", error.message);
        return {};
    }
}

module.exports = {
    extractRequirementsWithLLM,
    normalizeSlots
};
