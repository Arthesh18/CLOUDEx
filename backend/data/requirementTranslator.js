/**
 * CLOUDEx - Real-World to Cloud Requirement Translation Layer
 * Feature #6: Beginner-First Recommendation (Core)
 */

function extractCloudRequirements(message = "", conversation = []) {
    // Combine all user messages from conversation plus current message to build complete context
    const userTexts = [];
    if (Array.isArray(conversation)) {
        conversation.forEach(item => {
            if (item && item.role === "user" && typeof item.content === "string") {
                userTexts.push(item.content);
            }
        });
    }
    if (typeof message === "string" && message.trim()) {
        userTexts.push(message.trim());
    }

    const fullText = userTexts.join(" \n ");
    const lower = fullText.toLowerCase();

    const req = {
        workloadType: null,
        projectPurpose: null,
        expectedScale: null,
        traffic: null,
        budgetSensitivity: null,
        simplicityPreference: null,
        databaseNeeds: null,
        storageNeeds: null,
        aiGpuNeeds: null,
        geographicNeeds: null,
        complianceNeeds: null,
        assumptions: []
    };

    // 1. Workload Type
    if (lower.match(/\b(ai|gpu|gpus|machine learning|deep learning|llm|pytorch|tensorflow|cuda|model training|inference)\b/i)) {
        req.workloadType = "AI / Machine Learning Application";
    } else if (lower.match(/\b(game server|gaming|streaming|audio|video streaming|websocket|realtime)\b/i)) {
        req.workloadType = "Real-Time / Media / Gaming";
    } else if (lower.match(/\b(static site|static website|portfolio|html|css|landing page|documentation|blog)\b/i) && !lower.match(/\b(backend|database|postgres|mysql|mongo|node|api)\b/i)) {
        req.workloadType = "Static Website / Frontend";
    } else if (lower.match(/\b(api|rest api|graphql|fastapi|backend|microservices|endpoints)\b/i) && !lower.match(/\b(frontend|ui|website)\b/i)) {
        req.workloadType = "Backend API / Microservices";
    } else if (lower.match(/\b(mobile app|mobile backend|flutter|react native|ios|android)\b/i)) {
        req.workloadType = "Mobile App Backend";
    } else if (lower.match(/\b(website|web app|webapp|web application|college project|college website|portal|store|ecommerce|shop|react|node|vue|django|flask|express)\b/i)) {
        req.workloadType = "Web Application / Full-Stack";
    }

    // 2. Project Purpose
    if (lower.match(/\b(college|student|university|school|assignment|coursework|semester|thesis|class project|final year)\b/i)) {
        req.projectPurpose = "College / Academic Project";
    } else if (lower.match(/\b(portfolio|personal|hobby|side project|experiment|for fun|testing|learning)\b/i)) {
        req.projectPurpose = "Personal / Hobby Project";
    } else if (lower.match(/\b(startup|saas|mvp|business|client|commercial|product launch|e-commerce|store)\b/i)) {
        req.projectPurpose = "Startup / MVP";
    } else if (lower.match(/\b(enterprise|corporate|production|high availability|mission critical|large business)\b/i)) {
        req.projectPurpose = "Production / Enterprise";
    }

    // 3. Expected Scale & Traffic
    const trafficNumberMatch = lower.match(/(\d+(?:,\d+)?|\d+k|\d+m)\s*(?:people|users|visitors|hits|requests|students|daily|monthly)/i);
    if (trafficNumberMatch) {
        req.traffic = trafficNumberMatch[0];
    }

    if (lower.match(/\b(thousands|10k|50k|100k|million|millions|heavy traffic|high traffic|huge traffic|viral)\b/i)) {
        req.expectedScale = "High / Large Scale";
    } else if (lower.match(/\b(hundreds|500|moderate|classmates|college campus|few hundred|small to medium)\b/i) || (req.traffic && req.traffic.includes("500"))) {
        req.expectedScale = "Low to Moderate (~100s of users)";
    } else if (lower.match(/\b(just me|few friends|testing|demo|very small|portfolio|small project)\b/i)) {
        req.expectedScale = "Very Low / Small (~few users)";
    }

    // 4. Budget Sensitivity
    if (lower.match(/\b(cheap|very little budget|little budget|limited budget|tight budget|low budget|lowest cost|free tier|free|student budget|don't want to spend much|not much|minimum cost|\$0|\$5|\$10|\$15|\$20)\b/i)) {
        req.budgetSensitivity = "High (Very Low Budget / Free-Tier Preferred)";
    } else if (lower.match(/\b(reasonable|moderate budget|fair price|\$50|\$100)\b/i)) {
        req.budgetSensitivity = "Moderate";
    } else if (lower.match(/\b(budget is not an issue|unlimited budget|enterprise budget|flexible budget|cost is not a factor)\b/i)) {
        req.budgetSensitivity = "Flexible / Enterprise";
    }

    // 5. Simplicity Preference
    if (lower.match(/\b(don't know anything about cloud|no cloud experience|beginner|new to cloud|somewhere to put my website|simple|simplest|easy|no devops|automated|keep it simple)\b/i)) {
        req.simplicityPreference = "High (Beginner / Zero-DevOps Preferred)";
    } else if (lower.match(/\b(vps|virtual server|docker|ssh|linux|full control|developer)\b/i)) {
        req.simplicityPreference = "Moderate (Developer Control)";
    } else if (lower.match(/\b(kubernetes|k8s|terraform|custom vpc|multi-cloud|infrastructure as code)\b/i)) {
        req.simplicityPreference = "Low (Advanced / Custom Infrastructure)";
    }

    // 6. Database Needs
    if (lower.match(/\b(no database|static only|no data|just html)\b/i)) {
        req.databaseNeeds = "None (Static Content Only)";
    } else if (lower.match(/\b(database|db|postgres|postgresql|mysql|mongodb|nosql|sqlite|store data|user accounts|logins|auth|users save)\b/i)) {
        req.databaseNeeds = "Yes (Managed or Integrated Database)";
    }

    // 7. AI / GPU Needs
    if (lower.match(/\b(gpu|gpus|cuda|model training|fine-tuning|llm training|a100|h100|dedicated gpu)\b/i)) {
        req.aiGpuNeeds = "Dedicated GPU Acceleration";
    } else if (lower.match(/\b(openai|groq|anthropic|api calls|ai api|external model)\b/i)) {
        req.aiGpuNeeds = "External AI API Integration Only (CPU sufficient)";
    } else if (lower.match(/\b(no ai|not ai|standard app)\b/i)) {
        req.aiGpuNeeds = "None";
    }

    // 8. Geographic Needs
    if (lower.match(/\b(india|mumbai|bangalore|delhi|indian users|south asia)\b/i)) {
        req.geographicNeeds = "India / South Asia";
    } else if (lower.match(/\b(germany|europe|eu|frankfurt|uk|london|france|paris|amsterdam|european)\b/i)) {
        req.geographicNeeds = "Europe / Germany";
    } else if (lower.match(/\b(us|usa|united states|america|california|virginia|north america)\b/i)) {
        req.geographicNeeds = "North America / USA";
    } else if (lower.match(/\b(asia|apac|singapore|tokyo|japan|china|hong kong)\b/i)) {
        req.geographicNeeds = "Asia-Pacific (APAC)";
    } else if (lower.match(/\b(global|worldwide|every continent|international)\b/i)) {
        req.geographicNeeds = "Global Distribution / Edge CDN";
    }

    // 9. Compliance & Privacy
    if (lower.match(/\b(gdpr|data privacy|sovereignty|european data|strict privacy)\b/i)) {
        req.complianceNeeds = "Strict European GDPR / Data Sovereignty";
    } else if (lower.match(/\b(hipaa|soc2|pci|financial compliance|healthcare)\b/i)) {
        req.complianceNeeds = "Enterprise / Regulatory Compliance (HIPAA/SOC2)";
    }

    // ==================================================
    // TRANSPARENT ASSUMPTIONS (FEATURE #6)
    // ==================================================
    // When essential context is unstated, formulate explicit, gentle assumptions:

    if (req.projectPurpose === "College / Academic Project") {
        if (!req.expectedScale) {
            req.assumptions.push("Assumed small-to-moderate academic scale (typically under 500–1,000 visitors).");
        }
        if (!req.budgetSensitivity) {
            req.assumptions.push("Assumed high budget sensitivity with a strong preference for free tiers or sub-$10/month hosting.");
            req.budgetSensitivity = "High (Student / Academic Context)";
        }
        if (!req.simplicityPreference) {
            req.assumptions.push("Assumed low-maintenance or managed setup is preferred so student can focus on code rather than complex cloud administration.");
        }
    }

    if (req.simplicityPreference === "High (Beginner / Zero-DevOps Preferred)") {
        if (!req.assumptions.some(a => a.includes("intuitive"))) {
            req.assumptions.push("Assumed intuitive developer platform (like DigitalOcean or Hetzner or Cloudflare Pages) is preferred over intricate enterprise consoles.");
        }
    }

    if (req.workloadType === "AI / Machine Learning Application" && !req.aiGpuNeeds) {
        req.assumptions.push("Assumed dedicated GPU acceleration may be required based on AI/ML workload mention.");
    }

    // Check if the current message contains an uncertainty signal (Feature #8)
    const uncertaintySignal = detectUnknownIntent(message);
    req.uncertaintySignal = uncertaintySignal;

    // Feature #8: If user expressed uncertainty or delegation, formulate safe transparent assumptions
    if (uncertaintySignal && (uncertaintySignal.type === "unknown" || uncertaintySignal.type === "delegation")) {
        if (!req.budgetSensitivity) {
            req.assumptions.push("Assumed cost-conscious priority (low cost / free-tier preference) as user expressed uncertainty on budget.");
        }
        if (!req.expectedScale) {
            req.assumptions.push("Assumed small starting traffic (~few hundred visitors) as visitor scale was not specified.");
        }
        if (!req.simplicityPreference) {
            req.assumptions.push("Assumed high priority on simplicity and managed setup as user requested best/simple defaults.");
        }
    }

    if (req.databaseNeeds === "Yes (Managed or Integrated Database)") {
        req.assumptions.push("Assumed a standard lightweight managed database (relational or document) without multi-region clustering.");
    }

    return req;
}

/**
 * Detect user uncertainty, delegation, confusion, or "I don't know" signals (Feature #8)
 */
function detectUnknownIntent(message = "") {
    if (typeof message !== "string") return null;
    const lower = message.toLowerCase().trim();

    // 1. Confusion / need plain-language explanation:
    // "I don't understand", "what does that mean", "i don't know what that means", "explain", "confused"
    if (lower.match(/\b(i don'?t understand|what does (?:that|this) mean|i don'?t know what (?:that|this) means?|confused|not sure what you mean|what is that|can you explain|what do you mean)\b/i)) {
        return {
            type: "confusion",
            signal: "confusion",
            label: "User needs explanation in plain language with simple choices",
            requiresExplanation: true
        };
    }

    // 2. Defer / delegate to Advisor:
    // "You decide", "you choose", "can you choose", "whatever is best", "whatever you think", "up to you", "you pick"
    if (lower.match(/\b(you decide|you choose|can you choose|whatever is best|whatever you (?:think|recommend|prefer|pick)|up to you|you pick|choose for me|decide for me|whatever works best|best option|what would you pick)\b/i)) {
        return {
            type: "delegation",
            signal: "delegation",
            label: "User delegates choice to Advisor; adopt safe default and disclose",
            requiresAssumption: true
        };
    }

    // 3. Direct uncertainty / unknown:
    // "I don't know", "not sure", "no idea", "i have no idea", "dunno", "not certain", "haven't decided"
    if (lower.match(/\b(i don'?t know|not sure|no idea|i have no idea|dunno|not certain|haven'?t decided|no clue|doesn'?t matter|don'?t care|whatever)\b/i)) {
        return {
            type: "unknown",
            signal: "unknown",
            label: "User does not know; adopt reasonable assumption, disclose it, do not repeat question",
            requiresAssumption: true
        };
    }

    return null;
}

function formatRequirementsForPrompt(req) {
    if (!req) return "";

    const lines = [];
    lines.push("==================================================");
    lines.push("INTERNAL REQUIREMENT TRANSLATION (FEATURE #6)");
    lines.push("==================================================");
    lines.push("The user's real-world statement has been translated into the following internal cloud context:");
    lines.push(`- Workload Type: ${req.workloadType || "Unknown (clarify gently if needed)"}`);
    lines.push(`- Project Purpose: ${req.projectPurpose || "Unknown"}`);
    lines.push(`- Expected Scale / Traffic: ${req.expectedScale || "Unknown"}${req.traffic ? ` (Mentioned: ${req.traffic})` : ""}`);
    lines.push(`- Budget Sensitivity: ${req.budgetSensitivity || "Unknown"}`);
    lines.push(`- Simplicity Preference: ${req.simplicityPreference || "Unknown"}`);
    lines.push(`- Database Requirement: ${req.databaseNeeds || "Unknown"}`);
    lines.push(`- AI / GPU Requirement: ${req.aiGpuNeeds || "None / Not mentioned"}`);
    lines.push(`- Geographic Region: ${req.geographicNeeds || "Unknown / Global"}`);
    if (req.complianceNeeds) {
        lines.push(`- Compliance / Privacy: ${req.complianceNeeds}`);
    }

    if (req.uncertaintySignal) {
        lines.push("");
        lines.push("==================================================");
        lines.push("CURRENT TURN UNCERTAINTY SIGNAL (FEATURE #8)");
        lines.push("==================================================");
        lines.push(`- Signal Type: ${req.uncertaintySignal.type.toUpperCase()}`);
        lines.push(`- Guidance: ${req.uncertaintySignal.label}`);
        if (req.uncertaintySignal.type === "confusion") {
            lines.push("- DIRECTIVE: The user does not understand a prior term. Explain the concept in simple everyday language with an analogy, then provide 2 simple non-technical options. Do NOT repeat the technical question.");
        } else {
            lines.push("- DIRECTIVE: Do NOT repeat the question or loop. Acknowledge warmly, adopt a sensible default, clearly disclose the assumption, and advance the conversation.");
        }
    }

    if (Array.isArray(req.assumptions) && req.assumptions.length > 0) {
        lines.push("");
        lines.push("ACTIVE TRANSPARENT ASSUMPTIONS:");
        req.assumptions.forEach(a => {
            lines.push(`* ${a}`);
        });
        lines.push("(Note: If making a final recommendation, explicitly disclose any active assumption so the user knows why it was chosen).");
    }

    return lines.join("\n");
}

module.exports = {
    extractCloudRequirements,
    detectUnknownIntent,
    formatRequirementsForPrompt
};
