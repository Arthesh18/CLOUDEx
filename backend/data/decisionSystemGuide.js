/**
 * CLOUDEx - Understanding CLOUDEx's Decision System Guide
 * Feature #19: Beginner-friendly educational guide explaining how CLOUDEx makes decisions in general.
 */

const DECISION_GUIDE_SECTIONS = [
    {
        id: "what_cloudex_does",
        number: 1,
        title: "What CLOUDEx Does",
        icon: "fa-compass",
        content: {
            beginner: "CLOUDEx is a cloud decision-support companion that helps you find the right cloud provider for your project without needing years of cloud engineering experience. It translates your real-world application needs into clear, objective cloud recommendations.",
            intermediate: "CLOUDEx is an intelligent cloud architecture decision-support engine that analyzes multi-dimensional workload constraints and matches them against calibrated CSP profiles across 15 cloud providers.",
            expert: "CLOUDEx is a deterministic multi-criteria decision analysis (MCDA) framework designed to optimize workload-to-infrastructure matching across hyperscale, enterprise, and specialized alternative cloud providers."
        }
    },
    {
        id: "how_understands_requirements",
        number: 2,
        title: "How CLOUDEx Understands Your Requirements",
        icon: "fa-brain",
        example: "You say: 'I am a student building a small website and I want to spend as little as possible.'",
        content: {
            beginner: "When you describe your project in plain language, CLOUDEx reads between the lines. In our student example, it infers that low cost is Very High priority, setup simplicity is High, and heavy compute power is Medium. CLOUDEx categorizes details into 3 transparent levels: 1) User Facts (what you explicitly tell us), 2) Inferred Context (logical deductions based on your project type), and 3) Assumed Safe Defaults (when you say 'I don't know', we adopt safe, conservative baselines like sub-500 user scale so you never get stuck).",
            intermediate: "The requirement translator extracts workload characteristics (traffic profile, persistence needs, deployment ergonomics) and maps conversational expressions into quantitative dimensional requirements while identifying unstated assumptions across user facts, inferred context, and safe defaults.",
            expert: "Conversational input undergoes natural language and rule-based feature extraction, producing normalized requirement signals across compute, memory, latency, FinOps, and SLA constraints with explicit uncertainty tracking and assumption stratification."
        }
    },
    {
        id: "what_fuzzy_preferences_mean",
        number: 3,
        title: "What Fuzzy Preferences Mean (User Priority ≠ Provider Score)",
        icon: "fa-sliders",
        content: {
            beginner: "A 'fuzzy preference' is not uncertainty about a cloud provider; it represents how important something is to you on a continuous scale from 0% to 100%. CRITICAL DISTINCTION: User Priority is NOT Provider Score. User Priority is how much YOU care about a dimension (e.g. 90% Cost). Provider Score is how well a cloud actually performs on that dimension. Setting your cost slider to 90% doesn't make a cloud cheaper; it tells the mathematical formula that cost should carry 90% of the weight when evaluating clouds for your project.",
            intermediate: "Fuzzy preferences quantify priority degrees along continuous evaluation intervals [0.0, 1.0], transforming qualitative requirements into mathematically operational priority weights. User Priority (W_d) governs weighting, distinct from intrinsic Provider Capability Scores (S_P,d).",
            expert: "Fuzzy priority values parameterize continuous utility membership functions, mapping subjective user criteria into normalized dimensional weights for multi-criteria synthesis, maintaining strict mathematical orthogonality between user utility vector W and candidate attribute matrix S."
        }
    },
    {
        id: "what_sliders_do",
        number: 4,
        title: "What the Priority Sliders Do",
        icon: "fa-sliders-simple",
        content: {
            beginner: "The priority sliders put you in full control. If CLOUDEx thought speed was 50% important to you, but speed is actually crucial, you can slide it up to 90% and click 'Make These Changes & Recalculate' to update your recommendation.",
            intermediate: "Priority sliders calibrate the multi-dimensional weight vector W. Recalculating dynamically reapplies your custom weights across the scoring matrix without losing your original baseline.",
            expert: "Sliders allow interactive FinOps and architectural sensitivity analysis by perturbing the criteria weighting vector W in [0,1]^7 and recalculating utility frontiers."
        }
    },
    {
        id: "what_tradeoffs_mean",
        number: 5,
        title: "What Trade-Offs Mean",
        icon: "fa-scale-balanced",
        content: {
            beginner: "In cloud computing, you cannot have everything at once. Wanting the fastest servers with dedicated AI graphics cards while spending almost zero dollars is a natural conflict. CLOUDEx detects these competing goals and helps you understand where compromises occur.",
            intermediate: "Trade-offs represent Pareto frontier tensions between competing architectural dimensions—such as FinOps cost constraints vs. Provisioned IOPS or turnkey PaaS ergonomics vs. deep VPC topology control.",
            expert: "Conflict detection analyzes multi-objective Pareto optimality, highlighting opposing gradient vectors in the decision space (e.g., bare-metal throughput vs. managed serverless abstraction)."
        }
    },
    {
        id: "what_mcdm_means",
        number: 6,
        title: "What MCDM Means (The Laptop Analogy)",
        icon: "fa-calculator",
        formula: "Score = Σ(User Preference × Provider Fit)",
        analogy: "Imagine buying a laptop. You care 90% about battery life and 20% about gaming. The best laptop for you isn't the one with the biggest GPU; it's the one that matches what YOU care about most. That's MCDM. Instead of ranking clouds purely by price or size, CLOUDEx calculates a personalized balance across Cost, Simplicity, Speed, Reliability, Tools, Support, and AI/GPU.",
        content: {
            beginner: "MCDM stands for Multi-Criteria Decision Making. Imagine buying a laptop: you care 90% about battery life and 20% about gaming. The best laptop for you isn't the one with the biggest GPU; it's the one that matches what YOU care about most. That's MCDM. CLOUDEx doesn't just rank clouds by price; it balances cost, simplicity, speed, and reliability all together. If cost matters twice as much to you as speed, the cost score carries twice as much weight in the final result.",
            intermediate: "Weighted MCDM calculates utility scores using normalized scalar weighting: Score(P) = Σ (W_d × S_P,d), ensuring deterministic, mathematically traceable provider comparisons analogous to multi-factor consumer selection.",
            expert: "The Weighted Linear Combination (WLC) MCDM formulation synthesizes normalized criterion scores S_P,d with user utility weights W_d via Utility(P) = Σ (W_d × S_P,d), satisfying monotonicity and additive independence."
        }
    },
    {
        id: "how_csps_evaluated",
        number: 7,
        title: "How CSPs are Evaluated",
        icon: "fa-network-wired",
        content: {
            beginner: "All 15 cloud providers are evaluated across 7 core areas: Cost, Simplicity, Speed, Reliability, Tools, Support, and AI/GPU. Value clouds (like DigitalOcean or Hetzner) score high on cost and simplicity; hyperscalers (like AWS or Google Cloud) score high on ecosystem breadth and enterprise scale.",
            intermediate: "Provider profiles are benchmarked across 7 structural dimensions calibrated from pricing models, SLA commitments, global network footprint, and developer ergonomics.",
            expert: "The decision matrix houses calibrated dimensional fit coefficients across 15 CSPs, parameterizing infrastructure tiers from unmetered bare-metal to hyperscaler multi-region fabrics."
        }
    },
    {
        id: "how_final_recommendation_produced",
        number: 8,
        title: "How the Final Recommendation is Produced",
        icon: "fa-award",
        content: {
            beginner: "The provider that scores highest after applying all your priority weights becomes your recommendation. CLOUDEx explains in plain language why it won, highlights its strongest matches, and points out any trade-offs.",
            intermediate: "The candidate with maximum multi-attribute utility is selected, supplemented with runner-up comparative margins, criteria contribution analysis, and trade-off advisories.",
            expert: "The Pareto-optimal provider maximizing the scalar objective function is synthesized with margin-of-victory deltas, trade-off annotations, and criteria sensitivity vectors."
        }
    },
    {
        id: "what_score_means",
        number: 9,
        title: "What the Recommendation Score Means",
        icon: "fa-percent",
        content: {
            beginner: "An 82% Fit Score means the provider matched 82% of what matters to your project based on your chosen priorities. It does NOT mean the cloud is 82% cheaper, has an 82% chance of working, or is an official 82/100 rating by the cloud company.",
            intermediate: "The score reflects mathematical alignment with your specific weighting criteria on a normalized [0, 100%] scale. It is an internal decision-support metric, not an absolute benchmark or vendor rating.",
            expert: "Match percentage represents normalized utility relative to your subjective weight profile; it is an internal decision-support metric, not an absolute benchmark, pricing index, or SLA guarantee."
        }
    },
    {
        id: "what_confidence_means",
        number: 10,
        title: "What Recommendation Confidence Means",
        icon: "fa-shield-halved",
        content: {
            beginner: "Recommendation Confidence indicates how clearly your project needs point to a specific provider. If you gave clear answers and one provider clearly led, confidence is High. If you answered 'I don't know' or two clouds scored almost identically, confidence is Medium or Low. It is NOT a probability or real-world guarantee.",
            intermediate: "Confidence reflects input signal completeness and candidate utility separation margins. It indicates decision-support certainty, not operational reliability.",
            expert: "The confidence metric measures information completeness and objective function separation (ΔU = U_1 - U_2), quantifying decision robustness rather than stochastic system availability."
        }
    },
    {
        id: "what_cloudex_does_not_claim",
        number: 11,
        title: "What CLOUDEx Does NOT Claim (Disclaimer)",
        icon: "fa-triangle-exclamation",
        content: {
            beginner: "CLOUDEx is an educational decision-support project. Provider evaluation values are curated decision-support data maintained by the project, NOT official real-time benchmark measurements or vendor endorsements. Always review official cloud provider pricing and documentation before purchasing.",
            intermediate: "All evaluation parameters represent project-maintained decision-support models. CLOUDEx makes no claims of real-time pricing parity, dynamic network latency benchmarks, or commercial vendor partnerships.",
            expert: "CLOUDEx evaluation coefficients are static decision-theoretic models for comparative architectural analysis. They do not constitute official vendor telemetry, dynamic FinOps metering, or contractual SLA warranties."
        }
    }
];

/**
 * Retrieve the decision system guide adapted for the specified experience mode.
 *
 * @param {string} [mode="beginner"] - "beginner" | "intermediate" | "expert"
 * @returns {Object} Mode-adapted guide object
 */
function getDecisionSystemGuide(mode = "beginner") {
    const activeMode = ["beginner", "intermediate", "expert"].includes(mode) ? mode : "beginner";

    const sections = DECISION_GUIDE_SECTIONS.map(s => ({
        id: s.id,
        number: s.number,
        title: s.title,
        icon: s.icon,
        example: s.example || null,
        formula: s.formula || null,
        analogy: s.analogy || null,
        text: s.content[activeMode] || s.content.beginner
    }));

    return {
        success: true,
        title: "Understanding CLOUDEx's Decision System",
        subtitle: "A transparent guide explaining how CLOUDEx interprets your requirements and generates cloud recommendations.",
        mode: activeMode,
        sectionsCount: sections.length,
        sections,
        mcdmFormula: "Score = Σ(User Preference × Provider Fit)",
        disclaimers: {
            scoreDisclaimer: "The recommendation score is an internal decision-support fit percentage, not an official provider rating, pricing discount, or success probability.",
            confidenceDisclaimer: "Recommendation confidence reflects signal clarity and candidate separation, not an operational reliability guarantee or benchmark accuracy measurement.",
            cspEvaluationDisclaimer: "Provider evaluation values used by CLOUDEx are project-maintained decision-support data and are not official provider ratings or real-time benchmark measurements unless explicitly cited."
        },
        generatedAt: new Date().toISOString()
    };
}

module.exports = {
    DECISION_GUIDE_SECTIONS,
    getDecisionSystemGuide
};
