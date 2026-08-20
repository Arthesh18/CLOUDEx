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
                await fetch("/api/cloud/providers");

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

                const description =
                    String(
                        provider.description || ""
                    ).toLowerCase();

                const categories =
                    Array.isArray(provider.categories)
                        ? provider.categories
                        : [];

                const matchesSearch =
                    name.includes(searchTerm) ||
                    description.includes(searchTerm);

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
            <article class="provider-card">

                <div class="provider-top">

                    <div class="provider-icon">
                        <i class="fa-solid ${icon}"></i>
                    </div>

                    ${
                        provider.rating
                            ? `
                                <div class="provider-rating">
                                    <i class="fa-solid fa-star"></i>
                                    ${provider.rating}
                                </div>
                            `
                            : ""
                    }

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
       SERVICE COMPARISON
    ================================================= */

    function renderServiceComparison(selected) {

        if (!serviceComparison) {
            return;
        }


        if (
            !selected ||
            selected.length < 2
        ) {

            serviceComparison.innerHTML = `

                <div class="empty-state">

                    <i class="fa-solid fa-table"></i>

                    <h3>
                        Select providers to compare
                    </h3>

                    <p>
                        Choose at least two
                        cloud providers.
                    </p>

                </div>

            `;

            return;

        }


        const categories = [

            {
                key: "compute",
                title: "Compute",
                icon: "fa-server",
                description:
                    "Virtual machines, containers and serverless computing."
            },

            {
                key: "storage",
                title: "Storage",
                icon: "fa-hard-drive",
                description:
                    "Object, block and file storage services."
            },

            {
                key: "database",
                title: "Database",
                icon: "fa-database",
                description:
                    "Managed SQL and NoSQL database services."
            },

            {
                key: "ai",
                title: "AI / ML",
                icon: "fa-brain",
                description:
                    "Artificial intelligence and machine learning services."
            }

        ];


        let html = `

            <div class="service-comparison-intro">

                <span>
                    SERVICE COMPARISON
                </span>

                <h2>
                    Compare cloud services
                </h2>

                <p>
                    See what each selected provider
                    offers in the same service category.
                </p>

            </div>

        `;


        categories.forEach(category => {

            html += `

                <section
                    class="service-category"
                >

                    <div
                        class="service-category-title"
                    >

                        <div
                            class="service-category-icon"
                        >

                            <i
                                class="fa-solid ${
                                    category.icon
                                }"
                            ></i>

                        </div>


                        <div>

                            <span>
                                SERVICE CATEGORY
                            </span>

                            <h3>
                                ${category.title}
                            </h3>

                            <p>
                                ${category.description}
                            </p>

                        </div>

                    </div>


                    <div
                        class="service-comparison-grid"
                    >

            `;


            selected.forEach(provider => {

                const categoriesData =
                    getServiceCategories(
                        provider
                    );


                const services =
                    Array.isArray(
                        categoriesData[
                            category.key
                        ]
                    )
                        ? categoriesData[
                            category.key
                        ]
                        : [];


                html += `

                    <article
                        class="service-provider-card"
                    >

                        <div
                            class="service-provider-header"
                        >

                            <div
                                class="service-provider-icon"
                            >

                                <i
                                    class="fa-solid ${
                                        provider.icon ||
                                        "fa-cloud"
                                    }"
                                ></i>

                            </div>


                            <div>

                                <h4>
                                    ${
                                        provider.name ||
                                        "Provider"
                                    }
                                </h4>

                                <span>
                                    ${services.length}
                                    service${
                                        services.length !== 1
                                            ? "s"
                                            : ""
                                    }
                                </span>

                            </div>

                        </div>


                        <div
                            class="service-items"
                        >

                `;


                if (services.length === 0) {

                    html += `

                        <div
                            class="service-unavailable"
                        >

                            <i
                                class="fa-solid fa-circle-info"
                            ></i>

                            No information
                            available

                        </div>

                    `;

                } else {

                    services.forEach(service => {

                        const name =
                            getServiceName(
                                service
                            );

                        const description =
                            getServiceDescription(
                                service
                            );

                        const type =
                            getServiceType(
                                service
                            );

                        const pricing =
                            getServicePricing(
                                service
                            );


                        html += `

                            <div
                                class="service-item"
                            >

                                <div
                                    class="service-item-name"
                                >

                                    <i
                                        class="fa-solid fa-check"
                                    ></i>

                                    <strong>
                                        ${name}
                                    </strong>

                                </div>


                                ${
                                    type
                                        ? `
                                            <span
                                                class="service-type"
                                            >
                                                ${type}
                                            </span>
                                        `
                                        : ""
                                }


                                ${
                                    description
                                        ? `
                                            <p>
                                                ${description}
                                            </p>
                                        `
                                        : ""
                                }


                                ${
                                    pricing
                                        ? `
                                            <small>

                                                <i
                                                    class="fa-solid fa-tag"
                                                ></i>

                                                ${pricing}

                                            </small>
                                        `
                                        : ""
                                }

                            </div>

                        `;

                    });

                }


                html += `

                        </div>

                    </article>

                `;

            });


            html += `

                    </div>

                </section>

            `;

        });


        serviceComparison.innerHTML =
            html;

    }


    /* =================================================
       PROVIDER DETAILS MODAL
    ================================================= */

    function openProviderModal(provider) {

        if (
            !modal ||
            !modalContent
        ) {
            return;
        }


        const services =
            getServiceCategories(
                provider
            );


        let serviceList = [];


        /* ---------------------------------------------
           NEW SERVICE STRUCTURE
        --------------------------------------------- */

        if (
            services &&
            typeof services === "object" &&
            !Array.isArray(services)
        ) {

            Object.keys(services)
                .forEach(category => {

                    const categoryServices =
                        Array.isArray(
                            services[category]
                        )
                            ? services[category]
                            : [];


                    categoryServices.forEach(
                        service => {

                            serviceList.push(
                                getServiceName(
                                    service
                                )
                            );

                        }
                    );

                });

        }


        /* ---------------------------------------------
           OLD SERVICE STRUCTURE
        --------------------------------------------- */

        if (
            serviceList.length === 0 &&
            Array.isArray(provider.services)
        ) {

            serviceList =
                provider.services;

        }


        const serviceHTML =
            serviceList.length
                ? serviceList
                    .map(
                        service => `

                            <span
                                class="modal-service"
                            >
                                ${service}
                            </span>

                        `
                    )
                    .join("")
                : `

                    <span
                        class="modal-service"
                    >
                        Information coming soon
                    </span>

                `;


        let strengthsHTML =
            "";


        if (
            Array.isArray(
                provider.strengths
            ) &&
            provider.strengths.length > 0
        ) {

            strengthsHTML = `

                <div class="modal-section">

                    <h3>
                        Why consider it?
                    </h3>


                    <div class="modal-points">

                        ${
                            provider.strengths
                                .map(
                                    strength => `

                                        <div
                                            class="modal-point"
                                        >

                                            <strong>
                                                ${
                                                    strength.title ||
                                                    strength
                                                }
                                            </strong>

                                            
                                            <span>
                                                ${
                                                    strength.description ||
                                                    ""
                                                }
                                            </span>

                                        </div>

                                    `
                                )
                                .join("")
                        }

                    </div>

                </div>

            `;

        }


        modalContent.innerHTML = `

            <div class="modal-header">

                <div
                    class="modal-provider-icon"
                >

                    <i
                        class="fa-solid ${
                            provider.icon ||
                            "fa-cloud"
                        }"
                    ></i>

                </div>


                <h2>
                    ${
                        provider.name ||
                        "Cloud Provider"
                    }
                </h2>


                <p>
                    ${
                        provider.description ||
                        ""
                    }
                </p>

            </div>


            <div class="modal-section">

                <h3>
                    Popular services
                </h3>


                <div class="modal-list">

                    ${serviceHTML}

                </div>

            </div>


            ${strengthsHTML}

        `;


        modal.classList.add("show");

    }


    /* =================================================
       CLOSE MODAL
    ================================================= */

    if (
        modalClose &&
        modal
    ) {

        modalClose.addEventListener(
            "click",
            () => {

                modal.classList.remove(
                    "show"
                );

            }
        );


        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
                ) {

                    modal.classList.remove(
                        "show"
                    );

                }

            }
        );

    }


    /* =================================================
       ESCAPE KEY
    ================================================= */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                modal
            ) {

                modal.classList.remove(
                    "show"
                );

            }

        }
    );


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