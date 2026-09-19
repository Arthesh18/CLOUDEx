/**
 * CLOUDEx - Personalized Final Recommendation Engine
 * Feature #16: Synthesizes Fuzzy Processing, Trade-Off Detection, and Weighted MCDM
 * to produce the complete, personalized recommendation object and explanation.
 */

const { processFuzzyRequirements } = require("./fuzzyRequirementProcessor");
const { detectTradeoffs } = require("./tradeoffDetection");
const { evaluateProvidersMCDM, CRITERIA_DEFINITIONS } = require("./mcdmEngine");
const { getProviderById } = require("./cloudData");
const { explainAssumptions } = require("./assumptionExplainer");

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
        assumptions: explainAssumptions({
            requirements: fuzzyResult.requirementSignals,
            preferences: fuzzyResult.preferences,
            recommendation: winner,
            mode: fuzzyResult.mode
        }),
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
        howDecided: buildDecisionPipelineExplainability({
            requirements: fuzzyResult.requirementSignals,
            preferences: fuzzyResult.preferences,
            source: fuzzyResult.source,
            mode: fuzzyResult.mode,
            tradeoffs: activeTradeoffs,
            mcdmResult,
            winner
        }),
        generatedAt: new Date().toISOString()
    };
}

/**
 * Compare Original vs Updated Recommendation (Feature #17)
 * Strictly preserves state separation and generates comparative explanations and rank movements.
 *
 * @param {Object} options
 * @param {Object} [options.requirements={}]
 * @param {Object} [options.originalPreferences={}]
 * @param {Object} [options.updatedPreferences={}]
 * @param {string} [options.mode="beginner"]
 * @returns {Object} Comparison result
 */
function compareRecommendations(options = {}) {
    const {
        requirements = {},
        originalPreferences = {},
        updatedPreferences = {},
        mode = "beginner"
    } = options;

    const DIMENSIONS = [
        { key: "cost", label: "Cost & Budget", beginner: "Cost & Budget", intermediate: "Cost & Budget Sensitivity", expert: "FinOps & Egress Optimization" },
        { key: "simplicity", label: "Ease of Setup", beginner: "Ease of Setup", intermediate: "Simplicity & Developer Velocity", expert: "Low Infrastructure Overhead" },
        { key: "performance", label: "Speed & Performance", beginner: "Speed & Performance", intermediate: "Performance & Throughput", expert: "Compute Throughput & IOPS" },
        { key: "reliability", label: "Reliability & Uptime", beginner: "Reliability & Uptime", intermediate: "High Availability & SLAs", expert: "Enterprise SLA & Fault Tolerance" },
        { key: "features", label: "Tools & Features", beginner: "Tools & Features", intermediate: "Ecosystem Breadth & Tools", expert: "Enterprise Ecosystem Breadth" },
        { key: "support", label: "Help & Support", beginner: "Help & Support", intermediate: "Support SLAs & Guidance", expert: "Enterprise Agreement & Direct Support" },
        { key: "aiGpu", label: "AI & Smart Tech", beginner: "AI & Smart Tech", intermediate: "Dedicated AI/GPU Compute", expert: "Dedicated GPU Compute Acceleration" }
    ];

    // Detect preference changes across all dimensions
    const preferenceChanges = [];
    let hasChanges = false;

    DIMENSIONS.forEach(dim => {
        const origVal = typeof originalPreferences[dim.key] === "number" ? originalPreferences[dim.key] : 0.5;
        const updVal = typeof updatedPreferences[dim.key] === "number" ? updatedPreferences[dim.key] : origVal;
        const delta = Math.round((updVal - origVal) * 100);

        if (Math.abs(delta) >= 2) {
            hasChanges = true;
            preferenceChanges.push({
                dimension: dim.key,
                label: dim[mode] || dim.label,
                originalPct: Math.round(origVal * 100),
                updatedPct: Math.round(updVal * 100),
                deltaPct: delta,
                direction: delta > 0 ? "increased" : "decreased",
                summary: `${dim[mode] || dim.label} ${delta > 0 ? "increased" : "decreased"} (${delta > 0 ? "+" : ""}${delta}%)`
            });
        }
    });

    // Generate both recommendations independently without mutating either
    const originalRec = generatePersonalizedRecommendation({
        requirements,
        preferences: originalPreferences,
        source: "ai_generated",
        mode
    });

    // If no changes were made to preferences
    if (!hasChanges) {
        return {
            success: true,
            changed: false,
            recommendationChanged: false,
            original: {
                provider: {
                    id: originalRec.recommendedProvider.id,
                    name: originalRec.recommendedProvider.name,
                    shortName: originalRec.recommendedProvider.shortName
                },
                score: originalRec.recommendationScore,
                matchPercentage: originalRec.matchPercentage,
                rank: 1
            },
            updated: {
                provider: {
                    id: originalRec.recommendedProvider.id,
                    name: originalRec.recommendedProvider.name,
                    shortName: originalRec.recommendedProvider.shortName
                },
                score: originalRec.recommendationScore,
                matchPercentage: originalRec.matchPercentage,
                rank: 1
            },
            preferenceChanges: [],
            rankMovement: null,
            explanation: "No preference changes were made, so there is no updated recommendation to compare.",
            mode
        };
    }

    // Evaluate updated recommendation with user-adjusted weights
    const updatedRec = generatePersonalizedRecommendation({
        requirements,
        preferences: updatedPreferences,
        source: "user_updated",
        mode
    });

    const origWinner = originalRec.recommendedProvider;
    const updWinner = updatedRec.recommendedProvider;
    const recChanged = origWinner.id !== updWinner.id;

    // Determine rank movement from actual MCDM allRankings
    const origWinnerInUpdated = updatedRec.allRankings.find(p => p.id === origWinner.id);
    const origWinnerNewRank = origWinnerInUpdated ? origWinnerInUpdated.rank : 2;
    const origWinnerNewScore = origWinnerInUpdated ? origWinnerInUpdated.matchPercentage : origWinner.matchPercentage;

    const updWinnerInOriginal = originalRec.allRankings.find(p => p.id === updWinner.id);
    const updWinnerOldRank = updWinnerInOriginal ? updWinnerInOriginal.rank : 2;
    const updWinnerOldScore = updWinnerInOriginal ? updWinnerInOriginal.matchPercentage : updWinner.matchPercentage;

    const rankMovement = {
        originalWinner: {
            providerId: origWinner.id,
            providerName: origWinner.name,
            originalRank: 1,
            updatedRank: origWinnerNewRank,
            originalScore: origWinner.matchPercentage,
            updatedScore: origWinnerNewScore
        },
        updatedWinner: {
            providerId: updWinner.id,
            providerName: updWinner.name,
            originalRank: updWinnerOldRank,
            updatedRank: 1,
            originalScore: updWinnerOldScore,
            updatedScore: updWinner.matchPercentage
        }
    };

    // Mode-adapted explanation
    let explanation = "";
    if (recChanged) {
        if (mode === "expert") {
            explanation = `Under your original priorities, ${origWinner.name} held highest aggregate utility (${origWinner.matchPercentage}%). Under your calibrated utility weights, ${updWinner.name} optimized the multi-criteria objective function (${updWinner.matchPercentage}%), moving ${origWinner.name} from Rank #1 to Rank #${origWinnerNewRank}.`;
        } else if (mode === "intermediate") {
            explanation = `Your recommendation shifted from ${origWinner.name} (Rank #1 → #${origWinnerNewRank}) to ${updWinner.name} (Rank #${updWinnerOldRank} → #1). This change occurred because your priority adjustments placed higher emphasis on criteria where ${updWinner.name} specializes.`;
        } else {
            explanation = `Your recommended provider changed because your priorities changed. Under your original priorities, ${origWinner.name} was recommended (${origWinner.matchPercentage}% fit). Under your updated priorities, ${updWinner.name} emerged as the best fit (${updWinner.matchPercentage}% fit). Neither provider is universally better; each simply fits different priorities.`;
        }
    } else {
        const scoreDelta = updWinner.matchPercentage - origWinner.matchPercentage;
        const deltaText = scoreDelta === 0 ? "remained exactly at" : (scoreDelta > 0 ? `increased by +${scoreDelta}% to` : `decreased by ${scoreDelta}% to`);
        if (mode === "expert") {
            explanation = `Top-ranked provider utility converged on ${origWinner.name} across both parameter profiles. Its aggregate score ${deltaText} ${updWinner.matchPercentage}%, demonstrating high robustness to weight adjustments.`;
        } else if (mode === "intermediate") {
            explanation = `Your recommended provider stayed the same. Despite adjusting your criteria, ${origWinner.name} continues to offer the most balanced architectural fit for your workload (fit score ${deltaText} ${updWinner.matchPercentage}%).`;
        } else {
            explanation = `Your recommended provider stayed the same. Even with your updated priorities, ${origWinner.name} remains the strongest overall match for your project (fit score ${deltaText} ${updWinner.matchPercentage}%).`;
        }
    }

    return {
        success: true,
        changed: true,
        recommendationChanged: recChanged,
        original: {
            provider: {
                id: origWinner.id,
                name: origWinner.name,
                shortName: origWinner.shortName
            },
            score: origWinner.totalScore,
            matchPercentage: origWinner.matchPercentage,
            rank: 1
        },
        updated: {
            provider: {
                id: updWinner.id,
                name: updWinner.name,
                shortName: updWinner.shortName
            },
            score: updWinner.totalScore,
            matchPercentage: updWinner.matchPercentage,
            rank: 1
        },
        preferenceChanges,
        rankMovement,
        explanation,
        mode
    };
}

/**
 * Generate Structured Decision Pipeline Explainability (Feature #18)
 *
 * @param {Object} options
 * @returns {Object} Structured explainability object
 */
function buildDecisionPipelineExplainability(options = {}) {
    const {
        requirements = {},
        preferences = {},
        source = "ai_generated",
        mode = "beginner",
        tradeoffs = null,
        mcdmResult = null,
        winner = null
    } = options;

    const DIMENSIONS = [
        { key: "cost", label: "Cost & Budget", beginner: "Cost & Budget", intermediate: "Cost & Budget Sensitivity", expert: "FinOps & Egress Optimization" },
        { key: "simplicity", label: "Ease of Setup", beginner: "Ease of Setup", intermediate: "Simplicity & Developer Velocity", expert: "Low Infrastructure Overhead" },
        { key: "performance", label: "Speed & Performance", beginner: "Speed & Performance", intermediate: "Performance & Throughput", expert: "Compute Throughput & IOPS" },
        { key: "reliability", label: "Reliability & Uptime", beginner: "Reliability & Uptime", intermediate: "High Availability & SLAs", expert: "Enterprise SLA & Fault Tolerance" },
        { key: "features", label: "Tools & Features", beginner: "Tools & Features", intermediate: "Ecosystem Breadth & Tools", expert: "Enterprise Ecosystem Breadth" },
        { key: "support", label: "Help & Support", beginner: "Help & Support", intermediate: "Support SLAs & Guidance", expert: "Enterprise Agreement & Direct Support" },
        { key: "aiGpu", label: "AI & Smart Tech", beginner: "AI & Smart Tech", intermediate: "Dedicated AI/GPU Compute", expert: "Dedicated GPU Compute Acceleration" }
    ];

    // 1. Input Summary
    const inputSummary = {
        project: requirements.projectPurpose || "Web / Cloud Workload",
        budget: requirements.budgetSensitivity || "Not explicitly constrained",
        scale: requirements.scaleRequirement || "Initial / Standard Scale",
        experience: requirements.experienceLevel || mode || "Beginner"
    };

    // 2. Requirements Understood (Feature #14)
    const isUncertain = Boolean(requirements.uncertaintySignal);
    const requirementsUnderstood = {
        workload: {
            dimension: "Workload",
            value: requirements.workloadType || "General Web Application",
            statedByUser: Boolean(requirements.workloadType),
            assumed: !requirements.workloadType
        },
        scale: {
            dimension: "Scale",
            value: requirements.scaleRequirement || "Standard Single-Region",
            statedByUser: Boolean(requirements.scaleRequirement),
            assumed: !requirements.scaleRequirement
        },
        budgetSensitivity: {
            dimension: "Budget Sensitivity",
            value: requirements.budgetSensitivity || "Moderate Budget",
            statedByUser: Boolean(requirements.budgetSensitivity),
            assumed: !requirements.budgetSensitivity
        },
        simplicity: {
            dimension: "Setup Simplicity",
            value: requirements.simplicityRequirement || (preferences.simplicity >= 0.70 ? "Turnkey / Low Ops" : "Standard Management"),
            statedByUser: Boolean(requirements.simplicityRequirement),
            assumed: !requirements.simplicityRequirement
        },
        database: {
            dimension: "Database Tier",
            value: requirements.databaseRequirement || "Standard Application Database",
            statedByUser: Boolean(requirements.databaseRequirement),
            assumed: !requirements.databaseRequirement
        },
        aiGpu: {
            dimension: "AI / GPU Compute",
            value: preferences.aiGpu >= 0.70 ? "Dedicated GPU Required" : "CPU / Standard Compute",
            statedByUser: Boolean(requirements.aiGpuRequirement || preferences.aiGpu >= 0.70),
            assumed: !requirements.aiGpuRequirement && preferences.aiGpu < 0.70
        },
        geographic: {
            dimension: "Geographic Needs",
            value: requirements.geographicRequirement || "Global Multi-Zone Capable",
            statedByUser: Boolean(requirements.geographicRequirement),
            assumed: !requirements.geographicRequirement
        },
        compliance: {
            dimension: "Compliance",
            value: requirements.complianceRequirement || "Standard Commercial Cloud Security",
            statedByUser: Boolean(requirements.complianceRequirement),
            assumed: !requirements.complianceRequirement
        },
        uncertaintySignal: isUncertain
    };

    // 3. Fuzzy Preferences (7 dimensions)
    function toLinguistic(val) {
        if (val <= 0.20) return "Very Low";
        if (val <= 0.40) return "Low";
        if (val <= 0.60) return "Medium";
        if (val <= 0.80) return "High";
        return "Very High";
    }

    const fuzzyPreferences = DIMENSIONS.map(d => {
        const val = typeof preferences[d.key] === "number" ? preferences[d.key] : 0.5;
        return {
            key: d.key,
            label: d[mode] || d.label,
            value: val,
            percentage: Math.round(val * 100),
            linguisticLevel: toLinguistic(val),
            isUserUpdated: source === "user_updated"
        };
    });

    // 4. User Priorities
    const userPriorities = {
        source,
        status: source === "user_updated" ? "Calibrated by You via Priority Sliders" : "Inferred by CLOUDEx from Requirements",
        mode
    };

    // 5. Trade-Offs (Feature #12)
    const tradeoffsList = Array.isArray(tradeoffs) ? tradeoffs.map(t => ({
        id: t.id,
        title: t.title,
        severity: t.severity,
        explanation: (t.explanations && t.explanations[mode]) || t.explanation || "",
        hint: (t.hints && t.hints[mode]) || t.hint || ""
    })) : [];

    // 6. MCDM Evaluation
    const topWinner = winner || (mcdmResult && mcdmResult.winner);
    const mcdmCriteria = topWinner ? DIMENSIONS.map(d => {
        const uWeight = preferences[d.key] || 0;
        const pFit = (topWinner.criteriaScores && topWinner.criteriaScores[d.key]) || 0;
        const weightedCont = (topWinner.weightedContributions && topWinner.weightedContributions[d.key]) || (uWeight * pFit);
        return {
            dimension: d.key,
            label: d[mode] || d.label,
            userWeight: Math.round(uWeight * 100) / 100,
            userWeightPct: Math.round(uWeight * 100),
            providerFit: Math.round(pFit * 100) / 100,
            providerFitPct: Math.round(pFit * 100),
            weightedContribution: Math.round(weightedCont * 1000) / 1000
        };
    }) : [];

    // 7. CSP Ranking (All 15 CSPs)
    const rankedProviders = (mcdmResult && mcdmResult.rankedProviders) ? mcdmResult.rankedProviders.map(p => ({
        rank: p.rank,
        id: p.providerId,
        name: p.providerName,
        shortName: p.shortName,
        totalScore: p.totalScore,
        matchPercentage: p.matchPercentage,
        isWinner: p.rank === 1
    })) : [];

    // 8. Why the Winner Won
    const strongestContributions = [...mcdmCriteria]
        .sort((a, b) => b.weightedContribution - a.weightedContribution)
        .slice(0, 3);

    const whyWinnerWon = {
        providerName: topWinner ? topWinner.providerName : "Recommended Cloud",
        topFactors: strongestContributions.map((c, i) => `${i + 1}. Strong ${c.label} fit (${c.providerFitPct}% match at ${c.userWeightPct}% priority)`),
        summary: mode === "expert"
            ? `${topWinner ? topWinner.providerName : "Winner"} maximized multi-criteria utility across your priority weights with ${strongestContributions.map(c => c.label).join(", ")} delivering top positive contributions.`
            : `${topWinner ? topWinner.providerName : "Winner"} ranked #1 because it scored highest across your top priorities: ${strongestContributions.map(c => c.label).join(", ")}.`
    };

    const assumptionsReport = explainAssumptions({
        requirements,
        preferences,
        recommendation: topWinner,
        mode
    });

    return {
        success: true,
        pipelineStages: [
            { id: "user_input", title: "1. User Input", description: "What you told CLOUDEx about your application" },
            { id: "requirements_understood", title: "2. Requirements Understood & Assumptions", description: "Inferred signals and assumed defaults" },
            { id: "fuzzy_preferences", title: "3. Fuzzy Preferences", description: "Normalized 7-dimension weights and linguistic levels" },
            { id: "user_priorities", title: "4. User Priorities", description: "Active weight calibration profile" },
            { id: "tradeoff_detection", title: "5. Trade-Off Detection", description: "Competing architectural tensions analyzed" },
            { id: "mcdm_evaluation", title: "6. MCDM Evaluation", description: "Mathematical multi-criteria utility calculation" },
            { id: "csp_ranking", title: "7. CSP Ranking", description: "Deterministic ranking of all 15 cloud providers" },
            { id: "final_recommendation", title: "8. Final Recommendation", description: "Synthesized recommendation and why the winner won" }
        ],
        inputSummary,
        requirementsUnderstood,
        assumptions: assumptionsReport,
        fuzzyPreferences,
        userPriorities,
        tradeoffs: tradeoffsList,
        mcdm: {
            method: "Weighted Multi-Criteria Decision Making (MCDM)",
            formula: "Score = Σ (User Preference Weight × Provider Fit Score)",
            description: "Each provider receives a score for the criteria that matter to you. Your preference weights determine how strongly each criterion affects the final score.",
            criteria: mcdmCriteria,
            winner: topWinner ? {
                id: topWinner.providerId,
                name: topWinner.providerName,
                totalScore: topWinner.totalScore,
                matchPercentage: topWinner.matchPercentage
            } : null,
            ranking: rankedProviders,
            disclaimer: "These are CLOUDEx decision-support scores based on your selected priorities and CLOUDEx evaluation data. They are not official provider ratings."
        },
        whyWinnerWon,
        mode,
        generatedAt: new Date().toISOString()
    };
}

module.exports = {
    generatePersonalizedRecommendation,
    buildPersonalizedWhyRecommended,
    extractStrongestMatches,
    extractWeakerMatches,
    compareRecommendations,
    buildDecisionPipelineExplainability
};
