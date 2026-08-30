/* =====================================================
   CLOUDEx - CLOUD EXPLORER
   Explorer + Provider Comparison + Service Comparison
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
       CONFIGURATION
    ================================================= */

    const API_BASE_URL =
        "http://localhost:5000";


    /* =================================================
       DATA
    ================================================= */

    let providers = [];

    let currentFilter = "all";

    let selectedProviders = [];


    /* =================================================
       LOAD PROVIDERS
    ================================================= */

    async function loadProviders() {

        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/cloud/providers`
                );

            if (!response.ok) {

                throw new Error(
                    "Unable to load cloud providers."
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
                "Provider loading error:",
                error
            );

            if (providerGrid) {

                providerGrid.innerHTML = `

                    <div class="empty-state">

                        <i
                            class="fa-solid fa-cloud-arrow-down"
                        ></i>

                        <h3>
                            Unable to load cloud providers
                        </h3>

                        <p>
                            Make sure the CLOUDEx
                            backend is running.
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
                    Array.isArray(
                        provider.categories
                    )
                        ? provider.categories
                        : [];


                const matchesSearch =
                    name.includes(searchTerm) ||
                    description.includes(searchTerm);


                const matchesFilter =
                    currentFilter === "all" ||
                    categories.includes(
                        currentFilter
                    );


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


        if (
            filteredProviders.length === 0
        ) {

            providerGrid.innerHTML = `

                <div class="empty-state">

                    <i
                        class="fa-solid fa-cloud"
                    ></i>

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
                .map(
                    provider =>
                        createProviderCard(
                            provider
                        )
                )
                .join("");


        document
            .querySelectorAll(
                ".view-provider"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const providerId =
                            button.dataset.id;

                        const provider =
                            providers.find(
                                item =>
                                    String(
                                        item.id
                                    ) ===
                                    String(
                                        providerId
                                    )
                            );


                        if (provider) {

                            openProviderModal(
                                provider
                            );

                        }

                    }
                );

            });

    }


    /* =================================================
       PROVIDER CARD
    ================================================= */

    function createProviderCard(
        provider
    ) {

        const icon =
            provider.icon ||
            "fa-cloud";


        const categories =
            Array.isArray(
                provider.categories
            )
                ? provider.categories
                : [];


        const tags =
            categories
                .slice(0, 3)
                .map(
                    category => `

                        <span
                            class="provider-tag"
                        >
                            ${formatCategory(
                                category
                            )}
                        </span>

                    `
                )
                .join("");


        return `

            <article
                class="provider-card"
            >

                <div
                    class="provider-top"
                >

                    <div
                        class="provider-icon"
                    >

                        <i
                            class="fa-solid ${icon}"
                        ></i>

                    </div>


                    ${
                        provider.rating
                            ? `

                                <div
                                    class="provider-rating"
                                >

                                    <i
                                        class="fa-solid fa-star"
                                    ></i>

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


                <p
                    class="provider-description"
                >
                    ${
                        provider.description ||
                        "Cloud services and infrastructure."
                    }
                </p>


                <div
                    class="provider-tags"
                >

                    ${tags}

                </div>


                <button
                    class="view-provider"
                    data-id="${provider.id}"
                >

                    View provider

                    <i
                        class="fa-solid fa-arrow-right"
                    ></i>

                </button>

            </article>

        `;

    }


    /* =================================================
       FORMAT CATEGORY
    ================================================= */

    function formatCategory(
        category
    ) {

        return String(category)
            .replace(
                /-/g,
                " "
            )
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
       FILTERS
    ================================================= */

    filterButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    filterButtons.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                    button.classList.add(
                        "active"
                    );


                    currentFilter =
                        button.dataset.filter ||
                        "all";


                    renderProviders();

                }
            );

        }
    );


    /* =================================================
       PROVIDER SELECTOR
    ================================================= */

    function renderProviderSelector() {

        if (!providerSelector) {

            return;

        }


        providerSelector.innerHTML =
            providers
                .map(
                    provider => `

                        <label
                            class="provider-option"
                            data-id="${provider.id}"
                        >

                            <input
                                type="checkbox"
                                value="${provider.id}"
                            >


                            <div
                                class="provider-icon"
                            >

                                <i
                                    class="fa-solid ${
                                        provider.icon ||
                                        "fa-cloud"
                                    }"
                                ></i>

                            </div>


                            <span
                                class="provider-option-name"
                            >

                                ${provider.name}

                            </span>

                        </label>

                    `
                )
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

    function handleProviderSelection(
        event
    ) {

        const input =
            event.target;

        const id =
            String(
                input.value
            );

        const option =
            input.closest(
                ".provider-option"
            );


        if (input.checked) {

            if (
                selectedProviders.length >= 4
            ) {

                input.checked = false;

                alert(
                    "You can compare up to 4 providers."
                );

                return;

            }


            if (
                !selectedProviders.includes(id)
            ) {

                selectedProviders.push(id);

            }


            option?.classList.add(
                "selected"
            );

        } else {

            selectedProviders =
                selectedProviders.filter(
                    providerId =>
                        providerId !== id
                );


            option?.classList.remove(
                "selected"
            );

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
       MAIN COMPARE BUTTON
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
                                String(
                                    provider.id
                                )
                            )
                    );


                comparisonResults?.classList.remove(
                    "hidden"
                );


                renderComparison(
                    selected
                );


                comparisonResults?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }
        );

    }


    /* =================================================
       COMPLETE COMPARISON
    ================================================= */

    function renderComparison(
        selected
    ) {

        renderQuickVerdict(
            selected
        );


        if (
            typeof window.renderComparisonCharts ===
            "function"
        ) {

            setTimeout(
                () => {

                    window.renderComparisonCharts(
                        selected
                    );

                },
                50
            );

        }


        renderServiceComparison(
            selected
        );

    }


    /* =================================================
       QUICK VERDICT
    ================================================= */

    function renderQuickVerdict(
        selected
    ) {

        if (!comparisonSummary) {

            return;

        }


        if (
            !Array.isArray(selected) ||
            selected.length < 2
        ) {

            comparisonSummary.innerHTML =
                "";

            return;

        }


        function getMetric(
            provider,
            key
        ) {

            const value =
                Number(
                    provider[key]
                );

            return Number.isFinite(value)
                ? value
                : 0;

        }


        function getOverallScore(
            provider
        ) {

            const keys = [

                "beginnerFriendly",
                "affordability",
                "scalability",
                "aiMl",
                "enterprise",
                "globalReach"

            ];


            const total =
                keys.reduce(
                    (sum, key) =>
                        sum +
                        getMetric(
                            provider,
                            key
                        ),
                    0
                );


            return total / keys.length;

        }


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


        const overallWinner =
            selected.reduce(
                (best, provider) => {

                    return getOverallScore(
                        provider
                    ) >
                    getOverallScore(
                        best
                    )
                        ? provider
                        : best;

                },
                selected[0]
            );


        const overallScore =
            getOverallScore(
                overallWinner
            );


        let html = `

            <div
                class="quick-verdict-header"
            >

                <div
                    class="quick-verdict-title"
                >

                    <span
                        class="chart-label"
                    >
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


                <div
                    class="verdict-overall"
                >

                    <span>
                        Best Overall
                    </span>

                    <strong>
                        ${overallWinner.name}
                    </strong>

                    <small>
                        ${overallScore.toFixed(1)} / 10
                    </small>

                </div>

            </div>


            <div
                class="verdict-grid"
            >

        `;


        categories.forEach(
            category => {

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

                    <div
                        class="verdict-card"
                    >

                        <div
                            class="verdict-icon"
                        >

                            <i
                                class="fa-solid ${
                                    category.icon
                                }"
                            ></i>

                        </div>


                        <div
                            class="verdict-content"
                        >

                            <span
                                class="verdict-category"
                            >
                                ${category.title}
                            </span>

                            <strong>
                                ${winner.name}
                            </strong>

                            <span
                                class="verdict-score"
                            >
                                ${value.toFixed(1)} / 10
                            </span>

                        </div>

                    </div>

                `;

            }
        );


        html += `

            </div>

        `;


        comparisonSummary.innerHTML =
            html;

    }


    /* =================================================
       SERVICE HELPERS
    ================================================= */

    function getServiceCategories(
        provider
    ) {

        const services =
            provider.services;


        if (
            services &&
            typeof services === "object" &&
            !Array.isArray(services)
        ) {

            return services;

        }


        return {

            compute: [],
            storage: [],
            database: [],
            ai: []

        };

    }


    function getServiceName(
        service
    ) {

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


    function getServiceDescription(
        service
    ) {

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


    function getServiceType(
        service
    ) {

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


    function getServicePricing(
        service
    ) {

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
       FIND COMPARABLE SERVICES
    ================================================= */

    function normalizeServiceName(
        name
    ) {

        return String(name || "")
            .toLowerCase()
            .replace(
                /[^a-z0-9]+/g,
                " "
            )
            .trim();

    }


    function getComparableServiceKey(
        name,
        category
    ) {

        const normalized =
            normalizeServiceName(
                name
            );


        const aliases = {

            compute: [

                [
                    "ec2",
                    "virtual machines",
                    "compute engine"
                ],

                [
                    "lambda",
                    "azure functions",
                    "cloud functions"
                ],

                [
                    "eks",
                    "aks",
                    "gke"
                ]

            ],


            storage: [

                [
                    "s3",
                    "blob storage",
                    "cloud storage"
                ],

                [
                    "ebs",
                    "managed disks",
                    "persistent disk"
                ],

                [
                    "efs",
                    "azure files",
                    "filestore"
                ]

            ],


            database: [

                [
                    "rds",
                    "sql database",
                    "cloud sql"
                ],

                [
                    "dynamodb",
                    "cosmos db",
                    "firestore"
                ]

            ],


            ai: [

                [
                    "sagemaker",
                    "azure machine learning",
                    "vertex ai"
                ],

                [
                    "bedrock",
                    "azure ai",
                    "vertex ai"
                ]

            ]

        };


        const groups =
            aliases[category] || [];


        for (
            const group of groups
        ) {

            if (
                group.some(
                    alias =>
                        normalized.includes(
                            alias
                        )
                )
            ) {

                return group[0];

            }

        }


        return normalized;

    }


    function getComparableServices(
        selected,
        category
    ) {

        const serviceMap =
            new Map();


        selected.forEach(
            provider => {

                const serviceCategories =
                    getServiceCategories(
                        provider
                    );


                const services =
                    Array.isArray(
                        serviceCategories[
                            category
                        ]
                    )
                        ? serviceCategories[
                            category
                        ]
                        : [];


                services.forEach(
                    service => {

                        const name =
                            getServiceName(
                                service
                            );


                        const key =
                            getComparableServiceKey(
                                name,
                                category
                            );


                        if (
                            !serviceMap.has(
                                key
                            )
                        ) {

                            serviceMap.set(
                                key,
                                []
                            );

                        }


                        serviceMap
                            .get(key)
                            .push({

                                provider,

                                service,

                                name

                            });

                    }
                );

            }
        );


        return Array
            .from(
                serviceMap.entries()
            )
            .filter(
                ([, services]) =>
                    services.length >= 2
            )
            .map(
                ([key, services]) => ({

                    key,

                    services

                })
            );

    }


    /* =================================================
       SERVICE COMPARISON
    ================================================= */

    function renderServiceComparison(
        selected
    ) {

        if (!serviceComparison) {

            return;

        }


        if (
            !selected ||
            selected.length < 2
        ) {

            serviceComparison.innerHTML = `

                <div
                    class="empty-state"
                >

                    <i
                        class="fa-solid fa-table"
                    ></i>

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

            <div
                class="service-comparison-intro"
            >

                <span>
                    SERVICE COMPARISON
                </span>

                <h2>
                    Compare cloud services
                </h2>

                <p>
                    See what each selected provider
                    offers in the same category.
                    You can also compare equivalent
                    services directly.
                </p>

            </div>

        `;


        categories.forEach(
            category => {

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


                selected.forEach(
                    provider => {

                        const serviceCategories =
                            getServiceCategories(
                                provider
                            );


                        const services =
                            Array.isArray(
                                serviceCategories[
                                    category.key
                                ]
                            )
                                ? serviceCategories[
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
                                            ${provider.name}
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


                        if (
                            services.length === 0
                        ) {

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

                            services.forEach(
                                service => {

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
                                                class="service-item-main"
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


                                            <button
                                                type="button"
                                                class="service-details-button"
                                                data-provider-id="${provider.id}"
                                                data-service-name="${encodeURIComponent(
                                                    name
                                                )}"
                                            >

                                                View details

                                                <i
                                                    class="fa-solid fa-arrow-right"
                                                ></i>

                                            </button>

                                        </div>

                                    `;

                                }
                            );

                        }


                        html += `

                                </div>

                            </article>

                        `;

                    }
                );


                html += `

                        </div>

                `;


                const comparableGroups =
                    getComparableServices(
                        selected,
                        category.key
                    );


                if (
                    comparableGroups.length > 0
                ) {

                    html += `

                        <div
                            class="comparable-services-area"
                        >

                            <div
                                class="comparable-services-header"
                            >

                                <span>
                                    DIRECT COMPARISON
                                </span>

                                <h4>
                                    Equivalent services
                                </h4>

                                <p>
                                    Compare services that
                                    perform a similar role
                                    across providers.
                                </p>

                            </div>


                            <div
                                class="comparable-services-list"
                            >

                    `;


                    comparableGroups.forEach(
                        group => {

                            html += `

                                <button
                                    type="button"
                                    class="compare-service-group"
                                    data-category="${category.key}"
                                    data-service-key="${group.key}"
                                >

                                    <span>

                                        ${
                                            group.services
                                                .map(
                                                    item =>
                                                        `${item.provider.name}: ${item.name}`
                                                )
                                                .join(
                                                    " • "
                                                )
                                        }

                                    </span>


                                    <i
                                        class="fa-solid fa-scale-balanced"
                                    ></i>

                                    Compare

                                </button>

                            `;

                        }
                    );


                    html += `

                            </div>

                        </div>

                    `;

                }


                html += `

                    </section>

                `;

            }
        );


        serviceComparison.innerHTML =
            html;


        /* ---------------------------------------------
           VIEW SERVICE DETAILS
        --------------------------------------------- */

        serviceComparison
            .querySelectorAll(
                ".service-details-button"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        event => {

                            event.stopPropagation();


                            openServiceDetails(
                                button.dataset.providerId,
                                button.dataset.serviceName
                            );

                        }
                    );

                }
            );


        /* ---------------------------------------------
           DIRECT SERVICE COMPARISON
        --------------------------------------------- */

        serviceComparison
            .querySelectorAll(
                ".compare-service-group"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const category =
                                button.dataset.category;

                            const serviceKey =
                                button.dataset.serviceKey;


                            const groups =
                                getComparableServices(
                                    selected,
                                    category
                                );


                            const group =
                                groups.find(
                                    item =>
                                        item.key ===
                                        serviceKey
                                );


                            if (group) {

                                renderDirectServiceComparison(
                                    selected,
                                    category,
                                    group
                                );

                            }

                        }
                    );

                }
            );

    }


    /* =================================================
       DIRECT SERVICE COMPARISON
    ================================================= */

    function renderDirectServiceComparison(
        selected,
        category,
        group
    ) {

        const serviceCards =
            group.services
                .map(
                    item => {

                        const service =
                            item.service;


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


                        return `

                            <article
                                class="direct-service-card"
                            >

                                <div
                                    class="direct-service-provider"
                                >

                                    <div
                                        class="service-provider-icon"
                                    >

                                        <i
                                            class="fa-solid ${
                                                item.provider.icon ||
                                                "fa-cloud"
                                            }"
                                        ></i>

                                    </div>


                                    <div>

                                        <span>
                                            ${item.provider.name}
                                        </span>

                                        <h4>
                                            ${item.name}
                                        </h4>

                                    </div>

                                </div>


                                <div
                                    class="direct-service-info"
                                >

                                    <div>

                                        <strong>
                                            What it does
                                        </strong>

                                        <p>
                                            ${
                                                description ||
                                                "Detailed information is available in View details."
                                            }
                                        </p>

                                    </div>


                                    ${
                                        type
                                            ? `

                                                <div>

                                                    <strong>
                                                        Type
                                                    </strong>

                                                    <p>
                                                        ${type}
                                                    </p>

                                                </div>

                                            `
                                            : ""
                                    }


                                    ${
                                        pricing
                                            ? `

                                                <div>

                                                    <strong>
                                                        Pricing
                                                    </strong>

                                                    <p>
                                                        ${pricing}
                                                    </p>

                                                </div>

                                            `
                                            : ""
                                    }

                                </div>


                                <button
                                    type="button"
                                    class="service-details-button"
                                    data-provider-id="${item.provider.id}"
                                    data-service-name="${encodeURIComponent(
                                        item.name
                                    )}"
                                >

                                    View details

                                    <i
                                        class="fa-solid fa-arrow-right"
                                    ></i>

                                </button>

                            </article>

                        `;

                    }
                )
                .join("");


        const conclusion =
            getServiceComparisonConclusion(
                category,
                group.services
            );


        serviceComparison.innerHTML = `

            <div
                class="direct-service-comparison"
            >

                <div
                    class="direct-comparison-header"
                >

                    <span>
                        DIRECT SERVICE COMPARISON
                    </span>

                    <h2>
                        ${
                            group.services
                                .map(
                                    item =>
                                        item.name
                                )
                                .join(
                                    " vs "
                                )
                        }
                    </h2>

                    <p>
                        Side-by-side comparison
                        of equivalent cloud services.
                    </p>

                </div>


                <div
                    class="direct-service-grid"
                >

                    ${serviceCards}

                </div>


                <div
                    class="direct-comparison-conclusion"
                >

                    <div
                        class="direct-conclusion-icon"
                    >

                        <i
                            class="fa-solid fa-lightbulb"
                        ></i>

                    </div>


                    <div>

                        <span>
                            KEY DIFFERENCE
                        </span>

                        <p>
                            ${conclusion}
                        </p>

                    </div>

                </div>


                <button
                    type="button"
                    class="back-to-service-comparison"
                    id="backToServiceComparison"
                >

                    <i
                        class="fa-solid fa-arrow-left"
                    ></i>

                    Back to service comparison

                </button>

            </div>

        `;


        serviceComparison
            .querySelectorAll(
                ".service-details-button"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        event => {

                            event.stopPropagation();


                            openServiceDetails(
                                button.dataset.providerId,
                                button.dataset.serviceName
                            );

                        }
                    );

                }
            );


        const backButton =
            document.getElementById(
                "backToServiceComparison"
            );


        if (backButton) {

            backButton.addEventListener(
                "click",
                () => {

                    renderServiceComparison(
                        selected
                    );

                }
            );

        }

    }
        /* =================================================
       SERVICE COMPARISON CONCLUSION
    ================================================= */

    function getServiceComparisonConclusion(
        category,
        services
    ) {

        const names =
            services.map(
                item =>
                    `${item.provider.name}'s ${item.name}`
            );


        if (
            category === "compute"
        ) {

            return `
                ${names.join(" and ")}
                provide comparable cloud compute
                capabilities. Their main differences
                come from configuration options,
                ecosystem integrations, management
                experience and workload suitability.
            `;

        }


        if (
            category === "storage"
        ) {

            return `
                ${names.join(" and ")}
                provide comparable storage capabilities,
                but their storage models, integrations,
                performance characteristics and pricing
                can differ.
            `;

        }


        if (
            category === "database"
        ) {

            return `
                ${names.join(" and ")}
                provide managed database capabilities,
                but their supported data models,
                scaling behaviour, integrations and
                management experience can differ.
            `;

        }


        if (
            category === "ai"
        ) {

            return `
                ${names.join(" and ")}
                provide AI / ML capabilities, but their
                supported models, tooling, integrations
                and deployment experience can differ.
            `;

        }


        return `
            ${names.join(" and ")}
            provide similar capabilities, but the
            best choice depends on the workload and
            the user's existing cloud ecosystem.
        `;

    }


/* =================================================
   SERVICE INFORMATION EXPLANATIONS
================================================= */

function getPricingExplanation(
    pricingModel
) {

    const pricing =
        String(
            pricingModel || ""
        ).toLowerCase();


    if (
        pricing.includes(
            "pay-as-you-go"
        )
    ) {

        return `
            You pay according to the resources
            you actually use. This is useful when
            your workload changes over time.
        `;

    }


    if (
        pricing.includes(
            "consumption"
        )
    ) {

        return `
            You are charged mainly according to
            the amount of resources or requests
            your application actually consumes.
        `;

    }


    if (
        pricing.includes(
            "usage"
        )
    ) {

        return `
            The cost depends on how much you use
            the service, such as requests,
            processing, storage or data transfer.
        `;

    }


    if (
        pricing.includes(
            "provisioned"
        )
    ) {

        return `
            You generally pay for capacity that
            you reserve or provision, even if you
            do not use all of it.
        `;

    }


    if (
        pricing.includes(
            "request"
        )
    ) {

        return `
            Charges are influenced by the number
            of requests or operations performed
            by your application.
        `;

    }


    return `
        Pricing depends on the resources and
        usage associated with this service.
        Check the provider's pricing for the
        exact cost.
    `;

}


/* =================================================
   SERVICE TYPE EXPLANATIONS
================================================= */

function getTypeExplanation(
    type
) {

    const value =
        String(
            type || ""
        ).toLowerCase();


    if (
        value.includes(
            "virtual machine"
        )
    ) {

        return `
            A virtual machine is a software-based
            computer running in the cloud. You get
            control over the operating system,
            computing resources and installed software.
        `;

    }


    if (
        value.includes(
            "serverless"
        )
    ) {

        return `
            Serverless means you do not have to
            manage the underlying servers yourself.
            The cloud provider handles the
            infrastructure while you focus mainly
            on your application code.
        `;

    }


    if (
        value.includes(
            "container"
        )
    ) {

        return `
            Containers package an application
            together with its dependencies so it
            can run consistently across different
            environments.
        `;

    }


    if (
        value.includes(
            "object storage"
        )
    ) {

        return `
            Object storage is designed for storing
            files and large amounts of unstructured
            data such as images, videos, backups
            and documents.
        `;

    }


    if (
        value.includes(
            "block storage"
        )
    ) {

        return `
            Block storage provides storage volumes
            that can be attached to computing
            resources and used like disks.
        `;

    }


    if (
    value.includes("nosql")
) {

    return `
        A NoSQL database uses flexible data
        models and is useful for applications
        handling large or changing datasets.
    `;

}


if (
    value.includes("sql")
) {

    return `
        A SQL database stores structured data
        in tables and supports relationships
        and SQL-based queries.
    `;

}


    if (
        value.includes("ai") ||
        value.includes(
            "machine learning"
        )
    ) {

        return `
            This service provides tools or
            infrastructure for building, training,
            deploying or using AI and machine
            learning applications.
        `;

    }


    return `
        This describes the main category or
        technology used by the service.
    `;

}


/* =================================================
   SERVICE DETAILS MODAL
================================================= */

async function openServiceDetails(
    providerId,
    encodedServiceName
) {

    if (
        !modal ||
        !modalContent
    ) {

        return;

    }


    const serviceName =
        decodeURIComponent(
            encodedServiceName
        );


    modalContent.innerHTML = `

        <div
            class="service-details-loading"
        >

            <i
                class="fa-solid fa-spinner fa-spin"
            ></i>

            <p>
                Loading service information...
            </p>

        </div>

    `;


    modal.classList.add(
        "show"
    );


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/services/${
                    encodeURIComponent(
                        providerId
                    )
                }/${
                    encodeURIComponent(
                        serviceName
                    )
                }`
            );


        if (
            !response.ok
        ) {

            throw new Error(
                "Unable to load service details."
            );

        }


        const data =
            await response.json();


        if (
            !data.success ||
            !data.service
        ) {

            throw new Error(
                "Service information unavailable."
            );

        }


        const service =
            data.service;


        const advantages =
            Array.isArray(
                service.advantages
            )
                ? service.advantages
                : [];


        const limitations =
            Array.isArray(
                service.limitations
            )
                ? service.limitations
                : [];


        const typeExplanation =
            getTypeExplanation(
                service.type
            );


        const pricingExplanation =
            getPricingExplanation(
                service.pricingModel
            );


        modalContent.innerHTML = `

            <div
                class="service-details-header"
            >

                <div
                    class="service-details-icon"
                >

                    <i
                        class="fa-solid fa-cloud"
                    ></i>

                </div>


                <div>

                    <span>
                        SERVICE INFORMATION
                    </span>

                    <h2>
                        ${serviceName}
                    </h2>

                </div>

            </div>


            <!-- WHAT IT DOES -->

            <div
                class="service-detail-section"
            >

                <h3>

                    <i
                        class="fa-solid fa-circle-info"
                    ></i>

                    What does it do?

                </h3>


                <p>
                    ${
                        service.description ||
                        "Detailed information is not available."
                    }
                </p>

            </div>


            <!-- BEST FOR -->

            <div
                class="service-detail-section"
            >

                <h3>

                    <i
                        class="fa-solid fa-bullseye"
                    ></i>

                    Best for

                </h3>


                <p>
                    ${
                        service.bestFor ||
                        "Information not available."
                    }
                </p>

            </div>


            <!-- SERVICE TYPE -->

            ${
                service.type
                    ? `

                        <div
                            class="service-detail-section"
                        >

                            <h3>

                                <i
                                    class="fa-solid fa-layer-group"
                                ></i>

                                What does
                                "${service.type}"
                                mean?

                            </h3>


                            <div
                                class="pricing-model-name"
                            >
                                ${service.type}
                            </div>


                            <p>
                                ${typeExplanation}
                            </p>

                        </div>

                    `
                    : ""
            }


            <!-- PRICING -->

            ${
                service.pricingModel
                    ? `

                        <div
                            class="service-detail-section"
                        >

                            <h3>

                                <i
                                    class="fa-solid fa-tag"
                                ></i>

                                Understanding the
                                pricing model

                            </h3>


                            <div
                                class="pricing-model-name"
                            >
                                ${service.pricingModel}
                            </div>


                            <p>
                                ${pricingExplanation}
                            </p>

                        </div>

                    `
                    : ""
            }


            <!-- ADVANTAGES -->

            ${
                advantages.length
                    ? `

                        <div
                            class="service-detail-section"
                        >

                            <h3>

                                <i
                                    class="fa-solid fa-circle-check"
                                ></i>

                                Advantages

                            </h3>


                            <ul>

                                ${
                                    advantages
                                        .map(
                                            item => `
                                                <li>
                                                    ${item}
                                                </li>
                                            `
                                        )
                                        .join("")
                                }

                            </ul>

                        </div>

                    `
                    : ""
            }


            <!-- LIMITATIONS -->

            ${
                limitations.length
                    ? `

                        <div
                            class="service-detail-section"
                        >

                            <h3>

                                <i
                                    class="fa-solid fa-circle-exclamation"
                                ></i>

                                Limitations

                            </h3>


                            <ul>

                                ${
                                    limitations
                                        .map(
                                            item => `
                                                <li>
                                                    ${item}
                                                </li>
                                            `
                                        )
                                        .join("")
                                }

                            </ul>

                        </div>

                    `
                    : ""
            }


            <!-- QUICK UNDERSTANDING -->

            <div
                class="service-information-note"
            >

                <i
                    class="fa-solid fa-lightbulb"
                ></i>


                <div>

                    <strong>
                        Quick understanding
                    </strong>


                    <p>
                        This information explains what
                        the service is designed for.
                        The best choice depends on your
                        workload, requirements and
                        existing cloud environment.
                    </p>

                </div>

            </div>

        `;


    } catch (error) {

        console.error(
            "Service details error:",
            error
        );


        modalContent.innerHTML = `

            <div
                class="empty-state"
            >

                <i
                    class="fa-solid fa-circle-exclamation"
                ></i>

                <h3>
                    Unable to load service details
                </h3>

                <p>
                    Make sure the CLOUDEx
                    backend is running.
                </p>

            </div>

        `;

    }

}
    /* =================================================
       PROVIDER DETAILS MODAL
    ================================================= */

    function openProviderModal(
        provider
    ) {

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


        Object.keys(
            services
        ).forEach(
            category => {

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

            }
        );


        if (
            serviceList.length === 0 &&
            Array.isArray(
                provider.services
            )
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

                <div
                    class="modal-section"
                >

                    <h3>
                        Why consider it?
                    </h3>


                    <div
                        class="modal-points"
                    >

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

            <div
                class="modal-header"
            >

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


            <div
                class="modal-section"
            >

                <h3>
                    Popular services
                </h3>


                <div
                    class="modal-list"
                >

                    ${serviceHTML}

                </div>

            </div>


            ${strengthsHTML}

        `;


        modal.classList.add(
            "show"
        );

    }


    /* =================================================
       MODAL CONTROLS
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


/* =====================================================
   AI ADVISOR → CLOUD EXPLORER
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const providerFromAI =
            params.get(
                "provider"
            );


        const compareFromAI =
            params.get(
                "compare"
            );


        /* ---------------------------------------------
           FIND PROVIDER CHECKBOX
        --------------------------------------------- */

        function findProviderCheckbox(
            providerId
        ) {

            if (!providerId) {

                return null;

            }


            const checkboxes =
                document.querySelectorAll(
                    'input[type="checkbox"]'
                );


            return Array
                .from(
                    checkboxes
                )
                .find(
                    checkbox => {

                        const value =
                            (
                                checkbox.value ||
                                ""
                            ).toLowerCase();


                        const dataProvider =
                            (
                                checkbox.dataset.provider ||
                                ""
                            ).toLowerCase();


                        const id =
                            (
                                checkbox.id ||
                                ""
                            ).toLowerCase();


                        return (

                            value ===
                            providerId.toLowerCase()

                            ||

                            dataProvider ===
                            providerId.toLowerCase()

                            ||

                            id.includes(
                                providerId.toLowerCase()
                            )

                        );

                    }
                );

        }


        /* ---------------------------------------------
           EXPLORE PROVIDER
        --------------------------------------------- */

        if (
            providerFromAI
        ) {

            setTimeout(
                () => {

                    const providerCards =
                        document.querySelectorAll(
                            "[data-provider]"
                        );


                    const card =
                        Array
                            .from(
                                providerCards
                            )
                            .find(
                                element =>
                                    (
                                        element.dataset.provider ||
                                        ""
                                    ).toLowerCase() ===
                                    providerFromAI.toLowerCase()
                            );


                    if (card) {

                        card.scrollIntoView({
                            behavior:
                                "smooth",
                            block:
                                "center"
                        });

                    }

                },
                500
            );

        }


        /* ---------------------------------------------
           COMPARE PROVIDER
        --------------------------------------------- */

        if (
            compareFromAI
        ) {

            setTimeout(
                () => {

                    const checkbox =
                        findProviderCheckbox(
                            compareFromAI
                        );


                    if (checkbox) {

                        if (
                            !checkbox.checked
                        ) {

                            checkbox.click();

                        }

                    } else {

                        console.warn(
                            "Could not find comparison checkbox for:",
                            compareFromAI
                        );

                    }


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


                    if (
                        comparisonSection
                    ) {

                        comparisonSection.scrollIntoView({
                            behavior:
                                "smooth",
                            block:
                                "start"
                        });

                    }

                },
                700
            );

        }

    }
);