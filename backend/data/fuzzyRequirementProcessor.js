/**
 * CLOUDEx - Fuzzy-Based Requirement Processing Engine
 * Feature #14: Converts requirements & preferences into structured fuzzy decision inputs.
 *
 * Produces standardized inputs for MCDM selection (Feature #15) and explanations.
 */

const { DIMENSION_METADATA } = require("./fuzzyPreferences");

const LINGUISTIC_BOUNDARIES = [
    { max: 0.20, label: "Very Low" },
    { max: 0.40, label: "Low" },
    { max: 0.60, label: "Medium" },
    { max: 0.80, label: "High" },
    { max: 1.00, label: "Very High" }
];

function toLinguisticLevel(val) {
    const num = typeof val === "number" && !isNaN(val) ? Math.max(0, Math.min(1, val)) : 0.5;
    for (const b of LINGUISTIC_BOUNDARIES) {
        if (num <= b.max) {
            return b.label;
        }
    }
    return "Medium";
}

const DIMENSION_DESCRIPTIONS = {
    cost: {
        "Very High": "Very High priority on keeping costs minimal and avoiding billing surprises",
        "High": "High priority on budget predictability and affordable pricing",
        "Medium": "Moderate balance between cost and infrastructure capabilities",
        "Low": "Flexible budget; willing to pay for advanced infrastructure",
        "Very Low": "Budget is not a primary concern; enterprise scale prioritized"
    },
    simplicity: {
        "Very High": "Very High priority on zero-DevOps and turnkey automated hosting",
        "High": "High priority on straightforward deployment and developer ergonomics",
        "Medium": "Balanced developer control with managed convenience",
        "Low": "Willing to configure VPS instances and manage server setup",
        "Very Low": "Full infrastructure-as-code and custom orchestration preferred"
    },
    performance: {
        "Very High": "Very High priority on dedicated compute throughput and lowest latency",
        "High": "High priority on fast response times and compute headroom",
        "Medium": "Standard compute and web throughput suitable for typical workloads",
        "Low": "Basic compute performance is sufficient",
        "Very Low": "Minimal compute resources required"
    },
    reliability: {
        "Very High": "Very High priority on mission-critical uptime (99.99%+ SLA) and multi-region failover",
        "High": "High priority on fault tolerance and automated health monitoring",
        "Medium": "Standard production durability and reliable single-zone operations",
        "Low": "Acceptable for non-critical experiments or staging environments",
        "Very Low": "No stringent availability requirements"
    },
    features: {
        "Very High": "Very High priority on vast proprietary service ecosystems and tooling depth",
        "High": "High priority on broad catalog of specialized cloud services",
        "Medium": "Standard suite of foundational cloud building blocks",
        "Low": "Core compute, storage, and networking only",
        "Very Low": "Minimal feature set needed"
    },
    support: {
        "Very High": "Very High priority on 24/7 dedicated enterprise SLAs and direct engineer access",
        "High": "High priority on prompt business-hours ticketing support",
        "Medium": "Standard technical support and documentation access",
        "Low": "Community forums and documentation are sufficient",
        "Very Low": "Self-service developer operations"
    },
    aiGpu: {
        "Very High": "Very High priority on dedicated high-end GPU hardware acceleration",
        "High": "High priority on GPU inference or fractional compute access",
        "Medium": "Standard CPU compute with external AI API integration",
        "Low": "General compute; no specialized GPU hardware required",
        "Very Low": "No AI or GPU workload involved"
    }
};

/**
 * Process raw requirements and preferences into a structured fuzzy decision input.
 *
 * @param {Object} options
 * @param {Object} options.requirements - Output from extractCloudRequirements
 * @param {Object} options.preferences - 7-dimension preference values (0.0 - 1.0)
 * @param {string} [options.source="ai_generated"] - "ai_generated" | "user_updated"
 * @param {string} [options.mode="beginner"] - "beginner" | "intermediate" | "expert"
 * @returns {Object} Structured fuzzy requirement processing output
 */
function processFuzzyRequirements(options = {}) {
    const {
        requirements = {},
        preferences = {},
        source = "ai_generated",
        mode = "beginner"
    } = options;

    const sanitizedSource = source === "user_updated" ? "user_updated" : "ai_generated";
    const sanitizedMode = ["beginner", "intermediate", "expert"].includes(mode) ? mode : "beginner";

    const dimensions = ["cost", "simplicity", "performance", "reliability", "features", "support", "aiGpu"];
    const normalizedPrefs = {};
    const fuzzyInterpretation = {};
    const perDimensionConfidence = {};

    const hasUncertainty = Boolean(requirements.uncertaintySignal);
    const assumptionCount = Array.isArray(requirements.assumptions) ? requirements.assumptions.length : 0;

    dimensions.forEach((dim) => {
        const raw = typeof preferences[dim] === "number" && !isNaN(preferences[dim])
            ? preferences[dim]
            : 0.50;
        const clamped = Math.max(0, Math.min(1, Math.round(raw * 100) / 100));
        normalizedPrefs[dim] = clamped;

        const linguisticLevel = toLinguisticLevel(clamped);
        const detailedDesc = (DIMENSION_DESCRIPTIONS[dim] && DIMENSION_DESCRIPTIONS[dim][linguisticLevel])
            || `${linguisticLevel} priority`;

        fuzzyInterpretation[dim] = {
            value: clamped,
            percentage: Math.round(clamped * 100),
            linguisticLevel,
            description: detailedDesc,
            dimensionLabel: (DIMENSION_METADATA[dim] && DIMENSION_METADATA[dim].label) || dim
        };

        // Per-dimension confidence calculation
        if (sanitizedSource === "user_updated") {
            // User explicitly calibrated this dimension via slider
            perDimensionConfidence[dim] = 0.95;
        } else {
            let dimConf = 0.70;

            if (dim === "cost") {
                if (requirements.budgetSensitivity && !requirements.budgetSensitivity.includes("Assumed")) {
                    dimConf = 0.88;
                } else if (hasUncertainty) {
                    dimConf = 0.50;
                } else if (requirements.projectPurpose === "College / Academic Project") {
                    dimConf = 0.78;
                }
            } else if (dim === "simplicity") {
                if (requirements.simplicityPreference && !requirements.simplicityPreference.includes("Assumed")) {
                    dimConf = 0.88;
                } else if (hasUncertainty) {
                    dimConf = 0.52;
                }
            } else if (dim === "performance") {
                if (requirements.expectedScale || requirements.workloadType === "Real-Time / Media / Gaming") {
                    dimConf = 0.85;
                } else if (hasUncertainty) {
                    dimConf = 0.50;
                }
            } else if (dim === "reliability") {
                if (requirements.projectPurpose === "Production / Enterprise" || requirements.complianceNeeds) {
                    dimConf = 0.90;
                } else {
                    dimConf = 0.65;
                }
            } else if (dim === "features") {
                if (requirements.workloadType) {
                    dimConf = 0.75;
                } else {
                    dimConf = 0.60;
                }
            } else if (dim === "support") {
                if (requirements.projectPurpose === "Production / Enterprise") {
                    dimConf = 0.85;
                } else {
                    dimConf = 0.60;
                }
            } else if (dim === "aiGpu") {
                if (requirements.aiGpuNeeds && requirements.aiGpuNeeds !== "None") {
                    dimConf = 0.92;
                } else if (requirements.workloadType === "AI / Machine Learning Application") {
                    dimConf = 0.88;
                } else {
                    dimConf = 0.80; // High confidence that AI is NOT needed if not mentioned
                }
            }

            perDimensionConfidence[dim] = Math.round(dimConf * 100) / 100;
        }
    });

    // Overall confidence calculation
    let overallConfidenceNum = 0.72;

    if (sanitizedSource === "user_updated") {
        overallConfidenceNum = 0.92;
    } else {
        if (requirements.workloadType) overallConfidenceNum += 0.08;
        if (requirements.budgetSensitivity) overallConfidenceNum += 0.06;
        if (requirements.projectPurpose) overallConfidenceNum += 0.05;

        if (hasUncertainty) {
            overallConfidenceNum -= 0.18;
        }
        if (assumptionCount > 0) {
            overallConfidenceNum -= Math.min(0.15, assumptionCount * 0.04);
        }
    }

    const overallConfidence = Math.max(0.35, Math.min(0.98, Math.round(overallConfidenceNum * 100) / 100));
    let confidenceLevel = "Medium";
    if (overallConfidence >= 0.80) {
        confidenceLevel = "High";
    } else if (overallConfidence < 0.60) {
        confidenceLevel = "Low";
    }

    return {
        success: true,
        source: sanitizedSource,
        mode: sanitizedMode,
        preferences: normalizedPrefs,
        fuzzyInterpretation,
        requirementSignals: {
            workloadType: requirements.workloadType || null,
            projectPurpose: requirements.projectPurpose || null,
            expectedScale: requirements.expectedScale || null,
            traffic: requirements.traffic || null,
            budgetSensitivity: requirements.budgetSensitivity || null,
            simplicityPreference: requirements.simplicityPreference || null,
            databaseNeeds: requirements.databaseNeeds || null,
            aiGpuNeeds: requirements.aiGpuNeeds || null,
            geographicNeeds: requirements.geographicNeeds || null,
            complianceNeeds: requirements.complianceNeeds || null,
            assumptions: Array.isArray(requirements.assumptions) ? [...requirements.assumptions] : [],
            uncertaintySignal: requirements.uncertaintySignal || null
        },
        confidence: {
            overall: overallConfidence,
            percentage: Math.round(overallConfidence * 100),
            level: confidenceLevel,
            label: `Internal decision-support confidence: ${confidenceLevel} (${Math.round(overallConfidence * 100)}%)`,
            perDimension: perDimensionConfidence,
            basis: sanitizedSource === "user_updated"
                ? "Calibrated directly by user preference adjustments"
                : (hasUncertainty
                    ? "Inferred with safe default assumptions due to user uncertainty"
                    : "Inferred from explicit requirements and project context")
        },
        processedAt: new Date().toISOString()
    };
}

module.exports = {
    LINGUISTIC_BOUNDARIES,
    toLinguisticLevel,
    DIMENSION_DESCRIPTIONS,
    processFuzzyRequirements
};
