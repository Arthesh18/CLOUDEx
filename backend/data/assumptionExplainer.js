/**
 * CLOUDEx - Explainable AI Assumptions
 * Feature #20: Makes all assumptions, inferences, and user-provided signals completely transparent.
 *
 * Distinguishes:
 * 1. User Provided (what the user explicitly stated)
 * 2. Inferred (what CLOUDEx deduced from context)
 * 3. Assumed (what CLOUDEx assumed because data was missing or uncertain)
 */

const ASSUMPTION_REASONS = {
    traffic: {
        beginner: "Traffic volume was not specified, so CLOUDEx used a conservative small-scale assumption to avoid overestimating infrastructure needs.",
        intermediate: "Traffic throughput was unstated; conservative baseline assumption applied to prevent over-provisioning compute and bandwidth.",
        expert: "Request rate / ingress traffic unspecified; lower-bound stochastic assumption applied to prevent over-allocation in the capacity frontier."
    },
    budget: {
        beginner: "Budget sensitivity was not specified, so CLOUDEx used a moderate/default preference rather than assuming either a very low or unlimited budget.",
        intermediate: "FinOps budget limits were not provided; default median cost tier applied to avoid skewing selection toward extreme price points.",
        expert: "Unspecified expenditure boundary; median cost-utility function assigned to maintain balanced scalarization."
    },
    ai_gpu: {
        beginner: "No AI/GPU workload was mentioned, so AI/GPU priority was kept low rather than assumed to be important.",
        intermediate: "No accelerator requirements were detected; GPU weighting minimized to prevent recommending specialized AI clusters unnecessarily.",
        expert: "No tensor/CUDA compute requirements declared; accelerator criterion zero-weighted to prevent Pareto bias toward specialized GPU clouds."
    },
    simplicity: {
        beginner: "Setup preference was not specified, so CLOUDEx assumed a simple, user-friendly setup is best to save you time.",
        intermediate: "DevOps operational preference unstated; assumed standard managed PaaS abstraction to prioritize developer velocity.",
        expert: "Infrastructure abstraction tier unstated; assumed mid-tier managed control plane over manual bare-metal orchestration."
    },
    database: {
        beginner: "Database architecture was not detailed, so CLOUDEx assumed a standard lightweight managed database without complex multi-server clustering.",
        intermediate: "Persistence topology unstated; standard managed relational or document store assumed.",
        expert: "Storage topology unstated; single-instance managed persistence assumed without multi-region sharding or distributed consensus."
    },
    uncertainty: {
        beginner: "You indicated uncertainty, so CLOUDEx chose safe, cost-conscious defaults to keep things simple and budget-friendly.",
        intermediate: "Uncertainty signaled; fallback heuristic applied favoring predictable pricing and managed convenience.",
        expert: "Stochastic input ambiguity; minimax risk-averse default policy activated across criteria weights."
    }
};

const CRITERIA_IMPACT_MAP = {
    traffic: {
        impact: "medium",
        affectedCriteria: ["performance", "cost"],
        criterionLabel: "Speed & Performance and Cost",
        description: "Assumed low traffic affects expected scalability and compute headroom."
    },
    budget: {
        impact: "high",
        affectedCriteria: ["cost"],
        criterionLabel: "Cost & Budget Fit",
        description: "Assumed budget sensitivity directly influences how heavily price is weighted in selection."
    },
    ai_gpu: {
        impact: "medium",
        affectedCriteria: ["aiGpu"],
        criterionLabel: "AI & GPU Compute",
        description: "Assumed lack of dedicated GPU keeps accelerator clouds from artificially displacing general-purpose clouds."
    },
    simplicity: {
        impact: "medium",
        affectedCriteria: ["simplicity"],
        criterionLabel: "Ease of Setup & Simplicity",
        description: "Assumed preference for simplicity favors managed PaaS over bare-metal or complex enterprise consoles."
    },
    database: {
        impact: "low",
        affectedCriteria: ["features", "cost"],
        criterionLabel: "Features & Cost",
        description: "Assumed standard database prevents over-budgeting for distributed multi-region database clusters."
    },
    uncertainty: {
        impact: "high",
        affectedCriteria: ["cost", "simplicity", "performance"],
        criterionLabel: "Cost, Simplicity, and Speed",
        description: "Safe default assumptions steer the recommendation toward predictable, user-friendly clouds."
    }
};

/**
 * Explain and categorize requirements into User Provided, Inferred, and Assumed.
 *
 * @param {Object} options
 * @param {Object} [options.requirements={}] - Extracted requirements or requirementSignals
 * @param {Object} [options.preferences={}] - 7-dimension preference map
 * @param {Object} [options.recommendation={}] - Optional recommendation object
 * @param {string} [options.mode="beginner"] - "beginner" | "intermediate" | "expert"
 * @returns {Object} Structured assumptions report
 */
function explainAssumptions(options = {}) {
    const {
        requirements = {},
        preferences = {},
        recommendation = null,
        mode = "beginner"
    } = options;

    const activeMode = ["beginner", "intermediate", "expert"].includes(mode) ? mode : "beginner";

    const userProvided = [];
    const inferred = [];
    const assumed = [];

    // 1. EVALUATE USER PROVIDED
    if (requirements.projectPurpose) {
        userProvided.push({
            id: "user_project_purpose",
            category: "purpose",
            description: "Project context provided by you",
            value: requirements.projectPurpose,
            source: "user",
            reason: "Explicitly specified in your conversation.",
            confidence: 0.95,
            impact: "high",
            changeable: false
        });
    }

    if (requirements.workloadType) {
        userProvided.push({
            id: "user_workload_type",
            category: "workload",
            description: "Application workload type",
            value: requirements.workloadType,
            source: "user",
            reason: "Explicitly specified in your conversation.",
            confidence: 0.95,
            impact: "high",
            changeable: false
        });
    }

    if (requirements.traffic) {
        userProvided.push({
            id: "user_traffic",
            category: "traffic",
            description: "Visitor traffic volume",
            value: requirements.traffic,
            source: "user",
            reason: "Explicitly mentioned user traffic figures.",
            confidence: 0.90,
            impact: "high",
            changeable: false
        });
    }

    if (requirements.budgetSensitivity && !requirements.budgetSensitivity.includes("Assumed") && !requirements.budgetSensitivity.includes("Student / Academic Context")) {
        userProvided.push({
            id: "user_budget",
            category: "budget",
            description: "Budget expectation",
            value: requirements.budgetSensitivity,
            source: "user",
            reason: "Explicitly stated budget requirements or constraints.",
            confidence: 0.92,
            impact: "high",
            changeable: false
        });
    }

    if (requirements.simplicityPreference && !requirements.simplicityPreference.includes("Assumed")) {
        userProvided.push({
            id: "user_simplicity",
            category: "simplicity",
            description: "DevOps & setup preference",
            value: requirements.simplicityPreference,
            source: "user",
            reason: "Explicitly requested simple or developer-friendly management.",
            confidence: 0.90,
            impact: "medium",
            changeable: false
        });
    }

    if (requirements.aiGpuNeeds && requirements.aiGpuNeeds !== "None") {
        userProvided.push({
            id: "user_ai_gpu",
            category: "ai_gpu",
            description: "AI & GPU acceleration requirement",
            value: requirements.aiGpuNeeds,
            source: "user",
            reason: "Explicitly requested GPU hardware or AI capabilities.",
            confidence: 0.95,
            impact: "high",
            changeable: false
        });
    }

    if (requirements.geographicNeeds) {
        userProvided.push({
            id: "user_geography",
            category: "geography",
            description: "Target deployment region",
            value: requirements.geographicNeeds,
            source: "user",
            reason: "Explicitly mentioned geographic audience.",
            confidence: 0.90,
            impact: "medium",
            changeable: false
        });
    }

    if (requirements.complianceNeeds) {
        userProvided.push({
            id: "user_compliance",
            category: "compliance",
            description: "Regulatory or compliance requirements",
            value: requirements.complianceNeeds,
            source: "user",
            reason: "Explicitly noted regulatory standards (e.g. GDPR, HIPAA).",
            confidence: 0.95,
            impact: "high",
            changeable: false
        });
    }


    // 2. EVALUATE INFERRED
    if (requirements.projectPurpose === "College / Academic Project") {
        inferred.push({
            id: "inferred_academic_ergonomics",
            category: "simplicity",
            description: "Academic-friendly ergonomics",
            value: "Zero-DevOps / Low Management Overhead",
            source: "inferred",
            reason: "Inferred that students prioritize coding over multi-VPC cloud configuration.",
            confidence: 0.85,
            impact: "medium",
            changeable: true,
            changeAction: "Adjust setup simplicity preference via sliders or chat."
        });
    }

    if (requirements.workloadType === "AI / Machine Learning Application" && !requirements.aiGpuNeeds) {
        inferred.push({
            id: "inferred_ai_workload_compute",
            category: "ai_gpu",
            description: "AI workload compute demands",
            value: "High compute throughput required",
            source: "inferred",
            reason: "Inferred from machine learning workload description that accelerated compute will be beneficial.",
            confidence: 0.80,
            impact: "high",
            changeable: true,
            changeAction: "Specify whether your model needs dedicated GPUs or external APIs."
        });
    }

    if (requirements.expectedScale && !requirements.traffic) {
        inferred.push({
            id: "inferred_scale_tier",
            category: "traffic",
            description: "Traffic scale band",
            value: requirements.expectedScale,
            source: "inferred",
            reason: `Inferred traffic scale band '${requirements.expectedScale}' from conversational context.`,
            confidence: 0.82,
            impact: "medium",
            changeable: true,
            changeAction: "Tell CLOUDEx your exact expected visitor count."
        });
    }

    if (requirements.databaseNeeds === "Yes (Managed or Integrated Database)") {
        inferred.push({
            id: "inferred_managed_db",
            category: "database",
            description: "Managed database tier",
            value: "Standard managed relational or NoSQL database",
            source: "inferred",
            reason: "Inferred that integrated managed databases prevent manual database server administration.",
            confidence: 0.85,
            impact: "low",
            changeable: true,
            changeAction: "Clarify if you require self-hosted database servers or multi-region replication."
        });
    }


    // 3. EVALUATE ASSUMPTIONS (Information was missing or uncertain)

    // A. Missing Traffic / Scale
    if (!requirements.traffic && !requirements.expectedScale) {
        const trReason = (ASSUMPTION_REASONS.traffic && ASSUMPTION_REASONS.traffic[activeMode]) || ASSUMPTION_REASONS.traffic.beginner;
        const trMeta = CRITERIA_IMPACT_MAP.traffic;
        assumed.push({
            id: "assumed_traffic_scale",
            category: "traffic",
            description: "Traffic volume assumed to be modest",
            value: "Small initial traffic (~100s of monthly visitors)",
            source: "assumed",
            reason: trReason,
            confidence: 0.65,
            impact: trMeta.impact,
            affectedCriteria: trMeta.affectedCriteria,
            criterionLabel: trMeta.criterionLabel,
            impactExplanation: `Assumed low traffic keeps compute and bandwidth requirements at a conservative baseline, influencing ${trMeta.criterionLabel}.`,
            changeable: true,
            changeAction: "Tell CLOUDEx your expected traffic",
            promptTemplate: "My expected traffic is about 10,000 visitors per month"
        });
    }

    // B. Missing Budget
    const isBudgetMissing = !requirements.budgetSensitivity ||
        requirements.budgetSensitivity.includes("Assumed") ||
        requirements.budgetSensitivity.includes("Student / Academic Context");

    if (isBudgetMissing && (!requirements.uncertaintySignal || requirements.uncertaintySignal.type !== "unknown")) {
        const bgReason = (ASSUMPTION_REASONS.budget && ASSUMPTION_REASONS.budget[activeMode]) || ASSUMPTION_REASONS.budget.beginner;
        const bgMeta = CRITERIA_IMPACT_MAP.budget;
        assumed.push({
            id: "assumed_budget_sensitivity",
            category: "budget",
            description: "Budget preference assumed to be cost-conscious",
            value: requirements.projectPurpose === "College / Academic Project"
                ? "High budget sensitivity (sub-$10/mo target)"
                : "Moderate / balanced budget sensitivity",
            source: "assumed",
            reason: bgReason,
            confidence: 0.70,
            impact: bgMeta.impact,
            affectedCriteria: bgMeta.affectedCriteria,
            criterionLabel: bgMeta.criterionLabel,
            impactExplanation: `Assumed budget sensitivity directly affects how heavily affordable pricing is weighted against enterprise features in ${bgMeta.criterionLabel}.`,
            changeable: true,
            changeAction: "Change budget preference",
            promptTemplate: "My budget is about $50 per month"
        });
    }

    // C. Unknown AI / GPU
    if (!requirements.aiGpuNeeds && requirements.workloadType !== "AI / Machine Learning Application") {
        const aiReason = (ASSUMPTION_REASONS.ai_gpu && ASSUMPTION_REASONS.ai_gpu[activeMode]) || ASSUMPTION_REASONS.ai_gpu.beginner;
        const aiMeta = CRITERIA_IMPACT_MAP.ai_gpu;
        assumed.push({
            id: "assumed_no_gpu",
            category: "ai_gpu",
            description: "No dedicated GPU hardware needed",
            value: "Standard CPU instances (No GPUs)",
            source: "assumed",
            reason: aiReason,
            confidence: 0.85,
            impact: aiMeta.impact,
            affectedCriteria: aiMeta.affectedCriteria,
            criterionLabel: aiMeta.criterionLabel,
            impactExplanation: `Assumed absence of GPU requirements prevents specialized GPU providers from artificially displacing general web hosts in ${aiMeta.criterionLabel}.`,
            changeable: true,
            changeAction: "Tell CLOUDEx whether you need GPUs",
            promptTemplate: "I need dedicated NVIDIA GPUs for machine learning"
        });
    }

    // D. Uncertainty Signal from User ("I don't know")
    if (requirements.uncertaintySignal) {
        const unReason = (ASSUMPTION_REASONS.uncertainty && ASSUMPTION_REASONS.uncertainty[activeMode]) || ASSUMPTION_REASONS.uncertainty.beginner;
        const unMeta = CRITERIA_IMPACT_MAP.uncertainty;
        assumed.push({
            id: "assumed_uncertainty_handling",
            category: "uncertainty",
            description: "Safe conservative defaults applied for unstated requirements",
            value: "Beginner-friendly defaults with cost protection",
            source: "assumed",
            reason: unReason,
            confidence: 0.60,
            impact: unMeta.impact,
            affectedCriteria: unMeta.affectedCriteria,
            criterionLabel: unMeta.criterionLabel,
            impactExplanation: `Defaults protect you from surprise bills and complex setup until requirements become clearer, influencing ${unMeta.criterionLabel}.`,
            changeable: true,
            changeAction: "Clarify any requirements as your project evolves",
            promptTemplate: "Here are more details about my project:"
        });
    }

    // E. Preserve and enrich existing raw string assumptions from requirementTranslator
    if (Array.isArray(requirements.assumptions)) {
        requirements.assumptions.forEach((rawAssumption, index) => {
            if (typeof rawAssumption === "string") {
                const lowerAssump = rawAssumption.toLowerCase();
                // Check if already captured above
                const isTraffic = lowerAssump.includes("traffic") || lowerAssump.includes("visitors") || lowerAssump.includes("scale");
                const isBudget = lowerAssump.includes("budget") || lowerAssump.includes("cost");
                const isGpu = lowerAssump.includes("gpu");
                const isUncertainty = lowerAssump.includes("uncertainty");

                const alreadyCovered = (isTraffic && assumed.some(a => a.category === "traffic")) ||
                    (isBudget && assumed.some(a => a.category === "budget")) ||
                    (isGpu && assumed.some(a => a.category === "ai_gpu")) ||
                    (isUncertainty && assumed.some(a => a.category === "uncertainty"));

                if (!alreadyCovered) {
                    let category = "infrastructure";
                    let criteria = ["simplicity", "features"];
                    let impact = "low";

                    if (lowerAssump.includes("database")) {
                        category = "database";
                        criteria = ["features", "cost"];
                    } else if (lowerAssump.includes("intuitive") || lowerAssump.includes("simplicity") || lowerAssump.includes("setup")) {
                        category = "simplicity";
                        criteria = ["simplicity"];
                        impact = "medium";
                    }

                    assumed.push({
                        id: `assumed_custom_${index + 1}`,
                        category,
                        description: rawAssumption,
                        value: "Safe architectural assumption",
                        source: "assumed",
                        reason: activeMode === "expert"
                            ? `Applied risk-averse default parameterization: ${rawAssumption}`
                            : (activeMode === "intermediate"
                                ? `Assumed standard configuration baseline: ${rawAssumption}`
                                : `CLOUDEx applied a gentle default assumption: ${rawAssumption}`),
                        confidence: 0.75,
                        impact,
                        affectedCriteria: criteria,
                        criterionLabel: criteria.join(", "),
                        impactExplanation: `This assumption influences ${criteria.join(" & ")} by establishing a clear baseline without requiring technical configuration.`,
                        changeable: true,
                        changeAction: "Change this assumption",
                        promptTemplate: "I would like to specify a different setup for this"
                    });
                }
            }
        });
    }

    const hasAssumptions = assumed.length > 0;

    return {
        success: true,
        mode: activeMode,
        hasAssumptions,
        counts: {
            userProvided: userProvided.length,
            inferred: inferred.length,
            assumed: assumed.length,
            total: userProvided.length + inferred.length + assumed.length
        },
        userProvided,
        inferred,
        assumed,
        summaryText: hasAssumptions
            ? `CLOUDEx made ${assumed.length} safe assumption${assumed.length > 1 ? "s" : ""} to provide a clear recommendation without getting you stuck.`
            : "CloudEx did not need to make major assumptions.",
        disclaimer: "Assumptions are transparent heuristics applied when details are unstated. You can adjust or override any assumption at any time."
    };
}

module.exports = {
    ASSUMPTION_REASONS,
    CRITERIA_IMPACT_MAP,
    explainAssumptions
};
