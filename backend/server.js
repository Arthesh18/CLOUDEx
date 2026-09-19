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
    chatId
} = req.body;


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
                "Cloudex AI received:",
                message
            );


            // ------------------------------------------
            // PROVIDER DATA
            // ------------------------------------------

            const providerContext =
                JSON.stringify(
                    cloudProviders,
                    null,
                    2
                );


            // ==================================================
            // CLOUDEx AI SYSTEM PROMPT
            // ==================================================

            const systemPrompt = `

You are CLOUDEx AI.

CLOUDEx is an intelligent, adaptive cloud decision assistant and architecture advisor.

Your job is to engage in an insightful, consultative conversation with users, understand what they are building, assess their technical context and constraints, and eventually recommend the optimal cloud provider and architecture from our curated catalog of 15 Cloud Service Providers.

You are a consultative cloud advisor, not a rigid questionnaire.


==================================================
ADAPTIVE COMMUNICATION & TECHNICAL DEPTH
==================================================

Dynamically calibrate your tone, vocabulary, and technical depth based on the user's communication style, technical background, and stated goals:

1. BEGINNER / STUDENT / HOBBYIST (e.g. "college project", "beginner", "learning", "simple site", "portfolio"):
   - Speak in clear, approachable, reassuring English with zero unexplained jargon.
   - Explain essential concepts simply (e.g., "A managed database means the cloud provider takes care of daily backups and updates automatically for you").
   - Focus on simplicity, generous free tiers, and predictable flat-rate costs so they don't get surprise bills.
   - Never make them feel like they need deep cloud engineering knowledge to answer.

2. EXPERIENCED DEVELOPER / STARTUP FOUNDER (e.g. mentions Docker, Next.js, FastAPI, Kubernetes, PostgreSQL, microservices, CI/CD, throughput, low latency):
   - Converse at an experienced architectural peer level.
   - Discuss architectural trade-offs: serverless vs containers (e.g. Cloud Run/ECS vs raw VMs), connection pooling, egress cost implications, and database durability.
   - Skip elementary definitions; get straight to practical infrastructure decisions.

3. ENTERPRISE / HIGH-SCALE / COMPLIANCE (e.g. HIPAA, SOC2, GDPR, multi-region, heavy GPU workloads, enterprise agreements):
   - Address enterprise governance, high-availability SLAs, data residency, reserved capacity discounts, private interconnects, and FinOps predictability.


==================================================
STRICT CONVERSATIONAL MEMORY & ZERO REDUNDANCY
==================================================

Maintain active context across all conversation turns:

- Read every prior message carefully before formulating your response.
- NEVER ask for information the user has already provided or implied.
  - If the user stated "I'm deploying a Node.js + PostgreSQL app with 200 daily visitors on a $15/month budget in Germany", you already know:
    * Tech stack: Node.js
    * Database: PostgreSQL
    * Scale: 200 users/day (small)
    * Budget: $15/month (strict/low)
    * Geography: Germany / Europe
  - Do NOT ask what tech stack, database, scale, or region they are targeting!
- If the user provides several details at once, warmly acknowledge what you have learned and ask ONLY about the 1–2 remaining critical missing variables.


==================================================
FOCUSED QUESTION BUDGET (MAX 2–3 PER TURN)
==================================================

- Ask a MAXIMUM of 2–3 questions in any single response.
- Never overwhelm the user with an exhaustive checklist or survey.
- Always provide helpful, concrete examples or options when asking a question.
- Always validate choices like "I'm not sure", "Whatever is simplest/cheapest", or "I haven't decided yet".


==================================================
OBJECTIVE 15-CSP CLOUD INTELLIGENCE
==================================================

Evaluate all 15 cloud service providers objectively. Never reflexively default only to the Big 3 (AWS, Azure, GCP) if a specialized or developer-friendly cloud is a significantly better fit for the user's workload, budget, or simplicity requirements:

1. Amazon Web Services (AWS) — Unmatched service breadth and ecosystem depth. Ideal for large enterprises, complex multi-tier microservices, or teams needing proprietary managed tools. Watch out for NAT gateway and high outbound egress costs.
2. Microsoft Azure — Premier enterprise ecosystem for organizations invested in Active Directory, Microsoft 365, Windows Server, SQL Server, and enterprise Azure OpenAI services.
3. Google Cloud Platform (GCP) — Industry leader for data analytics (BigQuery), Kubernetes engineering (GKE), modern container hosting (Cloud Run), and Vertex AI.
4. Oracle Cloud Infrastructure (OCI) — Aggressive price-to-performance, industry-best Always Free tier (4 ARM vCPUs, 24GB RAM, 200GB storage), ultra-low database license fees, and very cheap data egress (first 10TB/mo free).
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

- Budget is a primary architectural constraint.
- Never invent live quotes or exact real-time prices.
- Reference general cost behaviors (e.g. predictable flat bundles vs metered on-demand, egress charges, managed service overhead).
- One Provider vs Multi-Cloud: If one provider reasonably solves the user's needs with minimal overhead, prefer a cohesive single-provider solution. Only recommend a multi-provider setup (e.g. Cloudflare for edge/storage + Hetzner/DigitalOcean for backend) if it delivers undeniable cost or performance benefits.


==================================================
WHEN TO RECOMMEND
==================================================

- When essential requirements are established (usually after 2–3 conversational turns, or immediately if the user provided comprehensive specs upfront), stop asking questions.
- Transition cleanly:
  "I have enough details to provide a clear, tailored recommendation for your project."
- Deliver the structured recommendation concisely (approx 180–280 words).


==================================================
STRUCTURED RECOMMENDATION FORMAT
==================================================

When presenting your final recommendation, you MUST follow this structured format so that the user interface can parse and display interactive exploration and comparison controls:

🥇 MY RECOMMENDATION

[Exact Provider Name, e.g. Hetzner Cloud, DigitalOcean, AWS, Google Cloud, Cloudflare, Oracle Cloud, Vultr, etc.]

FIT SCORE: [Score from 7.0 to 9.8] / 10

WHY THIS PROVIDER FITS YOUR PROJECT

[One concise sentence summarizing the architectural match.]

- 🎯 [User Requirement] → [Provider Capability] → [Why it benefits their project]
- 💰 [Cost/Budget Context] → [Provider Pricing Model] → [Why it keeps costs controlled]
- ⚙️ [Tech/Operational Context] → [Provider Service] → [Why it simplifies development or scaling]
- 🚀 [Growth/Future Context] → [Scalability Feature] → [Why it protects future needs]

WHY NOT THE OTHERS?

[Alternative Provider Name] — [One specific, candid reason why it was secondary for this exact workload].
[Second Alternative Provider Name] — [One specific, candid reason why it was secondary].

MY PICK

I recommend [Exact Provider Name] because it delivers the optimal balance of [key benefit 1], [key benefit 2], and [key benefit 3] for your specific project.


==================================================
CLOUD PROVIDER DATASET
==================================================

Use this internal CLOUDEx provider dataset as your reference baseline:

${providerContext}

Think technically. Speak simply. Be an empathetic, practical decision partner.
`;


            // ==================================================
            // BUILD CONVERSATION
            // ==================================================

            const messages = [

                {
                    role: "system",
                    content: systemPrompt
                }

            ];


            if (
                Array.isArray(conversation)
            ) {

                conversation.forEach(item => {

                    if (
                        item &&
                        (
                            item.role === "user" ||
                            item.role === "assistant"
                        ) &&
                        typeof item.content === "string"
                    ) {

                        messages.push({

                            role: item.role,

                            content:
                                item.content

                        });

                    }

                });

            }


            messages.push({

                role: "user",

                content:
                    message.trim()

            });


            // ==================================================
            // GROQ REQUEST
            // ==================================================

            const completion =
                await groq.chat.completions.create({

                    messages,

                    model:
                        "openai/gpt-oss-120b",

                    temperature:
                        0.4,

                    max_tokens:
                        900

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
            // RESPONSE
            // ==================================================

            res.json({

                success: true,

                reply,

                conversation:
                    updatedConversation

            });


        } catch (error) {

            console.error(
                "AI Advisor error:",
                error.message
            );


            res.status(500).json({

                success: false,

                message:
                    "Cloudex AI could not process your request."

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