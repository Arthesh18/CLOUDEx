/**
 * CLOUDEx - Intelligent Requirement Slot Tracker & Question Selection Engine
 *
 * Implements deterministic slot-state tracking:
 * - 19 Information Slots across 4 States: UNKNOWN, KNOWN, ASSUMED, USER_DECLINED
 * - Current-message-first extraction & user correction overrides
 * - Semantic duplicate detection (preventing repetitive questions under different phrasing)
 * - Information-value-based question ranking & queue management
 * - Non-numeric safe default assumptions for "I don't know" signals
 */

const { detectUnknownIntent } = require("./requirementTranslator");

// ---------------------------------------------------------------------------
// SLOT DEFINITIONS & METADATA
// ---------------------------------------------------------------------------

const SLOT_DEFINITIONS = {
    workloadType: {
        key: "workloadType",
        label: "Workload Type",
        impactWeight: 1.0,
        core: true,
        questions: {
            beginner: "What kind of application are you building (e.g. web app, mobile backend, personal blog)?",
            intermediate: "What is your primary application workload (e.g. full-stack web app, containerized microservices, background worker)?",
            expert: "What is the workload classification (e.g. event-driven serverless, stateless microservices, distributed cluster)?"
        }
    },
    projectPurpose: {
        key: "projectPurpose",
        label: "Project Purpose",
        impactWeight: 0.9,
        core: true,
        questions: {
            beginner: "Is this for a college class, a personal hobby, or a business you are launching?",
            intermediate: "What is the project stage (academic prototype, personal project, startup MVP, commercial production)?",
            expert: "What is the deployment environment and business tier (sandbox/PoC, staging, production enterprise)?"
        }
    },
    expectedUsers: {
        key: "expectedUsers",
        label: "Expected Users / Scale",
        impactWeight: 0.88,
        core: true,
        semanticAliases: ["how many users", "how many people", "user count", "user base", "expected users", "how many visitors", "number of users", "visitor count"],
        questions: {
            beginner: "Roughly how many people do you expect will use your application at launch?",
            intermediate: "What is your target initial user base or monthly active user scale?",
            expert: "What is your target concurrency model and peak request volume (RPS)?"
        }
    },
    trafficPattern: {
        key: "trafficPattern",
        label: "Traffic Pattern",
        impactWeight: 0.7,
        core: false,
        semanticAliases: ["traffic pattern", "traffic spikes", "predictable traffic", "bursty traffic", "steady traffic"],
        questions: {
            beginner: "Will people visit evenly throughout the day, or all at once during specific times?",
            intermediate: "Do you anticipate steady baseline traffic or spiky, burst-heavy usage patterns?",
            expert: "What are your ingress traffic variability, peak-to-average ratio, and auto-scaling step constraints?"
        }
    },
    concurrentUsers: {
        key: "concurrentUsers",
        label: "Concurrent Users",
        impactWeight: 0.75,
        core: false,
        semanticAliases: ["concurrent users", "active at the same time", "simultaneous users"],
        questions: {
            beginner: "Could many people be clicking and using the app at the exact same minute?",
            intermediate: "What peak concurrent user connections do you expect to handle simultaneously?",
            expert: "What are your peak concurrent socket/connection pool dimensions?"
        }
    },
    userAccounts: {
        key: "userAccounts",
        label: "User Accounts & Authentication",
        impactWeight: 0.92,
        core: true,
        semanticAliases: ["need accounts", "require login", "need login", "sign up", "authentication", "user profiles", "logins", "user sign-in"],
        questions: {
            beginner: "Will people need to create an account or log in to use your application?",
            intermediate: "Does your application require user authentication and identity management (JWT, OAuth, or session-based)?",
            expert: "What identity/auth architecture are you integrating (OAuth2/OIDC, SAML, SSO, or custom token service)?"
        }
    },
    databaseNeeds: {
        key: "databaseNeeds",
        label: "Database Needs & Persistence",
        impactWeight: 0.94,
        core: true,
        semanticAliases: ["need a database", "store data", "store tasks", "store posts", "store profiles", "what database", "database needs", "database required"],
        questions: {
            beginner: "Will your application need to store data like tasks, user profiles, or messages in a database?",
            intermediate: "What database requirements do you have (e.g. relational PostgreSQL/MySQL vs document store MongoDB)?",
            expert: "What persistence tier and consistency model do you require (e.g. ACID relational with read replicas, NoSQL key-value, distributed cache)?"
        }
    },
    databaseType: {
        key: "databaseType",
        label: "Database Type (SQL vs NoSQL)",
        impactWeight: 0.8,
        core: false,
        semanticAliases: ["what database", "sql or nosql", "postgres or mongo", "relational or document"],
        questions: {
            beginner: "Do you have a specific database in mind, like PostgreSQL, MySQL, or MongoDB?",
            intermediate: "Do you prefer a managed SQL database (PostgreSQL/MySQL) or a document/NoSQL store?",
            expert: "What database engine and schema topology (PostgreSQL, MySQL, Redis, DynamoDB/MongoDB) are you provisioning?"
        }
    },
    storageNeeds: {
        key: "storageNeeds",
        label: "General Storage Needs",
        impactWeight: 0.72,
        core: false,
        semanticAliases: ["storage needs", "how much storage", "disk space", "storage capacity"],
        questions: {
            beginner: "Will your app need lots of storage space for files or data?",
            intermediate: "What are your initial persistent block storage or database disk requirements?",
            expert: "What are your IOPS throughput and persistent block volume retention constraints?"
        }
    },
    fileStorageNeeds: {
        key: "fileStorageNeeds",
        label: "File & Media Uploads (Object Storage)",
        impactWeight: 0.84,
        core: false,
        semanticAliases: ["upload files", "file uploads", "store images", "upload images", "store pdfs", "media files", "object storage", "s3 storage", "upload photos"],
        questions: {
            beginner: "Will users be uploading files like photos, videos, or PDF documents?",
            intermediate: "Will your service require S3-compatible object storage or a CDN for user-uploaded media?",
            expert: "Do you require distributed S3-compatible blob storage with global edge replication?"
        }
    },
    aiGpuNeeds: {
        key: "aiGpuNeeds",
        label: "AI / GPU Acceleration",
        impactWeight: 0.95,
        core: false,
        semanticAliases: ["gpu", "gpus", "cuda", "model training", "inference", "ai acceleration"],
        questions: {
            beginner: "Does your application need special AI hardware (GPUs) to run or train models?",
            intermediate: "Do you require dedicated GPU hardware for model inference/training, or are you calling external APIs (OpenAI/Groq)?",
            expert: "What compute accelerator profile (e.g. NVIDIA H100/A100 SXM, vLLM/TensorRT inference) is required?"
        }
    },
    geographicNeeds: {
        key: "geographicNeeds",
        label: "Geographic Target Region",
        impactWeight: 0.76,
        core: false,
        semanticAliases: ["geographic region", "where are users", "datacenter location", "location", "country", "region"],
        questions: {
            beginner: "Where in the world are most of your visitors located (e.g. US, Europe, India, Asia)?",
            intermediate: "What primary geographic region or datacenter locations are you targeting for low latency?",
            expert: "What latency boundary and geographic deployment topology (single-region, multi-region active-active, edge) do you mandate?"
        }
    },
    complianceNeeds: {
        key: "complianceNeeds",
        label: "Compliance & Data Residency",
        impactWeight: 0.85,
        core: false,
        semanticAliases: ["compliance", "gdpr", "hipaa", "soc2", "data residency", "privacy requirements"],
        questions: {
            beginner: "Do you have strict privacy or legal rules (like keeping data inside Europe)?",
            intermediate: "Are there specific compliance or data sovereignty requirements (GDPR, SOC2, HIPAA)?",
            expert: "What regulatory frameworks (SOC2 Type II, ISO 27001, HIPAA BAA, FedRAMP, EU Data Sovereignty) must the provider satisfy?"
        }
    },
    availabilityNeeds: {
        key: "availabilityNeeds",
        label: "Availability & Uptime SLA",
        impactWeight: 0.78,
        core: false,
        semanticAliases: ["uptime", "sla", "high availability", "zero downtime", "redundancy"],
        questions: {
            beginner: "Is it okay if the app restarts occasionally, or must it run 24/7 without a second of downtime?",
            intermediate: "What are your availability expectations (e.g. 99.9% standard vs multi-zone redundancy)?",
            expert: "What are your RTO/RPO targets and formal SLA availability commitments (99.99%+ active-active)?"
        }
    },
    budgetSensitivity: {
        key: "budgetSensitivity",
        label: "Budget Sensitivity & Cost",
        impactWeight: 0.96,
        core: true,
        semanticAliases: ["budget", "spend", "cost", "how much money", "price", "free tier", "monthly budget", "spend much money"],
        questions: {
            beginner: "What is your target monthly budget, or do you prefer a free tier / lowest possible cost?",
            intermediate: "What is your target monthly cloud budget range, and is predictable flat pricing important?",
            expert: "What are your cost-performance envelope, commitment pricing preferences (reserved vs spot), and egress tolerance?"
        }
    },
    simplicityPreference: {
        key: "simplicityPreference",
        label: "Simplicity vs Developer Control",
        impactWeight: 0.92,
        core: true,
        semanticAliases: ["simplicity", "easy to set up", "managed platform", "zero devops", "keep it simple", "simple to set up"],
        questions: {
            beginner: "Do you want something super simple that handles servers automatically, or do you want to configure servers yourself?",
            intermediate: "Do you prefer a managed PaaS (like Render/Vercel) for developer velocity, or full Linux VM control (like DigitalOcean Droplets)?",
            expert: "What is your desired infrastructure abstraction tier (fully managed PaaS vs Kubernetes/IaaS with custom IaC)?"
        }
    },
    technicalPreference: {
        key: "technicalPreference",
        label: "Technical Control & Management",
        impactWeight: 0.8,
        core: false,
        semanticAliases: ["technical control", "management level", "devops", "self-managed"],
        questions: {
            beginner: "Do you prefer a visual dashboard or are you comfortable managing servers?",
            intermediate: "How much infrastructure maintenance (OS updates, firewall rules, backups) are you willing to manage?",
            expert: "What operational control plane and CI/CD/GitOps integration model do you require?"
        }
    },
    deploymentPreference: {
        key: "deploymentPreference",
        label: "Deployment Method",
        impactWeight: 0.85,
        core: false,
        semanticAliases: ["deployment method", "how will you deploy", "deploy with git", "deploy containers"],
        questions: {
            beginner: "Would you like to deploy automatically by connecting your GitHub repository?",
            intermediate: "How are you planning to deploy (Git push auto-deploy, pre-built Docker containers, or manual SSH)?",
            expert: "What deployment pipeline (GitOps with ArgoCD/Flux, container registry CI push, or blue-green rollout) are you architecting?"
        }
    },
    architecturePreference: {
        key: "architecturePreference",
        label: "Architecture Topology",
        impactWeight: 0.82,
        core: false,
        semanticAliases: ["architecture", "monolith or microservices", "serverless", "virtual servers"],
        questions: {
            beginner: "Is your app a single combined project, or split into separate pieces?",
            intermediate: "Is this a single unified monolith or separate decoupled frontend/backend services?",
            expert: "What architectural topology (modular monolith, microservices with service mesh, or event-driven serverless) are you building?"
        }
    }
};

// ---------------------------------------------------------------------------
// SLOT TRACKER CLASS
// ---------------------------------------------------------------------------

class RequirementSlotTracker {
    constructor() {
        this.slots = {};
        this.askedSlots = new Set();
        this.historyLog = [];
        this.initializeSlots();
    }

    initializeSlots() {
        Object.keys(SLOT_DEFINITIONS).forEach((key) => {
            this.slots[key] = {
                key,
                label: SLOT_DEFINITIONS[key].label,
                state: "UNKNOWN", // "UNKNOWN" | "KNOWN" | "ASSUMED" | "USER_DECLINED"
                value: null,
                rawUserText: null,
                confidence: null,
                source: null, // "user" | "assumed" | "inferred"
                reason: null,
                turnUpdated: 0
            };
        });
    }

    /**
     * Parse conversation and current message to update slot states.
     * Order of operations:
     * 1. Extract from previous conversation history (build base knowledge).
     * 2. Identify slots already asked by the assistant in prior turns.
     * 3. Extract from the CURRENT user message first.
     * 4. Apply any user corrections over old values.
     * 5. Handle "I don't know" / uncertainty delegation if signaled in the current turn.
     */
    processTurn(currentMessage = "", conversation = [], experienceMode = "beginner") {
        const mode = ["beginner", "intermediate", "expert"].includes(experienceMode) ? experienceMode : "beginner";

        // Step 1: Accumulate previous turns to establish baseline state & asked questions
        if (Array.isArray(conversation)) {
            let turnCounter = 0;
            conversation.forEach((msg) => {
                if (!msg || typeof msg.content !== "string") return;

                if (msg.role === "assistant") {
                    // Record which slots the assistant asked about in this message
                    const askedSlotKeys = this.detectAskedSlotsInText(msg.content);
                    askedSlotKeys.forEach((k) => this.askedSlots.add(k));
                } else if (msg.role === "user") {
                    turnCounter++;
                    this.extractSlotsFromText(msg.content, turnCounter, false);
                }
            });
        }

        // Step 2: Determine what slot the assistant just asked in the immediately preceding message
        const lastAssistantMsg = this.getLastAssistantMessage(conversation);
        const lastAskedSlots = lastAssistantMsg ? this.detectAskedSlotsInText(lastAssistantMsg.content) : [];

        // Step 3: ALWAYS extract slots from the current message first (highest priority).
        // This must run unconditionally so rich messages like
        // "I don't know much about cloud. I expect 100 users, low budget, simple setup."
        // are fully parsed rather than short-circuited by the uncertainty handler.
        const currentTurnIndex = (Array.isArray(conversation) ? conversation.filter(m => m && m.role === "user").length : 0) + 1;
        this.extractSlotsFromText(currentMessage, currentTurnIndex, true);

        // Step 4: Check for uncertainty ONLY if the message is primarily an uncertainty expression.
        // Heuristic: the message is "primarily uncertain" when it is short (< 12 words) and
        // no new slots were extracted from the current message in Step 3.
        const wordCount = currentMessage.trim().split(/\s+/).length;
        const slotsExtractedCount = Object.values(this.slots).filter(s => s.turnUpdated === currentTurnIndex && s.state === "KNOWN").length;
        const isPrimarilyUncertain = wordCount <= 12 && slotsExtractedCount === 0;

        if (isPrimarilyUncertain) {
            const uncertainty = detectUnknownIntent(currentMessage);
            if (uncertainty && (uncertainty.type === "unknown" || uncertainty.type === "delegation" || uncertainty.type === "confusion")) {
                this.handleUncertaintyForTurn(lastAskedSlots, uncertainty, currentTurnIndex, mode);
            }
        }

        return this.getSlotSummary();
    }

    getLastAssistantMessage(conversation) {
        if (!Array.isArray(conversation)) return null;
        for (let i = conversation.length - 1; i >= 0; i--) {
            if (conversation[i] && conversation[i].role === "assistant" && typeof conversation[i].content === "string") {
                return conversation[i];
            }
        }
        return null;
    }

    /**
     * Semantic question slot detection:
     * Identifies which information slot(s) a given assistant question is asking about.
     */
    detectAskedSlotsInText(text) {
        if (typeof text !== "string") return [];
        const lower = text.toLowerCase();
        const detected = [];

        // User count / scale
        if (lower.match(/\b(how many (?:people|users|visitors|students|customers)|user count|user base|expected users|how many are you expecting|traffic volume)\b/i)) {
            detected.push("expectedUsers");
        }
        // User accounts / login
        if (lower.match(/\b(need accounts|require login|need login|sign up|sign in|authentication|auth|user profiles|create an account|user accounts)\b/i)) {
            detected.push("userAccounts");
        }
        // Database
        if (lower.match(/\b(need a database|database to store|store data|store tasks|store posts|store profiles|what database|database needs)\b/i)) {
            detected.push("databaseNeeds");
        }
        // File storage / uploads
        if (lower.match(/\b(upload files|file uploads|store images|upload images|store pdfs|media files|object storage|s3 storage|upload photos)\b/i)) {
            detected.push("fileStorageNeeds");
        }
        // Budget
        if (lower.match(/\b(monthly budget|target budget|how much (?:money )?do you want to spend|budget sensitivity|price limit|free tier)\b/i)) {
            detected.push("budgetSensitivity");
        }
        // Simplicity / PaaS vs VM
        if (lower.match(/\b(how important is simplicity|simple to set up|managed platform|virtual server|droplet|ec2|configure servers yourself|zero devops)\b/i)) {
            detected.push("simplicityPreference");
        }
        // AI / GPU
        if (lower.match(/\b(ai hardware|gpus|gpu acceleration|cuda|training models|model inference)\b/i)) {
            detected.push("aiGpuNeeds");
        }
        // Geographic region
        if (lower.match(/\b(where in the world|geographic region|datacenter location|target region|users located)\b/i)) {
            detected.push("geographicNeeds");
        }
        // Architecture / Monolith
        if (lower.match(/\b(single combined project|separate pieces|monolith|microservices|frontend and backend separate)\b/i)) {
            detected.push("architecturePreference");
        }

        return detected;
    }

    /**
     * Extracts information slots from text while STRICTLY preserving user semantics:
     * - "100 users" -> "approximately 100 users" (never "100 concurrent users" or "500 visitors").
     * - Corrections override old values.
     */
    extractSlotsFromText(text, turnIndex, isCurrentTurn = false) {
        if (typeof text !== "string" || !text.trim()) return;
        const lower = text.toLowerCase();

        // 1. Expected Users (Preserving User Semantics)
        // Check for explicit user numbers or corrections: "100 users", "about 100", "maybe 100 users", "actually 10,000", "10k users"
        const correctionMatch = lower.match(/(?:actually|closer to|now i expect|change to|increase to|rather)\s*(\d+(?:,\d+)?|\d+k|\d+m)\s*(?:users|people|visitors)?/i);
        const usersMatch = correctionMatch || lower.match(/(?:expect|maybe|around|about|roughly|have)?\s*(\d+(?:,\d+)?|\d+k|\d+m)\s*(?:users|people|visitors|students|members|accounts|customers|downloads)/i);

        if (usersMatch) {
            const rawNumberStr = (correctionMatch ? correctionMatch[1] : usersMatch[1]).replace(/,/g, "");
            let countText = rawNumberStr;
            if (rawNumberStr.toLowerCase().endsWith("k")) {
                countText = `${parseInt(rawNumberStr, 10) * 1000}`;
            } else if (rawNumberStr.toLowerCase().endsWith("m")) {
                countText = `${parseInt(rawNumberStr, 10) * 1000000}`;
            }

            this.updateSlot("expectedUsers", {
                state: "KNOWN",
                value: `approximately ${countText} users`,
                rawUserText: usersMatch[0].trim(),
                confidence: 0.95,
                source: "user",
                reason: isCurrentTurn && correctionMatch ? "Explicit user correction" : "Explicitly stated by user",
                turnUpdated: turnIndex
            });
        } else if (lower.match(/\b(just me|just myself|few friends|testing only|portfolio for demo|only me)\b/i)) {
            this.updateSlot("expectedUsers", {
                state: "KNOWN",
                value: "very small scale (~just author / few friends)",
                rawUserText: "just me / testing only",
                confidence: 0.9,
                source: "user",
                reason: "Explicitly stated small personal testing scope",
                turnUpdated: turnIndex
            });
        }

        // 2. Project Purpose
        if (lower.match(/\b(college|student|university|school|assignment|coursework|semester|thesis|class project|final year)\b/i)) {
            this.updateSlot("projectPurpose", {
                state: "KNOWN",
                value: "College / Academic Project",
                rawUserText: "college / student project",
                confidence: 0.95,
                source: "user",
                reason: "Explicitly stated academic project purpose",
                turnUpdated: turnIndex
            });
        } else if (lower.match(/\b(portfolio|personal|hobby|side project|experiment|for fun|testing|learning)\b/i)) {
            this.updateSlot("projectPurpose", {
                state: "KNOWN",
                value: "Personal / Hobby Project",
                rawUserText: "personal / hobby project",
                confidence: 0.95,
                source: "user",
                reason: "Explicitly stated personal hobby purpose",
                turnUpdated: turnIndex
            });
        } else if (lower.match(/\b(startup|saas|mvp|business|client|commercial|product launch|e-commerce|store)\b/i)) {
            this.updateSlot("projectPurpose", {
                state: "KNOWN",
                value: "Startup / MVP",
                rawUserText: "startup / commercial MVP",
                confidence: 0.95,
                source: "user",
                reason: "Explicitly stated commercial startup purpose",
                turnUpdated: turnIndex
            });
        } else if (lower.match(/\b(enterprise|corporate|production|mission critical|large business)\b/i)) {
            this.updateSlot("projectPurpose", {
                state: "KNOWN",
                value: "Production / Enterprise",
                rawUserText: "enterprise production",
                confidence: 0.95,
                source: "user",
                reason: "Explicitly stated enterprise production workload",
                turnUpdated: turnIndex
            });
        }

        // 3. Workload Type
        if (lower.match(/\b(ai|gpu|gpus|machine learning|deep learning|llm|pytorch|tensorflow|cuda|model training|inference)\b/i)) {
            this.updateSlot("workloadType", {
                state: "KNOWN",
                value: "AI / Machine Learning Application",
                rawUserText: "AI / ML workload",
                confidence: 0.95,
                source: "user",
                reason: "Explicitly mentioned AI/ML or GPU compute requirements",
                turnUpdated: turnIndex
            });
        } else if (lower.match(/\b(static site|static website|portfolio|html|css|landing page|documentation|blog)\b/i) && !lower.match(/\b(backend|database|postgres|mysql|mongo|node|api)\b/i)) {
            this.updateSlot("workloadType", {
                state: "KNOWN",
                value: "Static Website / Frontend",
                rawUserText: "static website",
                confidence: 0.9,
                source: "user",
                reason: "Explicitly identified static frontend website",
                turnUpdated: turnIndex
            });
        } else if (lower.match(/\b(api|rest api|graphql|fastapi|backend|microservices|endpoints)\b/i) && !lower.match(/\b(frontend|ui|website)\b/i)) {
            this.updateSlot("workloadType", {
                state: "KNOWN",
                value: "Backend API / Microservices",
                rawUserText: "backend API / microservices",
                confidence: 0.92,
                source: "user",
                reason: "Explicitly stated backend API or microservices",
                turnUpdated: turnIndex
            });
        } else if (lower.match(/\b(website|web app|webapp|web application|college project|college website|portal|store|ecommerce|react|node|vue|django|flask|express)\b/i)) {
            this.updateSlot("workloadType", {
                state: "KNOWN",
                value: "Web Application / Full-Stack",
                rawUserText: "web application",
                confidence: 0.92,
                source: "user",
                reason: "Explicitly identified web application framework or stack",
                turnUpdated: turnIndex
            });
        }

        // 4. Budget Sensitivity / Cost Priority
        if (lower.match(/\b(cheap|very little budget|little budget|limited budget|tight budget|low budget|lowest cost|free tier|free|student budget|don't want to spend much|not much money|not spend much|minimum cost|\$0|\$5|\$10|\$15|\$20)\b/i)) {
            this.updateSlot("budgetSensitivity", {
                state: "KNOWN",
                value: "Cost Priority: Very High (Free Tier / Sub-$10 Preferred)",
                rawUserText: "low budget / don't want to spend much",
                confidence: 0.95,
                source: "user",
                reason: "Explicit user budget constraint",
                turnUpdated: turnIndex
            });
        } else if (lower.match(/\b(reasonable|moderate budget|fair price|\$50|\$100)\b/i)) {
            this.updateSlot("budgetSensitivity", {
                state: "KNOWN",
                value: "Cost Priority: Moderate ($50-$100/mo)",
                rawUserText: "moderate budget",
                confidence: 0.92,
                source: "user",
                reason: "User specified moderate budget range",
                turnUpdated: turnIndex
            });
        } else if (lower.match(/\b(budget is not an issue|unlimited budget|enterprise budget|flexible budget|cost is not a factor)\b/i)) {
            this.updateSlot("budgetSensitivity", {
                state: "KNOWN",
                value: "Cost Priority: Flexible / Enterprise",
                rawUserText: "flexible budget",
                confidence: 0.92,
                source: "user",
                reason: "User expressed flexible expenditure envelope",
                turnUpdated: turnIndex
            });
        }

        // 5. Simplicity Preference
        if (lower.match(/\b(don't know much about cloud|no cloud experience|beginner|new to cloud|somewhere to put my website|simple to set up|simple|simplest|easy|no devops|automated|keep it simple)\b/i)) {
            this.updateSlot("simplicityPreference", {
                state: "KNOWN",
                value: "High (Beginner / Zero-DevOps Preferred)",
                rawUserText: "simple to set up / beginner",
                confidence: 0.95,
                source: "user",
                reason: "Explicit user preference for simplicity and low maintenance",
                turnUpdated: turnIndex
            });
        } else if (lower.match(/\b(vps|virtual server|docker|ssh|linux|full control|developer control)\b/i)) {
            this.updateSlot("simplicityPreference", {
                state: "KNOWN",
                value: "Moderate (Developer Control)",
                rawUserText: "virtual server / developer control",
                confidence: 0.9,
                source: "user",
                reason: "User requested Linux VM or developer control",
                turnUpdated: turnIndex
            });
        } else if (lower.match(/\b(kubernetes|k8s|terraform|custom vpc|multi-cloud|infrastructure as code)\b/i)) {
            this.updateSlot("simplicityPreference", {
                state: "KNOWN",
                value: "Low (Advanced / Custom Infrastructure)",
                rawUserText: "kubernetes / IaC",
                confidence: 0.9,
                source: "user",
                reason: "User specified custom cluster or advanced infrastructure",
                turnUpdated: turnIndex
            });
        }

        // 6. User Accounts & Login
        if (lower.match(/\b(need accounts|need user accounts|users need accounts|require login|need login|users will log in|sign up|authentication|auth|user profiles|user logins)\b/i)) {
            this.updateSlot("userAccounts", {
                state: "KNOWN",
                value: "Yes (User accounts & authentication required)",
                rawUserText: "users need accounts / logins",
                confidence: 0.95,
                source: "user",
                reason: "User stated application requires accounts/logins",
                turnUpdated: turnIndex
            });
        } else if (lower.match(/\b(no accounts|no login|no authentication|public only|no users sign in)\b/i)) {
            this.updateSlot("userAccounts", {
                state: "KNOWN",
                value: "None (Public access / no accounts needed)",
                rawUserText: "no accounts / no login",
                confidence: 0.95,
                source: "user",
                reason: "User stated no authentication or accounts required",
                turnUpdated: turnIndex
            });
        }

        // 7. Database Needs
        if (lower.match(/\b(need a database|store data|store task data|store tasks|store posts|store profiles|postgres|postgresql|mysql|mongodb|nosql|sqlite|database required)\b/i)) {
            let dbType = "Managed Database";
            if (lower.match(/postgres/i)) dbType = "PostgreSQL";
            else if (lower.match(/mysql/i)) dbType = "MySQL";
            else if (lower.match(/mongo/i)) dbType = "MongoDB";

            this.updateSlot("databaseNeeds", {
                state: "KNOWN",
                value: `Yes (Managed ${dbType})`,
                rawUserText: "need database / store data",
                confidence: 0.95,
                source: "user",
                reason: "User stated requirement to persist application data",
                turnUpdated: turnIndex
            });
            if (dbType !== "Managed Database") {
                this.updateSlot("databaseType", {
                    state: "KNOWN",
                    value: dbType,
                    rawUserText: dbType,
                    confidence: 0.95,
                    source: "user",
                    reason: `User explicitly specified ${dbType}`,
                    turnUpdated: turnIndex
                });
            }
        } else if (lower.match(/\b(no database|static only|no data storage|no db)\b/i)) {
            this.updateSlot("databaseNeeds", {
                state: "KNOWN",
                value: "None (Static content only)",
                rawUserText: "no database",
                confidence: 0.95,
                source: "user",
                reason: "User stated no database required",
                turnUpdated: turnIndex
            });
        }

        // 8. File Storage Needs
        if (lower.match(/\b(upload files|file uploads|store images|upload images|store pdfs|upload photos|media files|object storage|s3)\b/i)) {
            this.updateSlot("fileStorageNeeds", {
                state: "KNOWN",
                value: "Yes (Object storage for file/media uploads)",
                rawUserText: "upload files / media storage",
                confidence: 0.95,
                source: "user",
                reason: "User stated file upload or media asset requirements",
                turnUpdated: turnIndex
            });
        } else if (lower.match(/\b(no file uploads|no files|text only|no media storage)\b/i)) {
            this.updateSlot("fileStorageNeeds", {
                state: "KNOWN",
                value: "None (No user file uploads)",
                rawUserText: "no file uploads",
                confidence: 0.95,
                source: "user",
                reason: "User stated no file upload requirements",
                turnUpdated: turnIndex
            });
        }

        // 9. Architecture / Deployment Preference
        if (lower.match(/\b(managed platform|render|vercel|paas|automatic deployment)\b/i)) {
            this.updateSlot("deploymentPreference", {
                state: "KNOWN",
                value: "Managed PaaS (e.g. Render / Vercel)",
                rawUserText: "managed platform",
                confidence: 0.92,
                source: "user",
                reason: "User specified preference for managed platform",
                turnUpdated: turnIndex
            });
        } else if (lower.match(/\b(virtual server|droplet|ec2|vps|ssh|linux server)\b/i)) {
            this.updateSlot("deploymentPreference", {
                state: "KNOWN",
                value: "Virtual Server / IaaS (e.g. DigitalOcean Droplet, AWS EC2)",
                rawUserText: "virtual server / droplet",
                confidence: 0.92,
                source: "user",
                reason: "User specified preference for virtual server compute",
                turnUpdated: turnIndex
            });
        } else if (lower.match(/\b(docker|container|containers|dockerfile)\b/i)) {
            this.updateSlot("deploymentPreference", {
                state: "KNOWN",
                value: "Containerized (Docker)",
                rawUserText: "docker / containers",
                confidence: 0.92,
                source: "user",
                reason: "User specified Docker containers",
                turnUpdated: turnIndex
            });
        }
    }

    /**
     * Handle user uncertainty ("I don't know", "Not sure", "You decide")
     * Binds to the slot asked in the previous assistant turn, or adopts safe defaults
     * WITHOUT inventing fake precise numbers.
     */
    handleUncertaintyForTurn(lastAskedSlots, uncertainty, turnIndex, mode = "beginner") {
        const targetSlotKey = (lastAskedSlots && lastAskedSlots.length > 0)
            ? lastAskedSlots[0]
            : this.findUnresolvedCriticalSlot();

        if (!targetSlotKey) return;

        let assumedValue = "Standard safe default";
        let disclosureText = "Adopted safe conservative default based on workload context";

        switch (targetSlotKey) {
            case "expectedUsers":
                assumedValue = "Low-to-moderate / small-scale initial traffic";
                disclosureText = "Assumed small-to-moderate starter scale typical of an early-stage project without inventing specific visitor numbers.";
                break;
            case "userAccounts":
                assumedValue = "None / Standard public access for initial MVP";
                disclosureText = "Assumed user authentication is not required for the initial MVP.";
                break;
            case "databaseNeeds":
                assumedValue = "Standard lightweight managed database";
                disclosureText = "Assumed a standard lightweight managed database without complex multi-server clustering.";
                break;
            case "fileStorageNeeds":
                assumedValue = "None / Standard application assets only";
                disclosureText = "Assumed file/media uploads are not required initially.";
                break;
            case "budgetSensitivity":
                assumedValue = "Cost Priority: Very High (Cost-conscious default)";
                disclosureText = "Assumed cost-conscious priority to favor free tiers and predictable pricing.";
                break;
            case "simplicityPreference":
                assumedValue = "High (Beginner / Zero-DevOps Preferred)";
                disclosureText = "Assumed simple, managed platform is preferred to avoid complex cloud administration.";
                break;
            case "deploymentPreference":
                assumedValue = "Managed PaaS / Automated setup";
                disclosureText = "Assumed managed setup is preferred over manual virtual server management.";
                break;
            default:
                assumedValue = "Standard safe baseline";
                disclosureText = `Adopted conservative baseline for ${SLOT_DEFINITIONS[targetSlotKey]?.label || targetSlotKey}.`;
                break;
        }

        this.updateSlot(targetSlotKey, {
            state: "ASSUMED",
            value: assumedValue,
            rawUserText: uncertainty.label || "I don't know / You decide",
            confidence: 0.75,
            source: "assumed",
            reason: disclosureText,
            turnUpdated: turnIndex
        });

        // Mark as asked and resolved so it is never repeated
        this.askedSlots.add(targetSlotKey);
    }

    updateSlot(key, data) {
        if (!this.slots[key]) return;
        this.slots[key] = {
            ...this.slots[key],
            ...data
        };
    }

    findUnresolvedCriticalSlot() {
        const coreOrder = ["workloadType", "projectPurpose", "expectedUsers", "budgetSensitivity", "simplicityPreference", "userAccounts", "databaseNeeds"];
        for (const key of coreOrder) {
            if (this.slots[key] && this.slots[key].state === "UNKNOWN" && !this.askedSlots.has(key)) {
                return key;
            }
        }
        return null;
    }

    /**
     * Determine which unresolved slot has the highest decision impact for the given workload.
     */
    selectBestUnresolvedQuestion(experienceMode = "beginner") {
        const mode = ["beginner", "intermediate", "expert"].includes(experienceMode) ? experienceMode : "beginner";

        // Candidate pool: All slots that are NOT KNOWN, NOT ASSUMED, NOT USER_DECLINED, and NOT in askedSlots
        const candidates = Object.values(SLOT_DEFINITIONS).filter((def) => {
            const slot = this.slots[def.key];
            if (!slot) return false;
            if (slot.state === "KNOWN" || slot.state === "ASSUMED" || slot.state === "USER_DECLINED") {
                return false;
            }
            if (this.askedSlots.has(def.key)) {
                return false;
            }

            // Filter out irrelevant slots based on known workload:
            const isAI = this.slots.workloadType.value && this.slots.workloadType.value.includes("AI");
            const isStudent = this.slots.projectPurpose.value && this.slots.projectPurpose.value.includes("College");
            const isStatic = this.slots.workloadType.value && this.slots.workloadType.value.includes("Static");

            if (def.key === "aiGpuNeeds" && !isAI) return false;
            if (def.key === "complianceNeeds" && isStudent) return false;
            if (def.key === "availabilityNeeds" && isStudent) return false;
            if (def.key === "databaseType" && this.slots.databaseNeeds.state === "UNKNOWN") return false;
            if (def.key === "databaseNeeds" && isStatic) return false;

            return true;
        });

        if (candidates.length === 0) {
            return null; // All relevant questions resolved
        }

        // Rank by impact weight descending
        candidates.sort((a, b) => b.impactWeight - a.impactWeight);
        const best = candidates[0];

        // Format mode-specific question text
        const questionText = (best.questions && best.questions[mode]) || best.questions.beginner;

        return {
            slotKey: best.key,
            slotLabel: best.label,
            impactWeight: best.impactWeight,
            questionText,
            mode
        };
    }

    /**
     * Mark a slot as formally asked in the dialogue.
     */
    markSlotAsked(slotKey) {
        if (slotKey) {
            this.askedSlots.add(slotKey);
        }
    }

    /**
     * Evaluate recommendation readiness based on information sufficiency,
     * resolved core slots, and minimum question safety.
     */
    isRecommendationReady(options = {}) {
        const {
            userTurnIndex = 0,
            isExplicitDemand = false,
            isRecalculated = false,
            minQuestionsSatisfied = false
        } = options;

        if (isExplicitDemand || isRecalculated) {
            return true;
        }

        // Core slots that must be resolved (either KNOWN or ASSUMED)
        const coreKeys = ["workloadType", "projectPurpose", "expectedUsers", "budgetSensitivity", "simplicityPreference"];
        const coreResolved = coreKeys.every((k) => {
            const slot = this.slots[k];
            return slot && (slot.state === "KNOWN" || slot.state === "ASSUMED");
        });

        // Also at least one persistence/account signal resolved or assumed
        const dataResolved = (this.slots.databaseNeeds && this.slots.databaseNeeds.state !== "UNKNOWN") ||
                             (this.slots.userAccounts && this.slots.userAccounts.state !== "UNKNOWN") ||
                             (this.askedSlots.has("databaseNeeds") || this.askedSlots.has("userAccounts"));

        const hasMinQuestions = (userTurnIndex >= 2) || minQuestionsSatisfied;

        return Boolean(coreResolved && dataResolved && hasMinQuestions);
    }

    /**
     * Return structured summary for API responses, UI cards, and prompt generation.
     */
    getSlotSummary() {
        const knownSlots = {};
        const assumedSlots = {};
        const unknownSlots = [];

        Object.keys(this.slots).forEach((key) => {
            const s = this.slots[key];
            if (s.state === "KNOWN") {
                knownSlots[key] = s;
            } else if (s.state === "ASSUMED") {
                assumedSlots[key] = s;
            } else {
                unknownSlots.push(key);
            }
        });

        return {
            slots: this.slots,
            knownSlots,
            assumedSlots,
            unknownSlots,
            askedSlots: Array.from(this.askedSlots),
            totalKnown: Object.keys(knownSlots).length,
            totalAssumed: Object.keys(assumedSlots).length
        };
    }
}

module.exports = {
    SLOT_DEFINITIONS,
    RequirementSlotTracker
};
