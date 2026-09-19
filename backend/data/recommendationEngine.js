/**
 * CLOUDEx - Personalized Final Recommendation Engine
 * Feature #16: Synthesizes Fuzzy Processing, Trade-Off Detection, and Weighted MCDM
 * to produce the complete, personalized recommendation object and explanation.
 */

const { processFuzzyRequirements } = require("./fuzzyRequirementProcessor");
const { detectTradeoffs } = require("./tradeoffDetection");
const { evaluateProvidersMCDM, CRITERIA_DEFINITIONS } = require("./mcdmEngine");
const { getProviderById } = require("./cloudData");

/**
 * Generate personalized explanation why the winner matches user priorities.
 */
function buildPersonalizedWhyRecommended(winner, preferences, mode = "beginner") {
    const lines = [];
    const costWeight = preferences.cost || 0;
    const simpWeight = preferences.simplicity || 0;
    const perfWeight = preferences.performance || 0;
    const relWeight = preferences.reliability || 0;
    const aiWeight = preferences.aiGpu || 0;

    if (costWeight >= 0.70 && simpWeight >= 0.70) {
        if (mode === "expert") {
            lines.push(`${winner.providerName} optimized utility scores on low operational overhead and cost predictability, mitigating unnecessary infrastructure administration.`);
        } else if (mode === "intermediate") {
            lines.push(`${winner.providerName} scored highest for your combination of budget predictability and straightforward developer ergonomics.`);
        } else {
            lines.push(`This provider scored strongly for the priorities you selected: keeping costs manageable and avoiding unnecessary setup complexity.`);
        }
    } else if (costWeight >= 0.75) {
        if (mode === "expert") {
            lines.push(`${winner.providerName} achieved the highest cost-efficiency ratio under your FinOps and affordability criteria.`);
        } else {
            lines.push(`It ranked strongly because keeping hosting costs low and predictable is one of your primary goals.`);
        }
    } else if (perfWeight >= 0.75) {
        if (mode === "expert") {
            lines.push(`${winner.providerName} led the weighted matrix in compute headroom, IOPS throughput, and low-latency network interconnects.`);
        } else if (mode === "intermediate") {
            lines.push(`${winner.providerName} ranked at the top because compute throughput and fast response times were your top requirements.`);
        } else {
            lines.push(`It ranked strongly because high speed and performance had a high priority in your preferences.`);
        }
    } else if (aiWeight >= 0.70) {
        if (mode === "expert") {
            lines.push(`${winner.providerName} maximized evaluation weights across dedicated GPU accelerators, high-bandwidth interconnects, and AI model runtimes.`);
        } else {
            lines.push(`It ranked strongly on the AI and GPU compute acceleration criteria used by CLOUDEx.`);
        }
    } else if (relWeight >= 0.80) {
        lines.push(`${winner.providerName} scored highest due to enterprise-grade high availability, multi-zone fault tolerance, and comprehensive uptime SLAs.`);
    } else {
        lines.push(`${winner.providerName} emerged as the best overall balanced match across all your active criteria in the CLOUDEx weighted evaluation.`);
    }

    return lines;
}

/**
 * Calculate top strongest criteria contributions for the winning provider.
 */
function extractStrongestMatches(winner, preferences, mode = "beginner") {
    const labelMap = {
        cost: "Cost & Budget Fit",
        simplicity: "Ease of Setup & Simplicity",
        performance: "Speed & Compute Performance",
        reliability: "Reliability & Uptime SLA",
        features: "Tooling & Ecosystem Breadth",
        support: "Support & SLA Guidance",
        aiGpu: "AI & GPU Compute Capability"
    };

    const sortedCriteria = Object.keys(winner.weightedContributions || {})
        .map(dim => ({
            dimension: dim,
            label: labelMap[dim] || dim,
            userPriority: preferences[dim] || 0,
            providerFitScore: (winner.criteriaScores && winner.criteriaScores[dim]) || 0,
            weightedContribution: (winner.weightedContributions && winner.weightedContributions[dim]) || 0
        }))
        .sort((a, b) => b.weightedContribution - a.weightedContribution);

    // Filter top 2 to 4 criteria that genuinely contributed
    const topMatches = sortedCriteria
        .filter(c => c.userPriority >= 0.35 && c.providerFitScore >= 0.70)
        .slice(0, 4);

    // Fallback to top 2 if strict filter is empty
    const finalMatches = topMatches.length >= 2 ? topMatches : sortedCriteria.slice(0, 3);

    return finalMatches.map(m => ({
        dimension: m.dimension,
        label: m.label,
        providerFitPercentage: Math.round(m.providerFitScore * 100),
        userPriorityPercentage: Math.round(m.userPriority * 100),
        note: `Scored ${Math.round(m.providerFitScore * 100)}% fit for your ${Math.round(m.userPriority * 100)}% priority`
    }));
}

/**
 * Extract meaningful weaker matches or compromises relative to other criteria.
 */
function extractWeakerMatches(winner, preferences, mode = "beginner") {
    const labelMap = {
        cost: "Cost / Budget Fit",
        simplicity: "Simplicity & Setup",
        performance: "Peak Compute Throughput",
        reliability: "Enterprise Availability",
        features: "Proprietary Tool Breadth",
        support: "Enterprise Support SLAs",
        aiGpu: "Dedicated GPU Compute"
    };

    const weaker = [];
    const scores = winner.criteriaScores || {};

    Object.keys(scores).forEach(dim => {
        const userPref = preferences[dim] || 0;
        const provFit = scores[dim];

        // Highlight if user cared (pref >= 0.40) but provider fit is moderate/low (< 0.75)
        // OR if provider fit is notably the lowest among all scores
        if (provFit < 0.72 && userPref >= 0.35) {
            weaker.push({
                dimension: dim,
                label: labelMap[dim] || dim,
                score: provFit,
                note: `${labelMap[dim] || dim} was a relative compromise (${Math.round(provFit * 100)}% fit) within the CLOUDEx evaluation.`
            });
        }
    });

    if (weaker.length === 0) {
        // Find the lowest score among all dimensions
        const lowestDim = Object.keys(scores).sort((a, b) => scores[a] - scores[b])[0];
        if (lowestDim && scores[lowestDim] < 0.85) {
            weaker.push({
                dimension: lowestDim,
                label: labelMap[lowestDim] || lowestDim,
                score: scores[lowestDim],
                note: `${labelMap[lowestDim] || lowestDim} is the lowest relative criterion (${Math.round(scores[lowestDim] * 100)}% fit) for this match.`
            });
        }
    }

    return weaker.slice(0, 2);
}

/**
 * Generate a complete, personalized recommendation.
 *
 * @param {Object} options
 * @param {Object} [options.requirements={}] - Raw or translated requirements
 * @param {Object} [options.preferences={}] - 7 dimension fuzzy preferences
 * @param {string} [options.source="ai_generated"] - "ai_generated" | "user_updated"
 * @param {string} [options.mode="beginner"] - "beginner" | "intermediate" | "expert"
 * @param {Array} [options.tradeoffs] - Pre-computed trade-offs (optional)
 * @returns {Object} Personalized recommendation result object
 */
function generatePersonalizedRecommendation(options = {}) {
    const {
        requirements = {},
        preferences = {},
        source = "ai_generated",
        mode = "beginner",
        tradeoffs = null
    } = options;

    // 1. Process Fuzzy Requirements (Feature #14)
    const fuzzyResult = processFuzzyRequirements({
        requirements,
        preferences,
        source,
        mode
    });

    // 2. Detect Trade-Offs (Feature #12)
    const activeTradeoffs = Array.isArray(tradeoffs) && tradeoffs.length > 0
        ? tradeoffs
        : detectTradeoffs(fuzzyResult.preferences, mode).tradeoffs;

    // 3. Evaluate Providers via Weighted MCDM (Feature #15)
    const mcdmResult = evaluateProvidersMCDM({
        preferences: fuzzyResult.preferences,
        requirements: fuzzyResult.requirementSignals,
        tradeoffs: activeTradeoffs,
        mode
    });

    const winner = mcdmResult.winner;
    const runnerUp = mcdmResult.rankedProviders[1] || null;

    // 4. Personalized Explanation & Criteria Analysis
    const whyRecommended = buildPersonalizedWhyRecommended(winner, fuzzyResult.preferences, mode);
    const strongestMatches = extractStrongestMatches(winner, fuzzyResult.preferences, mode);
    const weakerMatches = extractWeakerMatches(winner, fuzzyResult.preferences, mode);

    // 5. Compute Recommendation Confidence
    const margin = runnerUp ? winner.totalScore - runnerUp.totalScore : 0.10;
    let confidenceVal = fuzzyResult.confidence.overall;

    if (source === "user_updated") {
        confidenceVal = Math.max(confidenceVal, 0.90);
    } else {
        if (margin >= 0.04) {
            confidenceVal += 0.06;
        } else if (margin < 0.015) {
            confidenceVal -= 0.08;
        }
    }

    const finalConfidenceScore = Math.max(0.40, Math.min(0.96, Math.round(confidenceVal * 100) / 100));
    let confidenceLevel = "Medium";
    if (finalConfidenceScore >= 0.80) {
        confidenceLevel = "High";
    } else if (finalConfidenceScore < 0.60) {
        confidenceLevel = "Low";
    }

    let confidenceBasis = "Reflects available requirement signals and weighted MCDM candidate separation.";
    if (source === "user_updated") {
        confidenceBasis = "High confidence: Priorities were directly adjusted and calibrated by you.";
    } else if (requirements.uncertaintySignal) {
        confidenceBasis = "Moderate confidence: Some defaults were safely assumed due to unstated requirements.";
    }

    return {
        success: true,
        recommendedProvider: {
            id: winner.providerId,
            name: winner.providerName,
            shortName: winner.shortName,
            totalScore: winner.totalScore,
            matchPercentage: winner.matchPercentage,
            rank: 1,
            categories: winner.categories,
            description: winner.description,
            strengths: winner.strengths,
            weaknesses: winner.weaknesses
        },
        runnerUp: runnerUp ? {
            id: runnerUp.providerId,
            name: runnerUp.providerName,
            matchPercentage: runnerUp.matchPercentage
        } : null,
        recommendationScore: winner.totalScore,
        matchPercentage: winner.matchPercentage,
        confidence: {
            score: finalConfidenceScore,
            level: confidenceLevel,
            percentage: Math.round(finalConfidenceScore * 100),
            label: `Recommendation confidence: ${confidenceLevel} (${Math.round(finalConfidenceScore * 100)}%)`,
            basis: confidenceBasis
        },
        whyRecommended,
        strongestMatches,
        weakerMatches,
        tradeoffs: activeTradeoffs,
        requirementsUnderstood: fuzzyResult.requirementSignals,
        preferencesUsed: fuzzyResult.preferences,
        fuzzyInterpretation: fuzzyResult.fuzzyInterpretation,
        source: fuzzyResult.source,
        mode: fuzzyResult.mode,
        scoringMethod: "Weighted MCDM",
        allRankings: mcdmResult.rankedProviders.map(p => ({
            rank: p.rank,
            id: p.providerId,
            name: p.providerName,
            matchPercentage: p.matchPercentage
        })),
        generatedAt: new Date().toISOString()
    };
}

module.exports = {
    generatePersonalizedRecommendation,
    buildPersonalizedWhyRecommended,
    extractStrongestMatches,
    extractWeakerMatches
};
