/**
 * CLOUDEx - Pricing & Cost Intelligence Engine
 * Feature #4: Pricing & Cost Intelligence
 */

const { cloudProviders, getProviderById } = require("./cloudData");

// ==================================================
// PRICING MODEL DEFINITIONS & COST DRIVERS
// ==================================================

const pricingModelsGuide = [
    {
        name: "Pay-As-You-Go (On-Demand)",
        badge: "On-Demand",
        icon: "fa-clock",
        description: "Billed strictly for the exact compute instance-seconds, storage gigabytes, or capacity hours consumed.",
        costDrivers: [
            "Active runtime (hours/seconds instances remain powered on)",
            "Instance sizing (vCPU and RAM capacity allocation)",
            "Attached volume storage capacity whether written or idle"
        ],
        advantages: [
            "No upfront capital expenditure or long-term commitment",
            "Instantly scale up or terminate resources based on live traffic"
        ],
        pitfalls: [
            "Idle forgotten servers continue to accrue full hourly charges",
            "Highest baseline rate compared to reserved or committed contracts"
        ]
    },
    {
        name: "Consumption / Serverless",
        badge: "Per-Invocation",
        icon: "fa-bolt",
        description: "Billed per function invocation, execution duration in milliseconds, and memory allocation. Pure scale-to-zero.",
        costDrivers: [
            "Total request count (invocations per minute/hour)",
            "Execution duration (function runtime in milliseconds)",
            "Allocated RAM memory size (MB/GB-seconds consumed)"
        ],
        advantages: [
            "$0 cost when traffic drops to zero (no idle waste)",
            "Automatic provisioning and scaling without instance management"
        ],
        pitfalls: [
            "Can become more expensive than dedicated VMs under steady high-volume load",
            "Cold start latency and downstream database connection pool limits"
        ]
    },
    {
        name: "Tiered Storage & API Operations",
        badge: "Per-GB + Ops",
        icon: "fa-box-archive",
        description: "Storage billed per GB-month stored, coupled with per-thousand read/write API requests and outbound data transfer.",
        costDrivers: [
            "Total data volume stored (GB/month across storage tiers)",
            "Data transfer out (internet egress fees)",
            "API operation count (PUT, GET, LIST, DELETE requests)"
        ],
        advantages: [
            "Low raw storage cost per gigabyte with massive durability",
            "Lifecycle tiering automatically moves older data to cold/archive tiers"
        ],
        pitfalls: [
            "Network egress charges can exceed the actual data storage cost",
            "High-frequency small file operations can trigger noticeable API request bills"
        ]
    },
    {
        name: "Predictable / Flat-Rate Bundles",
        badge: "Flat-Rate",
        icon: "fa-receipt",
        description: "Fixed monthly billing for a bundled specification (vCPU, RAM, SSD storage, and generous included bandwidth).",
        costDrivers: [
            "Selected server plan tier (fixed cost per month)",
            "Bandwidth overage if exceeding the high included pool (e.g. >20TB)"
        ],
        advantages: [
            "100% predictable monthly bills with zero surprise variance",
            "Huge savings on high-bandwidth or sustained compute workloads"
        ],
        pitfalls: [
            "Fixed resources don't instantly autoscale without manual upgrades or load balancers",
            "Fewer managed enterprise compliance certifications"
        ]
    },
    {
        name: "Zero-Egress / Edge Model",
        badge: "Zero Egress",
        icon: "fa-shield-halved",
        description: "Zero outbound network transfer fees, shifting billing exclusively to storage volume or compute request counts.",
        costDrivers: [
            "Raw storage volume and write operations",
            "Edge worker request counts and CPU execution time"
        ],
        advantages: [
            "Eliminates the most volatile and unpredictable cloud cost driver (egress)",
            "Substantially reduces expenses for video streaming, downloads, and CDNs"
        ],
        pitfalls: [
            "Specialized edge architecture requires adapting traditional application code"
        ]
    }
];

// ==================================================
// COST DRIVERS BY ARCHITECTURAL CATEGORY
// ==================================================

const costDriversByCategory = {
    compute: {
        categoryTitle: "Compute Workloads",
        icon: "fa-server",
        primaryDrivers: [
            "Instance Sizing: Over-provisioning vCPU/RAM is the #1 cause of cloud compute waste",
            "Idle Runtime: Paying for staging or test environments running 24/7",
            "Purchasing Strategy: Using On-Demand instead of Spot instances for fault-tolerant jobs",
            "Network Egress: Traffic departing VMs to the internet or cross-region AZs"
        ],
        optimizationTips: [
            "Enable autoscaling with scheduled turn-down for non-production environments",
            "Right-size instances based on real 95th-percentile utilization metrics",
            "Leverage serverless scale-to-zero for spiky, unpredictable background jobs"
        ]
    },
    storage: {
        categoryTitle: "Storage & Backups",
        icon: "fa-hard-drive",
        primaryDrivers: [
            "Data Egress Transfer: The fee charged every time files are downloaded over the internet",
            "Storage Volume Growth: Unmanaged retention of stale snapshots, logs, and old versions",
            "API Request Frequency: High volumes of micro-file GET/PUT requests",
            "Block Volume Provisioning: Paying for provisioned GBs even if disk space is 80% empty"
        ],
        optimizationTips: [
            "Select zero-egress or high-included-bandwidth providers for media distribution",
            "Configure automatic lifecycle expiration rules to delete or archive old data",
            "Compress media and leverage CDN caching to minimize repeated storage origin hits"
        ]
    },
    database: {
        categoryTitle: "Managed Databases",
        icon: "fa-database",
        primaryDrivers: [
            "Provisioned vs Autoscaling IOPS: Paying for peak disk read/write capacity permanently",
            "Multi-AZ High Availability: Redundant standbys typically double the instance cost",
            "Storage Auto-Expansion: Disks automatically grow but rarely shrink automatically",
            "Read Replica Sizing: Adding read replicas for queries without connection caching"
        ],
        optimizationTips: [
            "Use serverless database scaling for variable workloads",
            "Add Redis/in-memory caching in front of relational databases to absorb read spikes",
            "Review query performance and add appropriate indexes before scaling database size"
        ]
    },
    ai: {
        categoryTitle: "AI & Machine Learning",
        icon: "fa-brain",
        primaryDrivers: [
            "GPU Hardware Tier: High-end accelerators (H100, A100) carry significant hourly rates",
            "Training Duration: Distributed model training running over multiple days/weeks",
            "Idle Inference Endpoints: Keeping specialized GPU instances warm without traffic",
            "Token Volume: LLM API token consumption for prompt input and completion output"
        ],
        optimizationTips: [
            "Use per-second billing specialized GPU clouds for batch model training",
            "Deploy serverless AI endpoints that scale to zero when no inference requests arrive",
            "Quantize models to run on more cost-effective L4/L40S or CPU tiers where possible"
        ]
    }
};

// ==================================================
// PROVIDER COST PROFILES (ALL 15 CSPS)
// ==================================================

const providerCostProfiles = {
    aws: {
        providerId: "aws",
        name: "Amazon Web Services",
        shortName: "AWS",
        affordabilityScore: 7.2,
        pricingLevel: "Flexible / Enterprise",
        costPredictability: "Variable",
        egressProfile: "Hyperscaler Tiered (~$0.09/GB)",
        freeTier: "Generous 12-Month Free Tier + Always-Free Products",
        billingHighlights: "Comprehensive cost explorer, savings plans, reserved instances, spot market discounts up to 90%.",
        costDriversToWatch: "Data transfer out to internet, NAT Gateway hourly charges, provisioned IOPS on EBS, inter-AZ traffic.",
        bestCostFitFor: "Enterprises needing maximum capability with dedicated FinOps tooling and negotiated EDP volume discounts."
    },
    azure: {
        providerId: "azure",
        name: "Microsoft Azure",
        shortName: "Azure",
        affordabilityScore: 7.0,
        pricingLevel: "Enterprise Tiered",
        costPredictability: "Variable",
        egressProfile: "Hyperscaler Tiered (~$0.087/GB)",
        freeTier: "12-Month Popular Free Services + $200 Starting Credit",
        billingHighlights: "Azure Hybrid Benefit provides major discounts for existing Windows Server and SQL Server licenses.",
        costDriversToWatch: "Data egress, premium managed disks, enterprise support plans, cross-region replication fees.",
        bestCostFitFor: "Organizations with existing Microsoft enterprise agreements and Microsoft software stacks."
    },
    gcp: {
        providerId: "gcp",
        name: "Google Cloud",
        shortName: "GCP",
        affordabilityScore: 7.1,
        pricingLevel: "Consumption-Based",
        costPredictability: "Variable",
        egressProfile: "Hyperscaler Tiered (~$0.085/GB)",
        freeTier: "Always-Free Tier (e.g. e2-micro, Cloud Run) + $300 Credit",
        billingHighlights: "Automatic Sustained Use Discounts apply without upfront lock-in; per-second billing with custom machine sizes.",
        costDriversToWatch: "Internet egress, BigQuery on-demand scan queries ($5/TB scanned), multi-region storage replication.",
        bestCostFitFor: "Data-heavy and containerized workloads leveraging custom instance configurations and Cloud Run."
    },
    oracle: {
        providerId: "oracle",
        name: "Oracle Cloud Infrastructure",
        shortName: "OCI",
        affordabilityScore: 8.4,
        pricingLevel: "Competitive Enterprise",
        costPredictability: "Moderate",
        egressProfile: "First 10TB/month Outbound Egress FREE",
        freeTier: "Generous Always-Free Tier (Ampere ARM 4 OCPU/24GB RAM + 2 DBs)",
        billingHighlights: "Substantially lower compute and network egress rates than AWS/Azure; generous always-free compute resources.",
        costDriversToWatch: "Autonomous Database auto-scaling, high-end storage performance tiers, specialized licensed options.",
        bestCostFitFor: "Enterprise workloads needing affordable compute, massive bandwidth, and high-performance Oracle databases."
    },
    ibm: {
        providerId: "ibm",
        name: "IBM Cloud",
        shortName: "IBM",
        affordabilityScore: 6.9,
        pricingLevel: "Enterprise",
        costPredictability: "Moderate",
        egressProfile: "Standard Tiered Bandwidth",
        freeTier: "Lite Tier with no time expiration for selected services",
        billingHighlights: "Custom enterprise contract bundling, integrated Watson AI packages, hybrid mainframe cloud integration.",
        costDriversToWatch: "Enterprise licensing terms, specialized hardware configurations, support plan fees.",
        bestCostFitFor: "Regulated enterprise industries (banking, healthcare) requiring customized compliance architectures."
    },
    digitalocean: {
        providerId: "digitalocean",
        name: "DigitalOcean",
        shortName: "DigitalOcean",
        affordabilityScore: 8.9,
        pricingLevel: "Predictable Tiered",
        costPredictability: "High",
        egressProfile: "Generous Pooled Transfer (1TB-5TB per droplet included)",
        freeTier: "App Platform Starter Tier + $200 New User Credit",
        billingHighlights: "Flat-rate monthly pricing with zero hidden component fees; pooled bandwidth shared across all instances.",
        costDriversToWatch: "Additional managed database standby nodes and snapshot storage beyond plan quotas.",
        bestCostFitFor: "Startups, SaaS builders, and mid-sized web apps wanting clear, predictable billing without complexity."
    },
    alibaba: {
        providerId: "alibaba",
        name: "Alibaba Cloud",
        shortName: "Alibaba Cloud",
        affordabilityScore: 8.0,
        pricingLevel: "Pay-as-you-go / Subscription",
        costPredictability: "Moderate",
        egressProfile: "Competitive International Rates",
        freeTier: "Free Trial with over 50 products and 1-month trial packages",
        billingHighlights: "Extremely cost-effective across Asia-Pacific regions with flexible subscription discount options.",
        costDriversToWatch: "Mainland China ICP licensing costs, cross-border network acceleration products.",
        bestCostFitFor: "Businesses with significant user traffic in Asia-Pacific or cross-border e-commerce operations."
    },
    huawei: {
        providerId: "huawei",
        name: "Huawei Cloud",
        shortName: "Huawei Cloud",
        affordabilityScore: 8.1,
        pricingLevel: "Flexible Tiered",
        costPredictability: "Moderate",
        egressProfile: "Regional Tiered Bandwidth",
        freeTier: "Free packages for compute and container services",
        billingHighlights: "Competitive hardware and telecommunications networking rates in supported global regions.",
        costDriversToWatch: "International bandwidth accelerators and dedicated enterprise interconnects.",
        bestCostFitFor: "Global enterprises expanding in emerging markets, Latin America, Africa, and Asia."
    },
    tencent: {
        providerId: "tencent",
        name: "Tencent Cloud",
        shortName: "Tencent Cloud",
        affordabilityScore: 8.2,
        pricingLevel: "Pay-as-you-go / Packages",
        costPredictability: "Moderate",
        egressProfile: "Competitive Regional Rates",
        freeTier: "Free trial credits for developers and startups",
        billingHighlights: "Cost-optimized solutions for audio/video processing, interactive gaming servers, and streaming media.",
        costDriversToWatch: "Real-time communication and CDN bandwidth spikes during peak events.",
        bestCostFitFor: "Gaming studios, streaming platforms, and social media applications."
    },
    vultr: {
        providerId: "vultr",
        name: "Vultr",
        shortName: "Vultr",
        affordabilityScore: 9.2,
        pricingLevel: "Flat-Rate Hourly/Monthly",
        costPredictability: "High",
        egressProfile: "High Included Bandwidth Pool (1TB-10TB+)",
        freeTier: "Promotional developer credits and free tier container engine",
        billingHighlights: "Transparent hourly pricing starting at low costs with globally distributed bare metal and cloud instances.",
        costDriversToWatch: "High-capacity block storage attachments and bandwidth consumption exceeding included pools.",
        bestCostFitFor: "Developers, agencies, and microservices requiring global footprint at fraction of hyperscaler cost."
    },
    hetzner: {
        providerId: "hetzner",
        name: "Hetzner Cloud",
        shortName: "Hetzner",
        affordabilityScore: 9.6,
        pricingLevel: "Extreme Budget / Flat-Rate",
        costPredictability: "Very High",
        egressProfile: "20TB Included Traffic per server (Zero egress up to 20TB)",
        freeTier: "Lowest nominal entry prices in European cloud market",
        billingHighlights: "Unmatched price-to-performance ratio in Europe; 20TB free bandwidth per server with minimal per-hour cost.",
        costDriversToWatch: "Traffic beyond 20TB (nominal €1/TB) and limited native managed PaaS (requires self-management).",
        bestCostFitFor: "Cost-sensitive startups, European deployments, high-bandwidth streaming, and compute-heavy self-managed setups."
    },
    ovhcloud: {
        providerId: "ovhcloud",
        name: "OVHcloud",
        shortName: "OVHcloud",
        affordabilityScore: 8.8,
        pricingLevel: "Transparent European Pricing",
        costPredictability: "High",
        egressProfile: "Unmetered / Included Public Traffic",
        freeTier: "Public cloud credit vouchers for new projects",
        billingHighlights: "Strict adherence to European data sovereignty with unmetered internal and external network traffic.",
        costDriversToWatch: "Advanced support contracts and custom compliance isolation options.",
        bestCostFitFor: "European enterprises and SaaS providers demanding strict GDPR compliance and zero egress fees."
    },
    cloudflare: {
        providerId: "cloudflare",
        name: "Cloudflare",
        shortName: "Cloudflare",
        affordabilityScore: 8.5,
        pricingLevel: "Zero Egress / Request-Based",
        costPredictability: "High",
        egressProfile: "ZERO Egress Fees (Cloudflare R2 Storage)",
        freeTier: "Substantial free tier: 100k requests/day (Workers) + 10GB (R2)",
        billingHighlights: "Cloudflare R2 completely eliminates data transfer fees; workers scale to millions of requests at low cost.",
        costDriversToWatch: "Worker CPU execution duration on standard tier ($0.15/million requests after quota).",
        bestCostFitFor: "Websites, media distribution, Jamstack applications, and edge compute where bandwidth costs dominate."
    },
    akamai: {
        providerId: "akamai",
        name: "Akamai",
        shortName: "Akamai",
        affordabilityScore: 8.3,
        pricingLevel: "Predictable Developer Pricing",
        costPredictability: "High",
        egressProfile: "Low-Cost Egress with Pooled Bandwidth",
        freeTier: "Developer credits and trial hours for Linode cloud",
        billingHighlights: "Retains Linode's transparent flat-rate pricing combined with Akamai's global edge network.",
        costDriversToWatch: "Specialized enterprise security and CDN add-on packages.",
        bestCostFitFor: "Applications requiring both developer-friendly cloud servers and distributed global edge acceleration."
    },
    coreweave: {
        providerId: "coreweave",
        name: "CoreWeave",
        shortName: "CoreWeave",
        affordabilityScore: 7.8,
        pricingLevel: "Specialized GPU Cloud / Per-Second",
        costPredictability: "Moderate",
        egressProfile: "Competitive Cloud Transfer Rates",
        freeTier: "Free registration with pay-per-second deployment",
        billingHighlights: "Up to 70% cheaper than hyperscalers for high-end AI GPU clusters (H100, A100, L40S) with per-second billing.",
        costDriversToWatch: "High baseline costs inherent to advanced GPU hardware and cluster reservation commitments.",
        bestCostFitFor: "AI labs, generative AI companies, LLM fine-tuning, and large-scale 3D rendering pipelines."
    }
};

// ==================================================
// SCENARIO COST ESTIMATOR (SIMULATION / BENCHMARK)
// ==================================================

const simulationScenarios = {
    "web-app": {
        key: "web-app",
        title: "Standard Web Application & API",
        icon: "fa-globe",
        description: "Small to mid-sized production app with 2 vCPU compute, 4GB RAM, 80GB SSD storage, and 300GB monthly outbound traffic.",
        assumptions: "2 vCPU / 4GB RAM general-purpose instance, 80GB block volume, 300GB monthly internet egress, 1 managed relational database.",
        baselineCost: 65, // Standard baseline USD/month
        affordabilityFactor: 1.0
    },
    "media-storage": {
        key: "media-storage",
        title: "High-Traffic Content & Media Storage",
        icon: "fa-photo-film",
        description: "Asset-heavy application with 3TB object storage, 500,000 monthly API requests, and 2.5TB outbound bandwidth.",
        assumptions: "3TB active object storage, 2.5TB outbound internet egress, 500k GET/PUT operations, global CDN edge caching.",
        baselineCost: 180,
        affordabilityFactor: 1.25
    },
    "ai-inference": {
        key: "ai-inference",
        title: "AI / ML Inference & Batch Pipeline",
        icon: "fa-brain",
        description: "Dedicated acceleration workload with 1x modern GPU instance running 150 hours/month, 200GB fast SSD, and model checkpoints.",
        assumptions: "1x mid-tier GPU instance (e.g. L4/A10G or equivalent), 150 active compute hours, 200GB NVMe storage.",
        baselineCost: 290,
        affordabilityFactor: 1.15
    }
};

function calculateScenarioEstimate(scenarioKey, providerIds = []) {
    const scenario = simulationScenarios[scenarioKey] || simulationScenarios["web-app"];
    const pIds = Array.isArray(providerIds) && providerIds.length > 0
        ? providerIds
        : cloudProviders.map(p => p.id);

    const estimates = pIds.map(pId => {
        const provider = getProviderById(pId);
        if (!provider) return null;

        const profile = providerCostProfiles[pId] || {
            affordabilityScore: provider.affordability || 7.0,
            costPredictability: "Moderate",
            egressProfile: "Standard",
            pricingLevel: provider.pricingLevel || "Flexible"
        };

        // Heuristic relative index: affordability score 10 -> 0.65x baseline; score 6 -> 1.35x baseline
        const score = profile.affordabilityScore;
        const multiplier = Math.max(0.45, Math.min(1.5, 1.85 - (score * 0.125)));
        
        // Egress discount adjustment: zero egress or generous pooled gives additional relative savings on media/storage
        let egressModifier = 1.0;
        if (scenario.key === "media-storage") {
            if (profile.egressProfile.includes("ZERO") || profile.egressProfile.includes("20TB") || profile.egressProfile.includes("Unmetered")) {
                egressModifier = 0.55;
            } else if (profile.egressProfile.includes("Pooled") || profile.egressProfile.includes("FREE")) {
                egressModifier = 0.75;
            }
        }

        const estMonthly = Math.round(scenario.baselineCost * multiplier * egressModifier);
        const rangeMin = Math.round(estMonthly * 0.85);
        const rangeMax = Math.round(estMonthly * 1.18);

        return {
            providerId: provider.id,
            providerName: provider.name,
            shortName: provider.shortName || provider.name,
            icon: provider.icon || "fa-cloud",
            affordabilityScore: score,
            pricingLevel: profile.pricingLevel,
            costPredictability: profile.costPredictability,
            egressProfile: profile.egressProfile,
            estimatedMonthlyRange: `$${rangeMin} – $${rangeMax}/mo`,
            relativeCostIndex: (multiplier * egressModifier).toFixed(2) + "x baseline",
            keyDriverNote: profile.costDriversToWatch
        };
    }).filter(Boolean);

    return {
        scenario: {
            key: scenario.key,
            title: scenario.title,
            icon: scenario.icon,
            description: scenario.description,
            assumptions: scenario.assumptions
        },
        disclaimer: "All estimated values are simulated benchmarks derived from qualitative affordability scores, published tier baselines, and architectural egress policies. They are not official quotes or guaranteed prices.",
        estimates
    };
}

function getPricingIntelligenceData() {
    return {
        pricingModelsGuide,
        costDriversByCategory,
        simulationScenarios: Object.values(simulationScenarios)
    };
}

function getCostProfileForProvider(providerId) {
    return providerCostProfiles[providerId] || null;
}

function compareProviderCostProfiles(providerIds = []) {
    const pIds = Array.isArray(providerIds) && providerIds.length > 0
        ? providerIds
        : cloudProviders.map(p => p.id);

    return pIds.map(pId => {
        const p = getProviderById(pId);
        const profile = providerCostProfiles[pId];
        if (!p || !profile) return null;
        return {
            ...profile,
            providerIcon: p.icon || "fa-cloud"
        };
    }).filter(Boolean);
}

module.exports = {
    pricingModelsGuide,
    costDriversByCategory,
    providerCostProfiles,
    simulationScenarios,
    calculateScenarioEstimate,
    getPricingIntelligenceData,
    getCostProfileForProvider,
    compareProviderCostProfiles
};
