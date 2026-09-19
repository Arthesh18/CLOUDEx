/* =====================================================
   CLOUDEx - CLOUD EXPLORER
   Complete Explorer + Comparison + Quick Verdict
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* =================================================
       ELEMENTS
    ================================================= */

    const providerGrid =
        document.getElementById("providerGrid");

    const providerCount =
        document.getElementById("providerCount");

    const searchInput =
        document.getElementById("providerSearch");

    const filterButtons =
        document.querySelectorAll(".filter-btn");

    const providerSelector =
        document.getElementById("providerSelector");

    const selectedCount =
        document.getElementById("selectedCount");

    const compareButton =
        document.getElementById("compareButton");

    const comparisonResults =
        document.getElementById("comparisonResults");

    const comparisonSummary =
        document.getElementById("comparisonSummary");

    const serviceComparison =
        document.getElementById("serviceComparison");

    const modal =
        document.getElementById("providerModal");

    const modalContent =
        document.getElementById("modalContent");

    const modalClose =
        document.getElementById("modalClose");

    const serviceModal =
        document.getElementById("serviceModal");

    const serviceModalContent =
        document.getElementById("serviceModalContent");

    const serviceModalClose =
        document.getElementById("serviceModalClose");


    /* =================================================
       DATA
    ================================================= */

    let providers = [];

    let currentFilter = "all";

    let selectedProviders = [];


    /* =================================================
       LOAD CLOUD PROVIDERS
    ================================================= */

    async function loadProviders() {

        try {

            const response =
                await fetch("http://localhost:5000/api/cloud/providers");

            if (!response.ok) {
                throw new Error(
                    "Unable to load cloud providers"
                );
            }

            const data =
                await response.json();

            providers =
                data.providers || data || [];

            if (!Array.isArray(providers)) {
                providers = [];
            }

            renderProviders();

            renderProviderSelector();

            // Handle URL query parameter ?provider=<id>
            const urlParams = new URLSearchParams(window.location.search);
            const providerParam = urlParams.get("provider");
            if (providerParam) {
                const targetProvider = providers.find(
                    p => String(p.id).toLowerCase() === providerParam.toLowerCase()
                );
                if (targetProvider) {
                    setTimeout(() => {
                        const card = document.querySelector(`[data-provider="${targetProvider.id}"]`);
                        if (card) {
                            card.scrollIntoView({ behavior: "smooth", block: "center" });
                        }
                        openProviderModal(targetProvider);
                    }, 150);
                }
            }

        } catch (error) {

            console.error(
                "Cloud provider loading error:",
                error
            );

            if (providerGrid) {

                providerGrid.innerHTML = `
                    <div class="empty-state">

                        <i class="fa-solid fa-cloud-arrow-down"></i>

                        <h3>
                            Unable to load cloud providers
                        </h3>

                        <p>
                            Please make sure the
                            CLOUDEx backend is running.
                        </p>

                    </div>
                `;

            }

            if (providerCount) {
                providerCount.textContent =
                    "Unable to load";
            }

        }

    }


    /* =================================================
       PROVIDER EXPLORER
    ================================================= */

    function renderProviders() {

        if (!providerGrid) {
            return;
        }

        const searchTerm =
            searchInput
                ? searchInput.value
                    .toLowerCase()
                    .trim()
                : "";

        const filteredProviders =
            providers.filter(provider => {

                const name =
                    String(
                        provider.name || ""
                    ).toLowerCase();

                const shortName =
                    String(
                        provider.shortName || ""
                    ).toLowerCase();

                const description =
                    String(
                        provider.description || ""
                    ).toLowerCase();

                const categories =
                    Array.isArray(provider.categories)
                        ? provider.categories
                        : [];

                // Check services within this provider
                let matchesService = false;
                if (searchTerm && provider.services && typeof provider.services === "object") {
                    const allServices = Object.values(provider.services).flat();
                    matchesService = allServices.some(s => {
                        const sName = String(s.name || "").toLowerCase();
                        const sType = String(s.type || "").toLowerCase();
                        const sDesc = String(s.description || "").toLowerCase();
                        const sBest = String(s.bestFor || "").toLowerCase();
                        return (
                            sName.includes(searchTerm) ||
                            sType.includes(searchTerm) ||
                            sDesc.includes(searchTerm) ||
                            sBest.includes(searchTerm)
                        );
                    });
                }

                const matchesSearch =
                    !searchTerm ||
                    name.includes(searchTerm) ||
                    shortName.includes(searchTerm) ||
                    description.includes(searchTerm) ||
                    matchesService;

                const matchesFilter =
                    currentFilter === "all" ||
                    categories.includes(currentFilter);

                return (
                    matchesSearch &&
                    matchesFilter
                );

            });


        if (providerCount) {

            providerCount.textContent =
                `${filteredProviders.length} provider${
                    filteredProviders.length !== 1
                        ? "s"
                        : ""
                }`;

        }


        if (filteredProviders.length === 0) {

            providerGrid.innerHTML = `
                <div class="empty-state">

                    <i class="fa-solid fa-cloud"></i>

                    <h3>
                        No providers found
                    </h3>

                    <p>
                        Try a different search
                        or filter.
                    </p>

                </div>
            `;

            return;
        }


        providerGrid.innerHTML =
            filteredProviders
                .map(provider =>
                    createProviderCard(provider)
                )
                .join("");


        document
            .querySelectorAll(".view-provider")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const providerId =
                            button.dataset.id;

                        const provider =
                            providers.find(
                                item =>
                                    String(item.id) ===
                                    String(providerId)
                            );

                        if (provider) {
                            openProviderModal(provider);
                        }

                    }
                );

            });

    }


    /* =================================================
       PROVIDER CARD
    ================================================= */

    function createProviderCard(provider) {

        const icon =
            provider.icon || "fa-cloud";

        const categories =
            Array.isArray(provider.categories)
                ? provider.categories
                : [];

        const tags =
            categories
                .slice(0, 3)
                .map(category => `
                    <span class="provider-tag">
                        ${formatCategory(category)}
                    </span>
                `)
                .join("");


        return `
            <article class="provider-card" data-provider="${provider.id}">

                <div class="provider-top">

                    <div class="provider-icon">
                        <i class="fa-solid ${icon}"></i>
                    </div>

                </div>


                <h3>
                    ${
                        provider.name ||
                        "Cloud Provider"
                    }
                </h3>


                <p class="provider-description">
                    ${
                        provider.description ||
                        "Cloud services and infrastructure."
                    }
                </p>


                <div class="provider-tags">
                    ${tags}
                </div>


                <button
                    class="view-provider"
                    data-id="${provider.id}"
                >
                    View provider
                    <i class="fa-solid fa-arrow-right"></i>
                </button>

            </article>
        `;

    }


    /* =================================================
       FORMAT CATEGORY
    ================================================= */

    function formatCategory(category) {

        return String(category)
            .replace(/-/g, " ")
            .replace(
                /\b\w/g,
                letter =>
                    letter.toUpperCase()
            );

    }


    /* =================================================
       SEARCH
    ================================================= */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            renderProviders
        );

    }


    /* =================================================
       FILTER BUTTONS
    ================================================= */

    filterButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                filterButtons.forEach(btn => {
                    btn.classList.remove("active");
                });

                button.classList.add("active");

                currentFilter =
                    button.dataset.filter || "all";

                renderProviders();

            }
        );

    });


    /* =================================================
       PROVIDER SELECTOR
    ================================================= */

    function renderProviderSelector() {

        if (!providerSelector) {
            return;
        }

        providerSelector.innerHTML =
            providers
                .map(provider => `

                    <label
                        class="provider-option"
                        data-id="${provider.id}"
                    >

                        <input
                            type="checkbox"
                            value="${provider.id}"
                        >

                        <div class="provider-icon">

                            <i
                                class="fa-solid ${
                                    provider.icon ||
                                    "fa-cloud"
                                }"
                            ></i>

                        </div>

                        <span class="provider-option-name">
                            ${provider.name}
                        </span>

                    </label>

                `)
                .join("");


        providerSelector
            .querySelectorAll(
                'input[type="checkbox"]'
            )
            .forEach(input => {

                input.addEventListener(
                    "change",
                    handleProviderSelection
                );

            });

    }


    /* =================================================
       PROVIDER SELECTION
    ================================================= */

    function handleProviderSelection(event) {

        const input =
            event.target;

        const id =
            String(input.value);

        const option =
            input.closest(
                ".provider-option"
            );


        if (input.checked) {

            if (selectedProviders.length >= 4) {

                input.checked = false;

                alert(
                    "You can compare up to 4 providers."
                );

                return;
            }


            if (!selectedProviders.includes(id)) {

                selectedProviders.push(id);

            }


            if (option) {

                option.classList.add(
                    "selected"
                );

            }

        } else {

            selectedProviders =
                selectedProviders.filter(
                    providerId =>
                        providerId !== id
                );


            if (option) {

                option.classList.remove(
                    "selected"
                );

            }

        }


        updateSelectionUI();

    }


    /* =================================================
       SELECTION UI
    ================================================= */

    function updateSelectionUI() {

        const count =
            selectedProviders.length;


        if (selectedCount) {

            selectedCount.textContent =
                `${count} selected`;

        }


        if (compareButton) {

            compareButton.disabled =
                count < 2;

        }

    }


    /* =================================================
       COMPARE BUTTON
    ================================================= */

    if (compareButton) {

        compareButton.addEventListener(
            "click",
            () => {

                if (
                    selectedProviders.length < 2
                ) {

                    alert(
                        "Select at least 2 providers to compare."
                    );

                    return;
                }


                const selected =
                    providers.filter(
                        provider =>
                            selectedProviders.includes(
                                String(provider.id)
                            )
                    );


                if (comparisonResults) {

                    comparisonResults.classList.remove(
                        "hidden"
                    );

                }


                renderComparison(selected);


                if (comparisonResults) {

                    comparisonResults.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }

            }
        );

    }


    /* =================================================
       COMPLETE COMPARISON
    ================================================= */

    function renderComparison(selected) {

        /* ---------------------------------------------
           QUICK VERDICT
        --------------------------------------------- */

        renderQuickVerdict(selected);


        /* ---------------------------------------------
           CHARTS
        --------------------------------------------- */

        if (
            typeof window.renderComparisonCharts ===
            "function"
        ) {

            setTimeout(() => {

                window.renderComparisonCharts(
                    selected
                );

            }, 50);

        }


        /* ---------------------------------------------
           SERVICES
        --------------------------------------------- */

        renderServiceComparison(selected);

    }


    /* =================================================
       QUICK VERDICT
    ================================================= */

    function renderQuickVerdict(selected) {

        if (!comparisonSummary) {
            return;
        }

        if (
            !Array.isArray(selected) ||
            selected.length < 2
        ) {
            comparisonSummary.innerHTML = "";
            return;
        }


        /* ---------------------------------------------
           GET NUMERIC SCORE
        --------------------------------------------- */

        function getMetric(provider, key) {

            const rawValue =
                key === "affordability"
                    ? provider.affordability
                    : provider[key];

            const value =
                Number(rawValue);

            return Number.isFinite(value)
                ? value
                : 0;

        }


        /* ---------------------------------------------
           OVERALL SCORE
        --------------------------------------------- */

        function getOverallScore(provider) {

            const scores = [

                getMetric(
                    provider,
                    "beginnerFriendly"
                ),

                getMetric(
                    provider,
                    "affordability"
                ),

                getMetric(
                    provider,
                    "scalability"
                ),

                getMetric(
                    provider,
                    "aiMl"
                ),

                getMetric(
                    provider,
                    "enterprise"
                ),

                getMetric(
                    provider,
                    "globalReach"
                )

            ];


            return (
                scores.reduce(
                    (sum, value) =>
                        sum + value,
                    0
                ) / scores.length
            );

        }


        /* ---------------------------------------------
           CATEGORIES
        --------------------------------------------- */

        const categories = [

            {
                key: "beginnerFriendly",
                title: "Best for Beginners",
                icon: "fa-graduation-cap"
            },

            {
                key: "affordability",
                title: "Best Value",
                icon: "fa-coins"
            },

            {
                key: "scalability",
                title: "Best Scalability",
                icon: "fa-chart-line"
            },

            {
                key: "aiMl",
                title: "Best for AI / ML",
                icon: "fa-brain"
            },

            {
                key: "enterprise",
                title: "Best for Enterprise",
                icon: "fa-building"
            },

            {
                key: "globalReach",
                title: "Best Global Reach",
                icon: "fa-globe"
            }

        ];


        /* ---------------------------------------------
           OVERALL WINNER
        --------------------------------------------- */

        const overallWinner =
            selected.reduce(
                (best, provider) => {

                    return getOverallScore(provider) >
                        getOverallScore(best)
                        ? provider
                        : best;

                },
                selected[0]
            );


        const overallScore =
            getOverallScore(
                overallWinner
            );


        /* ---------------------------------------------
           HEADER
        --------------------------------------------- */

        let html = `

            <div class="quick-verdict-header">

                <div class="quick-verdict-title">

                    <span class="chart-label">
                        QUICK VERDICT
                    </span>

                    <h3>
                        Which provider fits best?
                    </h3>

                    <p>
                        A quick summary based on
                        the comparison scores.
                    </p>

                </div>


                <div class="verdict-overall">

                    <span>
                        Best Overall
                    </span>

                    <strong>
                        ${
                            overallWinner.name ||
                            "Provider"
                        }
                    </strong>

                    <small>
                        ${overallScore.toFixed(1)} / 10
                    </small>

                </div>

            </div>


            <div class="verdict-grid">

        `;


        /* ---------------------------------------------
           CATEGORY WINNERS
        --------------------------------------------- */

        categories.forEach(category => {

            const winner =
                selected.reduce(
                    (best, provider) => {

                        return getMetric(
                            provider,
                            category.key
                        ) >
                        getMetric(
                            best,
                            category.key
                        )
                            ? provider
                            : best;

                    },
                    selected[0]
                );


            const value =
                getMetric(
                    winner,
                    category.key
                );


            html += `

                <div class="verdict-card">

                    <div class="verdict-icon">

                        <i
                            class="fa-solid ${
                                category.icon
                            }"
                        ></i>

                    </div>


                    <div class="verdict-content">

                        <span class="verdict-category">
                            ${category.title}
                        </span>

                        <strong>
                            ${
                                winner.name ||
                                "Provider"
                            }
                        </strong>

                        <span class="verdict-score">
                            ${value.toFixed(1)} / 10
                        </span>

                    </div>

                </div>

            `;

        });


        html += `

            </div>

        `;


        comparisonSummary.innerHTML =
            html;

    }


    /* =================================================
       SERVICE DATA HELPERS
    ================================================= */

    function getServiceCategories(provider) {

        const services =
            provider.services;


        /* ---------------------------------------------
           NEW STRUCTURE

           services: {
               compute: [],
               storage: [],
               database: [],
               ai: []
           }
        --------------------------------------------- */

        if (
            services &&
            typeof services === "object" &&
            !Array.isArray(services)
        ) {

            return services;

        }


        /* ---------------------------------------------
           OLD STRUCTURE
        --------------------------------------------- */

        return {

            compute: [],
            storage: [],
            database: [],
            ai: []

        };

    }


    function getServiceName(service) {

        if (
            typeof service === "string"
        ) {

            return service;

        }


        if (
            service &&
            typeof service === "object"
        ) {

            return (
                service.name ||
                service.title ||
                "Service"
            );

        }


        return "Service";

    }


    function getServiceDescription(service) {

        if (
            service &&
            typeof service === "object"
        ) {

            return (
                service.description ||
                ""
            );

        }


        return "";

    }


    function getServiceType(service) {

        if (
            service &&
            typeof service === "object"
        ) {

            return (
                service.type ||
                service.category ||
                ""
            );

        }


        return "";

    }


    function getServicePricing(service) {

        if (
            service &&
            typeof service === "object"
        ) {

            return (
                service.pricingModel ||
                service.pricing ||
                ""
            );

        }


        return "";

    }


    /* =================================================
       SERVICE EQUIVALENCE DEFINITIONS (FEATURE #3)
    ================================================= */

    const serviceEquivalenceGroups = [
        {
            key: "virtual-machines",
            title: "Virtual Machines & Core Compute",
            category: "compute",
            icon: "fa-server",
            description: "General-purpose scalable compute instances and virtual machines for running application servers, web workloads, and custom operating systems.",
            mappings: {
                aws: "Amazon EC2",
                azure: "Azure Virtual Machines",
                gcp: "Compute Engine",
                oracle: "OCI Compute",
                ibm: "IBM Virtual Servers",
                digitalocean: "Droplets",
                alibaba: "Elastic Compute Service",
                huawei: "Elastic Cloud Server",
                tencent: "Cloud Virtual Machine",
                vultr: "Vultr Cloud Compute",
                hetzner: "Hetzner Cloud Servers",
                ovhcloud: "OVHcloud Public Cloud",
                akamai: "Akamai Cloud Compute",
                coreweave: "CPU Compute"
            }
        },
        {
            key: "managed-kubernetes",
            title: "Managed Kubernetes & Containers",
            category: "compute",
            icon: "fa-cubes",
            description: "Container orchestration and managed Kubernetes clusters for deploying, scaling, and managing containerized microservices.",
            mappings: {
                aws: "Amazon ECS",
                azure: "Azure Kubernetes Service",
                gcp: "Google Kubernetes Engine",
                oracle: "OCI Container Instances",
                ibm: "IBM Code Engine",
                alibaba: "Container Service for Kubernetes",
                huawei: "Cloud Container Engine",
                tencent: "Tencent Kubernetes Engine",
                vultr: "Vultr Kubernetes Engine",
                hetzner: "Hetzner Cloud Kubernetes",
                ovhcloud: "Managed Kubernetes Service",
                coreweave: "Kubernetes"
            }
        },
        {
            key: "serverless-functions",
            title: "Serverless & Event-Driven Functions",
            category: "compute",
            icon: "fa-bolt",
            description: "Event-driven execution environments where code runs on demand without managing or provisioning underlying servers.",
            mappings: {
                aws: "AWS Lambda",
                azure: "Azure Functions",
                gcp: "Cloud Run",
                ibm: "IBM Code Engine",
                digitalocean: "App Platform",
                alibaba: "Function Compute",
                huawei: "FunctionGraph",
                tencent: "CloudBase",
                cloudflare: "Cloudflare Workers",
                akamai: "Akamai Edge Compute"
            }
        },
        {
            key: "object-storage",
            title: "Object Storage",
            category: "storage",
            icon: "fa-box-archive",
            description: "Highly scalable and durable storage for unstructured assets, backups, static websites, and media files with global HTTP API access.",
            mappings: {
                aws: "Amazon S3",
                azure: "Azure Blob Storage",
                gcp: "Cloud Storage",
                oracle: "OCI Object Storage",
                ibm: "IBM Cloud Object Storage",
                digitalocean: "Spaces",
                alibaba: "Object Storage Service",
                huawei: "Object Storage Service",
                tencent: "Cloud Object Storage",
                vultr: "Vultr Object Storage",
                hetzner: "Hetzner Object Storage",
                ovhcloud: "Object Storage",
                cloudflare: "Cloudflare R2",
                akamai: "Akamai Cloud Storage",
                coreweave: "Cloud Storage"
            }
        },
        {
            key: "block-storage",
            title: "Block Storage & Persistent Volumes",
            category: "storage",
            icon: "fa-hard-drive",
            description: "High-performance block volumes attachable to virtual instances for OS filesystems, transactional databases, and I/O-intensive workloads.",
            mappings: {
                aws: "Amazon EBS",
                azure: "Azure Disk Storage",
                vultr: "Vultr Block Storage",
                hetzner: "Hetzner Volumes",
                ovhcloud: "Block Storage",
                coreweave: "Block Storage"
            }
        },
        {
            key: "relational-database",
            title: "Managed Relational (SQL) Databases",
            category: "database",
            icon: "fa-database",
            description: "Fully managed SQL database engines with automated backups, patching, replication, and high availability.",
            mappings: {
                aws: "Amazon RDS",
                azure: "Azure SQL Database",
                gcp: "Cloud SQL",
                oracle: "Oracle Autonomous Database",
                ibm: "IBM Cloud Databases",
                digitalocean: "Managed Databases",
                alibaba: "ApsaraDB RDS",
                huawei: "Relational Database Service",
                tencent: "TencentDB for MySQL",
                vultr: "Vultr Managed Databases",
                hetzner: "Managed Databases",
                ovhcloud: "Managed Databases",
                cloudflare: "D1",
                akamai: "Managed Databases",
                coreweave: "Managed Database Options"
            }
        },
        {
            key: "nosql-database",
            title: "NoSQL & Distributed Key-Value Datastores",
            category: "database",
            icon: "fa-table-cells",
            description: "Globally distributed, flexible-schema document and key-value datastores built for low latency at massive scale.",
            mappings: {
                aws: "Amazon DynamoDB",
                azure: "Azure Cosmos DB",
                gcp: "Firestore",
                cloudflare: "Workers KV"
            }
        },
        {
            key: "ai-ml-platform",
            title: "AI & Machine Learning Platforms",
            category: "ai",
            icon: "fa-brain",
            description: "Comprehensive machine learning development environments, foundation model fine-tuning, and dedicated GPU computing.",
            mappings: {
                aws: "Amazon SageMaker",
                azure: "Azure Machine Learning",
                gcp: "Vertex AI",
                oracle: "OCI Generative AI",
                ibm: "watsonx.ai",
                digitalocean: "GPU Droplets",
                alibaba: "PAI",
                huawei: "ModelArts",
                tencent: "Tencent Cloud AI",
                vultr: "Vultr GPU",
                hetzner: "GPU Servers",
                ovhcloud: "AI Endpoints",
                cloudflare: "Workers AI",
                akamai: "GPU Cloud",
                coreweave: "AI Infrastructure"
            }
        }
    ];

    let activeEquivalenceGroup = "virtual-machines";


    /* =================================================
       SERVICE COMPARISON (FEATURE #3 SERVICE-TO-SERVICE)
    ================================================= */

    function renderServiceComparison(selected) {

        if (!serviceComparison) {
            return;
        }

        if (!selected || selected.length < 2) {

            serviceComparison.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-table"></i>
                    <h3>Select providers to compare</h3>
                    <p>Choose at least two cloud providers above to compare equivalent services side-by-side.</p>
                </div>
            `;
            return;

        }

        // Build archetype navigation buttons
        const navButtonsHTML = serviceEquivalenceGroups.map(g => `
            <button
                class="eq-archetype-btn ${activeEquivalenceGroup === g.key ? "active" : ""}"
                data-group="${g.key}"
            >
                <i class="fa-solid ${g.icon}"></i>
                ${g.title}
            </button>
        `).join("") + `
            <button
                class="eq-archetype-btn ${activeEquivalenceGroup === "overview" ? "active" : ""}"
                data-group="overview"
            >
                <i class="fa-solid fa-layer-group"></i>
                All Categories Overview
            </button>
        `;

        let contentHTML = "";

        if (activeEquivalenceGroup !== "overview") {

            const group =
                serviceEquivalenceGroups.find(
                    g => g.key === activeEquivalenceGroup
                ) || serviceEquivalenceGroups[0];

            // Banner
            const bannerHTML = `
                <div class="eq-archetype-banner">
                    <div class="eq-banner-icon">
                        <i class="fa-solid ${group.icon}"></i>
                    </div>
                    <div class="eq-banner-content">
                        <h3>${group.title}</h3>
                        <p>${group.description}</p>
                    </div>
                </div>
            `;

            // Matrix Cards
            const matrixCardsHTML = selected.map(provider => {

                const mappedName =
                    group.mappings[provider.id];

                const allServices =
                    Object.values(provider.services || {}).flat();

                const svc =
                    mappedName
                        ? allServices.find(s => s.name === mappedName)
                        : null;

                if (svc) {

                    const advantagesHTML = Array.isArray(svc.advantages) && svc.advantages.length
                        ? `
                            <span class="eq-section-title eq-adv-title">
                                <i class="fa-solid fa-circle-check"></i> Key Advantages
                            </span>
                            <ul class="eq-list">
                                ${svc.advantages.map(a => `
                                    <li class="eq-adv-li">
                                        <i class="fa-solid fa-check"></i>
                                        <span>${a}</span>
                                    </li>
                                `).join("")}
                            </ul>
                        `
                        : "";

                    const limitationsHTML = Array.isArray(svc.limitations) && svc.limitations.length
                        ? `
                            <span class="eq-section-title eq-lim-title">
                                <i class="fa-solid fa-triangle-exclamation"></i> Limitations & Trade-offs
                            </span>
                            <ul class="eq-list">
                                ${svc.limitations.map(l => `
                                    <li class="eq-lim-li">
                                        <i class="fa-solid fa-triangle-exclamation"></i>
                                        <span>${l}</span>
                                    </li>
                                `).join("")}
                            </ul>
                        `
                        : "";

                    return `
                        <article class="eq-service-card" data-provider="${provider.id}" data-svc="${svc.name}">
                            <div>
                                <div class="eq-provider-header">
                                    <div class="eq-provider-icon">
                                        <i class="fa-solid ${provider.icon || "fa-cloud"}"></i>
                                    </div>
                                    <div>
                                        <h4>${provider.name}</h4>
                                    </div>
                                </div>

                                <h3 class="eq-service-name">${svc.name}</h3>

                                <div class="eq-meta-tags">
                                    ${svc.type ? `<span class="eq-type-badge">${svc.type}</span>` : ""}
                                    ${svc.pricingModel ? `<span class="eq-pricing-badge"><i class="fa-solid fa-tag"></i> ${svc.pricingModel}</span>` : ""}
                                </div>

                                <p class="eq-desc">${svc.description || ""}</p>

                                ${svc.bestFor ? `
                                    <div class="eq-best-for">
                                        <strong><i class="fa-solid fa-bullseye"></i> Best For</strong>
                                        <p>${svc.bestFor}</p>
                                    </div>
                                ` : ""}

                                ${advantagesHTML}
                                ${limitationsHTML}
                            </div>

                            <div class="eq-service-footer">
                                <button
                                    class="eq-open-modal-btn"
                                    data-provider="${provider.id}"
                                    data-svc="${svc.name}"
                                >
                                    View Full Details <i class="fa-solid fa-chevron-right"></i>
                                </button>
                            </div>
                        </article>
                    `;

                } else {

                    return `
                        <div class="eq-unmapped-card">
                            <div class="eq-provider-header" style="border:none; margin:0 0 10px 0; padding:0;">
                                <div class="eq-provider-icon">
                                    <i class="fa-solid ${provider.icon || "fa-cloud"}"></i>
                                </div>
                                <h4>${provider.name}</h4>
                            </div>

                            <div class="eq-unmapped-icon">
                                <i class="fa-solid fa-circle-minus"></i>
                            </div>

                            <h4>No Direct Equivalent</h4>
                            <p>${provider.shortName || provider.name} does not currently have a mapped equivalent in this dataset for ${group.title}.</p>
                        </div>
                    `;

                }

            }).join("");

            contentHTML = `
                ${bannerHTML}
                <div class="eq-matrix-grid">
                    ${matrixCardsHTML}
                </div>
            `;

        } else {

            // CATEGORY OVERVIEW
            const categories = [
                {
                    key: "compute",
                    title: "Compute",
                    icon: "fa-server",
                    description: "Virtual machines, containers and serverless computing."
                },
                {
                    key: "storage",
                    title: "Storage",
                    icon: "fa-hard-drive",
                    description: "Object, block and file storage services."
                },
                {
                    key: "database",
                    title: "Database",
                    icon: "fa-database",
                    description: "Managed SQL and NoSQL database services."
                },
                {
                    key: "ai",
                    title: "AI / ML",
                    icon: "fa-brain",
                    description: "Artificial intelligence and machine learning services."
                }
            ];

            let overviewHTML = "";

            categories.forEach(category => {

                overviewHTML += `
                    <section class="service-category">
                        <div class="service-category-title">
                            <div class="service-category-icon">
                                <i class="fa-solid ${category.icon}"></i>
                            </div>
                            <div>
                                <span>SERVICE CATEGORY</span>
                                <h3>${category.title}</h3>
                                <p>${category.description}</p>
                            </div>
                        </div>

                        <div class="service-comparison-grid">
                `;

                selected.forEach(provider => {

                    const categoriesData =
                        getServiceCategories(provider);

                    const services =
                        Array.isArray(categoriesData[category.key])
                            ? categoriesData[category.key]
                            : [];

                    overviewHTML += `
                        <article class="service-provider-card">
                            <div class="service-provider-header">
                                <div class="service-provider-icon">
                                    <i class="fa-solid ${provider.icon || "fa-cloud"}"></i>
                                </div>
                                <div>
                                    <h4>${provider.name || "Provider"}</h4>
                                    <span>${services.length} service${services.length !== 1 ? "s" : ""}</span>
                                </div>
                            </div>

                            <div class="service-items">
                    `;

                    if (services.length === 0) {

                        overviewHTML += `
                            <div class="service-unavailable">
                                <i class="fa-solid fa-circle-info"></i>
                                No information available
                            </div>
                        `;

                    } else {

                        services.forEach(service => {

                            const name = getServiceName(service);
                            const description = getServiceDescription(service);
                            const type = getServiceType(service);
                            const pricing = getServicePricing(service);

                            overviewHTML += `
                                <div class="service-item">
                                    <div class="service-item-name">
                                        <i class="fa-solid fa-check"></i>
                                        <strong>${name}</strong>
                                    </div>
                                    ${type ? `<span class="service-type">${type}</span>` : ""}
                                    ${description ? `<p>${description}</p>` : ""}
                                    ${pricing ? `<small><i class="fa-solid fa-tag"></i> ${pricing}</small>` : ""}
                                </div>
                            `;

                        });

                    }

                    overviewHTML += `
                            </div>
                        </article>
                    `;

                });

                overviewHTML += `
                        </div>
                    </section>
                `;

            });

            contentHTML = overviewHTML;

        }

        serviceComparison.innerHTML = `
            <div class="service-comparison-intro">
                <span>SERVICE-TO-SERVICE EQUIVALENCE</span>
                <h2>Compare Equivalent Cloud Services</h2>
                <p>Directly compare equivalent services across your selected providers side-by-side with full specifications, best use cases, and trade-offs.</p>
            </div>

            <div class="eq-archetype-nav">
                ${navButtonsHTML}
            </div>

            <div class="eq-comparison-content">
                ${contentHTML}
            </div>
        `;

        // Wire archetype buttons
        const navButtons =
            serviceComparison.querySelectorAll(".eq-archetype-btn");

        navButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                const groupKey = btn.dataset.group;
                activeEquivalenceGroup = groupKey;
                renderServiceComparison(selected);
            });
        });

        // Wire "View Full Details" buttons on equivalent cards
        const detailButtons =
            serviceComparison.querySelectorAll(".eq-open-modal-btn");

        detailButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                const pId = btn.dataset.provider;
                const sName = btn.dataset.svc;
                const p = providers.find(item => String(item.id) === String(pId));
                if (p && p.services) {
                    const allSvcs = Object.values(p.services).flat();
                    const svc = allSvcs.find(s => s.name === sName);
                    if (svc) {
                        openServiceModal(svc, p, "Equivalent Service");
                    }
                }
            });
        });

    }


    /* =================================================
       ADD PROVIDER TO COMPARISON
    ================================================= */

    function addProviderToComparison(providerId) {

        const id = String(providerId);

        if (selectedProviders.length >= 4 && !selectedProviders.includes(id)) {

            alert("You can compare up to 4 providers.");
            return;

        }

        if (!selectedProviders.includes(id)) {

            selectedProviders.push(id);

        }

        const checkbox =
            document.querySelector(
                `.provider-option input[value="${id}"]`
            );

        if (checkbox) {

            checkbox.checked = true;

            const option =
                checkbox.closest(".provider-option");

            if (option) {

                option.classList.add("selected");

            }

        }

        updateSelectionUI();

        if (modal) {

            modal.classList.remove("show");

        }

        if (serviceModal) {

            serviceModal.classList.remove("show");

        }

        if (selectedProviders.length >= 2) {

            const selected =
                providers.filter(p =>
                    selectedProviders.includes(String(p.id))
                );

            if (comparisonResults) {

                comparisonResults.classList.remove("hidden");

            }

            renderComparison(selected);

            if (comparisonResults) {

                comparisonResults.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        } else {

            const compSection =
                document.getElementById("comparisonSection");

            if (compSection) {

                compSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }

    }


    /* =================================================
       PROVIDER DETAILS MODAL
    ================================================= */

    function openProviderModal(provider) {

        if (!modal || !modalContent) {
            return;
        }

        // 1. Metric Scores
        const metricDefs = [
            { key: "beginnerFriendly", label: "Beginner Friendly" },
            { key: "affordability", label: "Affordability / Cost" },
            { key: "scalability", label: "Scalability" },
            { key: "enterprise", label: "Enterprise Readiness" },
            { key: "aiMl", label: "AI & ML Capabilities" },
            { key: "globalReach", label: "Global Reach" }
        ];

        const scoresHTML = metricDefs.map(m => {
            const val = typeof provider[m.key] === "number" ? provider[m.key] : 0;
            const pct = Math.min(Math.max(val * 10, 0), 100);
            return `
                <div class="modal-score-item">
                    <div class="modal-score-header">
                        <span class="modal-score-label">${m.label}</span>
                        <span class="modal-score-val">${val} <small>/ 10</small></span>
                    </div>
                    <div class="modal-score-track">
                        <div class="modal-score-fill" style="width: ${pct}%"></div>
                    </div>
                </div>
            `;
        }).join("");

        // 2. Core Platform Capabilities
        const capabilities = provider.capabilities || {};
        const capKeys = [
            { key: "security", label: "Security & IAM", icon: "fa-shield-halved" },
            { key: "reliability", label: "Reliability & HA", icon: "fa-server" },
            { key: "performance", label: "Performance", icon: "fa-bolt" },
            { key: "compliance", label: "Compliance & Governance", icon: "fa-certificate" },
            { key: "support", label: "Support & SLA", icon: "fa-headset" }
        ];

        const capabilitiesHTML = capKeys.map(c => {
            const desc = capabilities[c.key] || "High-grade cloud platform capability.";
            return `
                <div class="modal-capability-card">
                    <div class="capability-icon">
                        <i class="fa-solid ${c.icon}"></i>
                    </div>
                    <div class="capability-content">
                        <h4>${c.label}</h4>
                        <p>${desc}</p>
                    </div>
                </div>
            `;
        }).join("");

        // 3. Strengths & Trade-offs
        const strengths = Array.isArray(provider.strengths) ? provider.strengths : [];
        const weaknesses = Array.isArray(provider.weaknesses) ? provider.weaknesses : [];

        const strengthsHTML = strengths.map(s => {
            const title = typeof s === "object" ? (s.title || "") : s;
            const desc = typeof s === "object" ? (s.description || "") : "";
            return `
                <li class="modal-point-pro">
                    <i class="fa-solid fa-circle-check"></i>
                    <div>
                        <strong>${title}</strong>
                        ${desc ? `<span>${desc}</span>` : ""}
                    </div>
                </li>
            `;
        }).join("");

        const weaknessesHTML = weaknesses.map(w => {
            const title = typeof w === "object" ? (w.title || "") : w;
            const desc = typeof w === "object" ? (w.description || "") : "";
            return `
                <li class="modal-point-con">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    <div>
                        <strong>${title}</strong>
                        ${desc ? `<span>${desc}</span>` : ""}
                    </div>
                </li>
            `;
        }).join("");

        // 4. Categorized Services
        const serviceCategoryDefs = [
            { key: "compute", title: "Compute", icon: "fa-server" },
            { key: "storage", title: "Storage", icon: "fa-hard-drive" },
            { key: "database", title: "Database", icon: "fa-database" },
            { key: "ai", title: "AI / ML", icon: "fa-brain" }
        ];

        const providerServices = provider.services || {};

        let servicesSectionsHTML = "";
        serviceCategoryDefs.forEach(cat => {
            const svcList = Array.isArray(providerServices[cat.key]) ? providerServices[cat.key] : [];
            if (svcList.length > 0) {
                const cardsHTML = svcList.map((svc, idx) => {
                    const sName = getServiceName(svc);
                    const sType = getServiceType(svc);
                    const sPricing = getServicePricing(svc);
                    const sDesc = svc.description || svc.bestFor || "Click to inspect service capabilities and trade-offs.";
                    return `
                        <div class="modal-service-card" data-cat="${cat.key}" data-idx="${idx}">
                            <div class="service-card-top">
                                <h4>${sName}</h4>
                                ${sType ? `<span class="service-type-badge">${sType}</span>` : ""}
                            </div>
                            <p class="service-card-desc">${sDesc}</p>
                            <div class="service-card-bottom">
                                ${sPricing ? `<span class="service-pricing-pill"><i class="fa-solid fa-tag"></i> ${sPricing}</span>` : "<span></span>"}
                                <span class="service-details-link">Details <i class="fa-solid fa-chevron-right"></i></span>
                            </div>
                        </div>
                    `;
                }).join("");

                servicesSectionsHTML += `
                    <div class="modal-service-group">
                        <div class="modal-service-group-title">
                            <i class="fa-solid ${cat.icon}"></i>
                            <h4>${cat.title}</h4>
                            <span class="group-count">${svcList.length} service${svcList.length !== 1 ? "s" : ""}</span>
                        </div>
                        <div class="modal-service-cards-grid">
                            ${cardsHTML}
                        </div>
                    </div>
                `;
            }
        });

        if (!servicesSectionsHTML) {
            servicesSectionsHTML = `<p class="modal-empty-notice">No service details cataloged yet.</p>`;
        }

        modalContent.innerHTML = `
            <div class="modal-header">
                <div class="modal-provider-icon">
                    <i class="fa-solid ${provider.icon || "fa-cloud"}"></i>
                </div>
                <h2>${provider.name || "Cloud Provider"}</h2>
                ${provider.shortName ? `<span class="modal-shortname-badge">${provider.shortName}</span>` : ""}
                <p class="modal-intro">${provider.description || ""}</p>
                
                <div class="modal-top-actions">
                    <button class="modal-action-btn modal-compare-btn" id="modalCompareActionBtn">
                        <i class="fa-solid fa-scale-balanced"></i>
                        Compare this Provider
                    </button>
                    <a href="advisor.html" class="modal-action-btn modal-advisor-btn">
                        <i class="fa-solid fa-robot"></i>
                        Ask AI Advisor
                    </a>
                </div>
            </div>

            <!-- 6 BENCHMARK SCORES -->
            <div class="modal-section">
                <div class="modal-section-title">
                    <i class="fa-solid fa-chart-simple"></i>
                    <h3>Core Benchmark Metrics</h3>
                </div>
                <div class="modal-scores-grid">
                    ${scoresHTML}
                </div>
            </div>

            <!-- CORE CAPABILITIES -->
            <div class="modal-section">
                <div class="modal-section-title">
                    <i class="fa-solid fa-layer-group"></i>
                    <h3>Platform Capabilities</h3>
                </div>
                <div class="modal-capabilities-grid">
                    ${capabilitiesHTML}
                </div>
            </div>

            <!-- STRENGTHS & TRADEOFFS -->
            <div class="modal-section">
                <div class="modal-section-title">
                    <i class="fa-solid fa-arrows-split-up-and-left"></i>
                    <h3>Key Strengths & Considerations</h3>
                </div>
                <div class="modal-pros-cons-grid">
                    <div class="modal-pro-column">
                        <h4><i class="fa-solid fa-thumbs-up"></i> Key Strengths</h4>
                        <ul class="modal-checklist">
                            ${strengthsHTML || "<li>Solid cloud foundation</li>"}
                        </ul>
                    </div>
                    <div class="modal-con-column">
                        <h4><i class="fa-solid fa-triangle-exclamation"></i> Considerations & Trade-offs</h4>
                        <ul class="modal-checklist">
                            ${weaknessesHTML || "<li>Standard architectural trade-offs</li>"}
                        </ul>
                    </div>
                </div>
            </div>

            <!-- CATEGORIZED SERVICES -->
            <div class="modal-section">
                <div class="modal-section-title">
                    <i class="fa-solid fa-cubes"></i>
                    <h3>Cataloged Services</h3>
                </div>
                <p class="modal-section-subtitle">Click on any service card below to view detailed specifications, best use cases, and limitations.</p>
                <div class="modal-service-categories">
                    ${servicesSectionsHTML}
                </div>
            </div>
        `;

        // Wire "Compare this Provider" button
        const compareActionBtn = modalContent.querySelector("#modalCompareActionBtn");
        if (compareActionBtn) {
            compareActionBtn.addEventListener("click", () => {
                addProviderToComparison(provider.id);
            });
        }

        // Wire clickable service cards
        const serviceCards = modalContent.querySelectorAll(".modal-service-card");
        serviceCards.forEach(card => {
            card.addEventListener("click", () => {
                const catKey = card.dataset.cat;
                const idx = parseInt(card.dataset.idx, 10);
                const catDef = serviceCategoryDefs.find(c => c.key === catKey);
                const svc = providerServices[catKey] && providerServices[catKey][idx];
                if (svc) {
                    openServiceModal(svc, provider, catDef ? catDef.title : "Service");
                }
            });
        });

        modal.classList.add("show");
    }


    /* =================================================
       SERVICE DETAILS MODAL
    ================================================= */

    function openServiceModal(service, provider, categoryTitle) {

        if (!serviceModal || !serviceModalContent) {
            return;
        }

        const sName = getServiceName(service);
        const sType = getServiceType(service);
        const sPricing = getServicePricing(service);
        const sDesc = service.description || "Detailed cloud service specification.";
        const sBestFor = service.bestFor || "Enterprise and developer workloads requiring managed cloud capabilities.";
        const advantages = Array.isArray(service.advantages) && service.advantages.length > 0
            ? service.advantages
            : ["Native integration with " + (provider.name || "cloud platform"), "Enterprise security and high availability"];
        const limitations = Array.isArray(service.limitations) && service.limitations.length > 0
            ? service.limitations
            : ["Usage costs scale with resource allocation and data transfer"];

        const advantagesHTML = advantages.map(adv => `
            <li class="service-adv-item">
                <i class="fa-solid fa-check"></i>
                <span>${adv}</span>
            </li>
        `).join("");

        const limitationsHTML = limitations.map(lim => `
            <li class="service-lim-item">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span>${lim}</span>
            </li>
        `).join("");

        const eqGroup =
            serviceEquivalenceGroups.find(
                g => g.mappings && g.mappings[provider.id] === sName
            );

        serviceModalContent.innerHTML = `
            <div class="service-modal-header">
                <div class="service-modal-badges">
                    <span class="service-provider-badge">
                        <i class="fa-solid ${provider.icon || "fa-cloud"}"></i>
                        ${provider.shortName || provider.name}
                    </span>
                    <span class="service-category-badge">${categoryTitle}</span>
                </div>
                <h2>${sName}</h2>
                <div class="service-meta-strip">
                    ${sType ? `<span class="service-type-tag"><i class="fa-solid fa-layer-group"></i> ${sType}</span>` : ""}
                    ${sPricing ? `<span class="service-pricing-tag"><i class="fa-solid fa-tag"></i> ${sPricing}</span>` : ""}
                </div>
            </div>

            <div class="service-modal-body">
                <div class="service-section">
                    <h4><i class="fa-solid fa-circle-info"></i> Service Overview</h4>
                    <p class="service-overview-text">${sDesc}</p>
                </div>

                <div class="service-section">
                    <h4><i class="fa-solid fa-bullseye"></i> Best For</h4>
                    <div class="service-best-for-box">
                        <p>${sBestFor}</p>
                    </div>
                </div>

                <div class="service-section">
                    <h4><i class="fa-solid fa-circle-check"></i> Key Advantages</h4>
                    <ul class="service-advantages-list">
                        ${advantagesHTML}
                    </ul>
                </div>

                <div class="service-section">
                    <h4><i class="fa-solid fa-triangle-exclamation"></i> Limitations & Considerations</h4>
                    <ul class="service-limitations-list">
                        ${limitationsHTML}
                    </ul>
                </div>
            </div>

            <div class="service-modal-footer">
                <button class="service-back-btn" id="serviceBackBtn">
                    <i class="fa-solid fa-arrow-left"></i>
                    Back to ${provider.shortName || provider.name}
                </button>
                ${
                    eqGroup
                        ? `
                            <button class="service-action-btn eq-modal-compare-btn" id="serviceCompareEquivalentsBtn">
                                <i class="fa-solid fa-scale-balanced"></i>
                                Compare Equivalent Services
                            </button>
                        `
                        : ""
                }
            </div>
        `;

        const backBtn = serviceModalContent.querySelector("#serviceBackBtn");
        if (backBtn) {
            backBtn.addEventListener("click", () => {
                serviceModal.classList.remove("show");
                if (modal) {
                    modal.classList.add("show");
                }
            });
        }

        const compareEqBtn = serviceModalContent.querySelector("#serviceCompareEquivalentsBtn");
        if (compareEqBtn && eqGroup) {
            compareEqBtn.addEventListener("click", () => {
                activeEquivalenceGroup = eqGroup.key;
                const pId = String(provider.id);

                if (!selectedProviders.includes(pId)) {
                    if (selectedProviders.length >= 4) {
                        selectedProviders.pop();
                    }
                    selectedProviders.push(pId);
                }

                if (selectedProviders.length < 2) {
                    const mappedIds = Object.keys(eqGroup.mappings);
                    const counterpart = mappedIds.find(id => id !== pId);
                    if (counterpart && !selectedProviders.includes(counterpart)) {
                        selectedProviders.push(counterpart);
                    }
                }

                updateSelectionUI();

                selectedProviders.forEach(id => {
                    const cb = document.querySelector(`.provider-option input[value="${id}"]`);
                    if (cb) {
                        cb.checked = true;
                        const opt = cb.closest(".provider-option");
                        if (opt) {
                            opt.classList.add("selected");
                        }
                    }
                });

                serviceModal.classList.remove("show");
                if (modal) {
                    modal.classList.remove("show");
                }

                const selected = providers.filter(p => selectedProviders.includes(String(p.id)));

                if (comparisonResults) {
                    comparisonResults.classList.remove("hidden");
                }

                renderComparison(selected);

                const compSec =
                    document.getElementById("serviceComparison") ||
                    document.getElementById("comparisonResults");

                if (compSec) {
                    compSec.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            });
        }

        if (modal) {
            modal.classList.remove("show");
        }

        serviceModal.classList.add("show");
    }


    /* =================================================
       CLOSE MODALS
    ================================================= */

    if (modalClose && modal) {

        modalClose.addEventListener("click", () => {
            modal.classList.remove("show");
        });

        modal.addEventListener("click", event => {
            if (event.target === modal) {
                modal.classList.remove("show");
            }
        });

    }

    if (serviceModalClose && serviceModal) {

        serviceModalClose.addEventListener("click", () => {
            serviceModal.classList.remove("show");
        });

        serviceModal.addEventListener("click", event => {
            if (event.target === serviceModal) {
                serviceModal.classList.remove("show");
            }
        });

    }


    /* =================================================
       ESCAPE KEY
    ================================================= */

    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {

            if (serviceModal && serviceModal.classList.contains("show")) {

                serviceModal.classList.remove("show");

                if (modal) {
                    modal.classList.add("show");
                }

            } else if (modal && modal.classList.contains("show")) {

                modal.classList.remove("show");

            }

        }

    });


    /* =================================================
       INITIALIZE
    ================================================= */

    loadProviders();

});
// =========================================================
// AI ADVISOR → CLOUD EXPLORER INTEGRATION
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

    const params = new URLSearchParams(
        window.location.search
    );

    const providerFromAI = params.get("provider");
    const compareFromAI = params.get("compare");


    // -----------------------------------------------------
    // Find provider checkbox
    // -----------------------------------------------------

    function findProviderCheckbox(providerId) {

        if (!providerId) {
            return null;
        }

        const checkboxes =
            document.querySelectorAll(
                'input[type="checkbox"]'
            );

        return Array.from(checkboxes).find(
            checkbox => {

                const value =
                    (checkbox.value || "")
                    .toLowerCase();

                const dataProvider =
                    (
                        checkbox.dataset.provider || ""
                    ).toLowerCase();

                const id =
                    (
                        checkbox.id || ""
                    ).toLowerCase();

                return (
                    value === providerId.toLowerCase() ||
                    dataProvider === providerId.toLowerCase() ||
                    id.includes(providerId.toLowerCase())
                );
            }
        );
    }


    // -----------------------------------------------------
    // Explore provider
    // -----------------------------------------------------

    if (providerFromAI) {

        setTimeout(() => {

            /*
             * Find a provider card that contains
             * the recommended provider.
             */

            const providerCards =
                document.querySelectorAll(
                    "[data-provider]"
                );

            const card =
                Array.from(providerCards).find(
                    element =>
                        (
                            element.dataset.provider || ""
                        ).toLowerCase() ===
                        providerFromAI.toLowerCase()
                );


            if (card) {

                card.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

                const viewBtn =
                    card.querySelector(".view-provider");

                if (viewBtn) {
                    viewBtn.click();
                }

            }

        }, 500);

    }


    // -----------------------------------------------------
    // Compare provider
    // -----------------------------------------------------

    if (compareFromAI) {

        setTimeout(() => {

            const checkbox =
                findProviderCheckbox(
                    compareFromAI
                );


            if (checkbox) {

                /*
                 * Automatically select the
                 * provider recommended by AI.
                 */

                if (!checkbox.checked) {

                    checkbox.click();

                }

            } else {

                console.warn(
                    "Could not find comparison checkbox for:",
                    compareFromAI
                );

            }


            // ---------------------------------------------
            // Scroll to comparison section
            // ---------------------------------------------

            const comparisonSection =
                document.querySelector(
                    "#comparison"
                ) ||
                document.querySelector(
                    ".comparison-section"
                ) ||
                document.querySelector(
                    "[data-section='comparison']"
                );


            if (comparisonSection) {

                comparisonSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            } else {

                /*
                 * Fallback:
                 * search for the Compare heading.
                 */

                const headings =
                    document.querySelectorAll(
                        "h1, h2, h3"
                    );

                const compareHeading =
                    Array.from(headings).find(
                        heading =>
                            heading.textContent
                                .toLowerCase()
                                .includes(
                                    "compare cloud providers"
                                )
                    );


                if (compareHeading) {

                    compareHeading.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }

            }

        }, 700);

    }

});