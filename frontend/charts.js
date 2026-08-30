/* =====================================================
   CLOUDEx - COMPARISON CHARTS
   Native Canvas Version
   No external Chart.js dependency
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
   GET SCORE
   ===================================================== */

function getScore(provider, key) {

    const score =
        Number(
            provider?.[key]
        );

    return Number.isFinite(score)
        ? score
        : 0;

}


/* =====================================================
   PROVIDER NAME
   ===================================================== */

function getProviderName(provider) {

    return (
        provider?.shortName ||
        provider?.name ||
        "Provider"
    );

}


/* =====================================================
   AFFORDABILITY SCORE
   ===================================================== */

function getPriceScore(provider) {

    /*
     * New cloudData.js format:
     *
     * affordability: 7.4
     */

    if (
        provider?.affordability !== undefined &&
        Number.isFinite(
            Number(
                provider.affordability
            )
        )
    ) {

        return Number(
            provider.affordability
        );

    }


    /*
     * Backup for older data.
     */

    const pricing =
        String(
            provider?.pricingLevel || ""
        ).toLowerCase();


    if (
        pricing === "simple"
    ) {

        return 8.8;

    }


    if (
        pricing === "competitive"
    ) {

        return 7.9;

    }


    if (
        pricing === "flexible"
    ) {

        return 7.3;

    }


    return 6.5;

}


/* =====================================================
   GET CANVAS
   ===================================================== */

function getCanvas(canvasId) {

    const canvas =
        document.getElementById(
            canvasId
        );


    if (!canvas) {

        console.warn(
            `CLOUDEx: #${canvasId} canvas not found.`
        );

        return null;

    }


    return canvas;

}


/* =====================================================
   DESTROY OLD CANVAS DRAWING
   ===================================================== */

function destroyCanvas(canvas) {

    if (!canvas) {
        return;
    }


    const ctx =
        canvas.getContext(
            "2d"
        );


    if (!ctx) {
        return;
    }


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

}


/* =====================================================
   PREPARE CANVAS
   ===================================================== */

function prepareCanvas(canvas) {

    if (!canvas) {
        return null;
    }


    const rect =
        canvas.getBoundingClientRect();


    const width =
        Math.max(
            rect.width,
            300
        );


    const height =
        Math.max(
            rect.height,
            250
        );


    const dpr =
        window.devicePixelRatio ||
        1;


    canvas.width =
        Math.round(
            width * dpr
        );


    canvas.height =
        Math.round(
            height * dpr
        );


    canvas.style.width =
        `${width}px`;


    canvas.style.height =
        `${height}px`;


    const ctx =
        canvas.getContext(
            "2d"
        );


    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    return {
        ctx,
        width,
        height
    };

}


/* =====================================================
   TEXT HELPER
   ===================================================== */

function drawText(
    ctx,
    text,
    x,
    y,
    options = {}
) {

    ctx.save();


    ctx.fillStyle =
        options.color ||
        "#172033";


    ctx.font =
        options.font ||
        "13px Arial";


    ctx.textAlign =
        options.align ||
        "center";


    ctx.textBaseline =
        options.baseline ||
        "middle";


    ctx.fillText(
        String(text),
        x,
        y
    );


    ctx.restore();

}


/* =====================================================
   ROUND RECTANGLE
   ===================================================== */

function roundRect(
    ctx,
    x,
    y,
    width,
    height,
    radius
) {

    const r =
        Math.min(
            radius,
            width / 2,
            height / 2
        );


    ctx.beginPath();


    ctx.moveTo(
        x + r,
        y
    );


    ctx.arcTo(
        x + width,
        y,
        x + width,
        y + height,
        r
    );


    ctx.arcTo(
        x + width,
        y + height,
        x,
        y + height,
        r
    );


    ctx.arcTo(
        x,
        y + height,
        x,
        y,
        r
    );


    ctx.arcTo(
        x,
        y,
        x + width,
        y,
        r
    );


    ctx.closePath();

}


/* =====================================================
   DRAW GRID
   ===================================================== */

function drawGrid(
    ctx,
    left,
    top,
    chartWidth,
    chartHeight
) {

    ctx.save();


    ctx.strokeStyle =
        "#e9eaf4";


    ctx.lineWidth =
        1;


    ctx.font =
        "11px Arial";


    ctx.fillStyle =
        "#7b8195";


    ctx.textAlign =
        "right";


    ctx.textBaseline =
        "middle";


    for (
        let value = 0;
        value <= 10;
        value++
    ) {

        const y =
            top +
            chartHeight -
            (
                value / 10
            ) *
            chartHeight;


        ctx.beginPath();


        ctx.moveTo(
            left,
            y
        );


        ctx.lineTo(
            left + chartWidth,
            y
        );


        ctx.stroke();


        ctx.fillText(
            value.toString(),
            left - 10,
            y
        );

    }


    ctx.restore();

}


/* =====================================================
   DRAW BAR CHART
   ===================================================== */

function createBarChart(
    canvasId,
    providers,
    scoreKey,
    chartTitle
) {

    const canvas =
        getCanvas(
            canvasId
        );


    if (!canvas) {
        return;
    }


    if (
        !Array.isArray(
            providers
        ) ||
        providers.length === 0
    ) {

        return;
    }


    const prepared =
        prepareCanvas(
            canvas
        );


    if (!prepared) {
        return;
    }


    const {
        ctx,
        width,
        height
    } = prepared;


    const left =
        55;


    const right =
        20;


    const top =
        20;


    const bottom =
        55;


    const chartWidth =
        width -
        left -
        right;


    const chartHeight =
        height -
        top -
        bottom;


    drawGrid(
        ctx,
        left,
        top,
        chartWidth,
        chartHeight
    );


    const count =
        providers.length;


    const gap =
        Math.min(
            28,
            chartWidth /
            (
                count * 3
            )
        );


    const barWidth =
        (
            chartWidth -
            gap *
            (
                count + 1
            )
        ) /
        count;


    providers.forEach(
        (
            provider,
            index
        ) => {

            const score =
                Math.max(
                    0,
                    Math.min(
                        10,
                        getScore(
                            provider,
                            scoreKey
                        )
                    )
                );


            const barHeight =
                (
                    score / 10
                ) *
                chartHeight;


            const x =
                left +
                gap +
                index *
                (
                    barWidth +
                    gap
                );


            const y =
                top +
                chartHeight -
                barHeight;


            ctx.save();


            ctx.fillStyle =
                chartColors[
                    index %
                    chartColors.length
                ];


            roundRect(
                ctx,
                x,
                y,
                barWidth,
                barHeight,
                8
            );


            ctx.fill();


            ctx.restore();


            drawText(
                ctx,
                score.toFixed(1),
                x +
                barWidth / 2,
                Math.max(
                    y - 12,
                    10
                ),
                {
                    color:
                        "#172033",

                    font:
                        "bold 12px Arial"
                }
            );


            let name =
                getProviderName(
                    provider
                );


            /*
             * Keep labels readable.
             */

            if (
                name.length > 14
            ) {

                name =
                    name.substring(
                        0,
                        13
                    ) +
                    "…";

            }


            drawText(
                ctx,
                name,
                x +
                barWidth / 2,
                top +
                chartHeight +
                25,
                {
                    color:
                        "#596176",

                    font:
                        "12px Arial"
                }
            );

        }
    );


    /*
     * Store canvas information so the
     * chart can be redrawn on resize.
     */

    comparisonCharts[
        canvasId
    ] = {

        type:
            "bar",

        providers,

        scoreKey,

        chartTitle

    };

}


/* =====================================================
   AFFORDABILITY BAR CHART
   ===================================================== */

function createPriceChart(
    providers
) {

    const canvas =
        getCanvas(
            "priceChart"
        );


    if (!canvas) {
        return;
    }


    if (
        !Array.isArray(
            providers
        ) ||
        providers.length === 0
    ) {

        return;
    }


    const prepared =
        prepareCanvas(
            canvas
        );


    if (!prepared) {
        return;
    }


    const {
        ctx,
        width,
        height
    } = prepared;


    const left =
        55;


    const right =
        20;


    const top =
        20;


    const bottom =
        55;


    const chartWidth =
        width -
        left -
        right;


    const chartHeight =
        height -
        top -
        bottom;


    drawGrid(
        ctx,
        left,
        top,
        chartWidth,
        chartHeight
    );


    const count =
        providers.length;


    const gap =
        Math.min(
            28,
            chartWidth /
            (
                count * 3
            )
        );


    const barWidth =
        (
            chartWidth -
            gap *
            (
                count + 1
            )
        ) /
        count;


    providers.forEach(
        (
            provider,
            index
        ) => {

            const score =
                Math.max(
                    0,
                    Math.min(
                        10,
                        getPriceScore(
                            provider
                        )
                    )
                );


            const barHeight =
                (
                    score / 10
                ) *
                chartHeight;


            const x =
                left +
                gap +
                index *
                (
                    barWidth +
                    gap
                );


            const y =
                top +
                chartHeight -
                barHeight;


            ctx.save();


            ctx.fillStyle =
                chartColors[
                    index %
                    chartColors.length
                ];


            roundRect(
                ctx,
                x,
                y,
                barWidth,
                barHeight,
                8
            );


            ctx.fill();


            ctx.restore();


            drawText(
                ctx,
                score.toFixed(1),
                x +
                barWidth / 2,
                Math.max(
                    y - 12,
                    10
                ),
                {
                    color:
                        "#172033",

                    font:
                        "bold 12px Arial"
                }
            );


            let name =
                getProviderName(
                    provider
                );


            if (
                name.length > 14
            ) {

                name =
                    name.substring(
                        0,
                        13
                    ) +
                    "…";

            }


            drawText(
                ctx,
                name,
                x +
                barWidth / 2,
                top +
                chartHeight +
                25,
                {
                    color:
                        "#596176",

                    font:
                        "12px Arial"
                }
            );

        }
    );


    comparisonCharts[
        "priceChart"
    ] = {

        type:
            "price",

        providers

    };

}
/* =====================================================
   DRAW RADAR CHART
   ===================================================== */

function createRadarChart(
    providers
) {

    const canvas =
        getCanvas(
            "overallChart"
        );


    if (!canvas) {
        return;
    }


    if (
        !Array.isArray(
            providers
        ) ||
        providers.length === 0
    ) {

        return;
    }


    const prepared =
        prepareCanvas(
            canvas
        );


    if (!prepared) {
        return;
    }


    const {
        ctx,
        width,
        height
    } = prepared;


    const centerX =
        width / 2;


    const centerY =
        height / 2;


    const radius =
        Math.min(
            width,
            height
        ) *
        0.32;


    const labels = [

        "Beginner Friendly",

        "Affordability",

        "Scalability",

        "AI / ML",

        "Enterprise",

        "Global Reach"

    ];


    const angleStep =
        (
            Math.PI * 2
        ) /
        labels.length;


    /* =================================================
       RADAR GRID
    ================================================= */

    ctx.save();


    ctx.strokeStyle =
        "#dedff0";


    ctx.lineWidth =
        1;


    for (
        let level = 1;
        level <= 5;
        level++
    ) {

        const levelRadius =
            radius *
            (
                level / 5
            );


        ctx.beginPath();


        labels.forEach(
            (
                _,
                index
            ) => {

                const angle =
                    -Math.PI / 2 +
                    index *
                    angleStep;


                const x =
                    centerX +
                    Math.cos(angle) *
                    levelRadius;


                const y =
                    centerY +
                    Math.sin(angle) *
                    levelRadius;


                if (
                    index === 0
                ) {

                    ctx.moveTo(
                        x,
                        y
                    );

                } else {

                    ctx.lineTo(
                        x,
                        y
                    );

                }

            }
        );


        ctx.closePath();


        ctx.stroke();

    }


    /* =================================================
       RADAR AXIS LINES
    ================================================= */

    labels.forEach(
        (
            _,
            index
        ) => {

            const angle =
                -Math.PI / 2 +
                index *
                angleStep;


            const x =
                centerX +
                Math.cos(angle) *
                radius;


            const y =
                centerY +
                Math.sin(angle) *
                radius;


            ctx.beginPath();


            ctx.moveTo(
                centerX,
                centerY
            );


            ctx.lineTo(
                x,
                y
            );


            ctx.stroke();

        }
    );


    ctx.restore();


    /* =================================================
       RADAR LABELS
    ================================================= */

    labels.forEach(
        (
            label,
            index
        ) => {

            const angle =
                -Math.PI / 2 +
                index *
                angleStep;


            const labelRadius =
                radius +
                28;


            const x =
                centerX +
                Math.cos(angle) *
                labelRadius;


            const y =
                centerY +
                Math.sin(angle) *
                labelRadius;


            let displayLabel =
                label;


            if (
                label ===
                "Beginner Friendly"
            ) {

                displayLabel =
                    "Beginner";

            }


            if (
                label ===
                "Global Reach"
            ) {

                displayLabel =
                    "Global Reach";

            }


            drawText(
                ctx,
                displayLabel,
                x,
                y,
                {

                    color:
                        "#596176",

                    font:
                        "12px Arial"

                }
            );

        }
    );


    /* =================================================
       RADAR DATA
    ================================================= */

    providers.forEach(
        (
            provider,
            providerIndex
        ) => {

            const color =
                chartColors[
                    providerIndex %
                    chartColors.length
                ];


            const values = [

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

            ];


            ctx.save();


            ctx.beginPath();


            values.forEach(
                (
                    value,
                    index
                ) => {

                    const safeValue =
                        Math.max(
                            0,
                            Math.min(
                                10,
                                Number(
                                    value
                                ) || 0
                            )
                        );


                    const angle =
                        -Math.PI / 2 +
                        index *
                        angleStep;


                    const pointRadius =
                        radius *
                        (
                            safeValue /
                            10
                        );


                    const x =
                        centerX +
                        Math.cos(angle) *
                        pointRadius;


                    const y =
                        centerY +
                        Math.sin(angle) *
                        pointRadius;


                    if (
                        index === 0
                    ) {

                        ctx.moveTo(
                            x,
                            y
                        );

                    } else {

                        ctx.lineTo(
                            x,
                            y
                        );

                    }

                }
            );


            ctx.closePath();


            /*
             * Transparent fill so multiple
             * providers remain visible.
             */

            ctx.fillStyle =
                hexToRGBA(
                    color,
                    0.08
                );


            ctx.fill();


            ctx.strokeStyle =
                color;


            ctx.lineWidth =
                2.5;


            ctx.stroke();


            /* =========================================
               RADAR POINTS
            ========================================= */

            values.forEach(
                (
                    value,
                    index
                ) => {

                    const safeValue =
                        Math.max(
                            0,
                            Math.min(
                                10,
                                Number(
                                    value
                                ) || 0
                            )
                        );


                    const angle =
                        -Math.PI / 2 +
                        index *
                        angleStep;


                    const pointRadius =
                        radius *
                        (
                            safeValue /
                            10
                        );


                    const x =
                        centerX +
                        Math.cos(angle) *
                        pointRadius;


                    const y =
                        centerY +
                        Math.sin(angle) *
                        pointRadius;


                    ctx.beginPath();


                    ctx.arc(
                        x,
                        y,
                        4,
                        0,
                        Math.PI * 2
                    );


                    ctx.fillStyle =
                        color;


                    ctx.fill();


                }
            );


            ctx.restore();

        }
    );


    /* =================================================
       RADAR LEGEND
    ================================================= */

    const legendY =
        height -
        18;


    let legendX =
        20;


    providers.forEach(
        (
            provider,
            index
        ) => {

            const color =
                chartColors[
                    index %
                    chartColors.length
                ];


            const name =
                getProviderName(
                    provider
                );


            ctx.save();


            ctx.fillStyle =
                color;


            ctx.beginPath();


            ctx.arc(
                legendX,
                legendY,
                5,
                0,
                Math.PI * 2
            );


            ctx.fill();


            ctx.restore();


            drawText(
                ctx,
                name,
                legendX + 10,
                legendY,
                {

                    align:
                        "left",

                    color:
                        "#596176",

                    font:
                        "12px Arial"

                }
            );


            legendX +=
                25 +
                (
                    ctx.measureText(
                        name
                    ).width
                );


            /*
             * Move to next line if the
             * legend becomes too wide.
             */

            if (
                legendX >
                width - 100
            ) {

                legendX =
                    20;

            }

        }
    );


    comparisonCharts[
        "overallChart"
    ] = {

        type:
            "radar",

        providers

    };

}


/* =====================================================
   HEX COLOR → RGBA
   ===================================================== */

function hexToRGBA(
    hex,
    alpha
) {

    const clean =
        String(
            hex
        )
            .replace(
                "#",
                ""
            );


    if (
        clean.length !== 6
    ) {

        return `rgba(91,92,226,${alpha})`;

    }


    const r =
        parseInt(
            clean.substring(
                0,
                2
            ),
            16
        );


    const g =
        parseInt(
            clean.substring(
                2,
                4
            ),
            16
        );


    const b =
        parseInt(
            clean.substring(
                4,
                6
            ),
            16
        );


    return `rgba(${r},${g},${b},${alpha})`;

}


/* =====================================================
   RENDER ALL COMPARISON CHARTS
   ===================================================== */

function renderComparisonCharts(
    providers
) {

    if (
        !Array.isArray(
            providers
        ) ||
        providers.length < 2
    ) {

        console.warn(
            "CLOUDEx: At least two providers are required for charts."
        );

        return;

    }


    /*
     * Wait until the comparison section has
     * been added to the page.
     */

    requestAnimationFrame(
        () => {

            createBarChart(
                "beginnerChart",
                providers,
                "beginnerFriendly",
                "Beginner Friendly"
            );


            createPriceChart(
                providers
            );


            createBarChart(
                "scalabilityChart",
                providers,
                "scalability",
                "Scalability"
            );


            createBarChart(
                "aiChart",
                providers,
                "aiMl",
                "AI / ML"
            );


            createBarChart(
                "enterpriseChart",
                providers,
                "enterprise",
                "Enterprise"
            );


            createBarChart(
                "globalChart",
                providers,
                "globalReach",
                "Global Reach"
            );


            createRadarChart(
                providers
            );

        }
    );

}


/* =====================================================
   REDRAW ALL CHARTS
   ===================================================== */

function redrawComparisonCharts() {

    Object.values(
        comparisonCharts
    ).forEach(
        chart => {

            if (
                !chart ||
                !chart.providers
            ) {

                return;

            }


            if (
                chart.type ===
                "radar"
            ) {

                createRadarChart(
                    chart.providers
                );


                return;

            }


            if (
                chart.type ===
                "price"
            ) {

                createPriceChart(
                    chart.providers
                );


                return;

            }


            createBarChart(
                /*
                 * Canvas id is recovered
                 * from the stored chart object.
                 */

                Object.keys(
                    comparisonCharts
                ).find(
                    key =>
                        comparisonCharts[
                            key
                        ] === chart
                ),

                chart.providers,

                chart.scoreKey,

                chart.chartTitle

            );

        }
    );

}


/* =====================================================
   WINDOW RESIZE
   ===================================================== */

let chartResizeTimer = null;


window.addEventListener(
    "resize",
    () => {

        clearTimeout(
            chartResizeTimer
        );


        chartResizeTimer =
            setTimeout(
                () => {

                    redrawComparisonCharts();

                },
                150
            );

    }
);


/* =====================================================
   EXPORT FUNCTION
   ===================================================== */

window.renderComparisonCharts =
    renderComparisonCharts;


/* =====================================================
   OPTIONAL GLOBAL ACCESS
   ===================================================== */

window.redrawComparisonCharts =
    redrawComparisonCharts;