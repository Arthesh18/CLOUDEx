/**
 * CLOUDEx - AI-Generated Initial Fuzzy Values
 * Feature #9: Priority Interpretation Engine
 *
 * Dimensions (scale 0.0 to 1.0):
 * - cost: Cost / Budget Sensitivity (higher = wants lower cost / tighter budget)
 * - simplicity: Simplicity / Ease of Setup (higher = wants managed / zero-devops / easy)
 * - performance: Performance / Compute / Latency (higher = needs high throughput / low latency)
 * - reliability: High Availability / Uptime / Durability (higher = mission critical / enterprise)
 * - features: Service Breadth / Managed Offerings (higher = needs wide ecosystem / specialized tools)
 * - support: Enterprise Support & SLAs (higher = enterprise compliance / dedicated assistance)
 * - aiGpu: AI / GPU Compute Acceleration (higher = needs dedicated GPUs / ML model training)
 */

const DIMENSION_METADATA = {
    cost: {
        id: "cost",
        label: "Cost",
        description: "Priority on keeping expenses low, avoiding surprise bills, and utilizing generous free tiers",
        beginnerLabel: "Cost & Budget",
        expertLabel: "Cost Optimization & FinOps Predictability"
    },
    simplicity: {
        id: "simplicity",
        label: "Simplicity",
        description: "Priority on developer ergonomics, automated configuration, and minimal cloud administration",
        beginnerLabel: "Simplicity & Easy Setup",
        expertLabel: "Operational Overhead & Managed Abstractions"
    },
    performance: {
        id: "performance",
        label: "Performance",
        description: "Priority on high-speed compute, fast network response times, and low latency",
        beginnerLabel: "Speed & Performance",
        expertLabel: "Throughput, IOPS & Sub-Millisecond Latency"
    },
    reliability: {
        id: "reliability",
        label: "Reliability",
        description: "Priority on uptime guarantees, fault tolerance, and data durability",
        beginnerLabel: "Reliability & Uptime",
        expertLabel: "SLA Guarantees, Multi-AZ Redundancy & HA"
    },
    features: {
        id: "features",
        label: "Features",
        description: "Priority on broad catalog of specialized cloud services and ecosystem integrations",
        beginnerLabel: "Tools & Features",
        expertLabel: "Ecosystem Breadth & Proprietary Services"
    },
    support: {
        id: "support",
        label: "Support",
        description: "Priority on technical support responsiveness, guidance, and enterprise SLAs",
        beginnerLabel: "Help & Support",
        expertLabel: "Enterprise Support Agreements & SLAs"
    },
    aiGpu: {
        id: "aiGpu",
        label: "AI/GPU",
        description: "Priority on specialized hardware acceleration for AI models and GPU training",
        beginnerLabel: "AI & Smart Tech",
        expertLabel: "Dedicated GPU Compute & Hardware Interconnects"
    }
};

function clamp(val, min = 0.0, max = 1.0) {
    const num = typeof val === "number" && !isNaN(val) ? val : 0.5;
    return Math.max(min, Math.min(max, Math.round(num * 100) / 100));
}

function generateInitialFuzzyValues(requirements = {}, message = "") {
    const lowerMsg = (typeof message === "string" ? message : "").toLowerCase();

    // Baseline neutral values
    let cost = 0.50;
    let simplicity = 0.50;
    let performance = 0.50;
    let reliability = 0.60;
    let features = 0.45;
    let support = 0.50;
    let aiGpu = 0.10; // Kept low unless specifically relevant to workload

    // 1. Cost Evaluation
    if (requirements.budgetSensitivity && requirements.budgetSensitivity.includes("High")) {
        cost = 0.85;
    } else if (requirements.budgetSensitivity && requirements.budgetSensitivity.includes("Flexible")) {
        cost = 0.20;
    } else if (requirements.budgetSensitivity && requirements.budgetSensitivity.includes("Moderate")) {
        cost = 0.55;
    }

    if (lowerMsg.match(/\b(cheap|cheapest|lowest cost|tight budget|student budget|free tier|minimum cost|very cheap|as cheap as possible|low budget)\b/i)) {
        cost = Math.max(cost, 0.90);
    }
    if (lowerMsg.match(/\b(don't care about (?:cost|price|budget)|cost is not an? (?:issue|factor)|unlimited budget|price doesn't matter|budget is not an? issue)\b/i)) {
        cost = 0.20;
    }

    // 2. Simplicity Evaluation
    if (requirements.simplicityPreference && requirements.simplicityPreference.includes("High")) {
        simplicity = 0.90;
    } else if (requirements.simplicityPreference && requirements.simplicityPreference.includes("Moderate")) {
        simplicity = 0.50;
    } else if (requirements.simplicityPreference && requirements.simplicityPreference.includes("Low")) {
        simplicity = 0.25;
    }

    if (requirements.projectPurpose === "College / Academic Project" || requirements.projectPurpose === "Personal / Hobby Project") {
        simplicity = Math.max(simplicity, 0.85);
    }
    if (lowerMsg.match(/\b(simple|simplest|easy|new to cloud|don't know anything about cloud|no devops|straightforward|keep it simple)\b/i)) {
        simplicity = Math.max(simplicity, 0.90);
    }
    if (lowerMsg.match(/\b(kubernetes|k8s|terraform|custom vpc|bare metal|full control|raw vms)\b/i)) {
        simplicity = Math.min(simplicity, 0.35);
    }

    // 3. Performance Evaluation
    if (lowerMsg.match(/\b(maximum performance|extreme performance|low latency|fastest|high throughput|sub-millisecond|gaming|video streaming)\b/i)) {
        performance = 0.90;
    } else if (requirements.expectedScale === "High / Large Scale") {
        performance = 0.80;
    } else if (requirements.workloadType === "Real-Time / Media / Gaming") {
        performance = 0.85;
    } else if (requirements.workloadType === "Static Website / Frontend" || requirements.projectPurpose === "College / Academic Project") {
        performance = 0.45;
    }

    // 4. Reliability Evaluation
    if (requirements.projectPurpose === "Production / Enterprise" || requirements.complianceNeeds) {
        reliability = 0.90;
    } else if (requirements.projectPurpose === "Startup / MVP") {
        reliability = 0.75;
    } else if (requirements.projectPurpose === "College / Academic Project" || requirements.projectPurpose === "Personal / Hobby Project") {
        reliability = 0.55;
    }

    // 5. Features / Ecosystem Evaluation
    if (requirements.workloadType === "Backend API / Microservices" || requirements.projectPurpose === "Production / Enterprise") {
        features = 0.75;
    } else if (requirements.workloadType === "Static Website / Frontend") {
        features = 0.30;
    } else {
        features = 0.45;
    }

    // 6. Support Evaluation
    if (requirements.projectPurpose === "Production / Enterprise" || requirements.complianceNeeds) {
        support = 0.85;
    } else if (requirements.projectPurpose === "Startup / MVP") {
        support = 0.60;
    } else {
        support = 0.40;
    }

    // 7. AI / GPU Evaluation
    if (requirements.workloadType === "AI / Machine Learning Application" || (requirements.aiGpuNeeds && requirements.aiGpuNeeds.includes("Dedicated GPU"))) {
        aiGpu = 0.90;
    } else if (lowerMsg.match(/\b(gpu|gpus|cuda|model training|fine-tuning|llm|pytorch|tensorflow|h100|a100|dedicated gpu)\b/i)) {
        aiGpu = 0.90;
    } else if (requirements.aiGpuNeeds && requirements.aiGpuNeeds.includes("API Integration")) {
        aiGpu = 0.35;
    } else {
        aiGpu = 0.10;
    }

    // Uncertainty Signal handling (Feature #8 integration)
    if (requirements.uncertaintySignal) {
        if (cost === 0.50) cost = 0.75;
        if (simplicity === 0.50) simplicity = 0.80;
    }

    return {
        cost: clamp(cost),
        simplicity: clamp(simplicity),
        performance: clamp(performance),
        reliability: clamp(reliability),
        features: clamp(features),
        support: clamp(support),
        aiGpu: clamp(aiGpu)
    };
}

module.exports = {
    DIMENSION_METADATA,
    clamp,
    generateInitialFuzzyValues
};
