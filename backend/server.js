const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const Groq = require("groq-sdk");
const ChatHistory = require("./models/ChatHistory");
// ==================================================
// GENERATE CHAT TITLE
// ==================================================

function generateChatTitle(message) {

    let title = message
        .trim()
        .replace(/\s+/g, " ");

    title = title.replace(
        /^i\s+(want|need|would like)\s+to\s+/i,
        ""
    );

    title = title.replace(
        /^(build|create|make|develop|deploy|host)\s+/i,
        ""
    );

    if (title.length > 45) {

        title =
            title.substring(0, 45).trim() +
            "...";

    }

    if (!title) {
        return "New Conversation";
    }

    return title.charAt(0).toUpperCase() +
        title.slice(1);

}
const authRoutes = require("./routes/authRoutes");
const recommendationRoutes =
    require("./routes/recommendationRoutes");
const chatRoutes =
    require("./routes/chatRoutes");
const {
    cloudProviders,
    getAllProviders,
    getProviderById,
    getAllServices
} = require("./data/cloudData");
const {
    serviceEquivalenceGroups,
    getEquivalenceGroups,
    getEquivalentService,
    compareEquivalentServices,
    findEquivalenceGroupForService
} = require("./data/serviceEquivalence");
const {
    pricingModelsGuide,
    costDriversByCategory,
    providerCostProfiles,
    simulationScenarios,
    calculateScenarioEstimate,
    getPricingIntelligenceData,
    getCostProfileForProvider,
    compareProviderCostProfiles
} = require("./data/pricingIntelligence");
const {
    extractCloudRequirements,
    formatRequirementsForPrompt
} = require("./data/requirementTranslator");
const {
    generateInitialFuzzyValues,
    DIMENSION_METADATA
} = require("./data/fuzzyPreferences");
const {
    detectTradeoffs
} = require("./data/tradeoffDetection");
const {
    processFuzzyRequirements
} = require("./data/fuzzyRequirementProcessor");
const {
    evaluateProvidersMCDM
} = require("./data/mcdmEngine");
const {
    generatePersonalizedRecommendation,
    compareRecommendations
} = require("./data/recommendationEngine");
const {
    getDecisionSystemGuide
} = require("./data/decisionSystemGuide");
const {
    explainAssumptions
} = require("./data/assumptionExplainer");
const {
    RequirementSlotTracker
} = require("./data/slotTracker");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


// ==================================================
// GROQ
// ==================================================

const groq = process.env.GROQ_API_KEY
    ? new Groq({
        apiKey: process.env.GROQ_API_KEY
    })
    : null;


// ==================================================
// MIDDLEWARE
// ==================================================

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use(
    "/api/recommendations",
    recommendationRoutes
);
app.use(
    "/api/chat",
    chatRoutes
);
// ==================================================
// FRONTEND
// ==================================================

const frontendPath =
    path.join(__dirname, "..", "frontend");

app.use(express.static(frontendPath));


// ==================================================
// BASIC API
// ==================================================

app.get("/api/health", (req, res) => {

    res.json({
        success: true,
        message:
            "CLOUDEx backend is running successfully.",
        status: "online"
    });

});


app.get("/api", (req, res) => {

    res.json({
        name: "CLOUDEx API",
        version: "1.0.0",
        message:
            "Explore. Compare. Build Smarter."
    });

});


// ==================================================
// CLOUD PROVIDERS
// ==================================================

app.get(
    "/api/cloud/providers",
    (req, res) => {

        try {

            res.json({
                success: true,
                count: cloudProviders.length,
                providers: getAllProviders()
            });

        } catch (error) {

            console.error(
                "Provider API error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Could not load cloud providers."
            });

        }

    }
);


// ==================================================
// SINGLE PROVIDER
// ==================================================

app.get(
    ["/api/providers/:id", "/api/cloud/providers/:id"],
    (req, res) => {

        try {

            const provider =
                getProviderById(
                    req.params.id
                );


            if (!provider) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Cloud provider not found."
                });

            }


            res.json({
                success: true,
                provider
            });

        } catch (error) {

            console.error(
                "Provider details error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Could not load provider details."
            });

        }

    }
);


// ==================================================
// ALL SERVICES
// ==================================================

app.get(
    ["/api/services", "/api/cloud/services"],
    (req, res) => {

        try {

            const services =
                getAllServices();


            res.json({
                success: true,
                count: services.length,
                services
            });

        } catch (error) {

            console.error(
                "Services API error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Could not load cloud services."
            });

        }

    }
);


// ==================================================
// SERVICE EQUIVALENCE & COMPARISON
// ==================================================

app.get("/api/services/equivalence", (req, res) => {
    try {
        res.json({
            success: true,
            groups: getEquivalenceGroups()
        });
    } catch (error) {
        console.error("Service equivalence API error:", error.message);
        res.status(500).json({
            success: false,
            message: "Could not load service equivalence groups."
        });
    }
});

app.get("/api/services/equivalence/:key", (req, res) => {
    try {
        const { key } = req.params;
        const providersQuery = req.query.providers;
        const providerIds = providersQuery
            ? providersQuery.split(",").map(p => p.trim().toLowerCase()).filter(Boolean)
            : [];

        const result = compareEquivalentServices(key, providerIds);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Equivalence group not found."
            });
        }

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error("Equivalence comparison error:", error.message);
        res.status(500).json({
            success: false,
            message: "Could not compare equivalent services."
        });
    }
});


// ==================================================
// PRICING & COST INTELLIGENCE (FEATURE #4)
// ==================================================

app.get("/api/pricing/models", (req, res) => {
    try {
        res.json({
            success: true,
            ...getPricingIntelligenceData()
        });
    } catch (error) {
        console.error("Pricing models API error:", error.message);
        res.status(500).json({
            success: false,
            message: "Could not load pricing models guide."
        });
    }
});

app.get("/api/pricing/profiles", (req, res) => {
    try {
        const providersQuery = req.query.providers;
        const providerIds = providersQuery
            ? providersQuery.split(",").map(p => p.trim().toLowerCase()).filter(Boolean)
            : [];

        const profiles = compareProviderCostProfiles(providerIds);

        res.json({
            success: true,
            count: profiles.length,
            profiles
        });
    } catch (error) {
        console.error("Pricing profiles API error:", error.message);
        res.status(500).json({
            success: false,
            message: "Could not load provider cost profiles."
        });
    }
});

app.get("/api/pricing/scenario", (req, res) => {
    try {
        const scenarioKey = req.query.scenario || "web-app";
        const providersQuery = req.query.providers;
        const providerIds = providersQuery
            ? providersQuery.split(",").map(p => p.trim().toLowerCase()).filter(Boolean)
            : [];

        const result = calculateScenarioEstimate(scenarioKey, providerIds);

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error("Scenario estimation API error:", error.message);
        res.status(500).json({
            success: false,
            message: "Could not calculate scenario cost estimates."
        });
    }
});


// ==================================================
// TRADE-OFF & CONFLICT DETECTION (FEATURE #12)
// ==================================================

app.post("/api/advisor/tradeoffs", (req, res) => {
    try {
        const { preferences, experienceMode = "beginner" } = req.body || {};
        const analysis = detectTradeoffs(preferences || {}, experienceMode);
        res.json({
            success: true,
            ...analysis
        });
    } catch (error) {
        console.error("Tradeoff detection API error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to evaluate preference trade-offs."
        });
    }
});


// ==================================================
// FUZZY REQUIREMENT PROCESSING (FEATURE #14)
// ==================================================

app.post("/api/advisor/fuzzy-process", (req, res) => {
    try {
        const {
            requirements = {},
            preferences = {},
            source = "ai_generated",
            mode = "beginner"
        } = req.body || {};

        const result = processFuzzyRequirements({
            requirements,
            preferences,
            source,
            mode
        });

        res.json(result);
    } catch (error) {
        console.error("Fuzzy requirement processing API error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to process fuzzy requirements."
        });
    }
});


// ==================================================
// MCDM-BASED CSP SELECTION (FEATURE #15)
// ==================================================

app.post("/api/advisor/mcdm", (req, res) => {
    try {
        const {
            requirements = {},
            preferences = {},
            mode = "beginner",
            tradeoffs = []
        } = req.body || {};

        const result = evaluateProvidersMCDM({
            requirements,
            preferences,
            mode,
            tradeoffs
        });

        res.json(result);
    } catch (error) {
        console.error("MCDM evaluation API error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to evaluate providers via MCDM."
        });
    }
});


// ==================================================
// PERSONALIZED FINAL RECOMMENDATION (FEATURE #16)
// ==================================================

app.post("/api/advisor/recommend", (req, res) => {
    try {
        const {
            requirements = {},
            preferences = {},
            source = "ai_generated",
            mode = "beginner",
            tradeoffs = []
        } = req.body || {};

        const recommendation = generatePersonalizedRecommendation({
            requirements,
            preferences,
            source,
            mode,
            tradeoffs
        });

        res.json(recommendation);
    } catch (error) {
        console.error("Personalized recommendation API error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to generate personalized recommendation."
        });
    }
});


// ==================================================
// COMPARE RECOMMENDATIONS (FEATURE #17)
// ==================================================

app.post("/api/advisor/compare-recommendations", (req, res) => {
    try {
        const {
            requirements = {},
            originalPreferences = {},
            updatedPreferences = {},
            mode = "beginner"
        } = req.body || {};

        const comparison = compareRecommendations({
            requirements,
            originalPreferences,
            updatedPreferences,
            mode
        });

        res.json(comparison);
    } catch (error) {
        console.error("Compare recommendations API error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to compare recommendations."
        });
    }
});


// ==================================================
// HOW CLOUDEx DECIDED EXPLAINABILITY (FEATURE #18)
// ==================================================

app.post("/api/advisor/how-decided", (req, res) => {
    try {
        const {
            requirements = {},
            preferences = {},
            source = "ai_generated",
            mode = "beginner",
            tradeoffs = []
        } = req.body || {};

        const rec = generatePersonalizedRecommendation({
            requirements,
            preferences,
            source,
            mode,
            tradeoffs
        });

        res.json(rec.howDecided);
    } catch (error) {
        console.error("How CLOUDEx Decided API error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to generate decision pipeline explainability."
        });
    }
});


// ==================================================
// UNDERSTANDING CLOUDEx DECISION SYSTEM GUIDE (FEATURE #19)
// ==================================================

app.get("/api/advisor/decision-guide", (req, res) => {
    try {
        const mode = req.query.mode || "beginner";
        const guide = getDecisionSystemGuide(mode);
        res.json(guide);
    } catch (error) {
        console.error("Decision guide API error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to load decision system guide."
        });
    }
});

app.post("/api/advisor/decision-guide", (req, res) => {
    try {
        const mode = (req.body && req.body.mode) || "beginner";
        const guide = getDecisionSystemGuide(mode);
        res.json(guide);
    } catch (error) {
        console.error("Decision guide API error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to load decision system guide."
        });
    }
});


// ==================================================
// EXPLAINABLE AI ASSUMPTIONS (FEATURE #20)
// ==================================================

app.post("/api/advisor/assumptions", (req, res) => {
    try {
        const { requirements = {}, preferences = {}, recommendation = null, mode = "beginner" } = req.body || {};
        const assumptionsReport = explainAssumptions({
            requirements,
            preferences,
            recommendation,
            mode
        });
        res.json(assumptionsReport);
    } catch (error) {
        console.error("Assumptions API error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to generate assumptions report."
        });
    }
});


// ==================================================
// OFFICIAL CSP & SERVICE LINKS (FEATURE #21)
// ==================================================

app.get("/api/official-links", (req, res) => {
    try {
        const { OFFICIAL_PROVIDERS, OFFICIAL_SERVICES } = require("./data/officialLinks");
        res.json({
            success: true,
            providers: OFFICIAL_PROVIDERS,
            services: OFFICIAL_SERVICES
        });
    } catch (error) {
        console.error("Official links API error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to load official links."
        });
    }
});


// ==================================================
// CLOUDEx AI ADVISOR
// ==================================================

app.post(
    "/api/ai/chat",
    async (req, res) => {

        try {

            const {
    message,
    conversation = [],
    userId,
    chatId,
    experienceMode: rawExperienceMode,
    userPreferences,
    isRecalculatedPreferences = false
} = req.body;


            // ------------------------------------------
            // VALIDATE EXPERIENCE MODE (FEATURE #7)
            // ------------------------------------------

            const sanitizedMode = typeof rawExperienceMode === "string"
                ? rawExperienceMode.toLowerCase().trim()
                : "beginner";

            const experienceMode = ["beginner", "intermediate", "expert"].includes(sanitizedMode)
                ? sanitizedMode
                : "beginner";


            // ------------------------------------------
            // VALIDATE MESSAGE
            // ------------------------------------------

            if (
                !message ||
                message.trim() === ""
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Please enter a message."
                });

            }


            // ------------------------------------------
            // CHECK GROQ
            // ------------------------------------------

            if (!groq) {

                return res.status(500).json({
                    success: false,
                    message:
                        "Groq API key is not configured."
                });

            }


            console.log(
                `Cloudex AI received [Mode: ${experienceMode.toUpperCase()}]:`,
                message
            );


            // ------------------------------------------
            // REAL-WORLD TO CLOUD REQUIREMENT EXTRACTION (FEATURE #6)
            // ------------------------------------------

            const extractedRequirements =
                extractCloudRequirements(
                    message,
                    conversation
                );

            const requirementContext =
                formatRequirementsForPrompt(
                    extractedRequirements
                );


            // ------------------------------------------
            // CONVERSATIONAL STAGE & MINIMUM QUESTIONS TRACKING
            // ------------------------------------------

            const priorUserMessages = Array.isArray(conversation)
                ? conversation.filter(m => m && m.role === "user")
                : [];
            const userTurnIndex = priorUserMessages.length; // 0 for Turn 1, 1 for Turn 2, 2+ for Turn 3
            const isExplicitDemand = /\b(recommend (one|now|right now|immediately)|give me (the|a) recommendation|skip questions?|stop asking)\b/i.test(message);
            const isDiscoveryStage = userTurnIndex < 2 && !isExplicitDemand && !isRecalculatedPreferences;


            // ------------------------------------------
            // INTELLIGENT SLOT TRACKING (prevents repeated questions)
            // ------------------------------------------

            const slotTracker = new RequirementSlotTracker();
            const slotSummary = slotTracker.processTurn(message, conversation, experienceMode);

            // Pick the best unresolved question to ask (only during discovery stage)
            let selectedQuestion = null;
            if (isDiscoveryStage) {
                selectedQuestion = slotTracker.selectBestUnresolvedQuestion(experienceMode);
                if (selectedQuestion) {
                    slotTracker.markSlotAsked(selectedQuestion.slotKey);
                }
            }

            // Build human-readable "known slots" list for the prompt
            const knownSlotLines = Object.values(slotSummary.knownSlots)
                .map(s => `- ${s.label}: ${s.value}`)
                .join("\n") || "None yet";
            const assumedSlotLines = Object.values(slotSummary.assumedSlots)
                .map(s => `- ${s.label}: ${s.value} (assumed)`)
                .join("\n") || "None";


            // ------------------------------------------
            // EXPERIENCE MODE DIRECTIVE (FEATURE #7)
            // ------------------------------------------

            let modePromptSection = "";
            if (experienceMode === "beginner") {
                modePromptSection = `
==================================================
CURRENT ACTIVE MODE: BEGINNER (DEFAULT)
==================================================

The user is currently interacting in BEGINNER mode.
- VOCABULARY & TONE: Speak in warm, accessible, everyday English. Strictly ZERO unexplained cloud jargon. If a technical term (such as "database", "server", "DNS", or "container") is necessary, explain it immediately with a simple everyday analogy.
- QUESTION COMPLEXITY: Ask simple, relatable questions focused on real-world objectives (what is being built, target user count, budget constraints, preference for simplicity). NEVER force technical choices or ask about vCPUs, RAM ratios, CIDR blocks, container orchestration runtimes, or IOPS.
- EXPLANATION DEPTH: Focus on ease of setup, intuitive dashboards, 1-click deployments, predictable flat monthly pricing, and generous free tiers that keep costs relatively predictable for small setups.
- RECOMMENDATION EXPLANATION: Clearly explain why the recommended cloud fits their project in plain, encouraging language, highlighting hassle-free management and cost predictability.
`;
            } else if (experienceMode === "intermediate") {
                modePromptSection = `
==================================================
CURRENT ACTIVE MODE: INTERMEDIATE
==================================================

The user is currently interacting in INTERMEDIATE mode.
- VOCABULARY & TONE: Practical, professional engineering tone. The user understands foundational cloud concepts (virtual machines, containers, managed databases, storage buckets, CDNs, git deployments). Do NOT talk down to them or explain basic terms like "what is a server" or "what is an API".
- QUESTION COMPLEXITY: Ask pragmatic architectural and operational questions: e.g., "Do you prefer managed PaaS/containers (like App Platform, Cloud Run, or ECS) or a raw Linux VM?", "What database engine and managed tier do you plan to use?", "What is your target budget and expected egress volume?".
- EXPLANATION DEPTH: Focus on operational trade-offs: managed vs unmanaged infrastructure, serverless vs persistent VMs, auto-scaling thresholds, connection pooling, and cost-to-performance efficiency.
- RECOMMENDATION EXPLANATION: Emphasize developer workflow, tooling ergonomics, API support, managed database offerings, bandwidth allocations, and cost efficiency.
`;
            } else if (experienceMode === "expert") {
                modePromptSection = `
==================================================
CURRENT ACTIVE MODE: EXPERT
==================================================

The user is currently interacting in EXPERT mode.
- VOCABULARY & TONE: High-level architectural peer dialogue. Direct, technical, and concise. No handholding, no introductory definitions, no patronizing explanations.
- QUESTION COMPLEXITY: Engage at enterprise production level: e.g., Kubernetes orchestration (EKS/GKE/AKS/bare-metal), VPC topology, peering and transit gateways, database replication topologies (read replicas, sharding, failover SLAs), multi-region active-active vs active-passive, GPU interconnects (InfiniBand/NVLink), regulatory compliance (SOC2, HIPAA, ISO27001, GDPR), and committed use / savings plans.
- EXPLANATION DEPTH: Evaluate deep technical factors: hypervisor overhead, network backplane throughput, IOPS guarantees, egress peering economics, SLA commitments (99.99%+), data sovereignty, observability/telemetry integration, and disaster recovery RTO/RPO.
- RECOMMENDATION EXPLANATION: Justify the recommendation with rigorous architectural rationale: architectural flexibility, networking performance, compliance certifications, pricing predictability at high scale, and ecosystem lock-in vs portability.
`;
            }


            // ==================================================
            // CLOUDEx AI SYSTEM PROMPT
            // ==================================================

            const systemPrompt = `
You are CLOUDEx AI.
CLOUDEx is an intelligent, adaptive cloud decision assistant and architecture advisor.
Your job is to engage in an insightful, consultative conversation with users, understand what they are building, assess their technical context and constraints, and recommend the optimal cloud provider and architecture from our curated catalog of 15 Cloud Service Providers.
You are a consultative cloud advisor, not a rigid questionnaire.

${modePromptSection}

==================================================
BEGINNER-FIRST ARCHITECTURAL PRINCIPLES (FEATURE #6)
==================================================
A user with little or no cloud computing knowledge MUST be able to receive a clear, useful recommendation without anxiety or confusion.
The user should NEVER need to understand:
- VM instance types, vCPU/RAM ratios, or bare metal
- Kubernetes, container orchestration, pods, or clusters
- Complex cloud architectures, VPCs, subnets, CIDR blocks, or NAT gateways
- Database storage engines or SQL vs NoSQL internals
- GPU driver architectures or provisioned IOPS
- Technical CSP differentiation fine print

Understand real-world requirements first:
1. What are you trying to build or host? (e.g. personal site, student project, mobile backend)
2. Who will use it / how many people? (e.g. just me, classmates, hundreds, or thousands)
3. Roughly how much usage/traffic do you expect?
4. What matters most to you? (e.g. lowest cost, simplicity/easy setup, fast performance, AI capability, European privacy)
NEVER force technical choices upfront. Ask simple, relatable questions about what they want to achieve.

==================================================
BEGINNER-FRIENDLY EXPLANATIONS
==================================================
When a technical concept is necessary to explain a choice:
- Explain it briefly in plain language before asking them to choose.
- If the user says: "I don't know anything about cloud. I just need somewhere to put my website", warmly reassure them:
  "No problem at all! You don't need any cloud computing knowledge to get your site online. Think of cloud hosting simply as a computer connected to the internet 24/7 that serves your website whenever someone visits your link."
  Then proceed with gentle, simple questions.

==================================================
TRANSPARENT ASSUMPTIONS (FEATURE #6)
==================================================
If you make a reasonable assumption because the user did not specify details:
- Explicitly identify it in your recommendation!
- Disclose any active assumptions clearly in the final recommendation under an "📌 ASSUMPTIONS MADE:" note.
- Do NOT invent precise numbers. Do NOT pretend an assumption came from the user.

==================================================
INTELLIGENT "I DON'T KNOW" HANDLING (FEATURE #8)
==================================================
A user with no cloud knowledge must NEVER get stuck simply because they do not know the answer to a question.
Recognize and gracefully handle user expressions of uncertainty, delegation, or confusion:
- Uncertainty: "I don't know.", "Not sure.", "I have no idea.", "Dunno", "Not certain", "Haven't decided".
- Delegation: "You decide.", "Can you choose?", "You pick.", "Up to you.", "Choose for me."
- Best Default: "Whatever is best.", "Whatever you think.", "Whatever works best.", "Whatever you recommend."
- Confusion: "I don't understand.", "What does that mean?", "I don't know what that means.", "Can you explain?"

STRICT OPERATIONAL RULES:
1. ZERO REPETITIVE QUESTIONING LOOP: When a user says "I don't know", "Not sure", "You decide", or "Whatever is best", NEVER ask the same question again. NEVER force or demand a choice. Acknowledge warmly: "No problem at all!", "Leave that to me.", or "That is completely fine."
2. ADOPT & CLEARLY DISCLOSE SAFE ASSUMPTIONS: Make a reasonable assumption based on their workload context, clearly disclose it (e.g. "No problem! Since this sounds like a college project, I'll initially treat cost as fairly important."), and advance the conversation forward.
3. EXPLAIN & OFFER SIMPLE CHOICES IF AN ASSUMPTION IS NOT SAFE: If the user expresses confusion ("I don't understand what that means"), explain in plain language with a simple everyday analogy and offer 2 simple non-technical choices without forcing technical jargon.
4. PRESERVE ALL PREVIOUSLY LEARNED CONTEXT: An uncertain or unknown response must NEVER overwrite, reset, or ignore previously established requirements.

${requirementContext}

==================================================
STRICT CONVERSATIONAL MEMORY & ZERO REDUNDANCY
==================================================
Maintain active context across all conversation turns:
- Read every prior message carefully. NEVER ask for information the user has already provided or implied.
- If the user provides several details at once, warmly acknowledge what you have learned and ask ONLY about the 1–2 remaining critical missing variables.

==================================================
FOCUSED QUESTION BUDGET (MAX 1–2 PER TURN)
==================================================
- Ask a MAXIMUM of 1–2 simple questions in any single response. Never overwhelm the user with a questionnaire.
- Always provide helpful, concrete examples or options when asking a question.
- Always validate choices like "I'm not sure", "Whatever is simplest/cheapest", or "I haven't decided yet".

==================================================
OBJECTIVE 15-CSP CLOUD INTELLIGENCE
==================================================
Evaluate all 15 cloud service providers objectively. Never reflexively default only to the Big 3 (AWS, Azure, GCP) if a specialized or developer-friendly cloud is a significantly better fit:

1. Amazon Web Services (AWS) — Unmatched service breadth and ecosystem depth. Ideal for large enterprises and complex microservices. Watch out for NAT gateway and high outbound egress costs.
2. Microsoft Azure — Premier enterprise ecosystem for organizations invested in Active Directory, Windows Server, SQL Server, and enterprise Azure OpenAI services.
3. Google Cloud Platform (GCP) — Industry leader for data analytics (BigQuery), Kubernetes (GKE), modern container hosting (Cloud Run), and Vertex AI.
4. Oracle Cloud Infrastructure (OCI) — Aggressive price-to-performance, industry-best Always Free tier (4 ARM vCPUs, 24GB RAM, 200GB storage), ultra-low database license fees, and very cheap data egress.
5. IBM Cloud — Enterprise-grade hybrid cloud, financial services compliance, enterprise Red Hat OpenShift integration, and bare-metal systems.
6. DigitalOcean — The gold standard for developer simplicity, early-stage SaaS, startups, and SMBs. Predictable flat monthly droplets, managed databases, App Platform, and included bandwidth.
7. Alibaba Cloud — Top provider for mainland China operations, Asia-Pacific cross-border ecommerce, and regional expansion across Southeast Asia.
8. Huawei Cloud — Cost-effective enterprise cloud with deep regional coverage across Asia, Latin America, Africa, and government digitization projects.
9. Tencent Cloud — Purpose-built excellence for online gaming, ultra-low-latency audio/video streaming, media transcoding, and APAC consumer applications.
10. Vultr — Global high-performance cloud compute, bare metal, unmanaged GPUs, and flat hourly/monthly rates with 32+ global datacenter locations for tech-savvy teams.
11. Hetzner Cloud — Unbeatable price-to-performance ratio in Europe (and US locations), rock-solid flat monthly server pricing, and 20TB free bandwidth per server. Perfect for bootstrapped startups and cost-conscious builders.
12. OVHcloud — European data sovereignty leader, strict GDPR compliance, unmetered public bandwidth on most tiers, and transparent private cloud infrastructure.
13. Cloudflare — Modern edge-native platform with ZERO outbound egress fees ($0 on R2 Storage & Workers), sub-millisecond edge latency, Pages, and serverless edge compute.
14. Akamai Cloud (Linode) — Blends global edge CDN and security distribution with simple, developer-friendly Linode compute and generous pooled bandwidth.
15. CoreWeave — Modern Kubernetes-native GPU cloud engineered specifically for high-throughput AI model training, LLM fine-tuning, and massive batch visual rendering.

==================================================
BUDGET & EGRESS REALISM
==================================================
- Budget is a primary architectural constraint. Never invent live quotes or exact real-time prices.
- Reference general cost behaviors (e.g. predictable flat bundles vs metered on-demand, egress charges, managed service overhead).
- Prefer a cohesive single-provider solution unless multi-cloud delivers undeniable advantages.

==================================================
PROGRESSIVE CONVERSATIONAL FLOW & QUESTION STRATEGY
==================================================
${isDiscoveryStage ? `
CRITICAL DIRECTIVE — MANDATORY DISCOVERY STAGE (User Turn ${userTurnIndex + 1} of minimum 2 questions)
CLOUDEx MUST ASK AT LEAST 2 MEANINGFUL QUESTIONS BEFORE GIVING A FINAL RECOMMENDATION.
THIS STRICTLY APPLIES ACROSS ALL THREE MODES: BEGINNER, INTERMEDIATE, AND EXPERT!

Current Turn: ${userTurnIndex + 1}.
UNDER NO CIRCUMSTANCES SHOULD YOU OUTPUT "🥇 MY RECOMMENDATION" OR "MY PICK" ON THIS TURN!

==================================================
WHAT CLOUDEx ALREADY KNOWS (DO NOT ASK ABOUT THESE):
==================================================
${knownSlotLines}

ALREADY ASSUMED (DO NOT ASK ABOUT THESE EITHER):
${assumedSlotLines}

==================================================
YOUR ONLY TASK ON THIS TURN:
==================================================
${selectedQuestion ? `
1. Warmly acknowledge the user's message and summarize what you have learned so far in 1–2 natural sentences.
2. Ask ONLY this ONE targeted question — it is the highest-impact missing piece of information:

   "${selectedQuestion.questionText}"

   (This question is about: ${selectedQuestion.slotLabel})

3. DO NOT ask about any of the "ALREADY KNOWN" or "ALREADY ASSUMED" items listed above.
4. DO NOT ask more than 1–2 questions total in this turn.
5. DO NOT output "🥇 MY RECOMMENDATION" or "MY PICK" under ANY circumstances on this turn.
6. Keep your response conversational, warm, and concise — not a long report.
` : `
1. Warmly acknowledge what the user is building and summarize what you understand so far.
2. All key information slots appear to be resolved or assumed. Ask 1 brief clarifying question about the user's preferred setup or any remaining uncertainty.
3. DO NOT output "🥇 MY RECOMMENDATION" or "MY PICK" on this turn.
`}
` : `
CURRENT STAGE: RECOMMENDATION READY (Turn ${userTurnIndex + 1})
At least 2 meaningful questions have been asked and answered across the dialogue.
You may now present the tailored final recommendation concisely using the structured format below.
`}


${isDiscoveryStage ? `
==================================================
MANDATORY CONVERSATION RULE FOR THIS TURN:
==================================================
You are currently in the Discovery Stage (Question ${userTurnIndex + 1} of at least 2 required questions).
You MUST ask a focused clarifying question to understand their needs better.
DO NOT provide any recommendation or provider selection yet.
DO NOT use the words "🥇 MY RECOMMENDATION" or "MY PICK" in this response.
` : `
==================================================
WHEN TO RECOMMEND
==================================================
- Transition cleanly: "I now have enough details to provide a clear, tailored recommendation for your project."
- Deliver the structured recommendation concisely.

==================================================
STRUCTURED RECOMMENDATION FORMAT
==================================================
When presenting your final recommendation, you MUST follow this structured format so that the user interface can parse and display interactive exploration and comparison controls:

🥇 MY RECOMMENDATION

[Exact Provider Name, e.g. Hetzner Cloud, DigitalOcean, AWS, Google Cloud, Cloudflare, Oracle Cloud, Vultr, etc.]

FIT SCORE: [Score from 7.0 to 9.8] / 10

WHY THIS PROVIDER FITS YOUR PROJECT

[One concise sentence directly connecting the user's real-world requirement to the recommendation.]

- 🎯 [User Real-World Goal] → [Provider Capability] → [Why it benefits their project in plain language]
- 💰 [Cost/Budget Context] → [Provider Pricing Model] → [Why it keeps costs relatively predictable for small setups]
- ⚙️ [Simplicity Context] → [Provider Service/Tool] → [Why it makes setup and management easy]
- 🚀 [Future Growth] → [Scalability Feature] → [Why they won't need to rebuild as they grow]

[If any assumptions were made, include a transparent note:]
📌 ASSUMPTIONS MADE:
- [Clear statement of any assumption made, e.g. "I assumed small-to-moderate traffic typical of an academic project with a student budget."]

WHY NOT THE OTHERS?

[Alternative Provider Name] — [One specific, candid reason why it was secondary for this exact workload in simple language].
[Second Alternative Provider Name] — [One specific, candid reason why it was secondary].

MY PICK

I recommend [Exact Provider Name] because it delivers the optimal balance of [key benefit 1], [key benefit 2], and [key benefit 3] for your specific project.
`}

Think technically. Speak simply. Be an empathetic, practical decision partner.
`;


            // ==================================================
            // BUILD CONVERSATION (SLIDING WINDOW)
            // ==================================================

            const messages = [
                {
                    role: "system",
                    content: systemPrompt
                }
            ];

            // Keep only the most recent conversation messages (last 8 messages = 4 turns)
            // to stay safely below provider token limits while preserving immediate context.
            // Full conversational requirements are already accumulated and preserved in requirementContext.
            const recentConversation = Array.isArray(conversation)
                ? conversation.filter(item => item && (item.role === "user" || item.role === "assistant") && typeof item.content === "string").slice(-8)
                : [];

            recentConversation.forEach(item => {
                // Prevent past massive card text bloat from exceeding prompt budget
                const content = item.content.length > 800
                    ? item.content.substring(0, 800) + "..."
                    : item.content;

                messages.push({
                    role: item.role,
                    content
                });
            });

            messages.push({
                role: "user",
                content: message.trim()
            });


            // ==================================================
            // GROQ REQUEST
            // ==================================================

            const completion =
                await groq.chat.completions.create({
                    messages,
                    model: "openai/gpt-oss-120b",
                    temperature: 0.4,
                    max_tokens: 1200
                });


            // ==================================================
            // GET RESPONSE
            // ==================================================

            const reply =
                completion
                    .choices?.[0]
                    ?.message
                    ?.content ||

                "I couldn't generate a response right now.";


            // ==================================================
            // UPDATED CONVERSATION
            // ==================================================

            const updatedConversation = [

                ...conversation,

                {
                    role: "user",
                    content:
                        message.trim()
                },

                {
                    role: "assistant",
                    content:
                        reply
                }

            ];
           // ==================================================
// SAVE CHAT HISTORY
// ==================================================

if (userId && chatId) {

    const chat = await ChatHistory.findOne({
        _id: chatId,
        userId: userId
    });

    if (chat) {

        // ------------------------------------------
        // SAVE MESSAGES
        // ------------------------------------------

        chat.messages.push(
            {
                role: "user",
                content: message.trim()
            },
            {
                role: "assistant",
                content: reply
            }
        );


        // ------------------------------------------
        // CREATE TITLE FROM FIRST USER MESSAGE
        // ------------------------------------------

        if (
            !chat.title ||
            chat.title === "New Conversation"
        ) {

            chat.title =
                generateChatTitle(
                    message
                );

        }


        // ------------------------------------------
        // SAVE CHAT
        // ------------------------------------------

        await chat.save();


        console.log(
            "Chat saved:",
            chat.title
        );


    } else {

        console.log(
            "Chat not found or does not belong to user."
        );

    }

}

            // ==================================================
            // INITIAL FUZZY PREFERENCES (FEATURE #9 & #11)
            // ==================================================

            const baseFuzzyPreferences =
                generateInitialFuzzyValues(
                    extractedRequirements,
                    message
                );

            const fuzzyPreferences = (isRecalculatedPreferences && userPreferences && typeof userPreferences === "object")
                ? { ...baseFuzzyPreferences, ...userPreferences }
                : baseFuzzyPreferences;


            // ==================================================
            // TRADE-OFF & CONFLICT DETECTION (FEATURE #12)
            // ==================================================

            const tradeoffAnalysis =
                detectTradeoffs(
                    fuzzyPreferences,
                    experienceMode
                );


            // ==================================================
            // FUZZY REQUIREMENT PROCESSING (FEATURE #14)
            // ==================================================

            const fuzzyRequirements =
                processFuzzyRequirements({
                    requirements: extractedRequirements,
                    preferences: fuzzyPreferences,
                    source: isRecalculatedPreferences ? "user_updated" : "ai_generated",
                    mode: experienceMode
                });


            // ==================================================
            // MCDM-BASED CSP SELECTION (FEATURE #15)
            // ==================================================

            const mcdmResult =
                evaluateProvidersMCDM({
                    preferences: fuzzyPreferences,
                    requirements: extractedRequirements,
                    tradeoffs: tradeoffAnalysis.tradeoffs,
                    mode: experienceMode
                });


            // ==================================================
            // PERSONALIZED FINAL RECOMMENDATION (FEATURE #16)
            // ==================================================

            const recommendation =
                generatePersonalizedRecommendation({
                    requirements: extractedRequirements,
                    preferences: fuzzyPreferences,
                    source: isRecalculatedPreferences ? "user_updated" : "ai_generated",
                    mode: experienceMode,
                    tradeoffs: tradeoffAnalysis.tradeoffs
                });


            // ==================================================
            // PROGRESSIVE RECOMMENDATION READINESS
            // ==================================================

            const hasMinimumQuestions = userTurnIndex >= 2 || isExplicitDemand;
            const isRecommendationText = /(?:🥇\s*)?my recommendation|my pick\b/i.test(reply);
            const isRecommendationReady = (isRecommendationText && hasMinimumQuestions) || Boolean(isRecalculatedPreferences);


            // ==================================================
            // RESPONSE
            // ==================================================

            res.json({

                success: true,

                reply,

                conversation:
                    updatedConversation,

                requirements:
                    extractedRequirements,

                experienceMode,

                fuzzyPreferences,

                tradeoffs: tradeoffAnalysis,

                fuzzyRequirements,

                mcdm: mcdmResult,

                recommendation,

                isRecommendationReady,

                isRecalculatedPreferences: Boolean(isRecalculatedPreferences),

                userTurnIndex,

                hasMinimumQuestions,

                isDiscoveryStage: !hasMinimumQuestions && !isRecalculatedPreferences,

                slotSummary,

                selectedQuestion

            });


        } catch (error) {
            console.error(
                "AI Advisor error:",
                error.status || error.code || "",
                error.message
            );

            const isTooLarge = error.status === 413 || (error.message && (error.message.includes("413") || error.message.includes("too large") || error.message.includes("Request too large")));
            const isRateLimit = error.status === 429 || (error.message && (error.message.includes("429") || error.message.includes("rate limit") || error.message.includes("Rate limit")));

            let userFriendlyMessage = "Cloudex AI could not process your request at this moment. Please try again.";
            let statusCode = 500;

            if (isTooLarge) {
                statusCode = 413;
                userFriendlyMessage = "Your message or conversation history exceeded the AI request limit. Please start a new chat or shorten your message.";
            } else if (isRateLimit) {
                statusCode = 429;
                userFriendlyMessage = "The AI service is temporarily experiencing high traffic. Please wait a moment and try again.";
            }

            res.status(statusCode).json({
                success: false,
                message: userFriendlyMessage,
                errorType: isTooLarge ? "token_limit_exceeded" : (isRateLimit ? "rate_limit" : "ai_provider_error")
            });
        }

    }
);


// ==================================================
// FRONTEND FALLBACK
// ==================================================

app.get(
    "*splat",
    (req, res) => {

        res.sendFile(

            path.join(
                frontendPath,
                "index.html"
            )

        );

    }
);


// ==================================================
// MONGODB
// ==================================================

const startServer = async () => {

    try {

        if (process.env.MONGO_URI) {

            await mongoose.connect(
                process.env.MONGO_URI
            );


            console.log(
                "MongoDB connected successfully."
            );

        } else {

            console.log(
                "MongoDB URI not configured yet."
            );


            console.log(
                "Starting CLOUDEx in frontend/demo mode."
            );

        }


        app.listen(
            PORT,
            () => {

                console.log(
                    "----------------------------------------"
                );

                console.log(
                    "       CLOUDEx Backend Started"
                );

                console.log(
                    "----------------------------------------"
                );

                console.log(
                    `Local URL: http://localhost:${PORT}`
                );

                console.log(
                    `API URL:   http://localhost:${PORT}/api`
                );

                console.log(
                    "----------------------------------------"
                );

            }
        );


    } catch (error) {

        console.error(
            "MongoDB connection failed:"
        );


        console.error(
            error.message
        );


        console.log(
            "Starting server without MongoDB..."
        );


        app.listen(
            PORT,
            () => {

                console.log(
                    `CLOUDEx running at http://localhost:${PORT}`
                );

            }
        );

    }

};


startServer();