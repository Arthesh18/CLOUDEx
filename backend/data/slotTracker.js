/**
 * CLOUDEx - Intelligent Requirement Slot Tracker & Question Selection Engine
 *
 * Implements deterministic slot-state tracking:
 * - 19 Information Slots across 4 States: UNKNOWN, KNOWN, ASSUMED, USER_DECLINED
 * - Current-message-first extraction & user correction overrides
 * - Answer binding: short replies ("yes", "500", "Europe") are bound to the slot
 *   the Advisor asked about in the previous turn
 * - Structured inputs (quick-choice options, slider values, persisted state and
 *   optional LLM extraction) merged into the same requirement state
 * - Semantic duplicate detection on QUESTION sentences (preventing repetitive
 *   questions under different phrasing), used both to record what was asked
 *   and to validate a drafted reply before it is sent
 * - Relevance + information-value based question ranking, adaptive stop rule
 * - Safe default assumptions (with plain-language explanations) for "I don't know"
 */

const { detectUnknownIntent } = require("./requirementTranslator");

const VALID_MODES = ["beginner", "intermediate", "expert"];
const MODE_RANK = { beginner: 0, intermediate: 1, expert: 2 };

// Minimum number of questions to ask when important information is missing,
// and the hard ceiling per experience mode (after which defaults are assumed).
const MIN_QUESTIONS = 2;
const MAX_QUESTIONS = { beginner: 4, intermediate: 5, expert: 6 };
// A remaining question is only worth asking if its (relevance-adjusted) value is at least this.
const VALUABLE_SCORE = 0.75;

const RESOLVED_STATES = ["KNOWN", "ASSUMED", "USER_DECLINED"];

// ---------------------------------------------------------------------------
// SLOT DEFINITIONS & METADATA
// ---------------------------------------------------------------------------
// askPatterns: regexes run against a single QUESTION sentence (lower-cased) to
// decide which slot it asks about, whatever the wording.
// concept: short explanation used when the user says "I don't know" / is confused.
// defaultAssumption: the safe value adopted when the user doesn't know.
// minMode: the slot is only asked in this experience mode or above.

const SLOT_DEFINITIONS = {
    workloadType: {
        key: "workloadType",
        label: "Workload Type",
        impactWeight: 1.0,
        core: true,
        minMode: "beginner",
        askPatterns: [
            /\bwhat (?:kind|type|sort) of (?:app|application|project|website|site|system|workload|product|service)\b/,
            /\bwhat (?:are|will) you (?:be )?(?:building|making|creating|developing|hosting|deploying|planning to (?:build|host|deploy|make))\b/,
            /\bwhat (?:does|will) (?:your|the) (?:app|application|project|site|website|product) do\b/,
            /\bworkload (?:type|classification)\b/,
            /\b(?:describe|tell me (?:more )?about) (?:your|the) (?:app|application|project|idea)\b/
        ],
        concept: {
            beginner: "This just means what your project is — for example an online shop, a blog, a mobile app's backend, or an AI tool.",
            intermediate: "The workload shape (web app, API, worker, static site, ML) decides which compute and hosting model fits."
        },
        defaultAssumption: { value: "Web Application / Full-Stack", reason: "Assumed a standard web application since the project type was not specified." },
        questions: {
            beginner: "What kind of application are you building (e.g. web app, mobile backend, personal blog)?",
            intermediate: "What is your primary application workload (e.g. full-stack web app, containerized microservices, background worker)?",
            expert: "What is the workload classification (e.g. event-driven serverless, stateless microservices, distributed cluster)?"
        }
    },
    projectPurpose: {
        key: "projectPurpose",
        label: "Project Purpose",
        impactWeight: 0.82,
        core: true,
        minMode: "beginner",
        askPatterns: [
            /\b(?:is|will) (?:this|it) (?:be )?(?:for|a|an) (?:a |an )?(?:college|class|school|academic|hobby|personal|business|commercial|startup|side|company|client)\b/,
            /\bproject (?:stage|purpose|tier)\b/,
            /\bwhat is (?:this|the project|it) for\b/,
            /\bpurpose of (?:the|your|this) (?:project|app|application)\b/,
            /\b(?:prototype|mvp|poc|sandbox|hobby|personal)\b[^?]*\bor\b[^?]*\b(?:production|commercial|business|enterprise)\b/,
            /\bbusiness tier\b/
        ],
        concept: {
            beginner: "Knowing whether this is a class project, a hobby or a real business helps me balance cost against reliability.",
            intermediate: "The project stage (prototype, MVP, production) sets how much to spend on redundancy and support."
        },
        defaultAssumption: { value: "Early-stage project / MVP", reason: "Assumed an early-stage project, so cost and simplicity are weighted above enterprise features." },
        questions: {
            beginner: "Is this for a college class, a personal hobby, or a business you are launching?",
            intermediate: "What is the project stage (academic prototype, personal project, startup MVP, commercial production)?",
            expert: "What is the deployment environment and business tier (sandbox/PoC, staging, production enterprise)?"
        }
    },
    expectedUsers: {
        key: "expectedUsers",
        label: "Expected Users / Scale",
        impactWeight: 0.95,
        core: true,
        minMode: "beginner",
        semanticAliases: ["how many users", "how many people", "user count", "user base", "expected users", "how many visitors", "number of users", "visitor count", "user traffic"],
        askPatterns: [
            /\bhow many\b[^?]*\b(?:users?|people|persons|visitors?|customers?|students?|members?|shoppers?|clients?|sign-?ups?|subscribers?|players?|buyers?)\b/,
            /\b(?:number|count) of (?:users?|people|visitors?|customers?|shoppers?)\b/,
            /\b(?:expected|estimated|anticipated|target|projected|likely)\b[^?]*\b(?:users?|user base|audience|visitors?|traffic|customers?|scale|load)\b/,
            /\buser (?:base|count|traffic|load|volume|numbers?|scale)\b/,
            /\bhow (?:big|large|much)\b[^?]*\b(?:audience|user base|traffic|usage|scale)\b/,
            /\b(?:traffic|request) volume\b/,
            /\b(?:rps|requests per second|monthly active|daily active|\bmau\b|\bdau\b)\b/,
            /\bhow many (?:are you expecting|do you expect|will (?:use|access|visit))\b/,
            /\bhow many (?:will|would|might|could)\b[^?]*\b(?:use|access|visit|sign up|log in)\b/
        ],
        concept: {
            beginner: "This is roughly how many people will use your app. It decides how big a server you need — a few hundred people can run on a very small, cheap plan.",
            intermediate: "User scale drives instance sizing, autoscaling needs and egress volume."
        },
        defaultAssumption: { value: "Low-to-moderate / small-scale initial traffic", reason: "Assumed small-to-moderate starter scale typical of an early-stage project, without inventing specific visitor numbers." },
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
        minMode: "beginner",
        semanticAliases: ["traffic pattern", "traffic spikes", "predictable traffic", "bursty traffic", "steady traffic"],
        askPatterns: [
            /\b(?:traffic|usage|load|visits?|visitors|orders|sales)\b[^?]*\b(?:spik\w*|burst\w*|steady|evenly|predictable|seasonal|peaks?|pattern|fluctuat\w*|all at once|throughout the day|vary|varies)\b/,
            /\b(?:spik\w*|burst\w*|peaks?|seasonal|sudden rush\w*|flash sales?)\b[^?]*\b(?:traffic|usage|load|sales|times?|visitors|days?)\b/,
            /\bpeak-to-average\b/
        ],
        concept: {
            beginner: "Some apps get a steady trickle of visitors, others get sudden rushes (like during a sale). Rushes need a setup that can grow for a few hours and shrink again.",
            intermediate: "Bursty traffic favours autoscaling or serverless; steady traffic favours flat-priced instances."
        },
        defaultAssumption: { value: "Mostly steady traffic with occasional peaks", reason: "Assumed mostly steady traffic with occasional peaks, so a modest setup with room to scale is suitable." },
        questions: {
            beginner: "Will people visit evenly throughout the day, or all at once during specific times (like a sale or launch)?",
            intermediate: "Do you anticipate steady baseline traffic or spiky, burst-heavy usage patterns?",
            expert: "What are your ingress traffic variability, peak-to-average ratio, and auto-scaling step constraints?"
        }
    },
    concurrentUsers: {
        key: "concurrentUsers",
        label: "Concurrent Users",
        impactWeight: 0.7,
        core: false,
        minMode: "intermediate",
        semanticAliases: ["concurrent users", "active at the same time", "simultaneous users"],
        askPatterns: [
            /\b(?:concurrent\w*|simultaneous(?:ly)?|at the same time|same minute|connection pool)\b/
        ],
        concept: {
            beginner: "This is how many people are using the app at the very same moment, which is usually far fewer than your total users.",
            intermediate: "Peak concurrency sizes connection pools, worker counts and database connections."
        },
        defaultAssumption: { value: "Proportional to total users (no unusual concurrency)", reason: "Assumed normal concurrency proportional to the expected user count." },
        questions: {
            beginner: "Could many people be clicking and using the app at the exact same minute?",
            intermediate: "What peak concurrent user connections do you expect to handle simultaneously?",
            expert: "What are your peak concurrent socket/connection pool dimensions?"
        }
    },
    userAccounts: {
        key: "userAccounts",
        label: "User Accounts & Authentication",
        impactWeight: 0.8,
        core: true,
        minMode: "beginner",
        semanticAliases: ["need accounts", "require login", "need login", "sign up", "authentication", "user profiles", "logins", "user sign-in"],
        askPatterns: [
            /\b(?:log ?in|log into|sign ?in|sign ?up|accounts?|authenticat\w*|\bauth\b|user profiles?|identity|oauth|\bsso\b|saml|passwords?)\b/
        ],
        concept: {
            beginner: "Accounts means people sign up and log in with an email and password, so the app can remember them.",
            intermediate: "Auth needs determine whether you want a managed identity service or roll your own."
        },
        defaultAssumption: { value: "Not required for the first version", reason: "Assumed user authentication is not required for the initial version." },
        questions: {
            beginner: "Will people need to create an account or log in to use your application?",
            intermediate: "Does your application require user authentication and identity management (JWT, OAuth, or session-based)?",
            expert: "What identity/auth architecture are you integrating (OAuth2/OIDC, SAML, SSO, or custom token service)?"
        }
    },
    databaseNeeds: {
        key: "databaseNeeds",
        label: "Database Needs & Persistence",
        impactWeight: 0.88,
        core: true,
        minMode: "beginner",
        semanticAliases: ["need a database", "store data", "store tasks", "store posts", "store profiles", "what database", "database needs", "database required"],
        askPatterns: [
            /\b(?:database|\bdb\b|store (?:any )?(?:data|information|records|details)|save (?:any )?(?:data|information)|persist\w*|data storage|keep track of|remember (?:things|data|information|details)|keep (?:information|data|records))\b/
        ],
        concept: {
            beginner: "A database is where your app keeps information like products, orders or user profiles, so nothing is lost when the server restarts.",
            intermediate: "Persistence needs decide whether you need a managed database tier and backups."
        },
        defaultAssumption: { value: "Standard lightweight managed database", reason: "Assumed a standard lightweight managed database without complex multi-server clustering." },
        questions: {
            beginner: "Will your application need to store data like tasks, user profiles, or messages in a database?",
            intermediate: "What database requirements do you have (e.g. relational PostgreSQL/MySQL vs document store MongoDB)?",
            expert: "What persistence tier and consistency model do you require (e.g. ACID relational with read replicas, NoSQL key-value, distributed cache)?"
        }
    },
    databaseType: {
        key: "databaseType",
        label: "Database Type (SQL vs NoSQL)",
        impactWeight: 0.66,
        core: false,
        minMode: "intermediate",
        semanticAliases: ["what database", "sql or nosql", "postgres or mongo", "relational or document"],
        askPatterns: [
            /\b(?:sql|nosql|postgres\w*|mysql|mongo\w*|relational|document (?:store|database|db)|database engine|which database|what database|kind of database|type of database|key-value)\b/
        ],
        concept: {
            beginner: "There are table-style databases (like spreadsheets) and flexible document databases. For most apps either works fine.",
            intermediate: "Relational (PostgreSQL/MySQL) suits transactional data like orders; document stores suit flexible schemas."
        },
        defaultAssumption: { value: "Managed PostgreSQL (relational)", reason: "Assumed a managed relational database (PostgreSQL), the safest general-purpose choice." },
        questions: {
            beginner: "Do you have a specific database in mind, like PostgreSQL, MySQL, or MongoDB?",
            intermediate: "Do you prefer a managed SQL database (PostgreSQL/MySQL) or a document/NoSQL store?",
            expert: "What database engine and schema topology (PostgreSQL, MySQL, Redis, DynamoDB/MongoDB) are you provisioning?"
        }
    },
    storageNeeds: {
        key: "storageNeeds",
        label: "General Storage Needs",
        impactWeight: 0.6,
        core: false,
        minMode: "expert",
        semanticAliases: ["storage needs", "how much storage", "disk space", "storage capacity"],
        askPatterns: [
            /\b(?:how much (?:storage|disk|space)|storage (?:capacity|space|needs|requirements)|disk space|iops|block storage|block volume|terabytes?|gigabytes?)\b/
        ],
        concept: {
            beginner: "This is how much disk space your app needs. Most small apps need very little.",
            intermediate: "Volume size and IOPS needs affect block storage tier and cost."
        },
        defaultAssumption: { value: "Modest storage (tens of GB)", reason: "Assumed modest storage requirements typical of a small-to-medium application." },
        questions: {
            beginner: "Will your app need lots of storage space for files or data?",
            intermediate: "What are your initial persistent block storage or database disk requirements?",
            expert: "What are your IOPS throughput and persistent block volume retention constraints?"
        }
    },
    fileStorageNeeds: {
        key: "fileStorageNeeds",
        label: "File & Media Uploads (Object Storage)",
        impactWeight: 0.74,
        core: false,
        minMode: "beginner",
        semanticAliases: ["upload files", "file uploads", "store images", "upload images", "store pdfs", "media files", "object storage", "s3 storage", "upload photos"],
        askPatterns: [
            /\b(?:upload\w*|photos?|images?|videos?|media|pdfs?|object storage|\bs3\b|blob storage|attachments?)\b/,
            /\b(?:store|host|share|serve)\b[^?]*\bfiles?\b/
        ],
        concept: {
            beginner: "If people upload photos, videos or documents, those are kept in a separate cheap 'file locker' service rather than on the server itself.",
            intermediate: "User uploads usually go to S3-compatible object storage, ideally behind a CDN; egress pricing matters here."
        },
        defaultAssumption: { value: "None / Standard application assets only", reason: "Assumed file/media uploads are not required initially." },
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
        minMode: "beginner",
        semanticAliases: ["gpu", "gpus", "cuda", "model training", "inference", "ai acceleration"],
        askPatterns: [
            /\b(?:gpus?|cuda|ai hardware|accelerat\w*|train(?:ing)? (?:a |your |the )?models?|model (?:training|inference)|inference|h100|a100|external (?:ai )?apis?)\b/
        ],
        concept: {
            beginner: "Training your own AI model needs special, expensive chips (GPUs). Calling an existing AI service like OpenAI or Groq does not.",
            intermediate: "Self-hosted training/inference needs GPU instances; calling hosted model APIs only needs ordinary CPU compute."
        },
        defaultAssumption: { value: "External AI API integration (no dedicated GPUs)", reason: "Assumed the app calls hosted AI APIs rather than training models, so dedicated GPUs are not required." },
        questions: {
            beginner: "Does your application need special AI hardware (GPUs) to run or train models, or will it use an existing AI service?",
            intermediate: "Do you require dedicated GPU hardware for model inference/training, or are you calling external APIs (OpenAI/Groq)?",
            expert: "What compute accelerator profile (e.g. NVIDIA H100/A100 SXM, vLLM/TensorRT inference) is required?"
        }
    },
    geographicNeeds: {
        key: "geographicNeeds",
        label: "Geographic Target Region",
        impactWeight: 0.74,
        core: false,
        minMode: "beginner",
        semanticAliases: ["geographic region", "where are users", "datacenter location", "location", "country", "region"],
        askPatterns: [
            /\bwhere\b[^?]*\b(?:users?|visitors?|customers?|audience|shoppers?|people|located|based)\b/,
            /\b(?:geograph\w*|datacenter|data center|regions?|countr(?:y|ies)|located|location)\b/
        ],
        concept: {
            beginner: "Servers close to your users make the app feel faster, so it helps to know where most of them live.",
            intermediate: "Region choice affects latency, data-residency obligations and which providers have nearby datacenters."
        },
        defaultAssumption: { value: "Single region close to the primary audience", reason: "Assumed a single region near your main audience; multi-region can be added later." },
        questions: {
            beginner: "Where in the world are most of your visitors located (e.g. US, Europe, India, Asia)?",
            intermediate: "What primary geographic region or datacenter locations are you targeting for low latency?",
            expert: "What latency boundary and geographic deployment topology (single-region, multi-region active-active, edge) do you mandate?"
        }
    },
    complianceNeeds: {
        key: "complianceNeeds",
        label: "Compliance & Data Residency",
        impactWeight: 0.7,
        core: false,
        minMode: "beginner",
        semanticAliases: ["compliance", "gdpr", "hipaa", "soc2", "data residency", "privacy requirements"],
        askPatterns: [
            /\b(?:complian\w*|gdpr|hipaa|soc ?2|\bpci\b|iso ?27001|fedramp|regulat\w*|data residency|sovereign\w*|privacy (?:rules|laws|requirements)|legal (?:rules|requirements))\b/
        ],
        concept: {
            beginner: "Some businesses have legal rules about where customer data is stored (for example inside Europe) or how card payments are handled.",
            intermediate: "Frameworks such as GDPR, PCI DSS or HIPAA restrict regions and provider choice."
        },
        defaultAssumption: { value: "No special compliance beyond standard best practice", reason: "Assumed no special regulatory requirements; payments, if any, handled by a provider such as Stripe." },
        questions: {
            beginner: "Do you have strict privacy or legal rules (like keeping data inside Europe, or handling card payments yourself)?",
            intermediate: "Are there specific compliance or data sovereignty requirements (GDPR, PCI DSS, SOC2, HIPAA)?",
            expert: "What regulatory frameworks (SOC2 Type II, ISO 27001, PCI DSS, HIPAA BAA, FedRAMP, EU Data Sovereignty) must the provider satisfy?"
        }
    },
    availabilityNeeds: {
        key: "availabilityNeeds",
        label: "Availability & Uptime SLA",
        impactWeight: 0.78,
        core: false,
        minMode: "beginner",
        semanticAliases: ["uptime", "sla", "high availability", "zero downtime", "redundancy", "24/7"],
        askPatterns: [
            /\b(?:uptime|downtime|availab\w*|24\/7|24x7|round the clock|always (?:on|online|available|running|up)|\bsla\b|redundan\w*|failover|\brto\b|\brpo\b|restarts? occasionally|outages?|goes? down|go offline)\b/
        ],
        concept: {
            beginner: "Availability is how much of the time your app stays online. 24/7 means it should almost never be down, which may need a backup server.",
            intermediate: "Availability targets decide single-instance vs multi-zone deployment and managed-DB failover."
        },
        defaultAssumption: { value: "Standard availability (~99.9%, single region)", reason: "Assumed standard availability, which is typical for early-stage projects." },
        questions: {
            beginner: "Is it okay if the app restarts occasionally, or must it run 24/7 without downtime?",
            intermediate: "What are your availability expectations (e.g. 99.9% standard vs multi-zone redundancy)?",
            expert: "What are your RTO/RPO targets and formal SLA availability commitments (99.99%+ active-active)?"
        }
    },
    budgetSensitivity: {
        key: "budgetSensitivity",
        label: "Budget Sensitivity & Cost",
        impactWeight: 0.96,
        core: true,
        minMode: "beginner",
        semanticAliases: ["budget", "spend", "cost", "how much money", "price", "free tier", "monthly budget", "spend much money"],
        askPatterns: [
            /\b(?:budget\w*|spend\w*|afford\w*|free tier|cheap\w*|expensive|pricing|price range|price limit|how much money|how much (?:are you|would you be) willing)\b/,
            /\b(?:monthly|per month|a month)\b[^?]*\b(?:cost|bill|spend|pay|budget|price)\b/,
            /\b(?:cost|costs)\b[^?]*\b(?:important|priority|matter|concern|sensitiv\w*|limit|target|range|envelope)\b/,
            /\bhow (?:important|much does) (?:is )?(?:the )?cost\b/,
            /\$\s?\d/
        ],
        concept: {
            beginner: "Your budget is how much you're comfortable paying each month. Many small projects can run free or for under $10/month.",
            intermediate: "Budget determines whether to favour flat-priced VPS/PaaS tiers, free tiers, or metered hyperscaler services."
        },
        defaultAssumption: { value: "Cost Priority: High (Cost-conscious default)", reason: "Assumed a cost-conscious priority, favouring free tiers and predictable flat pricing." },
        questions: {
            beginner: "What is your target monthly budget, or do you prefer a free tier / lowest possible cost?",
            intermediate: "What is your target monthly cloud budget range, and is predictable flat pricing important?",
            expert: "What are your cost-performance envelope, commitment pricing preferences (reserved vs spot), and egress tolerance?"
        }
    },
    simplicityPreference: {
        key: "simplicityPreference",
        label: "Simplicity vs Developer Control",
        impactWeight: 0.9,
        core: true,
        minMode: "beginner",
        semanticAliases: ["simplicity", "easy to set up", "managed platform", "zero devops", "keep it simple", "simple to set up"],
        askPatterns: [
            /\b(?:simpl\w*|easy|easier|hands-?off|zero devops|abstraction tier|developer control|full control|fully managed)\b/,
            /\bmanaged (?:platform|service|paas|hosting|option)\b/,
            /\b(?:paas|platform-as-a-service)\b/,
            /\b(?:manage|configure|run|maintain|handle)\b[^?]*\bservers?\b/
        ],
        concept: {
            beginner: "A managed platform handles the servers for you (you just upload your code). Managing your own server is cheaper at scale but means you look after updates and security.",
            intermediate: "Managed PaaS trades some cost and flexibility for much lower operational overhead than self-managed VMs."
        },
        defaultAssumption: { value: "High (Managed / low-maintenance preferred)", reason: "Assumed a simple, managed platform is preferred to avoid server administration." },
        questions: {
            beginner: "Do you want something simple that handles the servers for you, or would you rather configure servers yourself?",
            intermediate: "Do you prefer a managed PaaS (like Render/Vercel/App Platform) for developer velocity, or full Linux VM control (like DigitalOcean Droplets)?",
            expert: "What is your desired infrastructure abstraction tier (fully managed PaaS vs Kubernetes/IaaS with custom IaC)?"
        }
    },
    technicalPreference: {
        key: "technicalPreference",
        label: "Technical Control & Management",
        impactWeight: 0.6,
        core: false,
        minMode: "expert",
        semanticAliases: ["technical control", "management level", "devops", "self-managed"],
        askPatterns: [
            /\b(?:maintenance|os updates|firewall rules|backups|technical control|devops|self-?managed|comfortable managing|control plane)\b/
        ],
        concept: {
            beginner: "This is about how much of the behind-the-scenes server work you want to do yourself.",
            intermediate: "Operational ownership: patching, firewalling, backups and observability."
        },
        defaultAssumption: { value: "Provider-managed operations preferred", reason: "Assumed provider-managed operations to keep maintenance overhead low." },
        questions: {
            beginner: "Do you prefer a visual dashboard or are you comfortable managing servers?",
            intermediate: "How much infrastructure maintenance (OS updates, firewall rules, backups) are you willing to manage?",
            expert: "What operational control plane and CI/CD/GitOps integration model do you require?"
        }
    },
    deploymentPreference: {
        key: "deploymentPreference",
        label: "Deployment Method",
        impactWeight: 0.68,
        core: false,
        minMode: "intermediate",
        semanticAliases: ["deployment method", "how will you deploy", "deploy with git", "deploy containers"],
        askPatterns: [
            /\b(?:deploy\w*|ci\/cd|pipeline|git ?push|github|gitlab|gitops|argocd|dockerfile|containers?|container registry|blue-green)\b/
        ],
        concept: {
            beginner: "Deployment is how your code gets onto the server — for example automatically every time you push to GitHub.",
            intermediate: "Deployment workflow (git-push PaaS, container registry, IaC) affects which platforms fit your tooling."
        },
        defaultAssumption: { value: "Git-based automatic deploys", reason: "Assumed git-based automatic deployment, which most managed platforms support." },
        questions: {
            beginner: "Would you like to deploy automatically by connecting your GitHub repository?",
            intermediate: "How are you planning to deploy (Git push auto-deploy, pre-built Docker containers, or manual SSH)?",
            expert: "What deployment pipeline (GitOps with ArgoCD/Flux, container registry CI push, or blue-green rollout) are you architecting?"
        }
    },
    architecturePreference: {
        key: "architecturePreference",
        label: "Architecture Topology",
        impactWeight: 0.66,
        core: false,
        minMode: "intermediate",
        semanticAliases: ["architecture", "monolith or microservices", "serverless", "virtual servers"],
        askPatterns: [
            /\b(?:monolith\w*|microservices?|serverless|architecture|topology|service mesh|separate (?:pieces|services|frontend)|single (?:combined|unified) (?:project|app))\b/
        ],
        concept: {
            beginner: "Whether your app is one single program or several smaller pieces that talk to each other.",
            intermediate: "Monolith vs decoupled services affects whether a single PaaS app or multiple services/containers fit best."
        },
        defaultAssumption: { value: "Single application (monolith) with separate database", reason: "Assumed a single application with a separate managed database, the simplest topology to run." },
        questions: {
            beginner: "Is your app a single combined project, or split into separate pieces?",
            intermediate: "Is this a single unified monolith or separate decoupled frontend/backend services?",
            expert: "What architectural topology (modular monolith, microservices with service mesh, or event-driven serverless) are you building?"
        }
    }
};

// ---------------------------------------------------------------------------
// TEXT HELPERS
// ---------------------------------------------------------------------------

const NUMBER_PATTERN = "(\\d{1,3}(?:,\\d{3})+|\\d+(?:\\.\\d+)?\\s?(?:k|m)\\b|\\d+)";
const PEOPLE_WORDS = "(?:users?|people|persons|visitors?|students?|members?|accounts?|customers?|shoppers?|buyers?|clients?|subscribers?|players?|employees?|downloads?|visits?)";

function parseHumanNumber(raw) {
    if (!raw) return null;
    const s = String(raw).toLowerCase().replace(/,/g, "").replace(/\s+/g, "");
    let n = parseFloat(s);
    if (Number.isNaN(n)) return null;
    if (s.endsWith("k")) n *= 1000;
    else if (s.endsWith("m")) n *= 1000000;
    return Math.round(n);
}

function formatCount(n) {
    return Number(n).toLocaleString("en-US");
}

/**
 * Split text into sentences and return only the ones that ask something.
 */
function getQuestionSentences(text) {
    if (typeof text !== "string" || !text.includes("?")) return [];
    const segments = text
        .replace(/\r/g, "")
        .split(/\n+|(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter(Boolean);
    return segments.filter((s) => s.includes("?"));
}

/**
 * Remove leading context clauses ("Since you expect 500 users, ...") so that a
 * reference to a known fact is not mistaken for a question about it.
 */
function stripContextClauses(sentence) {
    let s = sentence.toLowerCase().replace(/[*_`#>]/g, "").replace(/^\s*(?:[-•\d.)]+\s*)/, "");
    s = s.replace(/^(?:since|given(?: that)?|because|as|with|based on|you mentioned|you said|now that|considering|for|knowing)\b[^,?]*,\s*/, "");
    s = s.replace(/^(?:great|perfect|thanks|got it|okay|ok|awesome|nice)[^,?]*[,!]\s*/, "");
    return s;
}

/**
 * Identify which slot(s) one question sentence is asking about.
 */
function detectSlotsInQuestion(sentence) {
    const s = stripContextClauses(sentence);
    const detected = [];
    Object.values(SLOT_DEFINITIONS).forEach((def) => {
        if (!def.askPatterns) return;
        if (def.askPatterns.some((re) => re.test(s))) {
            detected.push(def.key);
        }
    });
    // A sentence that restates a concrete user count ("your 500 users") is
    // referencing a known value, not asking for it.
    if (detected.includes("expectedUsers") && new RegExp(`\\d[\\d,.]*\\s?k?\\s*${PEOPLE_WORDS}`, "i").test(s) && !/\bhow many\b/.test(s)) {
        detected.splice(detected.indexOf("expectedUsers"), 1);
    }
    // Budget words inside a clear availability or user-count question are context, not the topic.
    if (detected.includes("budgetSensitivity") && detected.length > 1 && !/\b(?:budget|spend|afford|how much money|price range|\$)/.test(s)) {
        detected.splice(detected.indexOf("budgetSensitivity"), 1);
    }
    return detected;
}

function isYes(text) {
    return /^\s*(?:yes|yeah|yep|yup|sure|definitely|of course|absolutely|correct|right|y|i do|we do|it will|they will|probably|likely)\b/i.test(text);
}

function isNo(text) {
    return /^\s*(?:no|nope|nah|not really|none|n|not needed|no need|we don'?t|i don'?t need|not at all|never)\b/i.test(text);
}

/**
 * "I don't know much about cloud" describes the user's experience, it does not
 * answer the question that was asked. Strip those phrases before testing for
 * uncertainty about the asked topic.
 */
function detectAnswerUncertainty(text) {
    if (typeof text !== "string") return null;
    const cleaned = text
        .replace(/\bi\s+(?:don'?t|do not)\s+know\s+(?:much|anything|a lot|a thing)\s+about\s+(?:the\s+)?(?:cloud|cloud computing|servers|hosting|tech\w*|devops|this stuff)\b/gi, "")
        .replace(/\b(?:new to|not familiar with)\s+(?:the\s+)?cloud\b/gi, "");
    if (!cleaned.trim()) return null;
    return detectUnknownIntent(cleaned);
}

// ---------------------------------------------------------------------------
// SLOT TRACKER CLASS
// ---------------------------------------------------------------------------

class RequirementSlotTracker {
    constructor() {
        this.slots = {};
        this.askedSlots = new Set();
        this.askedBeforeCurrentTurn = new Set();
        this.clarifyCounts = {};
        this.historyLog = [];
        this.turnEvents = { extracted: [], assumed: [], clarify: [], boundAnswers: [] };
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
                source: null, // "user" | "option" | "slider" | "llm" | "answer" | "assumed" | "inferred"
                reason: null,
                turnUpdated: 0
            };
        });
    }

    isResolved(key) {
        const slot = this.slots[key];
        return Boolean(slot && RESOLVED_STATES.includes(slot.state));
    }

    /**
     * Parse conversation and current message to update slot states.
     * Order of operations:
     * 1. Load persisted structured state (options, sliders, LLM extraction from earlier turns).
     * 2. Replay previous turns: record what each assistant message asked, extract from each
     *    user message, bind short answers / "I don't know" to the question just asked.
     * 3. Extract from the CURRENT user message first (corrections override older values).
     * 4. Apply structured inputs from this turn (selected quick-choice option, slider values,
     *    LLM extraction of the current message).
     * 5. Handle "I don't know" / confusion, then bind any remaining short answer.
     * 6. Apply safe context inferences (e.g. e-commerce needs a database).
     *
     * options: { externalState, selectedOption, sliderPreferences, llmSlots }
     */
    processTurn(currentMessage = "", conversation = [], experienceMode = "beginner", options = {}) {
        const mode = VALID_MODES.includes(experienceMode) ? experienceMode : "beginner";
        const { externalState = null, selectedOption = null, sliderPreferences = null, llmSlots = null } = options || {};
        const history = Array.isArray(conversation)
            ? conversation.filter((m) => m && typeof m.content === "string" && (m.role === "user" || m.role === "assistant"))
            : [];

        // Step 1: persisted state as the baseline
        if (externalState) {
            this.applyExternalState(externalState);
        }

        // Step 2: replay history in order
        let turnCounter = 0;
        let lastAsked = [];
        history.forEach((msg) => {
            if (msg.role === "assistant") {
                lastAsked = this.detectAskedSlotsInText(msg.content);
                lastAsked.forEach((k) => this.askedSlots.add(k));
            } else {
                turnCounter++;
                this.extractSlotsFromText(msg.content, turnCounter, false);
                this.resolveAnswerToAskedSlots(msg.content, lastAsked, turnCounter, mode, false);
                lastAsked = [];
            }
        });

        this.askedBeforeCurrentTurn = new Set(this.askedSlots);

        // Step 3: current message (highest priority)
        const currentTurnIndex = turnCounter + 1;
        this.currentTurnIndex = currentTurnIndex;
        const lastAssistantMsg = this.getLastAssistantMessage(history);
        const lastAskedSlots = lastAssistantMsg ? this.detectAskedSlotsInText(lastAssistantMsg.content) : [];

        const beforeStates = this.snapshotStates();
        this.extractSlotsFromText(currentMessage, currentTurnIndex, true);

        // Step 4: structured inputs from this turn
        if (selectedOption && selectedOption.slotKey) {
            this.applySelectedOption(selectedOption, currentTurnIndex);
        }
        if (sliderPreferences && typeof sliderPreferences === "object") {
            this.applySliderPreferences(sliderPreferences, currentTurnIndex);
        }
        if (llmSlots && typeof llmSlots === "object") {
            this.applyLLMExtraction(llmSlots, currentTurnIndex);
        }

        // Step 5: uncertainty / short answers for the question just asked
        this.resolveAnswerToAskedSlots(currentMessage, lastAskedSlots, currentTurnIndex, mode, true);

        // Step 6: context inferences
        this.applyContextInferences(currentTurnIndex);

        this.turnEvents.extracted = Object.keys(this.slots).filter((k) =>
            this.slots[k].turnUpdated === currentTurnIndex &&
            this.slots[k].state === "KNOWN" &&
            beforeStates[k] !== JSON.stringify([this.slots[k].state, this.slots[k].value])
        );

        return this.getSlotSummary();
    }

    snapshotStates() {
        const snap = {};
        Object.keys(this.slots).forEach((k) => {
            snap[k] = JSON.stringify([this.slots[k].state, this.slots[k].value]);
        });
        return snap;
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
     * Identifies which information slot(s) the QUESTIONS in an assistant message ask about.
     * Statements ("You mentioned 500 users.") are ignored; only sentences with "?" count.
     */
    detectAskedSlotsInText(text) {
        const detected = new Set();
        getQuestionSentences(text).forEach((q) => {
            detectSlotsInQuestion(q).forEach((k) => detected.add(k));
        });
        return Array.from(detected);
    }

    /**
     * Extracts information slots from text while STRICTLY preserving user semantics:
     * - "100 users" -> "approximately 100 users" (never "100 concurrent users" or "500 visitors").
     * - Corrections override old values.
     */
    extractSlotsFromText(text, turnIndex, isCurrentTurn = false) {
        if (typeof text !== "string" || !text.trim()) return;
        const lower = text.toLowerCase();
        const known = (key, value, rawUserText, reason, confidence = 0.95) => {
            this.updateSlot(key, {
                state: "KNOWN",
                value,
                rawUserText,
                confidence,
                source: "user",
                reason,
                turnUpdated: turnIndex
            });
        };

        // 1. Expected Users (Preserving User Semantics)
        const correctionMatch = lower.match(new RegExp(`(?:actually|closer to|now i expect|change (?:it )?to|increase(?:d)? to|rather|update(?:d)? to|make it)\\s*(?:around|about|roughly|~)?\\s*${NUMBER_PATTERN}\\s*${PEOPLE_WORDS}?`, "i"));
        const usersMatch = lower.match(new RegExp(`${NUMBER_PATTERN}\\+?\\s*(?:-|to)?\\s*(?:\\d[\\d,]*\\s*)?(?:daily |monthly |active |concurrent |expected |regular |paying )?${PEOPLE_WORDS}`, "i"));
        const isConcurrentMention = /\b(?:concurrent|simultaneous|at the same time|at once)\b/.test(lower);

        if (correctionMatch || usersMatch) {
            const match = correctionMatch || usersMatch;
            const count = parseHumanNumber(match[1]);
            if (count !== null && count > 0) {
                const approx = /\b(?:around|about|roughly|approximately|approx|maybe|~|nearly|almost|up to|under|over|less than|more than|at least)\b/.test(lower);
                const prefix = /\b(?:under|less than|up to|below)\b/.test(lower) ? "under" : (/\b(?:over|more than|at least)\b/.test(lower) ? "over" : "approximately");
                const value = `${prefix} ${formatCount(count)} users`;
                if (isConcurrentMention && /\b(?:concurrent|simultaneous|at the same time|at once)\b/.test(match[0] + lower.slice(match.index, match.index + 60))) {
                    known("concurrentUsers", `${prefix} ${formatCount(count)} concurrent users`, match[0].trim(), "Explicitly stated concurrency by user");
                } else {
                    known("expectedUsers", value, match[0].trim(), isCurrentTurn && correctionMatch ? "Explicit user correction" : (approx ? "Stated by user (approximate)" : "Explicitly stated by user"));
                }
            }
        } else if (/\b(?:just me|just myself|only me|me and (?:a )?(?:few|couple)|few friends|testing only|portfolio for demo|personal use only)\b/.test(lower)) {
            known("expectedUsers", "very small scale (~just author / few friends)", "just me / testing only", "Explicitly stated small personal testing scope", 0.9);
        } else if (/\b(?:a few hundred|few hundred|hundreds of|several hundred)\b/.test(lower)) {
            known("expectedUsers", "a few hundred users", "a few hundred", "Stated by user (approximate)", 0.85);
        } else if (/\b(?:a few thousand|few thousand|thousands of|several thousand)\b/.test(lower)) {
            known("expectedUsers", "a few thousand users", "thousands", "Stated by user (approximate)", 0.85);
        } else if (/\b(?:millions of|a million|viral|huge traffic|massive traffic|heavy traffic)\b/.test(lower)) {
            known("expectedUsers", "very large scale (hundreds of thousands+ users)", "very large scale", "Stated by user (approximate)", 0.8);
        } else if (/\b(?:small (?:number|group|audience) of (?:users|people)|not many (?:users|people)|low traffic|small traffic)\b/.test(lower)) {
            known("expectedUsers", "small scale (low traffic)", "small audience", "Stated by user (approximate)", 0.8);
        }

        // 2. Project Purpose
        if (/\b(?:college|student|university|school|assignment|coursework|semester|thesis|class project|final year|academic)\b/.test(lower)) {
            known("projectPurpose", "College / Academic Project", "college / student project", "Explicitly stated academic project purpose");
        } else if (/\b(?:portfolio|personal|hobby|side project|experiment|for fun|just learning|learning project|to learn)\b/.test(lower)) {
            known("projectPurpose", "Personal / Hobby Project", "personal / hobby project", "Explicitly stated personal hobby purpose");
        } else if (/\b(?:enterprise|corporate|mission critical|large business|large company)\b/.test(lower)) {
            known("projectPurpose", "Production / Enterprise", "enterprise production", "Explicitly stated enterprise production workload");
        } else if (/\b(?:startup|saas|mvp|my business|small business|our business|a business|client|commercial|product launch|e-?commerce|online (?:store|shop)|sell (?:products|online)|revenue|customers|(?:my|our|a) (?:shop|salon|restaurant|bakery|cafe|clinic|gym|agency|store|hotel|company|firm|brand))\b/.test(lower)) {
            known("projectPurpose", "Business / Startup (commercial)", "business / commercial project", "Commercial purpose stated or clearly implied by user", 0.9);
        }

        // 3. Workload Type
        if (/\b(?:e-?commerce|online (?:store|shop)|web ?shop|shopify|woocommerce|shopping cart|sell (?:products|items|things) online|marketplace)\b/.test(lower)) {
            known("workloadType", "E-commerce Web Application", "e-commerce", "Explicitly stated e-commerce use case");
        } else if (/\b(?:ai|gpu|gpus|machine learning|deep learning|llm|pytorch|tensorflow|cuda|model training|inference|chatbot|computer vision)\b/.test(lower)) {
            known("workloadType", "AI / Machine Learning Application", "AI / ML workload", "Explicitly mentioned AI/ML or GPU compute requirements");
        } else if (/\b(?:game server|multiplayer|video streaming|live stream\w*|real-?time chat|websockets?)\b/.test(lower)) {
            known("workloadType", "Real-Time / Media / Gaming", "real-time / media workload", "Explicitly stated real-time or media workload", 0.9);
        } else if (/\b(?:static site|static website|landing page|documentation site|docs site|blog|portfolio site|portfolio website)\b/.test(lower) && !/\b(?:backend|database|postgres|mysql|mongo|node|api|login|accounts)\b/.test(lower)) {
            known("workloadType", "Static Website / Frontend", "static website", "Explicitly identified static frontend website", 0.9);
        } else if (/\b(?:mobile app|mobile backend|flutter|react native|ios app|android app)\b/.test(lower)) {
            known("workloadType", "Mobile App Backend", "mobile app backend", "Explicitly stated mobile application backend", 0.92);
        } else if (/\b(?:api|apis|rest api|graphql|fastapi|backend api|microservices|endpoints)\b/.test(lower) && !/\b(?:frontend|ui|website)\b/.test(lower)) {
            known("workloadType", "Backend API / Microservices", "backend API / microservices", "Explicitly stated backend API or microservices", 0.92);
        } else if (/\b(?:website|web app|webapp|web application|application|college project|college website|portal|dashboard|crm|booking system|react|next\.?js|node|vue|django|flask|express|laravel|rails)\b/.test(lower)) {
            known("workloadType", "Web Application / Full-Stack", "web application", "Identified web application or framework", 0.88);
        }

        // 4. Budget Sensitivity / Cost Priority
        if (/\b(?:cheap\w*|very little budget|little budget|limited budget|tight budget|low budget|small budget|no budget|zero budget|minimal budget|budget is (?:very |quite |really |pretty )?(?:limited|tight|low|small|minimal)|lowest (?:possible )?cost|low cost|low-cost|keep (?:the )?costs? (?:low|down|minimal)|costs? (?:low|down) as possible|minimi[sz]e (?:the )?costs?|as cheap as possible|affordable|free tier|for free|free hosting|student budget|don'?t want to spend (?:much|a lot)|not (?:much|a lot of) money|not spend much|can'?t spend much|minimum cost|cost is (?:very |really )?important|cost-?conscious|cost-?sensitive|on a budget)\b/.test(lower)
            || /\$\s?(?:0|5|10|15|20)\b(?!\d)/.test(lower)) {
            known("budgetSensitivity", "Cost Priority: Very High (Free Tier / Sub-$10 Preferred)", "low budget / keep cost low", "Explicit user budget constraint");
        } else if (/\b(?:reasonable budget|moderate budget|fair price|mid-?range budget|medium budget|some budget|decent budget)\b/.test(lower) || /\$\s?(?:2[5-9]|[3-9]\d|1\d\d|200)\b/.test(lower)) {
            known("budgetSensitivity", "Cost Priority: Moderate ($25-$200/mo)", "moderate budget", "User specified moderate budget range", 0.92);
        } else if (/\b(?:budget is not an? (?:issue|problem|concern)|unlimited budget|enterprise budget|flexible budget|cost is not (?:a|an) (?:factor|issue|concern)|money is(?:n'?t| not) (?:a|an) (?:issue|problem)|don'?t care about (?:the )?(?:cost|price)|large budget|big budget|cost doesn'?t matter)\b/.test(lower) || /\$\s?\d{4,}/.test(lower)) {
            known("budgetSensitivity", "Cost Priority: Flexible / Enterprise", "flexible budget", "User expressed flexible expenditure envelope", 0.92);
        }

        // 5. Availability (24/7, uptime)
        if (/\b(?:24\s?\/\s?7|24x7|24 hours|round the clock|around the clock|always (?:on|online|available|up|running)|high(?:ly)? availab\w*|zero downtime|no downtime|minimal downtime|never (?:go )?down|can'?t (?:afford to )?go down|99\.9+%?|mission critical|uptime is (?:critical|important)|must (?:always )?be available)\b/.test(lower)) {
            known("availabilityNeeds", "High (24/7, minimal downtime)", "24/7 availability", "Explicit user availability requirement");
        } else if (/\b(?:downtime is (?:ok|okay|fine|acceptable)|okay if it (?:goes down|restarts)|fine if it (?:goes down|restarts)|doesn'?t need to be (?:always|24\/7) (?:on|up|available)|occasional downtime)\b/.test(lower)) {
            known("availabilityNeeds", "Standard (occasional downtime acceptable)", "downtime acceptable", "User accepts occasional downtime", 0.92);
        }

        // 6. Traffic pattern
        if (/\b(?:spikes?|spiky|bursts?|bursty|flash sales?|seasonal|black friday|festive sale|sale days?|peak (?:hours|season|times))\b/.test(lower)) {
            known("trafficPattern", "Spiky / seasonal peaks", "traffic spikes", "User described bursty or seasonal traffic", 0.9);
        } else if (/\b(?:steady traffic|consistent traffic|predictable traffic|evenly (?:throughout|during) the day|constant traffic)\b/.test(lower)) {
            known("trafficPattern", "Steady / predictable", "steady traffic", "User described steady traffic", 0.9);
        }

        // 7. Simplicity Preference
        if (/\b(?:don'?t know (?:much|anything) about (?:the )?cloud|no cloud experience|new to (?:the )?cloud|somewhere to put my website|simple to set up|easy to (?:set up|use|manage)|keep it simple|simplest|zero devops|no devops|fully managed|managed platform|hands-?off|don'?t want to manage servers|not (?:very )?technical|non-?technical)\b/.test(lower)) {
            known("simplicityPreference", "High (Beginner / Zero-DevOps Preferred)", "simple to set up / managed", "Explicit user preference for simplicity and low maintenance");
        } else if (/\b(?:vps|virtual (?:private )?server|full control|root access|developer control|manage (?:my|our) own servers?|ssh access)\b/.test(lower)) {
            known("simplicityPreference", "Moderate (Developer Control)", "virtual server / developer control", "User requested Linux VM or developer control", 0.9);
        } else if (/\b(?:kubernetes|k8s|terraform|custom vpc|multi-cloud|infrastructure as code|\biac\b)\b/.test(lower)) {
            known("simplicityPreference", "Low (Advanced / Custom Infrastructure)", "kubernetes / IaC", "User specified custom cluster or advanced infrastructure", 0.9);
        } else if (/\b(?:simple|easy)\b/.test(lower) && !/\b(?:simple (?:website|site|app|blog|page|crud|api|project))\b/.test(lower)) {
            known("simplicityPreference", "High (Beginner / Zero-DevOps Preferred)", "simple / easy", "User asked for something simple", 0.85);
        }

        // 8. User Accounts & Login
        if (/\b(?:no accounts?|no login|no log-?in|no sign-?ups?|no authentication|without (?:accounts|login)|public only|anonymous|guest (?:only|checkout only))\b/.test(lower)) {
            known("userAccounts", "None (Public access / no accounts needed)", "no accounts / no login", "User stated no authentication or accounts required");
        } else if (/\b(?:accounts?|log ?in|logins?|log-?in|sign ?up|sign-?ups?|sign ?in|authentication|\bauth\b|user profiles?|register|registration|members? area|oauth|sso)\b/.test(lower)) {
            known("userAccounts", "Yes (User accounts & authentication required)", "users need accounts / logins", "User stated application requires accounts/logins");
        }

        // 9. Database Needs
        if (/\b(?:no database|no db|static only|no data storage|don'?t need (?:a )?database|just html)\b/.test(lower)) {
            known("databaseNeeds", "None (Static content only)", "no database", "User stated no database required");
        } else if (/\b(?:database|\bdb\b|store (?:the )?(?:data|tasks|posts|profiles|orders|records|information)|save (?:data|records)|postgres\w*|mysql|mariadb|mongo\w*|nosql|sqlite|firebase|supabase|dynamodb|redis)\b/.test(lower)) {
            let dbType = null;
            if (/postgres|supabase/.test(lower)) dbType = "PostgreSQL";
            else if (/mysql|mariadb/.test(lower)) dbType = "MySQL";
            else if (/mongo/.test(lower)) dbType = "MongoDB";
            else if (/dynamodb/.test(lower)) dbType = "DynamoDB";
            else if (/firebase/.test(lower)) dbType = "Firebase (Firestore)";
            else if (/\bnosql\b/.test(lower)) dbType = "NoSQL document store";
            else if (/\b(?:relational|sql)\b/.test(lower)) dbType = "Relational SQL";

            known("databaseNeeds", `Yes (Managed ${dbType || "Database"})`, "need database / store data", "User stated requirement to persist application data");
            if (dbType) {
                known("databaseType", dbType, dbType, `User explicitly specified ${dbType}`);
            }
        }

        // 10. File Storage Needs
        if (/\b(?:no file uploads|no uploads|no files|text only|no media)\b/.test(lower)) {
            known("fileStorageNeeds", "None (No user file uploads)", "no file uploads", "User stated no file upload requirements");
        } else if (/\b(?:upload\w*|store (?:images|photos|videos|pdfs|files|documents)|photos?|videos?|media files|object storage|\bs3\b|product images)\b/.test(lower)) {
            known("fileStorageNeeds", "Yes (Object storage for file/media uploads)", "files / media storage", "User stated file upload or media asset requirements", 0.9);
        }

        // 11. AI / GPU
        if (/\b(?:gpus?|cuda|train(?:ing)? (?:my |our |a |the )?(?:own )?models?|fine-?tun\w*|a100|h100|self-?host(?:ed)? (?:llm|model))\b/.test(lower)) {
            known("aiGpuNeeds", "Dedicated GPU Acceleration", "GPU / model training", "User stated GPU or model training needs");
        } else if (/\b(?:openai|groq|anthropic|claude|gemini|ai api|external (?:ai|model)|api calls? to (?:an? )?(?:ai|llm))\b/.test(lower)) {
            known("aiGpuNeeds", "External AI API Integration Only (CPU sufficient)", "external AI API", "User will call a hosted AI API", 0.9);
        }

        // 12. Geography
        const geo = this.detectRegion(lower);
        if (geo) {
            known("geographicNeeds", geo, geo, "User stated target region", 0.9);
        }

        // 13. Compliance
        if (/\b(?:no (?:special )?compliance|no regulations?|no legal requirements)\b/.test(lower)) {
            known("complianceNeeds", "None (standard best practice)", "no compliance needs", "User stated no special compliance", 0.9);
        } else if (/\b(?:gdpr|data residency|sovereignty|eu data|data (?:must|should) stay in)\b/.test(lower)) {
            known("complianceNeeds", "GDPR / Data residency", "GDPR", "User stated data protection / residency requirement");
        } else if (/\b(?:hipaa|soc ?2|pci(?:[- ]dss)?|iso ?27001|fedramp|healthcare data|patient data|financial compliance)\b/.test(lower)) {
            known("complianceNeeds", "Regulatory compliance (HIPAA / SOC2 / PCI)", "regulatory compliance", "User stated regulatory compliance requirement");
        }

        // 14. Deployment / Architecture preference
        if (/\b(?:render|vercel|netlify|heroku|paas|app platform|automatic deploy\w*|auto-?deploy\w*|git push)\b/.test(lower)) {
            known("deploymentPreference", "Managed PaaS (git-based deploys)", "managed platform", "User specified preference for managed platform", 0.92);
        } else if (/\b(?:droplet|ec2|vps|ssh|linux server)\b/.test(lower)) {
            known("deploymentPreference", "Virtual Server / IaaS (e.g. Droplet, EC2)", "virtual server", "User specified preference for virtual server compute", 0.92);
        } else if (/\b(?:docker|containers?|containeri[sz]ed|dockerfile)\b/.test(lower)) {
            known("deploymentPreference", "Containerized (Docker)", "docker / containers", "User specified Docker containers", 0.92);
        }
        if (/\b(?:microservices?)\b/.test(lower)) {
            known("architecturePreference", "Microservices", "microservices", "User specified microservices", 0.9);
        } else if (/\b(?:monolith\w*|single (?:app|application|codebase))\b/.test(lower)) {
            known("architecturePreference", "Monolith", "monolith", "User specified a single application", 0.9);
        } else if (/\b(?:serverless|lambda|cloud functions|workers)\b/.test(lower)) {
            known("architecturePreference", "Serverless", "serverless", "User specified serverless", 0.88);
        }
    }

    detectRegion(lower) {
        if (/\b(?:india|indian|mumbai|bangalore|bengaluru|delhi|hyderabad|chennai|pune|south asia)\b/.test(lower)) return "India / South Asia";
        if (/\b(?:germany|europe|european|\beu\b|frankfurt|uk|united kingdom|london|france|paris|amsterdam|netherlands|spain|italy)\b/.test(lower)) return "Europe";
        if (/\b(?:usa|u\.s\.|united states|america|american|california|virginia|new york|texas|north america|canada)\b/.test(lower)) return "North America";
        if (/\b(?:asia|apac|singapore|tokyo|japan|china|hong kong|korea|indonesia|vietnam|philippines|malaysia)\b/.test(lower)) return "Asia-Pacific (APAC)";
        if (/\b(?:australia|sydney|melbourne|new zealand)\b/.test(lower)) return "Australia / Oceania";
        if (/\b(?:brazil|latin america|mexico|argentina|south america)\b/.test(lower)) return "Latin America";
        if (/\b(?:africa|nigeria|kenya|south africa|middle east|dubai|uae|saudi)\b/.test(lower)) return "Middle East / Africa";
        if (/\b(?:global|worldwide|all over the world|every continent|international(?:ly)?)\b/.test(lower)) return "Global audience";
        if (/\b(?:local|my city|my town|one city|my country)\b/.test(lower)) return "Single local region";
        return null;
    }

    /**
     * After a question was asked, interpret the user's reply for those slots:
     * - "I don't know" / "you decide" -> adopt + record a safe assumption (never re-ask)
     * - "what does that mean?" -> one plain-language clarification, then assume
     * - short direct answers ("yes", "500", "Europe") -> bind to the asked slot
     */
    resolveAnswerToAskedSlots(text, askedKeys, turnIndex, mode = "beginner", isCurrentTurn = false) {
        if (!Array.isArray(askedKeys) || askedKeys.length === 0 || typeof text !== "string" || !text.trim()) return;
        const pending = askedKeys.filter((k) => this.slots[k] && this.slots[k].state === "UNKNOWN");
        if (pending.length === 0) return;

        const uncertainty = detectAnswerUncertainty(text);
        if (uncertainty && uncertainty.type === "confusion") {
            pending.forEach((k) => {
                this.clarifyCounts[k] = (this.clarifyCounts[k] || 0) + 1;
                if (this.clarifyCounts[k] >= 2) {
                    this.assumeDefault(k, turnIndex, "User still unsure after an explanation", isCurrentTurn, mode);
                } else if (isCurrentTurn) {
                    this.turnEvents.clarify.push(k);
                }
            });
            return;
        }
        if (uncertainty && (uncertainty.type === "unknown" || uncertainty.type === "delegation")) {
            pending.forEach((k) => this.assumeDefault(k, turnIndex, uncertainty.label || "I don't know / You decide", isCurrentTurn, mode));
            return;
        }

        // Short direct answer binding (conservative: short replies only)
        const words = text.trim().split(/\s+/).length;
        if (words > 25) return;
        pending.forEach((k) => {
            const bound = this.parseShortAnswer(k, text);
            if (bound) {
                this.updateSlot(k, {
                    state: "KNOWN",
                    value: bound,
                    rawUserText: text.trim().slice(0, 160),
                    confidence: 0.8,
                    source: "answer",
                    reason: "User answered the Advisor's question",
                    turnUpdated: turnIndex
                });
                if (isCurrentTurn) this.turnEvents.boundAnswers.push(k);
            }
        });
    }

    parseShortAnswer(key, text) {
        const t = text.trim();
        const lower = t.toLowerCase();
        const yes = isYes(lower);
        const no = isNo(lower);
        switch (key) {
            case "expectedUsers": {
                const m = lower.match(new RegExp(NUMBER_PATTERN));
                if (m) {
                    const n = parseHumanNumber(m[1]);
                    if (n) return `approximately ${formatCount(n)} users`;
                }
                if (/\b(?:small|few|not many|low)\b/.test(lower)) return "small scale (low traffic)";
                if (/\b(?:lots|many|large|huge|high)\b/.test(lower)) return "large scale (high traffic)";
                break;
            }
            case "userAccounts":
                if (yes) return "Yes (User accounts & authentication required)";
                if (no) return "None (Public access / no accounts needed)";
                break;
            case "databaseNeeds":
                if (yes) return "Yes (Managed Database)";
                if (no) return "None (Static content only)";
                break;
            case "fileStorageNeeds":
                if (yes) return "Yes (Object storage for file/media uploads)";
                if (no) return "None (No user file uploads)";
                break;
            case "aiGpuNeeds":
                if (no || /\b(?:api|existing service|openai|groq)\b/.test(lower)) return "External AI API Integration Only (CPU sufficient)";
                if (yes) return "Dedicated GPU Acceleration";
                break;
            case "complianceNeeds":
                if (no) return "None (standard best practice)";
                break;
            case "availabilityNeeds":
                if (/\b(?:restart\w*|okay|ok|fine|acceptable)\b/.test(lower) && !/\b24|always\b/.test(lower)) return "Standard (occasional downtime acceptable)";
                if (/\b(?:24|always|must|critical|no downtime)\b/.test(lower)) return "High (24/7, minimal downtime)";
                break;
            case "trafficPattern":
                if (/\b(?:even\w*|steady|constant|throughout)\b/.test(lower)) return "Steady / predictable";
                if (/\b(?:once|spik\w*|burst\w*|peak\w*|sale|specific times|rush)\b/.test(lower)) return "Spiky / seasonal peaks";
                break;
            case "simplicityPreference":
                if (/\b(?:simple|easy|managed|handle|automatic\w*|for me)\b/.test(lower) || (yes && !/\b(?:myself|control)\b/.test(lower))) return "High (Beginner / Zero-DevOps Preferred)";
                if (/\b(?:myself|control|configure|own server|vps)\b/.test(lower)) return "Moderate (Developer Control)";
                break;
            case "budgetSensitivity": {
                const m = lower.match(/\$?\s?(\d+)/);
                if (m) {
                    const n = parseInt(m[1], 10);
                    if (n <= 20) return "Cost Priority: Very High (Free Tier / Sub-$10 Preferred)";
                    if (n <= 200) return "Cost Priority: Moderate ($25-$200/mo)";
                    return "Cost Priority: Flexible / Enterprise";
                }
                if (/\b(?:low|cheap|free|minimal|little|tight|small)\b/.test(lower)) return "Cost Priority: Very High (Free Tier / Sub-$10 Preferred)";
                if (/\b(?:flexible|not an issue|high|large|whatever it takes)\b/.test(lower)) return "Cost Priority: Flexible / Enterprise";
                break;
            }
            case "geographicNeeds":
                return this.detectRegion(lower);
            case "projectPurpose":
                if (/\b(?:college|class|school|university|student)\b/.test(lower)) return "College / Academic Project";
                if (/\b(?:hobby|personal|fun|learning)\b/.test(lower)) return "Personal / Hobby Project";
                if (/\b(?:business|startup|commercial|company|client|launch)\b/.test(lower)) return "Business / Startup (commercial)";
                break;
            default:
                break;
        }
        // Generic: a short, substantive reply that isn't a bare yes/no is kept verbatim.
        if (!yes && !no && t.length >= 2 && t.split(/\s+/).length <= 12) {
            return `User said: "${t.slice(0, 120)}"`;
        }
        if (yes) return "Yes";
        if (no) return "No";
        return null;
    }

    /**
     * Adopt a safe default when the user doesn't know (Feature #8). Records the
     * assumption so it is disclosed and the question is never repeated.
     */
    assumeDefault(key, turnIndex, rawUserText, isCurrentTurn = false, mode = "beginner") {
        const def = SLOT_DEFINITIONS[key];
        if (!def || this.isResolved(key)) return;
        const assumption = def.defaultAssumption || { value: "Standard safe baseline", reason: `Adopted conservative baseline for ${def.label}.` };
        this.updateSlot(key, {
            state: "ASSUMED",
            value: assumption.value,
            rawUserText: rawUserText || "I don't know / You decide",
            confidence: 0.75,
            source: "assumed",
            reason: assumption.reason,
            turnUpdated: turnIndex
        });
        this.askedSlots.add(key);
        if (isCurrentTurn) {
            this.turnEvents.assumed.push({
                slotKey: key,
                label: def.label,
                value: assumption.value,
                reason: assumption.reason,
                concept: (def.concept && (def.concept[mode] || def.concept.beginner)) || ""
            });
        }
    }

    /**
     * Context inferences: information that clearly follows from what the user said.
     * Stored as ASSUMED (source "inferred") so they are disclosed, never asked, and
     * always overridden by anything the user states explicitly.
     */
    applyContextInferences(turnIndex) {
        const ctx = this.getContext();
        const infer = (key, value, reason) => {
            if (this.slots[key] && this.slots[key].state === "UNKNOWN") {
                this.updateSlot(key, { state: "ASSUMED", value, rawUserText: null, confidence: 0.8, source: "inferred", reason, turnUpdated: turnIndex });
            }
        };
        if (ctx.isEcommerce) {
            infer("projectPurpose", "Business / Startup (commercial)", "An e-commerce store is a commercial project.");
            infer("databaseNeeds", "Yes (products, orders and customer data)", "An online store needs a database for products, orders and customers.");
            infer("fileStorageNeeds", "Product images (object storage / CDN)", "Product photos are best served from object storage behind a CDN.");
            infer("userAccounts", "Customer accounts / checkout (likely)", "Online stores usually need customer accounts or at least checkout sessions.");
        }
        if (ctx.isStatic) {
            infer("databaseNeeds", "None (Static content only)", "A static website does not need a database.");
            infer("userAccounts", "None (Public access / no accounts needed)", "A static website has no user logins.");
            infer("fileStorageNeeds", "None (No user file uploads)", "A static website has no user uploads.");
        }
        if (ctx.isStudent || ctx.isPersonal) {
            infer("availabilityNeeds", "Standard (occasional downtime acceptable)", "Academic and personal projects rarely need 24/7 redundancy.");
            infer("complianceNeeds", "None (standard best practice)", "Academic and personal projects rarely carry regulatory requirements.");
        }
        if (ctx.isStudent) {
            infer("budgetSensitivity", "Cost Priority: Very High (Student / Academic Context)", "Student projects usually aim for free tiers or the lowest possible cost.");
        }
        if (ctx.veryLowScale) {
            infer("concurrentUsers", "Very low concurrency", "Small audience implies low concurrency.");
            infer("trafficPattern", "Low, steady traffic", "Small audience implies low, steady traffic.");
        }
    }

    // -----------------------------------------------------------------------
    // STRUCTURED INPUTS
    // -----------------------------------------------------------------------

    /**
     * Merge persisted advisor state (from the browser or the saved chat). Only
     * resolved slots and asked-slot history are taken; values carry their turn
     * index so newer user statements still win.
     */
    applyExternalState(state) {
        if (!state || typeof state !== "object") return;
        if (Array.isArray(state.askedSlots)) {
            state.askedSlots.forEach((k) => { if (SLOT_DEFINITIONS[k]) this.askedSlots.add(k); });
        }
        if (state.clarifyCounts && typeof state.clarifyCounts === "object") {
            Object.keys(state.clarifyCounts).forEach((k) => {
                if (SLOT_DEFINITIONS[k]) this.clarifyCounts[k] = Math.max(this.clarifyCounts[k] || 0, Number(state.clarifyCounts[k]) || 0);
            });
        }
        if (state.slots && typeof state.slots === "object") {
            Object.keys(state.slots).forEach((k) => {
                const s = state.slots[k];
                if (!SLOT_DEFINITIONS[k] || !s || !RESOLVED_STATES.includes(s.state)) return;
                // Only carry structured / LLM-derived facts; text-derived ones are rebuilt from the conversation.
                if (!["option", "slider", "llm", "answer", "assumed"].includes(s.source)) return;
                this.updateSlot(k, {
                    state: s.state,
                    value: typeof s.value === "string" ? s.value.slice(0, 200) : s.value,
                    rawUserText: typeof s.rawUserText === "string" ? s.rawUserText.slice(0, 200) : null,
                    confidence: typeof s.confidence === "number" ? s.confidence : 0.8,
                    source: s.source,
                    reason: typeof s.reason === "string" ? s.reason.slice(0, 300) : null,
                    turnUpdated: Number(s.turnUpdated) || 0
                });
            });
        }
    }

    applySelectedOption(option, turnIndex) {
        const key = option.slotKey;
        if (!SLOT_DEFINITIONS[key] || typeof option.value !== "string") return;
        const isUnknown = /i don'?t know|you decide|pick a safe default/i.test(option.value);
        if (isUnknown) {
            this.assumeDefault(key, turnIndex, option.value, true);
            return;
        }
        this.updateSlot(key, {
            state: "KNOWN",
            value: (option.label || option.value).slice(0, 160),
            rawUserText: option.value.slice(0, 160),
            confidence: 0.95,
            source: "option",
            reason: "Selected by the user from the quick-choice options",
            turnUpdated: turnIndex
        });
        this.askedSlots.add(key);
    }

    applySliderPreferences(prefs, turnIndex) {
        const num = (v) => (typeof v === "number" && !Number.isNaN(v) ? v : null);
        const set = (key, value) => this.updateSlot(key, {
            state: "KNOWN", value, rawUserText: "priority slider", confidence: 0.9,
            source: "slider", reason: "Set by the user with the priority sliders", turnUpdated: turnIndex
        });
        const cost = num(prefs.cost);
        if (cost !== null) {
            set("budgetSensitivity", cost >= 0.75 ? "Cost Priority: Very High (slider)" : cost >= 0.45 ? "Cost Priority: Moderate (slider)" : "Cost Priority: Flexible (slider)");
        }
        const simplicity = num(prefs.simplicity);
        if (simplicity !== null) {
            set("simplicityPreference", simplicity >= 0.7 ? "High (Managed / simple preferred, slider)" : simplicity >= 0.4 ? "Moderate (Balanced, slider)" : "Low (Developer control preferred, slider)");
        }
        const reliability = num(prefs.reliability);
        if (reliability !== null) {
            set("availabilityNeeds", reliability >= 0.75 ? "High (24/7, minimal downtime, slider)" : reliability >= 0.45 ? "Standard (~99.9%, slider)" : "Low priority (slider)");
        }
        const aiGpu = num(prefs.aiGpu);
        if (aiGpu !== null && aiGpu >= 0.7) {
            set("aiGpuNeeds", "Dedicated GPU Acceleration (slider)");
        }
    }

    /**
     * Merge LLM-extracted facts for the current message. They fill gaps only:
     * a value the user stated explicitly (rule-based) is never replaced.
     */
    applyLLMExtraction(llmSlots, turnIndex) {
        Object.keys(llmSlots).forEach((k) => {
            const entry = llmSlots[k];
            if (!SLOT_DEFINITIONS[k] || !entry || typeof entry.value !== "string" || !entry.value.trim()) return;
            const current = this.slots[k];
            const canFill = current.state === "UNKNOWN" || current.source === "inferred" ||
                (current.state === "ASSUMED" && current.turnUpdated < turnIndex);
            if (!canFill) return;
            this.updateSlot(k, {
                state: "KNOWN",
                value: entry.value.trim().slice(0, 160),
                rawUserText: typeof entry.evidence === "string" ? entry.evidence.slice(0, 160) : null,
                confidence: typeof entry.confidence === "number" ? Math.min(entry.confidence, 0.9) : 0.8,
                source: "llm",
                reason: "Understood from the user's description",
                turnUpdated: turnIndex
            });
        });
    }

    updateSlot(key, data) {
        if (!this.slots[key]) return;
        const current = this.slots[key];
        // Never let older information overwrite something learned in a later turn.
        if (current.state !== "UNKNOWN" && typeof data.turnUpdated === "number" && data.turnUpdated < current.turnUpdated) {
            return;
        }
        // An inferred/assumed value never overrides something the user actually said in the same turn.
        if (current.state === "KNOWN" && data.state === "ASSUMED" && data.turnUpdated === current.turnUpdated) {
            return;
        }
        this.slots[key] = {
            ...current,
            ...data
        };
    }

    findUnresolvedCriticalSlot() {
        const coreOrder = ["workloadType", "expectedUsers", "budgetSensitivity", "simplicityPreference", "projectPurpose", "databaseNeeds", "userAccounts"];
        for (const key of coreOrder) {
            if (this.slots[key] && this.slots[key].state === "UNKNOWN" && !this.askedSlots.has(key)) {
                return key;
            }
        }
        return null;
    }

    // -----------------------------------------------------------------------
    // RELEVANCE, RANKING & READINESS
    // -----------------------------------------------------------------------

    getContext() {
        const v = (k) => String((this.slots[k] && this.slots[k].value) || "").toLowerCase();
        const workload = v("workloadType");
        const purpose = v("projectPurpose");
        const users = v("expectedUsers");
        const userNumMatch = users.match(/([\d,]+)/);
        const userCount = userNumMatch ? parseInt(userNumMatch[1].replace(/,/g, ""), 10) : null;
        return {
            workload,
            purpose,
            isAI: workload.includes("ai"),
            isStatic: workload.includes("static"),
            isEcommerce: workload.includes("e-commerce"),
            isRealtime: workload.includes("real-time"),
            isStudent: purpose.includes("college"),
            isPersonal: purpose.includes("personal"),
            isBusiness: purpose.includes("business") || purpose.includes("startup") || purpose.includes("enterprise") || purpose.includes("production") || workload.includes("e-commerce"),
            isEnterprise: purpose.includes("enterprise"),
            userCount,
            veryLowScale: users.includes("very small") || (userCount !== null && userCount <= 50),
            largeScale: users.includes("large") || users.includes("thousands") || (userCount !== null && userCount >= 10000),
            highAvailability: v("availabilityNeeds").includes("high")
        };
    }

    /**
     * Should this slot be asked at all for THIS user? Returns a relevance
     * multiplier (0 = not relevant).
     */
    getRelevance(key, ctx, mode) {
        const def = SLOT_DEFINITIONS[key];
        if (!def) return 0;
        if (MODE_RANK[mode] < MODE_RANK[def.minMode || "beginner"]) return 0;

        switch (key) {
            case "aiGpuNeeds":
                return ctx.isAI ? 1.1 : 0;
            case "databaseNeeds":
            case "userAccounts":
                return ctx.isStatic ? 0 : 1;
            case "fileStorageNeeds":
                return ctx.isStatic ? 0 : (ctx.isAI ? 0.85 : 1);
            case "databaseType":
                return (this.slots.databaseNeeds.state !== "UNKNOWN" && !/none|no\b/i.test(this.slots.databaseNeeds.value || "")) ? 1 : 0;
            case "complianceNeeds":
                if (ctx.isStudent || ctx.isPersonal) return 0;
                return ctx.isEcommerce || ctx.isEnterprise ? 1.1 : (ctx.isBusiness ? 0.9 : 0.75);
            case "availabilityNeeds":
                if (ctx.isStudent || ctx.isPersonal) return 0;
                return ctx.isBusiness ? 1.1 : 0.9;
            case "geographicNeeds":
                if (ctx.isStudent || ctx.isPersonal || ctx.veryLowScale) return 0.7;
                return ctx.isBusiness ? 1.05 : 0.9;
            case "trafficPattern":
                if (ctx.isStudent || ctx.isPersonal || ctx.veryLowScale || ctx.isStatic) return 0;
                return ctx.isEcommerce ? 1.15 : (ctx.isBusiness ? 1 : 0.85);
            case "concurrentUsers":
                // Covered by expected users unless scale or real-time behaviour makes it decisive
                return (ctx.largeScale || ctx.isRealtime) ? 1 : 0;
            case "projectPurpose":
                return 1;
            case "technicalPreference":
                // Covered by the simplicity / deployment answers
                return (this.isResolved("simplicityPreference") || this.isResolved("deploymentPreference")) ? 0 : 1;
            case "deploymentPreference":
                return /high/i.test(this.slots.simplicityPreference.value || "") ? 0 : 1;
            case "storageNeeds":
                return (this.isResolved("databaseNeeds") || this.isResolved("fileStorageNeeds")) ? 0 : 1;
            case "architecturePreference":
                return ctx.isStatic ? 0 : 1;
            default:
                return 1;
        }
    }

    /**
     * Slots that must be resolved (known, assumed or at least asked) before recommending.
     */
    getCriticalSlots(ctx) {
        const keys = ["workloadType", "expectedUsers", "budgetSensitivity", "simplicityPreference"];
        if (!ctx.isStatic) keys.push("databaseNeeds");
        if (ctx.isBusiness && !ctx.isStudent && !ctx.isPersonal) keys.push("availabilityNeeds");
        if (ctx.isAI) keys.push("aiGpuNeeds");
        return keys;
    }

    /**
     * Rank every question that is still worth asking: unknown, never asked,
     * relevant to this user's use case and mode, and not covered by another answer.
     */
    rankCandidateQuestions(experienceMode = "beginner") {
        const mode = VALID_MODES.includes(experienceMode) ? experienceMode : "beginner";
        const ctx = this.getContext();
        const critical = new Set(this.getCriticalSlots(ctx));
        return Object.values(SLOT_DEFINITIONS)
            .filter((def) => {
                const slot = this.slots[def.key];
                return slot && slot.state === "UNKNOWN" && !this.askedSlots.has(def.key);
            })
            .map((def) => {
                const relevance = this.getRelevance(def.key, ctx, mode);
                const score = def.impactWeight * relevance * (critical.has(def.key) ? 1.08 : 1);
                return { def, relevance, score, critical: critical.has(def.key) };
            })
            .filter((c) => c.relevance > 0)
            .sort((a, b) => b.score - a.score);
    }

    /**
     * Determine which unresolved slot has the highest decision impact for the given workload.
     */
    selectBestUnresolvedQuestion(experienceMode = "beginner") {
        const list = this.selectNextQuestions(experienceMode, 1);
        return list.length > 0 ? list[0] : null;
    }

    /**
     * Pick up to `max` questions for this turn. Beginners get one question at a
     * time unless two critical facts are still missing.
     */
    selectNextQuestions(experienceMode = "beginner", max = 2) {
        const mode = VALID_MODES.includes(experienceMode) ? experienceMode : "beginner";
        const ranked = this.rankCandidateQuestions(mode).filter((c) => c.critical || c.score >= VALUABLE_SCORE);
        if (ranked.length === 0) return [];

        const remainingBudget = Math.max(0, MAX_QUESTIONS[mode] - this.askedSlots.size);
        if (remainingBudget === 0) return [];

        const criticalMissing = ranked.filter((c) => c.critical).length;
        let perTurn = mode === "beginner" ? (criticalMissing >= 2 ? 2 : 1) : 2;
        perTurn = Math.min(perTurn, max, remainingBudget);

        const picked = [ranked[0]];
        if (perTurn >= 2 && ranked[1] && (ranked[1].critical || ranked[1].score >= 0.8)) {
            picked.push(ranked[1]);
        }

        return picked.map((c) => this.formatQuestion(c.def, mode));
    }

    formatQuestion(def, mode) {
        return {
            slotKey: def.key,
            slotLabel: def.label,
            impactWeight: def.impactWeight,
            questionText: (def.questions && def.questions[mode]) || def.questions.beginner,
            concept: mode === "expert" ? "" : ((def.concept && (def.concept[mode] || def.concept.beginner)) || ""),
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
     * Information-based readiness: recommend once the critical facts are resolved
     * and either 2+ meaningful questions were asked or nothing valuable is left.
     * Never ask beyond the per-mode ceiling; remaining gaps become disclosed assumptions.
     */
    evaluateReadiness(options = {}) {
        const { isExplicitDemand = false, isRecalculated = false, experienceMode = "beginner" } = options;
        const mode = VALID_MODES.includes(experienceMode) ? experienceMode : "beginner";
        const ctx = this.getContext();
        const critical = this.getCriticalSlots(ctx);
        const questionsAsked = this.askedSlots.size;
        const unresolvedCritical = critical.filter((k) => !this.isResolved(k) && !this.askedSlots.has(k));
        const valuable = this.rankCandidateQuestions(mode).filter((c) => c.critical || c.score >= VALUABLE_SCORE);

        let ready = false;
        let reason = "";
        if (isExplicitDemand || isRecalculated) {
            ready = true; reason = isRecalculated ? "Preferences recalculated by the user" : "User asked for the recommendation now";
        } else if (questionsAsked >= MAX_QUESTIONS[mode]) {
            ready = true; reason = "Question limit reached; remaining gaps are covered by assumptions";
        } else if (unresolvedCritical.length > 0) {
            ready = false; reason = `Missing critical information: ${unresolvedCritical.map((k) => SLOT_DEFINITIONS[k].label).join(", ")}`;
        } else if (valuable.length === 0) {
            ready = true; reason = "All information that would change the recommendation is known";
        } else if (questionsAsked < MIN_QUESTIONS) {
            ready = false; reason = "Important details still missing; asking at least two meaningful questions";
        } else {
            ready = true; reason = "Enough information to recommend";
        }

        return { ready, reason, questionsAsked, unresolvedCritical, remainingValuable: valuable.map((c) => c.def.key) };
    }

    /**
     * Before recommending, turn any critical gap into a recorded, disclosed assumption.
     */
    applyDefaultAssumptionsForGaps(experienceMode = "beginner") {
        const ctx = this.getContext();
        this.getCriticalSlots(ctx).forEach((k) => {
            if (!this.isResolved(k)) {
                this.assumeDefault(k, this.currentTurnIndex || 0, "Not specified by the user", true, experienceMode);
            }
        });
    }

    /**
     * Legacy readiness check kept for compatibility.
     */
    isRecommendationReady(options = {}) {
        const { isExplicitDemand = false, isRecalculated = false, experienceMode = "beginner" } = options;
        return this.evaluateReadiness({ isExplicitDemand, isRecalculated, experienceMode }).ready;
    }

    // -----------------------------------------------------------------------
    // REPEATED-QUESTION GUARD FOR DRAFTED REPLIES
    // -----------------------------------------------------------------------

    /**
     * Find question sentences in a drafted reply that ask for information that is
     * already known/assumed or was already asked in an earlier turn.
     * allowedKeys: slots the engine selected for this turn (allowed once).
     */
    findRepeatedQuestions(replyText, allowedKeys = []) {
        const allowed = new Set(allowedKeys || []);
        const violations = [];
        getQuestionSentences(replyText).forEach((sentence) => {
            // Check each clause separately so "What is your budget, and do you want it simple?"
            // is caught even when one half is the planned question.
            const clauses = sentence
                .split(/,\s*(?:and|or|also|plus|but)\s+|;\s*|\s+and also\s+|\?\s+/i)
                .map((c) => c.trim())
                .filter((c) => c.split(/\s+/).length >= 2);
            const units = clauses.length > 1 ? clauses : [sentence];
            const bad = new Set();
            units.forEach((unit) => {
                const slots = detectSlotsInQuestion(unit.endsWith("?") ? unit : `${unit}?`);
                if (slots.some((k) => allowed.has(k))) return; // the planned question
                slots
                    .filter((k) => this.isResolved(k) || this.askedBeforeCurrentTurn.has(k))
                    .forEach((k) => bad.add(k));
            });
            if (bad.size > 0) {
                violations.push({ sentence, slotKeys: Array.from(bad) });
            }
        });
        return violations;
    }

    /**
     * Last-resort removal of repeated question sentences from a reply.
     */
    removeQuestionSentences(replyText, violations) {
        let text = replyText;
        violations.forEach((v) => {
            const idx = text.indexOf(v.sentence);
            if (idx !== -1) {
                text = text.slice(0, idx) + text.slice(idx + v.sentence.length);
            }
        });
        return text
            .split("\n")
            .filter((line) => !/^\s*(?:[-*•]|\d+[.)])\s*$/.test(line))
            .join("\n")
            .replace(/[ \t]{2,}/g, " ")
            .replace(/[ \t]+\n/g, "\n")
            .replace(/\n{3,}/g, "\n\n")
            .trim();
    }

    /**
     * Record the slots the final reply actually asks about.
     */
    recordAskedInReply(replyText) {
        const asked = this.detectAskedSlotsInText(replyText);
        asked.forEach((k) => this.askedSlots.add(k));
        return asked;
    }

    // -----------------------------------------------------------------------
    // OUTPUT
    // -----------------------------------------------------------------------

    /**
     * Compact, serialisable state that the browser sends back next turn and the
     * chat document stores, so selected options, sliders and LLM-understood facts persist.
     */
    getPersistableState() {
        const slots = {};
        Object.keys(this.slots).forEach((k) => {
            const s = this.slots[k];
            if (s.state !== "UNKNOWN") {
                slots[k] = {
                    state: s.state,
                    value: s.value,
                    rawUserText: s.rawUserText,
                    confidence: s.confidence,
                    source: s.source,
                    reason: s.reason,
                    turnUpdated: s.turnUpdated
                };
            }
        });
        return {
            version: 2,
            slots,
            askedSlots: Array.from(this.askedSlots),
            clarifyCounts: { ...this.clarifyCounts }
        };
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
            totalAssumed: Object.keys(assumedSlots).length,
            turnEvents: this.turnEvents
        };
    }
}

module.exports = {
    SLOT_DEFINITIONS,
    RequirementSlotTracker,
    detectSlotsInQuestion,
    getQuestionSentences
};
