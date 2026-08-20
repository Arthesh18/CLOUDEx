/* =====================================================
   CLOUDEx - COMPARISON CHARTS
   ===================================================== */

let comparisonCharts = {};


/* =====================================================
   COLORS
   ===================================================== */

const chartColors = [
    "#5b5ce2",
    "#20a47a",
    "#e49a2f",
    "#e45d75",
    "#8b5cf6",
    "#06b6d4"
];


/* =====================================================
   DESTROY OLD CHARTS
   ===================================================== */

function destroyCharts() {

    Object.values(comparisonCharts).forEach(chart => {

        if (chart) {
            chart.destroy();
        }

    });

    comparisonCharts = {};
}


/* =====================================================
   GET SCORE
   ===================================================== */

function getScore(provider, key) {

    const score = Number(provider[key]);

    return Number.isFinite(score) ? score : 0;
}


/* =====================================================
   PROVIDER NAME
   ===================================================== */

function getProviderName(provider) {

    return (
        provider.shortName ||
        provider.name ||
        "Provider"
    );

}


/* =====================================================
   CREATE BAR CHART
   ===================================================== */

function createBarChart(
    canvasId,
    providers,
    scoreKey,
    chartTitle
) {

    const canvas = document.getElementById(canvasId);

    if (!canvas) {
        return;
    }

    const ctx = canvas.getContext("2d");

    comparisonCharts[canvasId] = new Chart(ctx, {

        type: "bar",

        data: {

            labels: providers.map(getProviderName),

            datasets: [

                {
                    label: chartTitle,

                    data: providers.map(provider =>
                        getScore(provider, scoreKey)
                    ),

                    backgroundColor: providers.map(
                        (_, index) =>
                            chartColors[
                                index % chartColors.length
                            ]
                    ),

                    borderRadius: 8,

                    borderSkipped: false

                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            scales: {

                y: {

                    beginAtZero: true,

                    max: 10,

                    ticks: {

                        stepSize: 1,

                        callback: value =>
                            Number(value).toFixed(0)

                    }

                },

                x: {

                    grid: {
                        display: false
                    }

                }

            },

            plugins: {

                legend: {
                    display: false
                },

                tooltip: {

                    callbacks: {

                        label: function(context) {

                            return ` Score: ${Number(
                                context.raw
                            ).toFixed(1)} / 10`;

                        }

                    }

                }

            }

        }

    });

}


/* =====================================================
   AFFORDABILITY
   ===================================================== */

function getPriceScore(provider) {

    /*
       NEW DATA:

       If cloudData.js contains:

       affordability: 7.4

       we use that directly.

       This gives us decimal values.
    */

    if (
        provider.affordability !== undefined &&
        Number.isFinite(Number(provider.affordability))
    ) {

        return Number(provider.affordability);

    }


    /*
       BACKUP FOR OLD DATA
    */

    const pricing =
        String(
            provider.pricingLevel || ""
        ).toLowerCase();


    if (pricing === "simple") {
        return 8.8;
    }

    if (pricing === "competitive") {
        return 7.9;
    }

    if (pricing === "flexible") {
        return 7.3;
    }

    return 6.5;

}


/* =====================================================
   AFFORDABILITY BAR CHART
   ===================================================== */

function createPriceChart(providers) {

    const canvas =
        document.getElementById("priceChart");

    if (!canvas) {
        return;
    }

    const ctx =
        canvas.getContext("2d");


    comparisonCharts.priceChart =
        new Chart(ctx, {

            type: "bar",

            data: {

                labels:
                    providers.map(getProviderName),

                datasets: [

                    {

                        label: "Affordability",

                        data:
                            providers.map(
                                getPriceScore
                            ),

                        backgroundColor:
                            providers.map(
                                (_, index) =>
                                    chartColors[
                                        index %
                                        chartColors.length
                                    ]
                            ),

                        borderRadius: 8,

                        borderSkipped: false

                    }

                ]

            },


            options: {

                responsive: true,

                maintainAspectRatio: false,


                scales: {

                    y: {

                        beginAtZero: true,

                        max: 10,

                        ticks: {

                            stepSize: 1

                        }

                    },

                    x: {

                        grid: {
                            display: false
                        }

                    }

                },


                plugins: {

                    legend: {
                        display: false
                    },

                    tooltip: {

                        callbacks: {

                            label: function(context) {

                                return ` Affordability: ${
                                    Number(context.raw).toFixed(1)
                                } / 10`;

                            }

                        }

                    }

                }

            }

        });

}


/* =====================================================
   OVERALL RADAR CHART
   ===================================================== */

function createRadarChart(providers) {

    const canvas =
        document.getElementById("overallChart");

    if (!canvas) {
        return;
    }

    const ctx =
        canvas.getContext("2d");


    const labels = [

        "Beginner Friendly",
        "Affordability",
        "Scalability",
        "AI / ML",
        "Enterprise",
        "Global Reach"

    ];


    const datasets =
        providers.map(
            (provider, index) => {

                const color =
                    chartColors[
                        index %
                        chartColors.length
                    ];


                return {

                    label:
                        getProviderName(provider),

                    data: [

                        getScore(
                            provider,
                            "beginnerFriendly"
                        ),

                        getPriceScore(
                            provider
                        ),

                        getScore(
                            provider,
                            "scalability"
                        ),

                        getScore(
                            provider,
                            "aiMl"
                        ),

                        getScore(
                            provider,
                            "enterprise"
                        ),

                        getScore(
                            provider,
                            "globalReach"
                        )

                    ],

                    borderColor: color,

                    backgroundColor:
                        "transparent",

                    pointBackgroundColor:
                        color,

                    pointBorderColor:
                        color,

                    pointRadius: 4,

                    pointHoverRadius: 6,

                    borderWidth: 3

                };

            }
        );


    comparisonCharts.overallChart =
        new Chart(ctx, {

            type: "radar",

            data: {

                labels: labels,

                datasets: datasets

            },


            options: {

                responsive: true,

                maintainAspectRatio: false,


                scales: {

                    r: {

                        min: 0,

                        max: 10,

                        ticks: {

                            stepSize: 2

                        },

                        pointLabels: {

                            font: {

                                size: 12

                            }

                        }

                    }

                },


                plugins: {

                    legend: {

                        position: "bottom"

                    },

                    tooltip: {

                        callbacks: {

                            label: function(context) {

                                return `${
                                    context.dataset.label
                                }: ${
                                    Number(context.raw).toFixed(1)
                                } / 10`;

                            }

                        }

                    }

                }

            }

        });

}


/* =====================================================
   RENDER ALL CHARTS
   ===================================================== */

function renderComparisonCharts(providers) {

    if (
        !providers ||
        providers.length < 2
    ) {

        return;

    }


    destroyCharts();


    /* =========================================
       1. BEGINNER FRIENDLY
    ========================================= */

    createBarChart(
        "beginnerChart",
        providers,
        "beginnerFriendly",
        "Beginner Friendly"
    );


    /* =========================================
       2. AFFORDABILITY
    ========================================= */

    createPriceChart(providers);


    /* =========================================
       3. SCALABILITY
    ========================================= */

    createBarChart(
        "scalabilityChart",
        providers,
        "scalability",
        "Scalability"
    );


    /* =========================================
       4. AI / ML
    ========================================= */

    createBarChart(
        "aiChart",
        providers,
        "aiMl",
        "AI / ML"
    );


    /* =========================================
       5. ENTERPRISE
    ========================================= */

    createBarChart(
        "enterpriseChart",
        providers,
        "enterprise",
        "Enterprise"
    );


    /* =========================================
       6. GLOBAL REACH
    ========================================= */

    createBarChart(
        "globalChart",
        providers,
        "globalReach",
        "Global Reach"
    );


    /* =========================================
       7. OVERALL RADAR
    ========================================= */

    createRadarChart(providers);

}


/* =====================================================
   EXPORT
   ===================================================== */

window.renderComparisonCharts =
    renderComparisonCharts;