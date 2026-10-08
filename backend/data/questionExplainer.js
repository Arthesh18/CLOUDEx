/**
 * CLOUDEx - Explainable Questions
 *
 * Builds a short explanation card for the technical question(s) the slot
 * tracker selected this turn: what the concept means, what it helps with,
 * why CLOUDEx is asking, and what each option means. Depth adapts to the
 * experience mode. Simple questions (what are you building, how many users,
 * budget) get no card.
 *
 * Cards are built ONLY from engine-selected questions, which have already
 * passed the known-requirement / repeated-question checks. They are returned
 * as structured data for the UI and are never stored in the conversation, so
 * they cannot re-introduce a topic that is already known.
 */

const DONT_KNOW = {
    label: "I don't know",
    value: "I don't know, please pick a safe default for me",
    meaning: {
        beginner: "No problem. CLOUDEx picks a safe default and tells you what it assumed.",
        intermediate: "CLOUDEx assumes a safe default and lists it in the assumptions.",
        expert: "Assume a safe default."
    }
};

// topic: the concept family shown as a small tag on the card
const EXPLAINERS = {
    databaseNeeds: {
        topic: "Database",
        title: { beginner: "What is a database?", intermediate: "Database", expert: "Persistence" },
        what: {
            beginner: "A database stores information your application needs to remember, such as users, products, orders or messages.",
            intermediate: "A managed database (e.g. PostgreSQL, MySQL, MongoDB) persists application data with backups handled by the provider."
        },
        helps: {
            beginner: "You need one if your app must save information and show it again later, even after a restart.",
            intermediate: "Needed whenever state must survive restarts or be shared between app instances."
        },
        why: {
            beginner: "Some clouds include cheap managed databases and others charge extra, so this changes the price and the best provider.",
            intermediate: "Managed DB pricing and availability vary a lot between providers.",
            expert: "Managed DB tier materially changes cost and provider fit."
        },
        options: [
            { label: "Yes", value: "Yes, my application needs a database to store data", meaning: { beginner: "Your app saves things like accounts, orders or posts.", intermediate: "Persistent state required; a managed DB will be sized in." } },
            { label: "No", value: "No database needed, the app doesn't store data", meaning: { beginner: "Your app only shows fixed content (like a simple website).", intermediate: "Stateless / static; no DB tier." } }
        ]
    },
    databaseType: {
        topic: "Database",
        title: { beginner: "SQL or NoSQL?", intermediate: "Database engine", expert: "Database engine" },
        what: {
            beginner: "SQL databases store data in tables (like spreadsheets). NoSQL databases store flexible documents.",
            intermediate: "Relational engines (PostgreSQL/MySQL) give strong consistency and joins; document stores (MongoDB) give flexible schemas."
        },
        helps: {
            beginner: "Tables suit orders and payments; documents suit data whose shape changes often.",
            intermediate: "Transactional data favours relational; schema-flexible or denormalised data favours documents."
        },
        why: {
            beginner: "Not every cloud offers every database as a managed service.",
            intermediate: "Managed engine availability differs per provider.",
            expert: "Determines which managed offerings qualify."
        },
        options: [
            { label: "PostgreSQL / MySQL", value: "I prefer a relational database like PostgreSQL or MySQL", meaning: { beginner: "Table-based, the safe default for most apps.", intermediate: "Relational, ACID." } },
            { label: "MongoDB / NoSQL", value: "I prefer a document database like MongoDB", meaning: { beginner: "Flexible documents instead of tables.", intermediate: "Document store, flexible schema." } }
        ]
    },
    fileStorageNeeds: {
        topic: "Storage",
        title: { beginner: "What is file storage?", intermediate: "Object storage", expert: "Object storage" },
        what: {
            beginner: "File storage keeps things people upload, like photos, videos or PDFs, in a separate low-cost store instead of on the server.",
            intermediate: "S3-compatible object storage holds user uploads and media, usually served through a CDN."
        },
        helps: {
            beginner: "It keeps uploads safe and makes them load quickly for visitors.",
            intermediate: "Decouples media from compute and scales independently."
        },
        why: {
            beginner: "Storage and download (bandwidth) prices differ a lot between clouds.",
            intermediate: "Storage and egress pricing vary widely between providers.",
            expert: "Egress pricing drives provider choice for media-heavy apps."
        },
        options: [
            { label: "Yes, uploads", value: "Yes, users upload photos or files", meaning: { beginner: "People will upload images, videos or documents.", intermediate: "Object storage + CDN required." } },
            { label: "No uploads", value: "No file uploads", meaning: { beginner: "Only your own app files, nothing uploaded by users.", intermediate: "No object storage tier." } }
        ]
    },
    storageNeeds: {
        topic: "Storage",
        title: { beginner: "How much storage?", intermediate: "Storage volume", expert: "Block storage / IOPS" },
        what: {
            beginner: "Storage is the disk space your app and its data take up.",
            intermediate: "Block storage backs databases and app disks; size and IOPS set the tier."
        },
        helps: { beginner: "Most small apps need very little.", intermediate: "Under-provisioned IOPS throttles databases." },
        why: { beginner: "Bigger disks cost more each month.", intermediate: "Volume size and IOPS tier affect price.", expert: "IOPS guarantees differ by provider." },
        options: [
            { label: "Small (< 50 GB)", value: "Small storage, under 50 GB", meaning: { beginner: "Typical for most apps.", intermediate: "Default volume sizes." } },
            { label: "Large (> 500 GB)", value: "Large storage, over 500 GB", meaning: { beginner: "Lots of data or media.", intermediate: "Large volumes / high-IOPS tiers." } }
        ]
    },
    simplicityPreference: {
        topic: "Compute",
        title: { beginner: "Managed platform or your own server?", intermediate: "PaaS vs VMs", expert: "Abstraction tier" },
        what: {
            beginner: "Compute is the computer that runs your app. A managed platform runs it for you; with your own server you install and look after everything yourself.",
            intermediate: "Managed PaaS abstracts the OS and scaling; VMs/IaaS give full control with more operational work."
        },
        helps: {
            beginner: "Managed means less work and fewer things to break. Your own server can be cheaper and more flexible.",
            intermediate: "Trade-off between developer velocity and cost/control."
        },
        why: {
            beginner: "Some clouds are built for simple 1-click hosting, others for experts. This decides which fit you.",
            intermediate: "Strongly separates PaaS-first providers from IaaS-first ones.",
            expert: "Determines PaaS vs IaaS/Kubernetes shortlist."
        },
        options: [
            { label: "Managed (simple)", value: "I prefer a managed platform that handles the servers for me", meaning: { beginner: "Upload your code; the platform handles servers, updates and scaling.", intermediate: "PaaS (App Platform, Render, Cloud Run)." } },
            { label: "My own servers", value: "I prefer virtual servers I control myself", meaning: { beginner: "More control and often cheaper, but you maintain it.", intermediate: "VMs/IaaS (Droplets, EC2, Hetzner)." } },
            { label: "Containers / Kubernetes", value: "I want containers or Kubernetes", meaning: { beginner: "Packaged apps run by an orchestration system; powerful but complex.", intermediate: "Docker/K8s on managed clusters." } }
        ]
    },
    technicalPreference: {
        topic: "Operations",
        title: { beginner: "Who looks after the servers?", intermediate: "Operational ownership", expert: "Ops model" },
        what: {
            beginner: "Servers need updates, security fixes and backups.",
            intermediate: "Patching, firewalling, backups and monitoring."
        },
        helps: { beginner: "Letting the provider do it saves time.", intermediate: "Determines managed vs self-managed services." },
        why: { beginner: "Some clouds do this for you, some don't.", intermediate: "Filters providers by managed-service depth.", expert: "Filters on managed-service depth." },
        options: [
            { label: "Provider handles it", value: "I want the provider to handle maintenance", meaning: { beginner: "Hands-off.", intermediate: "Managed services." } },
            { label: "I'll manage it", value: "I'm comfortable managing servers myself", meaning: { beginner: "You do updates yourself.", intermediate: "Self-managed." } }
        ]
    },
    availabilityNeeds: {
        topic: "Availability",
        title: { beginner: "What is availability?", intermediate: "Availability target", expert: "SLA / RTO-RPO" },
        what: {
            beginner: "Availability is how much of the time your app stays online. \"24/7\" means it should almost never be down.",
            intermediate: "Availability targets (99.9% vs 99.99%) decide single-instance vs multi-zone deployment and DB failover."
        },
        helps: {
            beginner: "Higher availability means a backup is ready if something fails, so customers aren't affected.",
            intermediate: "Redundancy reduces downtime from instance or zone failures."
        },
        why: {
            beginner: "Always-on setups cost more, so CLOUDEx only recommends them if you need them.",
            intermediate: "Redundancy roughly doubles parts of the bill.",
            expert: "Drives multi-AZ and managed failover requirements."
        },
        options: [
            { label: "Must be up 24/7", value: "It must be available 24/7 with minimal downtime", meaning: { beginner: "Downtime would lose you customers or money.", intermediate: "Multi-zone / failover." } },
            { label: "Short downtime is OK", value: "Occasional downtime is acceptable", meaning: { beginner: "A few minutes offline now and then is fine.", intermediate: "Single instance, ~99.9%." } }
        ]
    },
    trafficPattern: {
        topic: "Scalability",
        title: { beginner: "What is scalability?", intermediate: "Traffic pattern", expert: "Load profile" },
        what: {
            beginner: "Scalability means your app can handle more visitors by adding capacity when it gets busy.",
            intermediate: "Bursty load favours autoscaling or serverless; steady load favours flat-priced instances."
        },
        helps: {
            beginner: "It keeps the app fast during rushes, like a sale, without paying for a big server all the time.",
            intermediate: "Matches capacity to demand to protect latency and cost."
        },
        why: {
            beginner: "Some clouds grow automatically and charge per use; others are cheaper for steady traffic.",
            intermediate: "Selects between autoscaling and fixed-capacity pricing models.",
            expert: "Selects autoscaling vs reserved capacity."
        },
        options: [
            { label: "Steady", value: "Steady traffic throughout the day", meaning: { beginner: "About the same number of visitors all day.", intermediate: "Fixed capacity is efficient." } },
            { label: "Sudden spikes", value: "Traffic spikes during sales or launches", meaning: { beginner: "Big rushes at certain times.", intermediate: "Needs autoscaling." } }
        ]
    },
    concurrentUsers: {
        topic: "Performance",
        title: { beginner: "Users at the same time", intermediate: "Peak concurrency", expert: "Peak concurrency" },
        what: {
            beginner: "This is how many people use the app at the exact same moment, usually far fewer than your total users.",
            intermediate: "Peak concurrent sessions size connection pools, workers and DB connections."
        },
        helps: { beginner: "It decides how powerful the server must be to stay fast.", intermediate: "Prevents saturation at peak." },
        why: { beginner: "More simultaneous users need more power.", intermediate: "Sets instance size and scaling thresholds.", expert: "Sets connection and worker sizing." },
        options: [
            { label: "A few at once", value: "Only a few users at the same time", meaning: { beginner: "Small server is enough.", intermediate: "Low concurrency." } },
            { label: "Hundreds+ at once", value: "Hundreds or more users at the same time", meaning: { beginner: "Needs more capacity.", intermediate: "High concurrency." } }
        ]
    },
    aiGpuNeeds: {
        topic: "Compute",
        title: { beginner: "What is a GPU?", intermediate: "GPU vs AI API", expert: "Accelerators" },
        what: {
            beginner: "A GPU is a special, expensive chip used to train or run AI models yourself.",
            intermediate: "Self-hosted training/inference needs GPU instances; hosted model APIs need only ordinary compute."
        },
        helps: { beginner: "Only needed if you run AI models yourself, not if you call a service like OpenAI or Groq.", intermediate: "Required for self-hosted models." },
        why: { beginner: "GPU clouds are a different (and pricier) group of providers.", intermediate: "Splits GPU specialists from general clouds.", expert: "Determines GPU-cloud shortlist." },
        options: [
            { label: "Use an AI service", value: "I will call an existing AI API like OpenAI or Groq, no GPUs", meaning: { beginner: "Your app sends requests to an AI provider; no special hardware.", intermediate: "CPU compute + API." } },
            { label: "Need GPUs", value: "Yes, I need dedicated GPUs to train or run models", meaning: { beginner: "You run or train models yourself.", intermediate: "GPU instances." } }
        ]
    },
    architecturePreference: {
        topic: "Serverless & containers",
        title: { beginner: "How is your app built?", intermediate: "Architecture", expert: "Topology" },
        what: {
            beginner: "Your app can be one program, several smaller services, or small functions that only run when needed (serverless).",
            intermediate: "Monolith, decoupled services/containers, or event-driven serverless functions."
        },
        helps: { beginner: "Serverless costs nothing when idle; containers package each part neatly.", intermediate: "Each maps to different hosting products and pricing." },
        why: { beginner: "Each style fits different cloud products.", intermediate: "Selects PaaS app vs container platform vs FaaS.", expert: "Selects PaaS vs container platform vs FaaS." },
        options: [
            { label: "One app", value: "It's a single application (monolith)", meaning: { beginner: "Simplest to host.", intermediate: "Single deployable." } },
            { label: "Containers / services", value: "It's split into containerised services", meaning: { beginner: "Several parts, each in its own package.", intermediate: "Container platform / K8s." } },
            { label: "Serverless", value: "I want serverless functions", meaning: { beginner: "Runs only when used; pay per request.", intermediate: "FaaS (Lambda, Workers, Cloud Functions)." } }
        ]
    },
    deploymentPreference: {
        topic: "Containers",
        title: { beginner: "How will you deploy?", intermediate: "Deployment workflow", expert: "Delivery pipeline" },
        what: {
            beginner: "Deploying means putting your code onto the cloud.",
            intermediate: "Git-push PaaS builds, pre-built container images, or VM-based deploys."
        },
        helps: { beginner: "Automatic deploys update your app every time you save to GitHub.", intermediate: "Matches the platform to your CI/CD." },
        why: { beginner: "Some clouds make this one click.", intermediate: "Filters by supported deploy workflow.", expert: "Filters by CI/CD integration." },
        options: [
            { label: "Git push", value: "I want automatic deploys from GitHub", meaning: { beginner: "Easiest.", intermediate: "Buildpacks / git-based PaaS." } },
            { label: "Docker images", value: "I deploy Docker containers", meaning: { beginner: "Packaged containers.", intermediate: "Registry-based deploys." } }
        ]
    },
    geographicNeeds: {
        topic: "Regions & networking",
        title: { beginner: "What is a region?", intermediate: "Region & latency", expert: "Region topology" },
        what: {
            beginner: "A region is the part of the world where the cloud's computers are. Closer to your users means a faster app.",
            intermediate: "Region choice sets network latency to users and data-residency obligations."
        },
        helps: { beginner: "Pages load quicker when the server is near your visitors.", intermediate: "Lower RTT and compliance with residency rules." },
        why: { beginner: "Not every cloud has data centres everywhere.", intermediate: "Provider region coverage differs.", expert: "Filters on regional coverage." },
        options: [
            { label: "India", value: "Most users are in India", meaning: { beginner: "Servers in Mumbai, Bangalore or nearby.", intermediate: "ap-south." } },
            { label: "Europe", value: "Most users are in Europe", meaning: { beginner: "Servers in the EU or UK.", intermediate: "EU regions." } },
            { label: "North America", value: "Most users are in North America", meaning: { beginner: "Servers in the US or Canada.", intermediate: "US regions." } },
            { label: "Worldwide", value: "Users are global / worldwide", meaning: { beginner: "A global network (CDN) helps everyone.", intermediate: "Multi-region / edge." } }
        ]
    },
    complianceNeeds: {
        topic: "Security",
        title: { beginner: "Security and legal rules", intermediate: "Compliance", expert: "Compliance frameworks" },
        what: {
            beginner: "Some apps must follow rules about personal data or payments, like GDPR in Europe or PCI for card payments.",
            intermediate: "Frameworks such as GDPR, PCI DSS, HIPAA or SOC 2 constrain regions and providers."
        },
        helps: { beginner: "Following them protects your customers and avoids fines.", intermediate: "Ensures the provider holds the right certifications." },
        why: { beginner: "Only some clouds have the right certificates.", intermediate: "Filters providers by certification.", expert: "Filters by attestation coverage." },
        options: [
            { label: "No special rules", value: "No special compliance requirements", meaning: { beginner: "Standard security is enough (payments via Stripe/PayPal are fine).", intermediate: "Baseline controls." } },
            { label: "GDPR / EU data", value: "GDPR applies, data should stay in the EU", meaning: { beginner: "Personal data must stay in Europe.", intermediate: "EU residency." } },
            { label: "PCI / HIPAA / SOC 2", value: "We need regulatory compliance like PCI DSS, HIPAA or SOC2", meaning: { beginner: "Card data, health data or audits.", intermediate: "Certified providers only." } }
        ]
    },
    userAccounts: {
        topic: "Security",
        title: { beginner: "Do people log in?", intermediate: "Authentication", expert: "Identity" },
        what: {
            beginner: "Accounts let people sign up and log in so the app can remember them.",
            intermediate: "Auth requires identity storage, sessions/tokens and secure password handling."
        },
        helps: { beginner: "Needed for profiles, orders or anything personal.", intermediate: "Determines whether to use a managed identity service." },
        why: { beginner: "Logins need a database and extra security.", intermediate: "Adds identity and DB requirements.", expert: "Adds identity service requirement." },
        options: [
            { label: "Yes, logins", value: "Yes, users need accounts and login", meaning: { beginner: "People create accounts.", intermediate: "Auth required." } },
            { label: "No logins", value: "No accounts or login needed", meaning: { beginner: "Anyone can use it without signing in.", intermediate: "Public, no auth." } }
        ]
    }
};

const pick = (obj, mode) => (obj ? (obj[mode] !== undefined ? obj[mode] : obj.intermediate || obj.beginner || "") : "");

/**
 * Build explanation cards for this turn's selected questions.
 * @param {Array} selectedQuestions  from RequirementSlotTracker.selectNextQuestions()
 * @param {string} mode              beginner | intermediate | expert
 * @param {object} tracker           the slot tracker (used to re-check nothing is already known)
 * @param {string} reply             the final reply (to reuse the model's own question wording)
 */
function buildQuestionCards(selectedQuestions, mode, tracker, reply, sentenceDetector) {
    if (!Array.isArray(selectedQuestions)) return [];
    const m = ["beginner", "intermediate", "expert"].includes(mode) ? mode : "beginner";

    return selectedQuestions
        .filter((q) => q && EXPLAINERS[q.slotKey])
        // Safety: never explain a topic that is already known or that was asked in an earlier turn
        .filter((q) => !(tracker && (tracker.isResolved(q.slotKey) || tracker.askedBeforeCurrentTurn.has(q.slotKey))))
        .map((q) => {
            const ex = EXPLAINERS[q.slotKey];
            // Prefer the model's own question sentence for this topic, else the engine's wording
            let question = q.questionText;
            if (typeof reply === "string" && typeof sentenceDetector === "function") {
                const own = sentenceDetector(reply, q.slotKey);
                if (own) question = own;
            }
            const card = {
                slotKey: q.slotKey,
                topic: ex.topic,
                title: pick(ex.title, m),
                question,
                mode: m,
                // Expert: minimal — only why it matters
                what: m === "expert" ? "" : pick(ex.what, m),
                helps: m === "expert" ? "" : pick(ex.helps, m),
                why: pick(ex.why, m),
                options: [...ex.options, DONT_KNOW].map((o) => ({
                    label: o.label,
                    value: o.value,
                    meaning: m === "expert" ? "" : pick(o.meaning, m)
                }))
            };
            return card;
        });
}

module.exports = {
    EXPLAINERS,
    buildQuestionCards
};
