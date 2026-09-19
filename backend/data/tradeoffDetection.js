/**
 * CLOUDEx - Trade-Off & Conflict Detection Engine
 * Feature #12: Detects competing or tension-inducing cloud preference settings.
 *
 * Provides constructive, educational guidance adapted to experience mode.
 * Never blocks the user; informs how CLOUDEx balances competing goals.
 */

const TRADEOFF_DEFINITIONS = [
    {
        id: "cost_vs_performance",
        title: "Cost vs. Performance",
        dimensions: ["cost", "performance"],
        evaluate: (prefs) => {
            const cost = prefs.cost || 0;
            const perf = prefs.performance || 0;
            if (cost >= 0.75 && perf >= 0.75) {
                return cost >= 0.85 && perf >= 0.85 ? "high" : "moderate";
            }
            return null;
        },
        explanations: {
            beginner: "High speed and fast processing usually require dedicated, powerful cloud servers which naturally cost more. Very cheap options typically share resources with other users and may slow down under heavy loads.",
            intermediate: "Aggressive budget constraints conflict with peak IOPS, dedicated CPU cores, and ultra-low latency networking. Entry-tier shared compute instances experience CPU throttling under sustained throughput.",
            expert: "FinOps-driven cost minimization directly conflicts with dedicated compute instances, Provisioned IOPS (e.g. AWS io2, GCP Extreme), and unmetered low-latency interconnects."
        },
        hints: {
            beginner: "CloudEx will look for the best 'sweet spot' — great performance at fair, predictable pricing without enterprise markups.",
            intermediate: "CloudEx will prioritize high price-to-performance alternative clouds (e.g. Hetzner, DigitalOcean) or optimized compute tiers.",
            expert: "CloudEx will target the cost-performance Pareto frontier, factoring in compute-optimized tiers vs bare-metal with low egress penalties."
        }
    },
    {
        id: "simplicity_vs_features",
        title: "Simplicity vs. Feature Breadth",
        dimensions: ["simplicity", "features"],
        evaluate: (prefs) => {
            const simp = prefs.simplicity || 0;
            const feat = prefs.features || 0;
            if (simp >= 0.75 && feat >= 0.75) {
                return simp >= 0.85 && feat >= 0.85 ? "high" : "moderate";
            }
            return null;
        },
        explanations: {
            beginner: "Simpler cloud platforms keep things easy by hiding complex tools and settings. Providers that offer hundreds of specialized tools usually have a steeper learning curve.",
            intermediate: "Turnkey PaaS platforms (like Render or Heroku) maximize developer ergonomics, but sacrifice granular networking, custom VPC mesh, and deep service catalogs offered by hyperscalers.",
            expert: "High abstraction layers (PaaS/Serverless) trade off deep IAM policies, fine-grained VPC topologies, specialized compliance modules, and proprietary ecosystem primitives."
        },
        hints: {
            beginner: "CloudEx will prioritize easy-to-use platforms that still include the essential tools your app needs to grow.",
            intermediate: "CloudEx will balance developer ergonomics against ecosystem depth, identifying platforms with turnkey workflows plus modular service catalogs.",
            expert: "CloudEx will balance time-to-market developer velocity against operational extensibility and custom orchestration requirements."
        }
    },
    {
        id: "cost_vs_reliability",
        title: "Cost vs. High Availability / SLA",
        dimensions: ["cost", "reliability"],
        evaluate: (prefs) => {
            const cost = prefs.cost || 0;
            const rel = prefs.reliability || 0;
            if (cost >= 0.75 && rel >= 0.80) {
                return cost >= 0.85 && rel >= 0.85 ? "high" : "moderate";
            }
            return null;
        },
        explanations: {
            beginner: "Keeping a website or app running 100% of the time with automatic backups across multiple data centers requires redundant servers, which adds to the monthly cost.",
            intermediate: "Achieving 99.99%+ SLA availability demands multi-region redundancy, automated health-check failover, and active-active replicas, substantially increasing base infrastructure cost.",
            expert: "Strict RTO/RPO objectives, multi-AZ clustering, cross-region replication, and financially-backed 99.99% SLAs double baseline compute and egress expenditures."
        },
        hints: {
            beginner: "CloudEx will seek out providers that offer solid, reliable uptime without charging enterprise premiums for basic reliability.",
            intermediate: "CloudEx will recommend cost-effective high-availability patterns (e.g. managed database replicas and multi-node clusters within reasonable budgets).",
            expert: "CloudEx will optimize for cost-effective resilience, evaluating multi-zone setups on value clouds vs enterprise multi-region architectures."
        }
    },
    {
        id: "cost_vs_aigpu",
        title: "Cost vs. Dedicated AI / GPU Compute",
        dimensions: ["cost", "aiGpu"],
        evaluate: (prefs) => {
            const cost = prefs.cost || 0;
            const ai = prefs.aiGpu || 0;
            if (cost >= 0.75 && ai >= 0.70) {
                return cost >= 0.85 && ai >= 0.80 ? "high" : "moderate";
            }
            return null;
        },
        explanations: {
            beginner: "Computers equipped with high-end AI graphics cards (GPUs) are among the most expensive cloud services to rent. Extremely low budgets make dedicated AI hardware tough to afford.",
            intermediate: "Dedicated AI accelerators (e.g. NVIDIA A100/H100/L40S) have high hourly price floors. Strict budget limits often require spot instances, fractional GPUs, or API-only models.",
            expert: "Dedicated GPU clusters, NVLink fabric, and high-VRAM instances represent significant CapEx/OpEx. Heavy cost constraints restrict availability to spot markets or boutique GPU clouds."
        },
        hints: {
            beginner: "CloudEx will check if using AI through affordable APIs or specialized GPU rental providers fits your budget.",
            intermediate: "CloudEx will highlight specialized GPU clouds (e.g. Lambda, RunPod) with transparent per-hour billing alongside hyperscaler options.",
            expert: "CloudEx will contrast boutique GPU cloud pricing with reserved instances and spot availability across hyperscalers."
        }
    },
    {
        id: "cost_vs_support",
        title: "Cost vs. Dedicated Enterprise Support",
        dimensions: ["cost", "support"],
        evaluate: (prefs) => {
            const cost = prefs.cost || 0;
            const sup = prefs.support || 0;
            if (cost >= 0.80 && sup >= 0.75) {
                return "moderate";
            }
            return null;
        },
        explanations: {
            beginner: "24/7 direct phone and engineer support typically requires premium monthly support subscriptions rather than free-tier or entry-level accounts.",
            intermediate: "Guaranteed 15-minute response SLAs and dedicated cloud technical account managers require dedicated paid support plans ($100-$1000+/mo on major clouds).",
            expert: "Enterprise Support tiers mandate percentage-of-spend minimums (3-10% of monthly cloud billing with substantial annual floors), conflicting with lean budget targets."
        },
        hints: {
            beginner: "CloudEx will favor platforms with responsive community support, clear documentation, and free email support.",
            intermediate: "CloudEx will recommend providers with responsive included support or flat-rate business ticketing rather than percentage-of-spend tiers.",
            expert: "CloudEx will compare providers offering reasonable SLA contracts without aggressive minimum spend retainers."
        }
    }
];

/**
 * Detect trade-offs and tensions in user or AI preferences.
 * @param {Object} preferences - Dimension values { cost, simplicity, performance, reliability, features, support, aiGpu }
 * @param {string} experienceMode - "beginner" | "intermediate" | "expert"
 * @returns {Object} Result object with detected flag and list of trade-off items
 */
function detectTradeoffs(preferences = {}, experienceMode = "beginner") {
    const modeKey = ["beginner", "intermediate", "expert"].includes(experienceMode)
        ? experienceMode
        : "beginner";

    const detectedTradeoffs = [];

    TRADEOFF_DEFINITIONS.forEach((def) => {
        const severity = def.evaluate(preferences);
        if (severity) {
            detectedTradeoffs.push({
                id: def.id,
                title: def.title,
                dimensions: [...def.dimensions],
                severity: severity, // "high" | "moderate"
                explanation: def.explanations[modeKey] || def.explanations.beginner,
                recommendationHint: def.hints[modeKey] || def.hints.beginner
            });
        }
    });

    return {
        detected: detectedTradeoffs.length > 0,
        tradeoffs: detectedTradeoffs,
        count: detectedTradeoffs.length,
        experienceMode: modeKey
    };
}

module.exports = {
    TRADEOFF_DEFINITIONS,
    detectTradeoffs
};
