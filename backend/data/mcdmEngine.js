/**
 * CLOUDEx - MCDM-Based CSP Selection Engine
 * Feature #15: Multi-Criteria Decision Making Provider Evaluation & Ranking
 *
 * Method: Transparent Weighted Multi-Criteria Decision Making (MCDM)
 * Evaluates all 15 CSPs across the 7 standardized criteria:
 * - cost (importance of low cost / budget predictability)
 * - simplicity (ease of setup / automated operations / developer ergonomics)
 * - performance (compute throughput / low latency / IOPS)
 * - reliability (high availability / SLA guarantees / multi-region)
 * - features (service catalog breadth / specialized tools)
 * - support (enterprise support agreements / responsive SLAs)
 * - aiGpu (dedicated GPU accelerators / AI hardware)
 *
 * NOTE: Higher provider cost score means BETTER FIT FOR LOW-COST PREFERENCE (more affordable).
 * These scores are CLOUDEx decision-support evaluation values, not official vendor benchmarks.
 */

const { getAllProviders } = require("./cloudData");

/**
 * Baseline qualitative evaluation values for all 15 CSPs on a 0.0 – 1.0 scale.
 * Derived from CLOUDEx provider metrics, pricing models, and architectural tiers.
 */
const CSP_EVALUATION_DATA = {
    aws: {
        cost: 0.70,
        simplicity: 0.62,
        performance: 0.96,
        reliability: 0.98,
        features: 0.99,
        support: 0.95,
        aiGpu: 0.97
    },
    azure: {
        cost: 0.68,
        simplicity: 0.65,
        performance: 0.94,
        reliability: 0.97,
        features: 0.97,
        support: 0.95,
        aiGpu: 0.92
    },
    gcp: {
        cost: 0.75,
        simplicity: 0.70,
        performance: 0.95,
        reliability: 0.96,
        features: 0.95,
        support: 0.92,
        aiGpu: 0.98
    },
    oracle: {
        cost: 0.80,
        simplicity: 0.63,
        performance: 0.86,
        reliability: 0.91,
        features: 0.85,
        support: 0.90,
        aiGpu: 0.75
    },
    ibm: {
        cost: 0.68,
        simplicity: 0.65,
        performance: 0.83,
        reliability: 0.93,
        features: 0.88,
        support: 0.93,
        aiGpu: 0.84
    },
    digitalocean: {
        cost: 0.95,
        simplicity: 0.96,
        performance: 0.80,
        reliability: 0.88,
        features: 0.72,
        support: 0.78,
        aiGpu: 0.60
    },
    alibaba: {
        cost: 0.78,
        simplicity: 0.65,
        performance: 0.90,
        reliability: 0.92,
        features: 0.92,
        support: 0.86,
        aiGpu: 0.87
    },
    huawei: {
        cost: 0.77,
        simplicity: 0.64,
        performance: 0.89,
        reliability: 0.91,
        features: 0.88,
        support: 0.84,
        aiGpu: 0.85
    },
    tencent: {
        cost: 0.78,
        simplicity: 0.63,
        performance: 0.88,
        reliability: 0.90,
        features: 0.87,
        support: 0.83,
        aiGpu: 0.84
    },
    vultr: {
        cost: 0.92,
        simplicity: 0.88,
        performance: 0.84,
        reliability: 0.86,
        features: 0.72,
        support: 0.76,
        aiGpu: 0.75
    },
    hetzner: {
        cost: 0.98,
        simplicity: 0.88,
        performance: 0.88,
        reliability: 0.88,
        features: 0.65,
        support: 0.74,
        aiGpu: 0.65
    },
    ovhcloud: {
        cost: 0.88,
        simplicity: 0.72,
        performance: 0.84,
        reliability: 0.88,
        features: 0.75,
        support: 0.78,
        aiGpu: 0.77
    },
    cloudflare: {
        cost: 0.86,
        simplicity: 0.85,
        performance: 0.90,
        reliability: 0.94,
        features: 0.76,
        support: 0.76,
        aiGpu: 0.76
    },
    akamai: {
        cost: 0.75,
        simplicity: 0.70,
        performance: 0.88,
        reliability: 0.92,
        features: 0.76,
        support: 0.82,
        aiGpu: 0.68
    },
    coreweave: {
        cost: 0.68,
        simplicity: 0.62,
        performance: 0.96,
        reliability: 0.88,
        features: 0.62,
        support: 0.80,
        aiGpu: 0.99
    }
};

const CRITERIA_DEFINITIONS = [
    { key: "cost", label: "Cost & Affordability", description: "Fit for budget sensitivity and low-cost priority" },
    { key: "simplicity", label: "Simplicity & Ergonomics", description: "Ease of setup and zero-devops automation" },
    { key: "performance", label: "Performance & Throughput", description: "Compute power, network speed, and IOPS" },
    { key: "reliability", label: "Reliability & Uptime SLA", description: "Fault tolerance, HA, and multi-region durability" },
    { key: "features", label: "Ecosystem & Feature Breadth", description: "Managed offerings and proprietary tool depth" },
    { key: "support", label: "Support & SLA Guidance", description: "Enterprise assistance, response SLAs, and guidance" },
    { key: "aiGpu", label: "AI & GPU Compute", description: "Dedicated GPU hardware accelerators and ML capabilities" }
];

/**
 * Execute Weighted MCDM scoring and ranking for all 15 CSPs.
 *
 * @param {Object} options
 * @param {Object} options.preferences - 7 dimension values (0.0 – 1.0)
 * @param {Object} [options.requirements={}] - Extracted requirements
 * @param {Array} [options.tradeoffs=[]] - Active trade-offs from Feature #12
 * @param {string} [options.mode="beginner"] - Experience mode
 * @returns {Object} Complete MCDM scoring and ranking result
 */
function evaluateProvidersMCDM(options = {}) {
    const {
        preferences = {},
        requirements = {},
        tradeoffs = [],
        mode = "beginner"
    } = options;

    const allProviders = getAllProviders();
    const dimensions = ["cost", "simplicity", "performance", "reliability", "features", "support", "aiGpu"];

    // 1. Sanitize and clamp preferences
    const sanitizedPrefs = {};
    let totalWeight = 0;

    dimensions.forEach((dim) => {
        const raw = typeof preferences[dim] === "number" && !isNaN(preferences[dim])
            ? preferences[dim]
            : 0.50;
        const clamped = Math.max(0, Math.min(1, Math.round(raw * 100) / 100));
        sanitizedPrefs[dim] = clamped;
        totalWeight += clamped;
    });

    // If totalWeight is 0, default to equal weights
    const divisor = totalWeight > 0 ? totalWeight : dimensions.length;

    // 2. Evaluate all 15 CSPs
    const rankedProviders = allProviders.map((provider) => {
        const evalData = CSP_EVALUATION_DATA[provider.id] || {
            cost: (provider.affordability || 7.0) / 10,
            simplicity: (provider.beginnerFriendly || 7.0) / 10,
            performance: (provider.scalability || 8.0) / 10,
            reliability: 0.85,
            features: (provider.enterprise || 7.5) / 10,
            support: 0.80,
            aiGpu: (provider.aiMl || 5.0) / 10
        };

        const criteriaScores = {};
        const weightedContributions = {};
        let rawWeightedSum = 0;

        dimensions.forEach((dim) => {
            const userPref = sanitizedPrefs[dim];
            const provScore = evalData[dim];
            const contribution = userPref * provScore;

            criteriaScores[dim] = provScore;
            weightedContributions[dim] = Math.round(contribution * 1000) / 1000;
            rawWeightedSum += contribution;
        });

        // Normalized score strictly in 0.0 - 1.0
        const totalScore = Math.max(0, Math.min(1, Math.round((rawWeightedSum / divisor) * 1000) / 1000));
        const matchPercentage = Math.round(totalScore * 100);

        return {
            providerId: provider.id,
            providerName: provider.name,
            shortName: provider.shortName || provider.name,
            totalScore,
            matchPercentage,
            criteriaScores,
            weightedContributions,
            categories: Array.isArray(provider.categories) ? [...provider.categories] : [],
            description: provider.description || "",
            strengths: Array.isArray(provider.strengths) ? [...provider.strengths] : [],
            weaknesses: Array.isArray(provider.weaknesses) ? [...provider.weaknesses] : []
        };
    });

    // 3. Sort providers deterministically descending by totalScore
    rankedProviders.sort((a, b) => {
        if (b.totalScore !== a.totalScore) {
            return b.totalScore - a.totalScore;
        }
        return a.providerName.localeCompare(b.providerName);
    });

    // Assign rank positions 1..15
    rankedProviders.forEach((p, idx) => {
        p.rank = idx + 1;
    });

    const winner = rankedProviders[0] || null;

    return {
        success: true,
        scoringMethod: "Weighted MCDM",
        rankedProviders,
        winner,
        totalProvidersEvaluated: rankedProviders.length,
        criteria: CRITERIA_DEFINITIONS.map(c => ({
            key: c.key,
            label: c.label,
            userWeight: sanitizedPrefs[c.key]
        })),
        preferencesUsed: sanitizedPrefs,
        tradeoffs: Array.isArray(tradeoffs) ? [...tradeoffs] : [],
        generatedAt: new Date().toISOString()
    };
}

module.exports = {
    CSP_EVALUATION_DATA,
    CRITERIA_DEFINITIONS,
    evaluateProvidersMCDM
};
