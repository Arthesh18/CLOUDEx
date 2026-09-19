// =========================================================
// CLOUDEX AI ADVISOR
// =========================================================

const API_BASE_URL = "http://localhost:5000";

let conversation = [];
let currentChatId = null;
let currentUserId = null;


// =========================================================
// INITIALIZE ADVISOR
// =========================================================

document.addEventListener("DOMContentLoaded", async () => {

    const storedUser =
        localStorage.getItem("cloudexUser");

    if (!storedUser) {
        window.location.href = "login.html";
        return;
    }

    const user = JSON.parse(storedUser);

    if (!user.id) {
        console.error("User ID not found.");
        window.location.href = "login.html";
        return;
    }

    currentUserId = user.id;


    // =====================================================
    // GET HTML ELEMENTS
    // =====================================================

    const chatForm =
        document.getElementById("chatForm");

    const messageInput =
        document.getElementById("messageInput");

    const sendButton =
        document.getElementById("sendButton");

    const chatMessages =
        document.getElementById("chatMessages");

    const typingIndicator =
        document.getElementById("typingIndicator");

    const clearChatButton =
        document.getElementById("clearChat");

    const quickPrompts =
        document.querySelectorAll(".quick-prompt");

    const historyList =
        document.getElementById("historyList");

    const newChatButton =
        document.getElementById("newChatButton");

    const modePills =
        document.querySelectorAll(".mode-pill");

    const modeDescriptionHint =
        document.getElementById("modeDescriptionHint");


    // =====================================================
    // EXPERIENCE MODES (FEATURE #7)
    // =====================================================

    const VALID_MODES = ["beginner", "intermediate", "expert"];

    const MODE_CONFIGS = {
        beginner: {
            hint: "Plain English • Guided questions • No jargon",
            placeholder: "Tell Cloudex what you're building (e.g. personal portfolio, student project)..."
        },
        intermediate: {
            hint: "Architecture & trade-offs • Containers & DBs • Pragmatic",
            placeholder: "Describe your stack and architecture needs (e.g. Next.js + Postgres container)..."
        },
        expert: {
            hint: "DevOps & orchestration • Multi-region & SLAs • Deep technical",
            placeholder: "Specify production requirements (e.g. multi-region K8s, high-IOPS DB, SOC2)..."
        }
    };

    let currentExperienceMode = (localStorage.getItem("cloudexExperienceMode") || "beginner").toLowerCase();
    if (!VALID_MODES.includes(currentExperienceMode)) {
        currentExperienceMode = "beginner";
    }

    function setExperienceMode(mode, userInitiated = false) {
        if (!VALID_MODES.includes(mode)) {
            mode = "beginner";
        }

        const prevMode = currentExperienceMode;
        currentExperienceMode = mode;
        localStorage.setItem("cloudexExperienceMode", mode);

        modePills.forEach((pill) => {
            const pillMode = pill.dataset.mode;
            const isActive = pillMode === mode;
            pill.classList.toggle("active", isActive);
            pill.setAttribute("aria-checked", isActive ? "true" : "false");
        });

        if (modeDescriptionHint && MODE_CONFIGS[mode]) {
            modeDescriptionHint.textContent = MODE_CONFIGS[mode].hint;
        }

        if (messageInput && MODE_CONFIGS[mode]) {
            messageInput.placeholder = MODE_CONFIGS[mode].placeholder;
        }

        if (userInitiated && prevMode !== mode && conversation.length > 0) {
            addSystemNotice(`Switched to ${mode.charAt(0).toUpperCase() + mode.slice(1)} mode — subsequent responses will adapt.`);
        }

        if (typeof updatePreferencesPanelLabels === "function") {
            updatePreferencesPanelLabels(mode);
        }
    }

    modePills.forEach((pill) => {
        pill.addEventListener("click", () => {
            const selectedMode = pill.dataset.mode;
            if (selectedMode && selectedMode !== currentExperienceMode) {
                setExperienceMode(selectedMode, true);
            }
        });
    });

    // Initialize mode UI
    setExperienceMode(currentExperienceMode, false);


    // =====================================================
    // PROVIDER INFORMATION
    // =====================================================

    const providerMap = {

        aws: {
            id: "aws",
            name: "AWS",
            aliases: [
                "amazon web services",
                "aws",
                "amazon"
            ]
        },

        azure: {
            id: "azure",
            name: "Microsoft Azure",
            aliases: [
                "microsoft azure",
                "azure",
                "microsoft"
            ]
        },

        gcp: {
            id: "gcp",
            name: "Google Cloud",
            aliases: [
                "google cloud platform",
                "google cloud",
                "gcp",
                "google"
            ]
        },

        oracle: {
            id: "oracle",
            name: "Oracle Cloud",
            aliases: [
                "oracle cloud infrastructure",
                "oracle cloud",
                "oracle",
                "oci"
            ]
        },

        ibm: {
            id: "ibm",
            name: "IBM Cloud",
            aliases: [
                "ibm cloud",
                "ibm"
            ]
        },

        digitalocean: {
            id: "digitalocean",
            name: "DigitalOcean",
            aliases: [
                "digitalocean",
                "digital ocean",
                "droplet"
            ]
        },

        alibaba: {
            id: "alibaba",
            name: "Alibaba Cloud",
            aliases: [
                "alibaba cloud",
                "alibaba",
                "aliyun"
            ]
        },

        huawei: {
            id: "huawei",
            name: "Huawei Cloud",
            aliases: [
                "huawei cloud",
                "huawei"
            ]
        },

        tencent: {
            id: "tencent",
            name: "Tencent Cloud",
            aliases: [
                "tencent cloud",
                "tencent"
            ]
        },

        vultr: {
            id: "vultr",
            name: "Vultr",
            aliases: [
                "vultr cloud",
                "vultr"
            ]
        },

        hetzner: {
            id: "hetzner",
            name: "Hetzner Cloud",
            aliases: [
                "hetzner cloud",
                "hetzner"
            ]
        },

        ovhcloud: {
            id: "ovhcloud",
            name: "OVHcloud",
            aliases: [
                "ovhcloud",
                "ovh cloud",
                "ovh"
            ]
        },

        cloudflare: {
            id: "cloudflare",
            name: "Cloudflare",
            aliases: [
                "cloudflare workers",
                "cloudflare r2",
                "cloudflare"
            ]
        },

        akamai: {
            id: "akamai",
            name: "Akamai Cloud",
            aliases: [
                "akamai connected cloud",
                "akamai cloud",
                "akamai",
                "linode"
            ]
        },

        coreweave: {
            id: "coreweave",
            name: "CoreWeave",
            aliases: [
                "coreweave cloud",
                "coreweave"
            ]
        }

    };


    // =====================================================
    // BASIC TEXT FORMATTING
    // =====================================================

    function formatMessage(text) {

        if (!text) {
            return "";
        }

        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(
                /\*\*(.*?)\*\*/g,
                "<strong>$1</strong>"
            )
            .replace(/\n/g, "<br>");

    }


    // =====================================================
    // SCROLL CHAT
    // =====================================================

    function scrollToBottom() {

        chatMessages.scrollTo({
            top: chatMessages.scrollHeight,
            behavior: "smooth"
        });

    }


    // =====================================================
    // DETECT RECOMMENDED PROVIDER
    // =====================================================

    function detectProvider(text) {

        if (!text) {
            return null;
        }

        const lowerText =
            text.toLowerCase();

        // 1. Extract exact provider line directly following "MY RECOMMENDATION"
        const headerMatch =
            lowerText.match(/(?:🥇\s*)?my recommendation\s*[\r\n]+([^\r\n]+)/i);

        if (headerMatch && headerMatch[1]) {
            const line =
                headerMatch[1].trim();

            for (
                const key in providerMap
            ) {
                const provider =
                    providerMap[key];

                for (
                    const alias
                    of provider.aliases
                ) {
                    if (
                        line.includes(
                            alias.toLowerCase()
                        )
                    ) {
                        return provider;
                    }
                }
            }
        }

        // 2. Extract provider from "MY PICK" or "I recommend [Provider]"
        const pickMatch =
            lowerText.match(/i recommend\s+([^\r\n,.]+)/i);

        if (pickMatch && pickMatch[1]) {
            const line =
                pickMatch[1].trim();

            for (
                const key in providerMap
            ) {
                const provider =
                    providerMap[key];

                for (
                    const alias
                    of provider.aliases
                ) {
                    if (
                        line.includes(
                            alias.toLowerCase()
                        )
                    ) {
                        return provider;
                    }
                }
            }
        }

        // 3. Fallback: match anywhere in text
        for (
            const key in providerMap
        ) {
            const provider =
                providerMap[key];

            for (
                const alias
                of provider.aliases
            ) {
                if (
                    lowerText.includes(
                        alias.toLowerCase()
                    )
                ) {
                    return provider;
                }
            }
        }

        return null;

    }


    // =====================================================
    // DETECT ALTERNATIVE PROVIDER (FEATURE #5)
    // =====================================================

    function detectAlternativeProvider(text, primaryId) {

        if (!text) {
            return null;
        }

        const lowerText =
            text.toLowerCase();

        const altPattern =
            /why not the others\?[\s\S]{0,400}/i;

        const match =
            lowerText.match(altPattern);

        if (match) {

            const chunk =
                match[0];

            for (
                const key in providerMap
            ) {

                if (key === primaryId) {
                    continue;
                }

                const provider =
                    providerMap[key];

                for (
                    const alias
                    of provider.aliases
                ) {

                    if (
                        chunk.includes(
                            alias.toLowerCase()
                        )
                    ) {
                        return provider;
                    }

                }

            }

        }

        return null;

    }


    // =========================================================
    // SAVE RECOMMENDATION TO MONGODB
    // =========================================================

    async function saveRecommendation(
        userMessage,
        aiReply
    ) {

        try {

            const provider =
                detectProvider(aiReply);


            if (!provider) {

                console.log(
                    "No cloud provider detected."
                );

                return;
            }


            const response =
                await fetch(
                    `${API_BASE_URL}/api/recommendations/save`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            userId:
                                currentUserId,

                            userMessage:
                                userMessage,

                            provider:
                                provider.name,

                            reason:
                                aiReply

                        })
                    }
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                console.error(
                    "Recommendation save failed:",
                    data.message
                );

                return;
            }


            console.log(
                "Recommendation saved successfully."
            );

        } catch (error) {

            console.error(
                "Recommendation save error:",
                error
            );

        }

    }


    // =========================================================
    // CHAT HISTORY HELPERS
    // =========================================================

    function getChatTitle(chat) {

        if (
            chat.title &&
            chat.title.trim() &&
            chat.title !== "New Conversation"
        ) {

            return chat.title.trim();

        }


        if (
            Array.isArray(chat.messages)
        ) {

            const firstUserMessage =
                chat.messages.find(
                    (message) =>
                        message.role === "user"
                );


            if (
                firstUserMessage &&
                firstUserMessage.content
            ) {

                let title =
                    firstUserMessage.content.trim();


                if (title.length > 32) {

                    title =
                        title.substring(0, 32) +
                        "...";

                }

                return title;

            }

        }


        return "New conversation";

    }


    function formatChatDate(dateValue) {

        if (!dateValue) {
            return "";
        }


        const date =
            new Date(dateValue);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "";

        }


        const now =
            new Date();


        const isToday =
            date.toDateString() ===
            now.toDateString();


        if (isToday) {

            return date.toLocaleTimeString(
                [],
                {
                    hour: "numeric",
                    minute: "2-digit"
                }
            );

        }


        return date.toLocaleDateString(
            [],
            {
                day: "numeric",
                month: "short"
            }
        );

    }


    // =========================================================
    // WELCOME MESSAGE
    // =========================================================

    function showWelcomeMessage() {

        chatMessages.innerHTML = `

            <div class="message ai-message">

                <div class="message-avatar">
                    ☁
                </div>


                <div class="message-content">

                    <div class="message-name">
                        Cloudex AI
                    </div>


                    <div class="message-bubble">

                        <p>
                            Hey! 👋 I'm your Cloudex AI advisor.
                        </p>


                        <p>
                            Tell me what you're planning to build in simple words — you don't need any cloud computing knowledge. I'll translate your project needs into the right cloud setup.
                        </p>


                        <p>
                            I won't recommend a provider immediately — I'll ask you a few simple questions first so the recommendation makes sense for your budget and goals.
                        </p>

                        <p style="margin-top: 8px; margin-bottom: 0;">
                            <button type="button" class="decision-guide-trigger-btn" id="openDecisionGuideBtn">
                                <i class="fa-solid fa-circle-question"></i> How does CLOUDEx make decisions?
                            </button>
                        </p>

                    </div>

                </div>

            </div>

        `;

        const guideBtn = chatMessages.querySelector("#openDecisionGuideBtn");
        if (guideBtn) {
            guideBtn.addEventListener("click", () => openDecisionSystemGuide());
        }

    }


    // =========================================================
    // RENDER SAVED CONVERSATION
    // =========================================================

    function renderConversation() {

        chatMessages.innerHTML = "";


        if (
            !Array.isArray(conversation) ||
            conversation.length === 0
        ) {

            showWelcomeMessage();

            return;

        }


        conversation.forEach(
            (message) => {

                addMessage(
                    message.role,
                    message.content
                );

            }
        );


        setTimeout(
            scrollToBottom,
            50
        );

    }


    // =========================================================
    // DELETE CHAT
    // =========================================================

    async function deleteChat(chatId) {

        if (!chatId) {
            return;
        }


        const confirmed =
            confirm(
                "Are you sure you want to delete this conversation?"
            );


        if (!confirmed) {
            return;
        }


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/chat/${chatId}`,
                    {
                        method: "DELETE"
                    }
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Could not delete conversation."
                );

            }


            if (
                String(chatId) ===
                String(currentChatId)
            ) {

                currentChatId = null;

                conversation = [];

                showWelcomeMessage();

            }


            await loadChatHistory();


            if (!currentChatId) {

                await createNewChat();

            }


        } catch (error) {

            console.error(
                "Delete chat error:",
                error
            );


            alert(
                "Could not delete this conversation. Please try again."
            );

        }

    }


    // =========================================================
    // LOAD ALL CHAT HISTORY
    // =========================================================

    async function loadChatHistory() {

        if (!historyList) {
            return [];
        }


        historyList.innerHTML = `

            <div class="history-loading">
                Loading conversations...
            </div>

        `;


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/chat/user/${currentUserId}`
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success ||
                !Array.isArray(data.chats)
            ) {

                throw new Error(
                    data.message ||
                    "Could not load chat history."
                );

            }


            const chats =
                [...data.chats].sort(
                    (a, b) => {

                        const dateA =
                            new Date(
                                a.updatedAt ||
                                a.createdAt ||
                                0
                            );

                        const dateB =
                            new Date(
                                b.updatedAt ||
                                b.createdAt ||
                                0
                            );

                        return dateB - dateA;

                    }
                );


            historyList.innerHTML = "";


            if (chats.length === 0) {

                historyList.innerHTML = `

                    <div class="history-empty">
                        No conversations yet.
                    </div>

                `;

                return chats;

            }


            // =================================================
            // DATE GROUPING
            // =================================================

            function getDateGroup(dateValue) {

                const date =
                    new Date(dateValue);


                if (
                    Number.isNaN(
                        date.getTime()
                    )
                ) {

                    return "OLDER";

                }


                const now =
                    new Date();


                const today =
                    new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        now.getDate()
                    );


                const chatDate =
                    new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate()
                    );


                const difference =
                    Math.floor(
                        (
                            today - chatDate
                        ) /
                        (
                            1000 *
                            60 *
                            60 *
                            24
                        )
                    );


                if (difference === 0) {

                    return "TODAY";

                }


                if (difference === 1) {

                    return "YESTERDAY";

                }


                return "OLDER";

            }


            const groups = {

                TODAY: [],

                YESTERDAY: [],

                OLDER: []

            };


            chats.forEach(
                (chat) => {

                    const group =
                        getDateGroup(
                            chat.updatedAt ||
                            chat.createdAt
                        );


                    groups[group].push(
                        chat
                    );

                }
            );


            // =================================================
            // RENDER GROUP
            // =================================================

            function renderGroup(
                groupName,
                groupChats
            ) {

                if (
                    !groupChats ||
                    groupChats.length === 0
                ) {

                    return;

                }


                const heading =
                    document.createElement(
                        "div"
                    );


                heading.className =
                    "history-group-title";


                heading.textContent =
                    groupName;


                historyList.appendChild(
                    heading
                );


                groupChats.forEach(
                    (chat) => {

                        const item =
                            document.createElement(
                                "div"
                            );


                        item.className =
                            "history-item";


                        if (
                            String(chat._id) ===
                            String(currentChatId)
                        ) {

                            item.classList.add(
                                "active"
                            );

                        }


                        const title =
                            getChatTitle(chat);


                        const date =
                            formatChatDate(
                                chat.updatedAt ||
                                chat.createdAt
                            );


                        // =====================================
                        // CHAT INFORMATION
                        // =====================================

                        const chatInfo =
                            document.createElement(
                                "div"
                            );


                        chatInfo.className =
                            "history-chat-info";


                        chatInfo.innerHTML = `

                            <span class="history-item-title">
                                ${formatMessage(title)}
                            </span>

                            <span class="history-item-date">
                                ${date}
                            </span>

                        `;


                        // =====================================
                        // DELETE BUTTON
                        // =====================================

                        const deleteButton =
                            document.createElement(
                                "button"
                            );


                        deleteButton.type =
                            "button";


                        deleteButton.className =
                            "history-delete-btn";


                        deleteButton.innerHTML =
                            "🗑";


                        deleteButton.title =
                            "Delete conversation";


                        deleteButton.addEventListener(
                            "click",
                            (event) => {

                                event.stopPropagation();

                                deleteChat(
                                    chat._id
                                );

                            }
                        );


                        // =====================================
                        // OPEN CHAT
                        // =====================================

                        chatInfo.addEventListener(
                            "click",
                            () => {

                                loadChat(
                                    chat._id
                                );

                            }
                        );


                        item.appendChild(
                            chatInfo
                        );


                        item.appendChild(
                            deleteButton
                        );


                        historyList.appendChild(
                            item
                        );

                    }
                );

            }


            // =================================================
            // RENDER ALL GROUPS
            // =================================================

            renderGroup(
                "TODAY",
                groups.TODAY
            );


            renderGroup(
                "YESTERDAY",
                groups.YESTERDAY
            );


            renderGroup(
                "OLDER",
                groups.OLDER
            );


            return chats;


        } catch (error) {

            console.error(
                "Could not load chat history:",
                error
            );


            historyList.innerHTML = `

                <div class="history-empty">
                    Could not load conversations.
                </div>

            `;


            return [];

        }

    }


    // =========================================================
    // LOAD ONE CHAT
    // =========================================================

    async function loadChat(chatId) {

        if (!chatId) {
            return;
        }


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/chat/${chatId}`
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success ||
                !data.chat
            ) {

                throw new Error(
                    data.message ||
                    "Could not load conversation."
                );

            }


            currentChatId =
                data.chat._id;


            conversation =
                Array.isArray(
                    data.chat.messages
                )
                    ? data.chat.messages.map(
                        (message) => ({

                            role:
                                message.role,

                            content:
                                message.content

                        })
                    )
                    : [];


            renderConversation();


            await loadChatHistory();


            messageInput.focus();


        } catch (error) {

            console.error(
                "Could not load conversation:",
                error
            );

        }

    }


    // =========================================================
    // CREATE NEW CHAT
    // =========================================================

    async function createNewChat() {

        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/chat`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            userId:
                                currentUserId

                        })
                    }
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success ||
                !data.chat
            ) {

                throw new Error(
                    data.message ||
                    "Could not create a new conversation."
                );

            }


            currentChatId =
                data.chat._id;


            conversation = [];
            originalFuzzyPreferences = null;
            userModifiedPreferences = null;
            updatedPreferences = null;
            currentFuzzyRequirements = null;
            currentMcdmResult = null;
            currentRecommendation = null;
            originalRecommendation = null;
            updatedRecommendation = null;
            currentRecommendationComparison = null;
            currentAssumptions = null;
            isRecalculated = false;
            recalculatedAt = null;

            closeDecisionSystemGuide();

            showWelcomeMessage();


            await loadChatHistory();


            messageInput.focus();


        } catch (error) {

            console.error(
                "Could not create new chat:",
                error
            );

        }

    }


    // =========================================================
    // CREATE PROVIDER ACTION BUTTONS
    // =========================================================

    function createProviderActions(text) {

        const provider =
            detectProvider(text);


        if (!provider) {
            return "";
        }

        const altProvider =
            detectAlternativeProvider(text, provider.id);

        const compareTarget =
            altProvider
                ? `${provider.id},${altProvider.id}`
                : provider.id;

        const compareLabel =
            altProvider
                ? `Compare ${provider.name} vs ${altProvider.name}`
                : "Compare Providers";


        return `

            <div class="ai-provider-actions">

                <button
                    type="button"
                    class="ai-action-btn explore-provider-btn"
                    data-provider="${provider.id}"
                >

                    <i class="fa-solid fa-cloud"></i>

                    Explore ${provider.name}

                </button>


                <button
                    type="button"
                    class="ai-action-btn compare-provider-btn"
                    data-provider="${compareTarget}"
                >

                    <i class="fa-solid fa-chart-column"></i>

                    ${compareLabel}

                </button>

            </div>

        `;

    }


    // =========================================================
    // PROVIDER ACTION BUTTONS
    // =========================================================

    function setupProviderButtons(container) {

        const exploreButton =
            container.querySelector(
                ".explore-provider-btn"
            );


        const compareButton =
            container.querySelector(
                ".compare-provider-btn"
            );


        if (exploreButton) {

            exploreButton.addEventListener(
                "click",
                () => {

                    const provider =
                        exploreButton.dataset.provider;


                    window.location.href =
                        `cloud-explorer.html?provider=${encodeURIComponent(provider)}`;

                }
            );

        }


        if (compareButton) {

            compareButton.addEventListener(
                "click",
                () => {

                    const provider =
                        compareButton.dataset.provider;


                    window.location.href =
                        `cloud-explorer.html?compare=${encodeURIComponent(provider)}`;

                }
            );

        }

    }


    // =========================================================
    // INITIAL CLOUD PREFERENCES & PRIORITY SLIDERS (FEATURES #9 & #10 & #11)
    // =========================================================

    let originalFuzzyPreferences = null;
    let userModifiedPreferences = null;
    let updatedPreferences = null;
    let isRecalculated = false;
    let recalculatedAt = null;
    let currentFuzzyRequirements = null;
    let currentMcdmResult = null;
    let currentRecommendation = null;
    let originalRecommendation = null;
    let updatedRecommendation = null;
    let currentRecommendationComparison = null;
    let currentAssumptions = null;

    const PREFERENCE_DIMENSION_CONFIG = [
        {
            key: "cost",
            icon: "💰",
            beginner: "Cost & Budget",
            intermediate: "Cost & Budget Sensitivity",
            expert: "FinOps & Egress Optimization"
        },
        {
            key: "simplicity",
            icon: "⚙️",
            beginner: "Simplicity & Easy Setup",
            intermediate: "Simplicity & Managed Services",
            expert: "Operational Overhead & Managed Abstractions"
        },
        {
            key: "performance",
            icon: "⚡",
            beginner: "Speed & Performance",
            intermediate: "Performance & Throughput",
            expert: "Compute Throughput & Sub-ms Latency"
        },
        {
            key: "reliability",
            icon: "🛡️",
            beginner: "Reliability & Uptime",
            intermediate: "Reliability & Fault Tolerance",
            expert: "Multi-AZ Redundancy & 99.99%+ SLA"
        },
        {
            key: "features",
            icon: "🧰",
            beginner: "Tools & Features",
            intermediate: "Ecosystem Breadth & Tools",
            expert: "Enterprise Ecosystem Breadth"
        },
        {
            key: "support",
            icon: "💬",
            beginner: "Help & Support",
            intermediate: "Support SLAs & Guidance",
            expert: "Enterprise Agreement & Direct Support"
        },
        {
            key: "aiGpu",
            icon: "🤖",
            beginner: "AI & Smart Tech",
            intermediate: "Dedicated AI/GPU Compute",
            expert: "Dedicated GPU Compute Acceleration"
        }
    ];

    // =========================================================
    // TRADE-OFF & CONFLICT DETECTION (FEATURE #12)
    // =========================================================

    const CLIENT_TRADEOFF_DEFINITIONS = [
        {
            id: "cost_vs_performance",
            title: "Cost vs. Performance",
            dim1: "cost",
            dim2: "performance",
            evaluate: (prefs) => {
                const cost = prefs.cost || 0;
                const perf = prefs.performance || 0;
                if (cost >= 0.75 && perf >= 0.75) {
                    return cost >= 0.85 && perf >= 0.85 ? "high" : "moderate";
                }
                return null;
            },
            explanations: {
                beginner: "High speed and fast processing usually require dedicated, powerful cloud servers which naturally cost more. Very cheap options typically share resources with other users and may slow down under heavy loads.",
                intermediate: "Aggressive budget constraints conflict with peak IOPS, dedicated CPU cores, and ultra-low latency networking. Entry-tier shared compute instances experience CPU throttling under sustained throughput.",
                expert: "FinOps-driven cost minimization directly conflicts with dedicated compute instances, Provisioned IOPS (e.g. AWS io2, GCP Extreme), and unmetered low-latency interconnects."
            },
            hints: {
                beginner: "CloudEx will look for the best 'sweet spot' — great performance at fair, predictable pricing without enterprise markups.",
                intermediate: "CloudEx will prioritize high price-to-performance alternative clouds (e.g. Hetzner, DigitalOcean) or optimized compute tiers.",
                expert: "CloudEx will target the cost-performance Pareto frontier, factoring in compute-optimized tiers vs bare-metal with low egress penalties."
            }
        },
        {
            id: "simplicity_vs_features",
            title: "Simplicity vs. Feature Breadth",
            dim1: "simplicity",
            dim2: "features",
            evaluate: (prefs) => {
                const simp = prefs.simplicity || 0;
                const feat = prefs.features || 0;
                if (simp >= 0.75 && feat >= 0.75) {
                    return simp >= 0.85 && feat >= 0.85 ? "high" : "moderate";
                }
                return null;
            },
            explanations: {
                beginner: "Simpler cloud platforms keep things easy by hiding complex tools and settings. Providers that offer hundreds of specialized tools usually have a steeper learning curve.",
                intermediate: "Turnkey PaaS platforms (like Render or Heroku) maximize developer ergonomics, but sacrifice granular networking, custom VPC mesh, and deep service catalogs offered by hyperscalers.",
                expert: "High abstraction layers (PaaS/Serverless) trade off deep IAM policies, fine-grained VPC topologies, specialized compliance modules, and proprietary ecosystem primitives."
            },
            hints: {
                beginner: "CloudEx will prioritize easy-to-use platforms that still include the essential tools your app needs to grow.",
                intermediate: "CloudEx will balance developer ergonomics against ecosystem depth, identifying platforms with turnkey workflows plus modular service catalogs.",
                expert: "CloudEx will balance time-to-market developer velocity against operational extensibility and custom orchestration requirements."
            }
        },
        {
            id: "cost_vs_reliability",
            title: "Cost vs. High Availability / SLA",
            dim1: "cost",
            dim2: "reliability",
            evaluate: (prefs) => {
                const cost = prefs.cost || 0;
                const rel = prefs.reliability || 0;
                if (cost >= 0.75 && rel >= 0.80) {
                    return cost >= 0.85 && rel >= 0.85 ? "high" : "moderate";
                }
                return null;
            },
            explanations: {
                beginner: "Keeping a website or app running 100% of the time with automatic backups across multiple data centers requires redundant servers, which adds to the monthly cost.",
                intermediate: "Achieving 99.99%+ SLA availability demands multi-region redundancy, automated health-check failover, and active-active replicas, substantially increasing base infrastructure cost.",
                expert: "Strict RTO/RPO objectives, multi-AZ clustering, cross-region replication, and financially-backed 99.99% SLAs double baseline compute and egress expenditures."
            },
            hints: {
                beginner: "CloudEx will seek out providers that offer solid, reliable uptime without charging enterprise premiums for basic reliability.",
                intermediate: "CloudEx will recommend cost-effective high-availability patterns (e.g. managed database replicas and multi-node clusters within reasonable budgets).",
                expert: "CloudEx will optimize for cost-effective resilience, evaluating multi-zone setups on value clouds vs enterprise multi-region architectures."
            }
        },
        {
            id: "cost_vs_aigpu",
            title: "Cost vs. Dedicated AI / GPU Compute",
            dim1: "cost",
            dim2: "aiGpu",
            evaluate: (prefs) => {
                const cost = prefs.cost || 0;
                const ai = prefs.aiGpu || 0;
                if (cost >= 0.75 && ai >= 0.70) {
                    return cost >= 0.85 && ai >= 0.80 ? "high" : "moderate";
                }
                return null;
            },
            explanations: {
                beginner: "Computers equipped with high-end AI graphics cards (GPUs) are among the most expensive cloud services to rent. Extremely low budgets make dedicated AI hardware tough to afford.",
                intermediate: "Dedicated AI accelerators (e.g. NVIDIA A100/H100/L40S) have high hourly price floors. Strict budget limits often require spot instances, fractional GPUs, or API-only models.",
                expert: "Dedicated GPU clusters, NVLink fabric, and high-VRAM instances represent significant CapEx/OpEx. Heavy cost constraints restrict availability to spot markets or boutique GPU clouds."
            },
            hints: {
                beginner: "CloudEx will check if using AI through affordable APIs or specialized GPU rental providers fits your budget.",
                intermediate: "CloudEx will highlight specialized GPU clouds (e.g. Lambda, RunPod) with transparent per-hour billing alongside hyperscaler options.",
                expert: "CloudEx will contrast boutique GPU cloud pricing with reserved instances and spot availability across hyperscalers."
            }
        },
        {
            id: "cost_vs_support",
            title: "Cost vs. Dedicated Enterprise Support",
            dim1: "cost",
            dim2: "support",
            evaluate: (prefs) => {
                const cost = prefs.cost || 0;
                const sup = prefs.support || 0;
                if (cost >= 0.80 && sup >= 0.75) {
                    return "moderate";
                }
                return null;
            },
            explanations: {
                beginner: "24/7 direct phone and engineer support typically requires premium monthly support subscriptions rather than free-tier or entry-level accounts.",
                intermediate: "Guaranteed 15-minute response SLAs and dedicated cloud technical account managers require dedicated paid support plans ($100-$1000+/mo on major clouds).",
                expert: "Enterprise Support tiers mandate percentage-of-spend minimums (3-10% of monthly cloud billing with substantial annual floors), conflicting with lean budget targets."
            },
            hints: {
                beginner: "CloudEx will favor platforms with responsive community support, clear documentation, and free email support.",
                intermediate: "CloudEx will recommend providers with responsive included support or flat-rate business ticketing rather than percentage-of-spend tiers.",
                expert: "CloudEx will compare providers offering reasonable SLA contracts without aggressive minimum spend retainers."
            }
        }
    ];

    function detectClientTradeoffs(preferences = {}, mode = "beginner") {
        const modeKey = ["beginner", "intermediate", "expert"].includes(mode) ? mode : "beginner";
        const detected = [];
        CLIENT_TRADEOFF_DEFINITIONS.forEach((def) => {
            const severity = def.evaluate(preferences);
            if (severity) {
                detected.push({
                    id: def.id,
                    title: def.title,
                    dim1: def.dim1,
                    dim2: def.dim2,
                    severity: severity,
                    explanation: def.explanations[modeKey] || def.explanations.beginner,
                    recommendationHint: def.hints[modeKey] || def.hints.beginner
                });
            }
        });
        return {
            detected: detected.length > 0,
            tradeoffs: detected,
            count: detected.length,
            mode: modeKey
        };
    }

    function renderTradeoffPanelHtml(tradeoffsResult, mode = "beginner") {
        const dimConfigMap = {};
        PREFERENCE_DIMENSION_CONFIG.forEach((d) => {
            dimConfigMap[d.key] = d;
        });

        if (!tradeoffsResult || !tradeoffsResult.detected || tradeoffsResult.tradeoffs.length === 0) {
            return `
                <div class="tradeoff-notice-panel" id="tradeoffNoticePanel">
                    <div class="tradeoff-balanced-notice">
                        <i class="fa-solid fa-circle-check"></i>
                        <span>Balanced Priorities: No competing cloud trade-offs detected across your settings.</span>
                    </div>
                </div>
            `;
        }

        const countText = `${tradeoffsResult.tradeoffs.length} tension${tradeoffsResult.tradeoffs.length > 1 ? "s" : ""} detected`;
        const cardsHtml = tradeoffsResult.tradeoffs.map((t) => {
            const dim1Label = (dimConfigMap[t.dim1] && dimConfigMap[t.dim1][mode]) || t.dim1;
            const dim2Label = (dimConfigMap[t.dim2] && dimConfigMap[t.dim2][mode]) || t.dim2;
            const sevLabel = t.severity === "high" ? "High Tension" : "Trade-Off Notice";

            return `
                <div class="tradeoff-card severity-${t.severity}">
                    <div class="tradeoff-title-row">
                        <span class="tradeoff-card-title">${t.title}</span>
                        <span class="tradeoff-severity-pill ${t.severity}">${sevLabel}</span>
                    </div>
                    <div class="tradeoff-dimensions-row">
                        <span class="tradeoff-dim-pill">${dim1Label}</span>
                        <i class="fa-solid fa-arrows-left-right" style="font-size: 10px; color: var(--text-muted);"></i>
                        <span class="tradeoff-dim-pill">${dim2Label}</span>
                    </div>
                    <p class="tradeoff-explanation">${t.explanation}</p>
                    <div class="tradeoff-hint">
                        <i class="fa-solid fa-lightbulb"></i>
                        <span>${t.recommendationHint}</span>
                    </div>
                </div>
            `;
        }).join("");

        return `
            <div class="tradeoff-notice-panel" id="tradeoffNoticePanel">
                <div class="tradeoff-header">
                    <div class="tradeoff-header-title">
                        <i class="fa-solid fa-scale-balanced"></i>
                        <span>Cloud Trade-Off Advisory</span>
                    </div>
                    <span class="tradeoff-count-pill">${countText}</span>
                </div>
                <div class="tradeoff-list">
                    ${cardsHtml}
                </div>
            </div>
        `;
    }

    function updateTradeoffsDisplay(container, prefs, mode) {
        if (!container) return;
        const panelSlot = container.querySelector("#tradeoffsContainer") || container.querySelector("#tradeoffNoticePanel");
        if (!panelSlot) return;

        const effectivePrefs = prefs || updatedPreferences || userModifiedPreferences || originalFuzzyPreferences || {};
        const effectiveMode = mode || currentExperienceMode || "beginner";
        const result = detectClientTradeoffs(effectivePrefs, effectiveMode);
        const newHtml = renderTradeoffPanelHtml(result, effectiveMode);

        if (panelSlot.id === "tradeoffsContainer") {
            panelSlot.innerHTML = newHtml;
        } else if (panelSlot.parentElement) {
            panelSlot.outerHTML = newHtml;
        }
    }

    // =========================================================
    // ORIGINAL VS UPDATED VALUES (FEATURE #13)
    // =========================================================

    function generatePreferenceComparison(originalPrefs, updatedPrefs, mode = "beginner") {
        if (!originalPrefs || !updatedPrefs) {
            return null;
        }

        const modeKey = ["beginner", "intermediate", "expert"].includes(mode) ? mode : "beginner";
        const dimConfigMap = {};
        PREFERENCE_DIMENSION_CONFIG.forEach((d) => {
            dimConfigMap[d.key] = d;
        });

        const rows = [];
        const increased = [];
        const decreased = [];

        PREFERENCE_DIMENSION_CONFIG.forEach((dim) => {
            const origRaw = typeof originalPrefs[dim.key] === "number"
                ? originalPrefs[dim.key]
                : 0.5;
            const updRaw = typeof updatedPrefs[dim.key] === "number"
                ? updatedPrefs[dim.key]
                : origRaw;

            const origPct = Math.round(origRaw * 100);
            const updPct = Math.round(updRaw * 100);
            const deltaPct = updPct - origPct;

            const label = dim[modeKey] || dim.beginner;

            if (deltaPct > 0) {
                increased.push({ key: dim.key, label, deltaPct });
            } else if (deltaPct < 0) {
                decreased.push({ key: dim.key, label, deltaPct });
            }

            rows.push({
                key: dim.key,
                icon: dim.icon,
                label: label,
                originalPct: origPct,
                updatedPct: updPct,
                deltaPct: deltaPct,
                changed: deltaPct !== 0
            });
        });

        const hasChanges = increased.length > 0 || decreased.length > 0;
        let summary = "";

        if (!hasChanges) {
            summary = "No preference changes were made.";
        } else {
            const parts = [];
            if (increased.length > 0) {
                const incDesc = increased.map((i) => `${i.label} (+${i.deltaPct}%)`).join(", ");
                parts.push(`prioritized ${incDesc}`);
            }
            if (decreased.length > 0) {
                const decDesc = decreased.map((d) => `${d.label} (${d.deltaPct}%)`).join(", ");
                parts.push(`decreased ${decDesc}`);
            }

            if (modeKey === "expert") {
                summary = `Calibrated utility weights: You ${parts.join(" and ")}. Multi-criteria ranking will re-weight scoring matrices accordingly.`;
            } else if (modeKey === "intermediate") {
                summary = `Updated architectural criteria: You ${parts.join(" and ")}. CloudEx will evaluate providers against these modified constraints.`;
            } else {
                summary = `You ${parts.join(" and ")}. CloudEx will use these priorities to find the best fit for your project.`;
            }
        }

        return {
            rows,
            hasChanges,
            increased,
            decreased,
            summary,
            mode: modeKey
        };
    }

    function renderComparisonPanelHtml(comparison, mode = "beginner") {
        if (!comparison) {
            return "";
        }

        const rowsHtml = comparison.rows.map((row) => {
            let deltaHtml = "";
            if (row.deltaPct > 0) {
                deltaHtml = `<span class="delta-pill positive">+${row.deltaPct}% <i class="fa-solid fa-arrow-up"></i></span>`;
            } else if (row.deltaPct < 0) {
                deltaHtml = `<span class="delta-pill negative">${row.deltaPct}% <i class="fa-solid fa-arrow-down"></i></span>`;
            } else {
                deltaHtml = `<span class="delta-pill neutral">No change</span>`;
            }

            return `
                <tr class="comparison-row ${row.changed ? "is-changed" : "is-unchanged"}">
                    <td class="dim-cell">${row.icon} ${row.label}</td>
                    <td class="val-cell">${row.originalPct}%</td>
                    <td class="val-cell ${row.changed ? "font-bold" : ""}">${row.updatedPct}%</td>
                    <td class="delta-cell">${deltaHtml}</td>
                </tr>
            `;
        }).join("");

        const badgeLabel = comparison.hasChanges ? "Updated Priorities Active" : "No Changes";

        return `
            <div class="preferences-comparison-panel" id="preferencesComparisonPanel">
                <div class="comparison-header">
                    <div class="comparison-header-title">
                        <i class="fa-solid fa-code-compare"></i>
                        <span>Your Preference Changes (Original vs. Updated)</span>
                    </div>
                    <span class="comparison-badge ${comparison.hasChanges ? "changed" : "unchanged"}">${badgeLabel}</span>
                </div>
                <div class="comparison-summary-box">
                    <i class="fa-solid fa-circle-info"></i>
                    <span>${comparison.summary}</span>
                </div>
                <div class="comparison-table-wrapper">
                    <table class="comparison-table">
                        <thead>
                            <tr>
                                <th>Dimension</th>
                                <th>Initial AI</th>
                                <th>Your Priority</th>
                                <th>Change</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    function updateComparisonDisplay(container, originalPrefs, updPrefs, mode) {
        if (!container) return;
        const compSlot = container.querySelector("#comparisonContainer");
        if (!compSlot) return;

        if (!updPrefs || !originalPrefs) {
            compSlot.style.display = "none";
            compSlot.innerHTML = "";
            return;
        }

        const comparison = generatePreferenceComparison(originalPrefs, updPrefs, mode || currentExperienceMode);
        compSlot.innerHTML = renderComparisonPanelHtml(comparison, mode || currentExperienceMode);
        compSlot.style.display = "block";
    }

    // =========================================================
    // ORIGINAL VS UPDATED RECOMMENDATION (FEATURE #17)
    // =========================================================

    function renderRecommendationComparisonHtml(comparison, mode = "beginner") {
        if (!comparison) return "";

        if (!comparison.changed) {
            return `
                <div class="rec-comparison-panel" id="recComparisonPanel">
                    <div class="rec-comp-header">
                        <div class="rec-comp-tag">
                            <i class="fa-solid fa-code-compare"></i>
                            <span>Original vs Updated Recommendation</span>
                        </div>
                        <span class="rec-comp-status-pill no-change">
                            <i class="fa-solid fa-minus"></i> No Changes
                        </span>
                    </div>
                    <p class="rec-comp-explanation">${comparison.explanation}</p>
                </div>
            `;
        }

        const orig = comparison.original || {};
        const upd = comparison.updated || {};
        const changed = comparison.recommendationChanged;
        const statusClass = changed ? "changed" : "maintained";
        const statusLabel = changed ? "Recommendation Changed" : "Recommendation Maintained";
        const statusIcon = changed ? "fa-arrows-rotate" : "fa-check";

        let movementHtml = "";
        if (comparison.rankMovement && changed) {
            const origMov = comparison.rankMovement.originalWinner;
            const updMov = comparison.rankMovement.updatedWinner;

            movementHtml = `
                <div class="rec-comp-movement-box">
                    <div class="rec-comp-movement-item">
                        <i class="fa-solid fa-arrow-right"></i>
                        <span><strong>${origMov.providerName}:</strong> Rank #${origMov.originalRank} (${origMov.originalScore}%) → Rank #${origMov.updatedRank} (${origMov.updatedScore}%)</span>
                    </div>
                    <div class="rec-comp-movement-item">
                        <i class="fa-solid fa-arrow-right"></i>
                        <span><strong>${updMov.providerName}:</strong> Rank #${updMov.originalRank} (${updMov.originalScore}%) → Rank #${updMov.updatedRank} (${updMov.updatedScore}%)</span>
                    </div>
                </div>
            `;
        }

        let deltasHtml = "";
        if (Array.isArray(comparison.preferenceChanges) && comparison.preferenceChanges.length > 0) {
            deltasHtml = `
                <div class="rec-comp-section">
                    <div class="rec-comp-section-title">
                        <i class="fa-solid fa-sliders"></i>
                        <span>What Changed in Your Priorities</span>
                    </div>
                    <div class="rec-comp-deltas-list">
                        ${comparison.preferenceChanges.map((p) => `
                            <span class="rec-comp-delta-badge ${p.direction}">
                                <i class="fa-solid ${p.direction === "increased" ? "fa-arrow-up" : "fa-arrow-down"}"></i>
                                ${p.summary}
                            </span>
                        `).join("")}
                    </div>
                </div>
            `;
        }

        return `
            <div class="rec-comparison-panel" id="recComparisonPanel">
                <div class="rec-comp-header">
                    <div class="rec-comp-tag">
                        <i class="fa-solid fa-code-compare"></i>
                        <span>Original vs Updated Recommendation</span>
                    </div>
                    <span class="rec-comp-status-pill ${statusClass}">
                        <i class="fa-solid ${statusIcon}"></i> ${statusLabel}
                    </span>
                </div>
                <div class="rec-comp-cards-row">
                    <div class="rec-comp-provider-card original-card">
                        <span class="rec-comp-card-label">Original Priorities</span>
                        <span class="rec-comp-card-provider">${orig.provider ? orig.provider.name : "Initial Match"}</span>
                        <div class="rec-comp-card-metrics">
                            <span>Rank #${orig.rank || 1}</span>
                            <span>•</span>
                            <strong>${orig.matchPercentage || Math.round((orig.score || 0) * 100)}% Fit</strong>
                        </div>
                    </div>
                    <div class="rec-comp-arrow-divider">
                        <i class="fa-solid fa-arrow-right"></i>
                    </div>
                    <div class="rec-comp-provider-card updated-card">
                        <span class="rec-comp-card-label">Your Updated Priorities</span>
                        <span class="rec-comp-card-provider">${upd.provider ? upd.provider.name : "Updated Match"}</span>
                        <div class="rec-comp-card-metrics">
                            <span>Rank #${upd.rank || 1}</span>
                            <span>•</span>
                            <strong>${upd.matchPercentage || Math.round((upd.score || 0) * 100)}% Fit</strong>
                        </div>
                    </div>
                </div>
                ${movementHtml}
                ${deltasHtml}
                <div class="rec-comp-section">
                    <div class="rec-comp-section-title">
                        <i class="fa-solid fa-circle-info"></i>
                        <span>Result</span>
                    </div>
                    <p class="rec-comp-explanation">${comparison.explanation}</p>
                </div>
            </div>
        `;
    }

    function updateRecommendationComparisonDisplay(container, compData, mode) {
        if (!container) return;
        const targetElements = container.querySelectorAll
            ? container.querySelectorAll("#recComparisonContainer")
            : document.querySelectorAll("#recComparisonContainer");

        targetElements.forEach((slot) => {
            if (!compData) {
                slot.style.display = "none";
                slot.innerHTML = "";
            } else {
                slot.innerHTML = renderRecommendationComparisonHtml(compData, mode || currentExperienceMode);
                slot.style.display = "block";
            }
        });
    }

    // =========================================================
    // HOW CLOUDEx UNDERSTANDS YOUR REQUIREMENTS (FEATURE #14)
    // =========================================================

    function toLinguisticLabel(val) {
        const num = typeof val === "number" ? val : 0.5;
        if (num <= 0.20) return "Very Low";
        if (num <= 0.40) return "Low";
        if (num <= 0.60) return "Medium";
        if (num <= 0.80) return "High";
        return "Very High";
    }

    function renderUnderstoodSummaryCard(reqs, mode = "beginner") {
        if (!reqs) return "";
        const sigs = reqs.requirementSignals || reqs;
        const chips = [];

        if (sigs.workloadType) {
            chips.push(`<span class="understood-chip"><i class="fa-solid fa-laptop-code"></i> ${sigs.workloadType}</span>`);
        }
        if (sigs.projectPurpose) {
            chips.push(`<span class="understood-chip"><i class="fa-solid fa-graduation-cap"></i> ${sigs.projectPurpose}</span>`);
        }
        if (sigs.traffic) {
            chips.push(`<span class="understood-chip"><i class="fa-solid fa-users"></i> Expected users: ~${sigs.traffic.replace(/users/i, '').trim()}</span>`);
        } else if (sigs.expectedScale) {
            chips.push(`<span class="understood-chip"><i class="fa-solid fa-users"></i> ${sigs.expectedScale}</span>`);
        }
        if (sigs.databaseNeeds && sigs.databaseNeeds.toLowerCase().includes("yes")) {
            chips.push(`<span class="understood-chip"><i class="fa-solid fa-database"></i> Database / Accounts Needed</span>`);
        }
        if (sigs.costPriority) {
            chips.push(`<span class="understood-chip"><i class="fa-solid fa-tag"></i> Cost Priority: <strong>${sigs.costPriority}</strong></span>`);
        } else if (sigs.budgetSensitivity) {
            const bWord = sigs.budgetSensitivity.includes("Very High") ? "Very High" : sigs.budgetSensitivity.split(" ")[0];
            chips.push(`<span class="understood-chip"><i class="fa-solid fa-tag"></i> Cost Priority: <strong>${bWord}</strong></span>`);
        }
        if (sigs.simplicityPreference && sigs.simplicityPreference.toLowerCase().includes("high")) {
            chips.push(`<span class="understood-chip"><i class="fa-solid fa-wand-magic-sparkles"></i> Simple Setup Preferred</span>`);
        }

        if (chips.length === 0) return "";

        return `
            <div class="understood-summary-card">
                <div class="understood-summary-header">
                    <i class="fa-solid fa-brain"></i>
                    <span>What CLOUDEx Understands</span>
                </div>
                <div class="understood-chips-list">
                    ${chips.join("")}
                </div>
            </div>
        `;
    }

    function renderUnderstoodRequirementsHtml(fuzzyReqs, mode = "beginner") {
        const modeKey = ["beginner", "intermediate", "expert"].includes(mode) ? mode : "beginner";

        const confidenceLevel = (fuzzyReqs && fuzzyReqs.confidence && fuzzyReqs.confidence.level) || "Medium";
        const confidencePct = (fuzzyReqs && fuzzyReqs.confidence && fuzzyReqs.confidence.percentage) || 75;
        const levelClass = confidenceLevel.toLowerCase();

        let summaryText = "General cloud workload inferred from your messages";
        if (fuzzyReqs && fuzzyReqs.requirementSignals) {
            const sigs = fuzzyReqs.requirementSignals;
            const parts = [];
            if (sigs.workloadType) parts.push(sigs.workloadType);
            if (sigs.projectPurpose) parts.push(sigs.projectPurpose);
            if (sigs.traffic) {
                parts.push(`Expected users: ~${sigs.traffic.replace(/users/i, '').trim()}`);
            } else if (sigs.expectedScale) {
                parts.push(sigs.expectedScale);
            }
            if (sigs.costPriority) {
                parts.push(`Cost Priority: ${sigs.costPriority}`);
            } else if (sigs.budgetSensitivity) {
                const bWord = sigs.budgetSensitivity.includes("Very High") ? "Very High" : sigs.budgetSensitivity.split(" ")[0];
                parts.push(`Cost Priority: ${bWord}`);
            }
            if (parts.length > 0) {
                summaryText = parts.join(" • ");
            }
        }

        const badgesHtml = PREFERENCE_DIMENSION_CONFIG.map((dim) => {
            let level = "Medium";
            if (fuzzyReqs && fuzzyReqs.fuzzyInterpretation && fuzzyReqs.fuzzyInterpretation[dim.key]) {
                level = fuzzyReqs.fuzzyInterpretation[dim.key].linguisticLevel;
            } else if (userModifiedPreferences && typeof userModifiedPreferences[dim.key] === "number") {
                level = toLinguisticLabel(userModifiedPreferences[dim.key]);
            } else if (originalFuzzyPreferences && typeof originalFuzzyPreferences[dim.key] === "number") {
                level = toLinguisticLabel(originalFuzzyPreferences[dim.key]);
            }

            const cssLevel = level.toLowerCase().replace(/\s+/g, "-");
            const dimLabel = dim[modeKey] || dim.beginner;

            return `
                <div class="understood-dim-badge level-${cssLevel}">
                    <span>${dim.icon} ${dimLabel}:</span>
                    <strong>${level}</strong>
                </div>
            `;
        }).join("");

        return `
            <div class="understood-req-header">
                <div class="understood-req-title">
                    <i class="fa-solid fa-brain"></i>
                    <span>How CLOUDEx Understands Your Requirements</span>
                </div>
                <span class="understood-confidence-pill ${levelClass}" title="Internal decision-support confidence indicator">
                    Confidence: ${confidenceLevel} (${confidencePct}%)
                </span>
            </div>
            <div class="understood-summary-line">
                <strong>Context:</strong> ${summaryText}
            </div>
            <div class="understood-interpretations-grid">
                ${badgesHtml}
            </div>
        `;
    }

    function getPreferenceIntroText(mode) {
        if (mode === "expert") {
            return "Calibrate multidimensional utility weights across infrastructure and operational criteria. Sliders reflect current model understanding:";
        }
        if (mode === "intermediate") {
            return "Adjust architectural priorities and operational trade-offs for your workload. Sliders reflect current model understanding:";
        }
        return "These sliders show what CloudEx currently thinks is important for your project. Change them if you'd like.";
    }

    function createInitialPreferencesPanel(fuzzyPreferences, mode = "beginner") {

        if (!fuzzyPreferences) {
            return "";
        }

        if (!originalFuzzyPreferences) {
            originalFuzzyPreferences = { ...fuzzyPreferences };
        }
        if (!userModifiedPreferences) {
            userModifiedPreferences = { ...fuzzyPreferences };
        }

        const activeValues = userModifiedPreferences || fuzzyPreferences;
        const currentMode = mode || currentExperienceMode || "beginner";
        const introText = getPreferenceIntroText(currentMode);

        let rowsHtml = "";
        PREFERENCE_DIMENSION_CONFIG.forEach((dim) => {
            const rawVal = typeof activeValues[dim.key] === "number"
                ? activeValues[dim.key]
                : (typeof fuzzyPreferences[dim.key] === "number" ? fuzzyPreferences[dim.key] : 0.5);
            const pct = Math.round(rawVal * 100);
            const label = dim[currentMode] || dim.beginner;

            rowsHtml += `
                <div class="preference-row" data-dimension="${dim.key}">
                    <div class="preference-row-header">
                        <span class="preference-name" data-dim-key="${dim.key}">${dim.icon} ${label}</span>
                        <span class="preference-pct" id="pref-pct-${dim.key}">${pct}%</span>
                    </div>
                    <div class="slider-wrapper">
                        <input
                            type="range"
                            class="priority-slider"
                            id="slider-${dim.key}"
                            data-dimension="${dim.key}"
                            min="0"
                            max="100"
                            value="${pct}"
                            aria-label="${label}"
                        />
                    </div>
                    <div class="slider-scale-labels">
                        <span>Less important</span>
                        <span>More important</span>
                    </div>
                </div>
            `;
        });

        const initialTradeoffs = detectClientTradeoffs(activeValues, currentMode);
        const comparisonHtml = (isRecalculated && updatedPreferences && originalFuzzyPreferences)
            ? renderComparisonPanelHtml(generatePreferenceComparison(originalFuzzyPreferences, updatedPreferences, currentMode), currentMode)
            : "";

        return `
            <div class="initial-preferences-panel" id="initialPreferencesPanel">
                <div class="preferences-header">
                    <span class="preferences-tag">YOUR INITIAL CLOUD PREFERENCES</span>
                    <p class="preferences-intro" id="preferencesIntroText">${introText}</p>
                </div>
                <div class="understood-requirements-box" id="understoodRequirementsBox">
                    ${renderUnderstoodRequirementsHtml(currentFuzzyRequirements, currentMode)}
                </div>
                <div class="preferences-list">
                    ${rowsHtml}
                </div>
                <div class="preferences-actions-area">
                    <div class="preferences-status-hint" id="preferencesStatusHint" style="${isRecalculated ? "display: none;" : "display: block;"}">
                        These are the initial priorities CLOUDEx generated from your answers.
                    </div>
                    <button type="button" class="recalculate-preferences-btn ${isRecalculated ? "applied" : ""}" id="recalculatePreferencesBtn">
                        <i class="fa-solid fa-arrows-rotate"></i>
                        <span>${isRecalculated ? "Changes Applied ✓" : "Make These Changes & Recalculate"}</span>
                    </button>
                    <div class="preferences-applied-banner" id="preferencesAppliedBanner" style="${isRecalculated ? "display: flex;" : "display: none;"}">
                        <span class="banner-icon">✓</span>
                        <span class="banner-text">Preferences updated. CloudEx will use these updated priorities for the next recommendation.</span>
                    </div>
                </div>
                <div class="comparison-container" id="comparisonContainer" style="${(isRecalculated && updatedPreferences) ? "display: block;" : "display: none;"}">
                    ${comparisonHtml}
                </div>
                <div class="rec-comparison-container" id="recComparisonContainer" style="${(isRecalculated && currentRecommendationComparison) ? "display: block;" : "display: none;"}">
                    ${currentRecommendationComparison ? renderRecommendationComparisonHtml(currentRecommendationComparison, currentMode) : ""}
                </div>
                <div class="tradeoffs-container" id="tradeoffsContainer">
                    ${renderTradeoffPanelHtml(initialTradeoffs, currentMode)}
                </div>
            </div>
        `;

    }

    function setupPreferenceSliders(container) {

        if (!container) {
            return;
        }

        const sliders =
            container.querySelectorAll(".priority-slider");

        const statusHint =
            container.querySelector("#preferencesStatusHint");

        const appliedBanner =
            container.querySelector("#preferencesAppliedBanner");

        const recalcBtn =
            container.querySelector("#recalculatePreferencesBtn");

        sliders.forEach((slider) => {

            slider.addEventListener("input", () => {

                const dimKey =
                    slider.dataset.dimension;

                const newPct =
                    parseInt(slider.value, 10);

                const pctLabel =
                    container.querySelector(`#pref-pct-${dimKey}`);

                if (pctLabel) {
                    pctLabel.textContent = `${newPct}%`;
                }

                if (!userModifiedPreferences) {
                    userModifiedPreferences = originalFuzzyPreferences
                        ? { ...originalFuzzyPreferences }
                        : {};
                }

                userModifiedPreferences[dimKey] =
                    Math.round((newPct / 100) * 100) / 100;

                if (statusHint) {
                    statusHint.textContent = "Your priorities have been changed. Apply your changes when you're ready.";
                    statusHint.style.display = "block";
                }

                if (appliedBanner && isRecalculated) {
                    appliedBanner.style.display = "none";
                }

                if (recalcBtn) {
                    recalcBtn.classList.remove("applied");
                    const span = recalcBtn.querySelector("span");
                    if (span) {
                        span.textContent = "Make These Changes & Recalculate";
                    }
                }

                // Update trade-offs advisory dynamically in real time (Feature #12)
                updateTradeoffsDisplay(container, userModifiedPreferences, currentExperienceMode);

            });

        });

        if (recalcBtn) {
            recalcBtn.addEventListener("click", () => {
                recalculatePreferences(container);
            });
        }

    }

    function recalculatePreferences(container = document) {

        const sliders =
            container.querySelectorAll(".priority-slider");

        if (!userModifiedPreferences) {
            userModifiedPreferences = originalFuzzyPreferences
                ? { ...originalFuzzyPreferences }
                : {};
        }

        sliders.forEach((slider) => {
            const dimKey = slider.dataset.dimension;
            const pct = parseInt(slider.value, 10);
            userModifiedPreferences[dimKey] =
                Math.round((pct / 100) * 100) / 100;
        });

        // Preserve original AI-generated values intact and store updated values separately
        updatedPreferences = { ...userModifiedPreferences };

        // Mark as recalculated
        isRecalculated = true;
        recalculatedAt = new Date().toISOString();

        // Update UI
        const statusHint =
            container.querySelector("#preferencesStatusHint");
        if (statusHint) {
            statusHint.style.display = "none";
        }

        const appliedBanner =
            container.querySelector("#preferencesAppliedBanner");
        if (appliedBanner) {
            appliedBanner.style.display = "flex";
        }

        const recalcBtn =
            container.querySelector("#recalculatePreferencesBtn");
        if (recalcBtn) {
            recalcBtn.classList.add("applied");
            const span = recalcBtn.querySelector("span");
            if (span) {
                span.textContent = "Changes Applied ✓";
            }
        }

        // Render / refresh comparison between original AI preferences and user preferences (Feature #13)
        updateComparisonDisplay(container, originalFuzzyPreferences, updatedPreferences, currentExperienceMode);

        // Refresh trade-offs for recalculated values (Feature #12)
        updateTradeoffsDisplay(container, updatedPreferences, currentExperienceMode);

        // Update or refresh personalized recommendation and comparison (Features #16 & #17)
        if (typeof fetch !== "undefined") {
            const apiBase = "http://localhost:5000";

            // 1. Fetch compare-recommendations (Feature #17)
            fetch(`${apiBase}/api/advisor/compare-recommendations`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    requirements: (currentFuzzyRequirements && currentFuzzyRequirements.requirementSignals) || (currentRecommendation && currentRecommendation.requirementsUnderstood) || {},
                    originalPreferences: originalFuzzyPreferences || {},
                    updatedPreferences: updatedPreferences || {},
                    mode: currentExperienceMode || "beginner"
                })
            })
            .then((res) => res.json())
            .then((compData) => {
                if (compData && compData.success) {
                    currentRecommendationComparison = compData;
                    if (compData.original && !originalRecommendation) {
                        originalRecommendation = compData.original;
                    }
                    if (compData.updated) {
                        updatedRecommendation = compData.updated;
                    }
                    updateRecommendationComparisonDisplay(container, compData, currentExperienceMode);
                }
            })
            .catch((err) => {
                console.warn("Could not fetch recommendation comparison:", err);
            });

            // 2. Fetch recommend for updated weights (Feature #16)
            fetch(`${apiBase}/api/advisor/recommend`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    requirements: (currentFuzzyRequirements && currentFuzzyRequirements.requirementSignals) || (currentRecommendation && currentRecommendation.requirementsUnderstood) || {},
                    preferences: updatedPreferences,
                    source: "user_updated",
                    mode: currentExperienceMode || "beginner"
                })
            })
            .then((res) => res.json())
            .then((newRec) => {
                if (newRec && newRec.success) {
                    currentRecommendation = newRec;
                    updatedRecommendation = newRec;
                    if (newRec.assumptions) {
                        currentAssumptions = newRec.assumptions;
                    }
                    const recCards = document.querySelectorAll(".final-recommendation-card");
                    recCards.forEach((card) => {
                        const parent = card.parentElement;
                        if (parent) {
                            let next = card.nextElementSibling;
                            while (next && (next.classList.contains("assumptions-card") || next.classList.contains("how-decided-card"))) {
                                const toRemove = next;
                                next = next.nextElementSibling;
                                parent.removeChild(toRemove);
                            }
                            const temp = document.createElement("div");
                            temp.innerHTML = createPersonalizedRecommendationCard(newRec, currentExperienceMode);
                            const children = Array.from(temp.children);
                            if (children.length > 0) {
                                parent.replaceChild(children[0], card);
                                let prev = children[0];
                                for (let i = 1; i < children.length; i++) {
                                    prev.after(children[i]);
                                    prev = children[i];
                                }
                            }
                        }
                    });
                }
            })
            .catch((err) => {
                console.warn("Could not dynamically refresh recommendation after recalculation:", err);
            });
        }

        console.log("Feature #11, #12 & #13: Preferences recalculated:", {
            original: originalFuzzyPreferences,
            updated: updatedPreferences,
            isRecalculated
        });

    }

    function updatePreferencesPanelLabels(mode) {

        const panels =
            document.querySelectorAll(".initial-preferences-panel");

        panels.forEach((panel) => {

            const introEl =
                panel.querySelector("#preferencesIntroText");

            if (introEl) {
                introEl.textContent =
                    getPreferenceIntroText(mode);
            }

            PREFERENCE_DIMENSION_CONFIG.forEach((dim) => {

                const nameEl =
                    panel.querySelector(`.preference-name[data-dim-key="${dim.key}"]`);

                if (nameEl) {
                    const label =
                        dim[mode] || dim.beginner;
                    nameEl.textContent =
                        `${dim.icon} ${label}`;
                }

                const sliderEl =
                    panel.querySelector(`.priority-slider[data-dimension="${dim.key}"]`);

                if (sliderEl) {
                    sliderEl.setAttribute(
                        "aria-label",
                        dim[mode] || dim.beginner
                    );
                }

            });

            // Update preference comparison for new experience mode depth (Feature #13)
            if (isRecalculated && updatedPreferences && originalFuzzyPreferences) {
                updateComparisonDisplay(panel, originalFuzzyPreferences, updatedPreferences, mode);
            }

            // Update trade-off notices for new experience mode depth (Feature #12)
            const activePrefs = updatedPreferences || userModifiedPreferences || originalFuzzyPreferences;
            if (activePrefs) {
                updateTradeoffsDisplay(panel, activePrefs, mode);
            }

            // Update understood requirements for new experience mode (Feature #14)
            const understoodBox = panel.querySelector("#understoodRequirementsBox");
            if (understoodBox) {
                understoodBox.innerHTML = renderUnderstoodRequirementsHtml(currentFuzzyRequirements, mode);
            }

            // Update recommendation comparison for new experience mode depth (Feature #17)
            if (isRecalculated && currentRecommendationComparison) {
                updateRecommendationComparisonDisplay(panel, currentRecommendationComparison, mode);
            }

        });

        // Refresh personalized recommendation cards for new mode (Feature #16 & Feature #20)
        const recCards = document.querySelectorAll(".final-recommendation-card");
        if (recCards.length > 0 && currentRecommendation) {
            recCards.forEach((card) => {
                const parent = card.parentElement;
                if (parent) {
                    let next = card.nextElementSibling;
                    while (next && (next.classList.contains("assumptions-card") || next.classList.contains("how-decided-card"))) {
                        const toRemove = next;
                        next = next.nextElementSibling;
                        parent.removeChild(toRemove);
                    }
                    const temp = document.createElement("div");
                    temp.innerHTML = createPersonalizedRecommendationCard(currentRecommendation, mode);
                    const children = Array.from(temp.children);
                    if (children.length > 0) {
                        parent.replaceChild(children[0], card);
                        let prev = children[0];
                        for (let i = 1; i < children.length; i++) {
                            prev.after(children[i]);
                            prev = children[i];
                        }
                    }
                }
            });
        }

    }

    // Expose preferences accessor for tests and subsequent features
    function getUserPreferences() {
        return {
            original: originalFuzzyPreferences ? { ...originalFuzzyPreferences } : null,
            modified: userModifiedPreferences ? { ...userModifiedPreferences } : null,
            updated: updatedPreferences ? { ...updatedPreferences } : null,
            isRecalculated: isRecalculated,
            recalculatedAt: recalculatedAt
        };
    }

    if (typeof window !== "undefined") {
        window.CloudExPreferences = {
            getUserPreferences,
            recalculatePreferences,
            getTradeoffs: (prefs = null, mode = null) => {
                const p = prefs || updatedPreferences || userModifiedPreferences || originalFuzzyPreferences || {};
                const m = mode || currentExperienceMode || "beginner";
                return detectClientTradeoffs(p, m);
            },
            getPreferenceComparison: (mode = null) => {
                if (!originalFuzzyPreferences || !updatedPreferences) return null;
                return generatePreferenceComparison(originalFuzzyPreferences, updatedPreferences, mode || currentExperienceMode || "beginner");
            },
            getFuzzyRequirements: () => currentFuzzyRequirements,
            getMcdmResult: () => currentMcdmResult,
            getRecommendation: () => currentRecommendation,
            getOriginalRecommendation: () => originalRecommendation,
            getUpdatedRecommendation: () => updatedRecommendation,
            getRecommendationComparison: () => currentRecommendationComparison,
            getHowDecided: () => currentRecommendation ? currentRecommendation.howDecided : null,
            openDecisionSystemGuide: (mode = null) => openDecisionSystemGuide(mode),
            closeDecisionSystemGuide: () => closeDecisionSystemGuide(),
            getDecisionGuideData: (mode = null) => fetchDecisionGuide(mode || currentExperienceMode || "beginner"),
            getAssumptions: () => currentAssumptions,
            applyAssumptionCorrection: (id, promptText) => applyAssumptionCorrection(id, promptText)
        };
    }

    // =========================================================
    // UNDERSTANDING CLOUDEx DECISION SYSTEM GUIDE (FEATURE #19)
    // =========================================================

    async function fetchDecisionGuide(mode = "beginner") {
        try {
            const apiBase = "http://localhost:5000";
            const res = await fetch(`${apiBase}/api/advisor/decision-guide?mode=${mode}`);
            if (res.ok) {
                return await res.json();
            }
        } catch (e) {
            console.warn("Could not fetch remote decision guide:", e);
        }
        return null;
    }

    function renderGuideContentHtml(guide) {
        if (!guide || !Array.isArray(guide.sections)) {
            return "";
        }

        const sectionsHtml = guide.sections.map((sec) => `
            <div class="decision-guide-section-item">
                <div class="decision-guide-section-head">
                    <span class="decision-guide-section-num">${sec.number}</span>
                    <i class="fa-solid ${sec.icon || 'fa-info-circle'}"></i>
                    <span>${sec.title}</span>
                </div>
                <p class="decision-guide-section-text">${sec.text}</p>
                ${sec.example ? `
                    <div class="decision-guide-example-box">
                        <i class="fa-solid fa-lightbulb"></i>
                        <span><strong>Example:</strong> ${sec.example}</span>
                    </div>
                ` : ''}
                ${sec.analogy ? `
                    <div class="decision-guide-analogy-box">
                        <i class="fa-solid fa-laptop"></i>
                        <span><strong>Analogy:</strong> ${sec.analogy}</span>
                    </div>
                ` : ''}
                ${sec.formula ? `
                    <div class="decision-guide-formula-box">
                        <i class="fa-solid fa-calculator"></i>
                        <span>${sec.formula}</span>
                    </div>
                ` : ''}
            </div>
        `).join("");

        const disc = guide.disclaimers || {};

        return `
            <div class="decision-guide-intro-banner">
                <i class="fa-solid fa-graduation-cap"></i>
                <span>${guide.subtitle || "Learn how CLOUDEx interprets requirements and calculates matches."}</span>
            </div>
            ${sectionsHtml}
            <div class="decision-guide-disclaimer-box">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span><strong>Important Notice:</strong> ${disc.cspEvaluationDisclaimer || "Provider evaluation values are project-maintained decision-support data."}</span>
            </div>
        `;
    }

    async function openDecisionSystemGuide(mode = null) {
        const targetMode = mode || currentExperienceMode || "beginner";
        let overlay = document.getElementById("decisionGuideOverlay");

        if (!overlay) {
            overlay = document.createElement("div");
            overlay.className = "decision-guide-modal-overlay";
            overlay.id = "decisionGuideOverlay";
            overlay.innerHTML = `
                <div class="decision-guide-modal" role="dialog" aria-modal="true" aria-labelledby="decisionGuideTitle">
                    <div class="decision-guide-modal-header">
                        <div class="decision-guide-modal-title" id="decisionGuideTitle">
                            <i class="fa-solid fa-circle-question"></i>
                            <span>Understanding CLOUDEx's Decision System</span>
                        </div>
                        <button type="button" class="decision-guide-close-btn" id="decisionGuideCloseBtn" aria-label="Close Guide">
                            &times;
                        </button>
                    </div>
                    <div class="decision-guide-modal-body" id="decisionGuideBody">
                        <div style="text-align: center; color: var(--text-muted); padding: 20px;">
                            <i class="fa-solid fa-spinner fa-spin"></i> Loading guide...
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            overlay.addEventListener("click", (e) => {
                if (e.target === overlay) {
                    closeDecisionSystemGuide();
                }
            });

            const closeBtn = overlay.querySelector("#decisionGuideCloseBtn");
            if (closeBtn) {
                closeBtn.addEventListener("click", closeDecisionSystemGuide);
            }

            document.addEventListener("keydown", (e) => {
                if (e.key === "Escape" && overlay.classList.contains("active")) {
                    closeDecisionSystemGuide();
                }
            });
        }

        overlay.classList.add("active");

        const bodyEl = overlay.querySelector("#decisionGuideBody");
        const guideData = await fetchDecisionGuide(targetMode);
        if (guideData && bodyEl) {
            bodyEl.innerHTML = renderGuideContentHtml(guideData);
        }
    }

    function closeDecisionSystemGuide() {
        const overlay = document.getElementById("decisionGuideOverlay");
        if (overlay) {
            overlay.classList.remove("active");
        }
    }

    // =========================================================
    // EXPLAINABLE AI ASSUMPTIONS (FEATURE #20)
    // =========================================================

    function applyAssumptionCorrection(id, promptText) {
        const input = document.getElementById("messageInput");
        if (input) {
            input.value = promptText || "";
            input.focus();
            input.scrollIntoView({ behavior: "smooth" });
        }
    }

    function renderAssumptionsCardHtml(assumptions, mode = "beginner") {
        if (!assumptions) return "";

        const hasAssumptions = Boolean(assumptions.hasAssumptions && assumptions.assumed && assumptions.assumed.length > 0);

        const userProvidedList = Array.isArray(assumptions.userProvided) ? assumptions.userProvided : [];
        const inferredList = Array.isArray(assumptions.inferred) ? assumptions.inferred : [];
        const assumedList = Array.isArray(assumptions.assumed) ? assumptions.assumed : [];

        const userProvidedHtml = userProvidedList.length > 0 ? `
            <div class="assumption-group">
                <div class="assumption-group-title user-provided">
                    <i class="fa-solid fa-circle-check"></i>
                    <span>WHAT YOU TOLD US</span>
                </div>
                <div class="assumption-items-list">
                    ${userProvidedList.map(u => `
                        <div class="assumption-item user-provided-item">
                            <span class="assumption-bullet"><i class="fa-solid fa-check"></i></span>
                            <div class="assumption-text">
                                <strong>${u.description}:</strong> ${u.value}
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>
        ` : "";

        const inferredHtml = inferredList.length > 0 ? `
            <div class="assumption-group">
                <div class="assumption-group-title inferred">
                    <i class="fa-solid fa-brain"></i>
                    <span>WHAT CLOUDEx INFERRED</span>
                </div>
                <div class="assumption-items-list">
                    ${inferredList.map(inf => `
                        <div class="assumption-item inferred-item">
                            <span class="assumption-bullet">•</span>
                            <div class="assumption-text">
                                <strong>${inf.description}:</strong> ${inf.value}
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>
        ` : "";

        const assumedHtml = hasAssumptions ? `
            <div class="assumption-group">
                <div class="assumption-group-title assumed">
                    <i class="fa-solid fa-circle-question"></i>
                    <span>WHAT CLOUDEx ASSUMED</span>
                </div>
                <div class="assumption-items-list">
                    ${assumedList.map(a => {
                        const impactLevel = (a.impact || "medium").toLowerCase();
                        const safePrompt = (a.promptTemplate || a.changeAction || "").replace(/'/g, "\\'").replace(/"/g, '&quot;');
                        return `
                            <div class="assumption-item assumed-item">
                                <div class="assumption-item-header">
                                    <div class="assumption-text">
                                        <span class="assumption-bullet">•</span>
                                        <strong>${a.description}:</strong> ${a.value}
                                    </div>
                                    <span class="assumption-impact-pill impact-${impactLevel}">${impactLevel.toUpperCase()} IMPACT</span>
                                </div>
                                <div class="assumption-reason-box">
                                    <i class="fa-solid fa-info-circle"></i>
                                    <span>${a.reason}</span>
                                </div>
                                ${a.impactExplanation ? `
                                    <div class="assumption-influence-note">
                                        <i class="fa-solid fa-chart-simple"></i>
                                        <span>${a.impactExplanation}</span>
                                    </div>
                                ` : ''}
                                ${a.changeable ? `
                                    <div class="assumption-action-row">
                                        <button type="button" class="assumption-change-btn" onclick="window.CloudExPreferences.applyAssumptionCorrection('${a.id}', '${safePrompt}')">
                                            <i class="fa-solid fa-pen-to-square"></i> ${a.changeAction || "Change this"}
                                        </button>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join("")}
                </div>
            </div>
        ` : `
            <div class="assumption-group">
                <div class="assumption-group-title assumed">
                    <i class="fa-solid fa-circle-question"></i>
                    <span>WHAT CLOUDEx ASSUMED</span>
                </div>
                <p class="assumptions-none-text">
                    <i class="fa-solid fa-circle-check" style="color: #35d99a;"></i> CloudEx did not need to make major assumptions.
                </p>
            </div>
        `;

        return `
            <div class="assumptions-card" id="assumptionsCard">
                <div class="assumptions-header">
                    <div class="assumptions-tag">
                        <i class="fa-solid fa-lightbulb"></i>
                        <span>WHAT CLOUDEx ASSUMED</span>
                    </div>
                    <span class="assumptions-badge">${assumedList.length} Assumption${assumedList.length === 1 ? '' : 's'}</span>
                </div>
                <div class="assumptions-body">
                    ${userProvidedHtml}
                    ${inferredHtml}
                    ${assumedHtml}
                </div>
            </div>
        `;
    }

    // =========================================================
    // HOW CLOUDEx DECIDED EXPLAINABILITY (FEATURE #18)
    // =========================================================

    function renderHowDecidedHtml(howDecided, mode = "beginner") {
        if (!howDecided || !howDecided.mcdm) {
            return "";
        }

        const inp = howDecided.inputSummary || {};
        const reqs = howDecided.requirementsUnderstood || {};
        const mcdm = howDecided.mcdm || {};
        const topRankings = (mcdm.ranking || []).slice(0, 5);
        const allRankings = mcdm.ranking || [];

        const stage1Html = `
            <div class="how-decided-step-item">
                <div class="how-decided-step-title"><i class="fa-solid fa-user"></i> 1. User Input Summary</div>
                <div class="how-decided-chips-grid">
                    <div class="how-decided-chip"><span class="chip-label">Project</span><span class="chip-val">${inp.project || "General Project"}</span></div>
                    <div class="how-decided-chip"><span class="chip-label">Budget</span><span class="chip-val">${inp.budget || "Standard"}</span></div>
                    <div class="how-decided-chip"><span class="chip-label">Scale</span><span class="chip-val">${inp.scale || "Standard"}</span></div>
                    <div class="how-decided-chip"><span class="chip-label">Experience</span><span class="chip-val">${inp.experience || mode}</span></div>
                </div>
            </div>
        `;

        const reqKeys = ["workload", "scale", "budgetSensitivity", "simplicity", "database", "aiGpu", "geographic", "compliance"];
        const stage2Chips = reqKeys.map((k) => {
            const item = reqs[k];
            if (!item) return "";
            const isStated = item.statedByUser;
            return `
                <div class="how-decided-chip">
                    <span class="chip-label">${item.dimension}</span>
                    <span class="chip-val">${item.value}</span>
                    <span class="chip-source ${isStated ? "stated" : "assumed"}">${isStated ? "User Stated" : "CLOUDEx Assumed"}</span>
                </div>
            `;
        }).filter(Boolean).join("");

        const stage2Html = `
            <div class="how-decided-step-item">
                <div class="how-decided-step-title"><i class="fa-solid fa-brain"></i> 2. Requirements Understood (User Stated vs Assumed)</div>
                <div class="how-decided-chips-grid">
                    ${stage2Chips}
                </div>
            </div>
        `;

        const stage3Chips = (howDecided.fuzzyPreferences || []).map((f) => `
            <div class="how-decided-chip">
                <span class="chip-label">${f.label}</span>
                <span class="chip-val">${f.percentage}% (${f.linguisticLevel})</span>
                ${f.isUserUpdated ? '<span class="chip-source stated">User Calibrated</span>' : '<span class="chip-source assumed">AI Inferred</span>'}
            </div>
        `).join("");

        const stage3Html = `
            <div class="how-decided-step-item">
                <div class="how-decided-step-title"><i class="fa-solid fa-sliders"></i> 3. Fuzzy Preferences (${howDecided.userPriorities ? howDecided.userPriorities.status : "Active Weights"})</div>
                <div class="how-decided-chips-grid">
                    ${stage3Chips}
                </div>
            </div>
        `;

        const tradeoffs = howDecided.tradeoffs || [];
        const stage4Html = `
            <div class="how-decided-step-item">
                <div class="how-decided-step-title"><i class="fa-solid fa-scale-balanced"></i> 4. Trade-Off Detection</div>
                ${tradeoffs.length > 0 ? `
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        ${tradeoffs.map((t) => `
                            <div style="font-size: 11.5px; color: #cbd5e1;">
                                <strong style="color: #fbbf24;">${t.title}:</strong> ${t.explanation}
                            </div>
                        `).join("")}
                    </div>
                ` : `<p style="margin: 0; font-size: 11.5px; color: #a7f3d0;"><i class="fa-solid fa-check"></i> No architectural tensions detected; criteria are well-balanced.</p>`}
            </div>
        `;

        const mcdmRows = (mcdm.criteria || []).map((c) => `
            <tr>
                <td>${c.label}</td>
                <td>${c.userWeightPct}%</td>
                <td>${c.providerFitPct}%</td>
                <td><strong>${c.weightedContribution}</strong></td>
            </tr>
        `).join("");

        const stage5Html = `
            <div class="how-decided-step-item">
                <div class="how-decided-step-title"><i class="fa-solid fa-calculator"></i> 5. Weighted MCDM Calculation for Top Winner</div>
                <p style="margin: 0; font-size: 11.5px; color: var(--text-muted);">${mcdm.description}</p>
                <div style="font-size: 11px; font-weight: 700; color: #c084fc; margin-top: 4px;">Formula: <code>${mcdm.formula}</code></div>
                <table class="how-decided-mcdm-table">
                    <thead>
                        <tr>
                            <th>Criterion</th>
                            <th>User Weight</th>
                            <th>Provider Fit</th>
                            <th>Weighted Contribution</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${mcdmRows}
                    </tbody>
                </table>
            </div>
        `;

        const stage6Html = `
            <div class="how-decided-step-item">
                <div class="how-decided-step-title"><i class="fa-solid fa-ranking-star"></i> 6. CSP Ranking (All 15 Evaluated)</div>
                <div class="how-decided-rankings-box" id="topRankingsBox">
                    ${topRankings.map((r) => `
                        <div class="how-decided-ranking-row ${r.isWinner ? "winner" : ""}">
                            <span>#${r.rank} ${r.name} ${r.isWinner ? "★ (Winner)" : ""}</span>
                            <strong>${r.matchPercentage}% Fit</strong>
                        </div>
                    `).join("")}
                </div>
                <div class="how-decided-rankings-box" id="allRankingsBox" style="display: none;">
                    ${allRankings.map((r) => `
                        <div class="how-decided-ranking-row ${r.isWinner ? "winner" : ""}">
                            <span>#${r.rank} ${r.name} ${r.isWinner ? "★ (Winner)" : ""}</span>
                            <strong>${r.matchPercentage}% Fit</strong>
                        </div>
                    `).join("")}
                </div>
                ${allRankings.length > 5 ? `
                    <button type="button" class="how-decided-all-btn" onclick="const b=this.parentElement.querySelector('#allRankingsBox'); const t=this.parentElement.querySelector('#topRankingsBox'); if(b.style.display==='none'){b.style.display='flex'; t.style.display='none'; this.textContent='Show Top 5 Only';}else{b.style.display='none'; t.style.display='flex'; this.textContent='Show All 15 Providers';}">
                        Show All 15 Providers
                    </button>
                ` : ""}
                <div class="how-decided-disclaimer">${mcdm.disclaimer}</div>
            </div>
        `;

        const why = howDecided.whyWinnerWon || {};
        const stage7Html = `
            <div class="how-decided-step-item">
                <div class="how-decided-step-title"><i class="fa-solid fa-award"></i> 7. Why the Winner Won (${why.providerName || "Recommended Cloud"})</div>
                <p style="margin: 0; font-size: 12px; color: #cbd5e1; line-height: 1.5;">${why.summary || ""}</p>
                ${Array.isArray(why.topFactors) ? `
                    <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 6px;">
                        ${why.topFactors.map((f) => `<span style="font-size: 11.5px; color: #e2e8f0;"><i class="fa-solid fa-check" style="color: #35d99a; font-size: 10px; margin-right: 6px;"></i>${f}</span>`).join("")}
                    </div>
                ` : ""}
                ${why.officialUrl ? `
                    <div style="margin-top: 8px;">
                        <a href="${why.officialUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 11px; color: #38bdf8; text-decoration: none; display: inline-flex; align-items: center; gap: 5px;">
                            <i class="fa-solid fa-arrow-up-right-from-square"></i> Visit ${why.providerName || "Provider"} Official Website
                        </a>
                    </div>
                ` : ""}
            </div>
        `;

        return `
            <div class="how-decided-card" id="howDecidedCard">
                <div class="how-decided-header" onclick="const c=this.parentElement.querySelector('#howDecidedContent'); const btn=this.querySelector('#howDecidedToggleText'); if(c.classList.contains('open')){c.classList.remove('open'); btn.textContent='Explore Decision Pipeline ▼';}else{c.classList.add('open'); btn.textContent='Close Decision Pipeline ▲';}">
                    <div class="how-decided-tag">
                        <i class="fa-solid fa-sitemap"></i>
                        <span>HOW CLOUDEx DECIDED</span>
                    </div>
                    <button type="button" class="how-decided-toggle-btn" id="howDecidedToggleText">
                        Explore Decision Pipeline ▼
                    </button>
                </div>
                <div class="how-decided-content" id="howDecidedContent">
                    <div class="how-decided-pipeline-steps">
                        ${stage1Html}
                        ${stage2Html}
                        ${stage3Html}
                        ${stage4Html}
                        ${stage5Html}
                        ${stage6Html}
                        ${stage7Html}
                    </div>
                </div>
            </div>
        `;
    }

    // =========================================================
    // PROGRESSIVE ADVISOR UI HELPERS & DRAWER TOGGLES
    // =========================================================

    window.CloudExToggleRecSection = function(sectionKey, btnElement) {
        const card = (btnElement && btnElement.closest(".final-recommendation-card")) || document.getElementById("finalRecommendationCard");
        if (!card) return;

        const drawer = card.querySelector("#recDrawerContainer") || document.getElementById("recDrawerContainer");
        if (!drawer) return;

        const targetSection = drawer.querySelector(`#recDrawerSection-${sectionKey}`);
        if (!targetSection) return;

        const isCurrentlyActive = targetSection.classList.contains("active");

        // Close all sections and clear active state on buttons
        const allSections = drawer.querySelectorAll(".rec-drawer-section");
        allSections.forEach((sec) => sec.classList.remove("active"));

        const toolbar = card.querySelector("#recActionToolbar") || document.getElementById("recActionToolbar");
        if (toolbar) {
            const allBtns = toolbar.querySelectorAll(".rec-toolbar-btn");
            allBtns.forEach((b) => b.classList.remove("active"));
        }

        if (!isCurrentlyActive) {
            targetSection.classList.add("active");
            if (btnElement) {
                btnElement.classList.add("active");
            }
            setTimeout(() => {
                targetSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }, 60);
        }
    };

    window.CloudExSubmitQuickChoice = function(choiceText) {
        const input = document.getElementById("messageInput") || document.getElementById("chatInput");
        const sendBtn = document.getElementById("sendButton") || document.getElementById("sendBtn");
        if (!input) return;
        input.value = choiceText;
        if (sendBtn) {
            sendBtn.click();
        } else {
            const form = input.closest("form");
            if (form) {
                form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
            }
        }
    };

    function renderQuickChoicesHtml(text, reqs, mode = "beginner") {
        if (!text || typeof text !== "string") return "";
        const lower = text.toLowerCase();
        const chips = [];

        if (lower.includes("how many") || lower.includes("traffic") || lower.includes("users") || lower.includes("visitors") || lower.includes("scale")) {
            chips.push({ label: "< 1,000 users", value: "Under 1,000 users / starter scale" });
            chips.push({ label: "1,000 – 50,000 users", value: "1,000 to 50,000 users / moderate traffic" });
            chips.push({ label: "50,000+ users", value: "Over 50,000 users / high traffic" });
            chips.push({ label: "I Don't Know / You Decide", value: "I don't know, please pick a safe default for me" });
        } else if (lower.includes("database") || lower.includes("storage") || lower.includes("postgres") || lower.includes("mysql") || lower.includes("mongodb") || lower.includes("sql")) {
            chips.push({ label: "Yes, PostgreSQL / MySQL", value: "Yes, I need a relational database (PostgreSQL/MySQL)" });
            chips.push({ label: "Yes, MongoDB / NoSQL", value: "Yes, I need a MongoDB / NoSQL database" });
            chips.push({ label: "No database needed", value: "No database needed, static frontend only" });
            chips.push({ label: "I Don't Know / You Decide", value: "I don't know, please pick a safe default for me" });
        } else if (lower.includes("budget") || lower.includes("cost") || lower.includes("spending") || lower.includes("free tier") || lower.includes("price") || lower.includes("monthly")) {
            chips.push({ label: "Lowest cost / Free tier (<$10)", value: "Lowest possible cost or free tier, budget under $10/month" });
            chips.push({ label: "Moderate ($20 – $100/mo)", value: "Moderate budget around $20 to $100/month" });
            chips.push({ label: "Flexible / Enterprise", value: "Flexible budget, performance and reliability come first" });
            chips.push({ label: "I Don't Know / You Decide", value: "I don't know, please pick a safe default for me" });
        } else if (lower.includes("managed") || lower.includes("control") || lower.includes("serverless") || lower.includes("docker") || lower.includes("virtual server") || lower.includes("droplet") || lower.includes("ec2")) {
            chips.push({ label: "Managed platform (simple)", value: "I prefer a managed platform like Render or Vercel for simplicity" });
            chips.push({ label: "Virtual servers (control)", value: "I prefer virtual servers like AWS EC2 or DigitalOcean for full control" });
            chips.push({ label: "Serverless / Containers", value: "I prefer container-based or serverless deployment" });
            chips.push({ label: "I Don't Know / You Decide", value: "I don't know, please pick a safe default for me" });
        } else if (lower.includes("?")) {
            chips.push({ label: "Yes", value: "Yes" });
            chips.push({ label: "No", value: "No" });
            chips.push({ label: "Keep it simple & low cost", value: "I want to keep it simple and low cost" });
            chips.push({ label: "I Don't Know / You Decide", value: "I don't know, please pick a safe default for me" });
        }

        if (chips.length === 0) return "";

        return `
            <div class="chat-quick-choices-row">
                <span class="quick-choices-label"><i class="fa-solid fa-bolt"></i> Quick choice:</span>
                ${chips.map((c) => `
                    <button type="button" class="chat-quick-choice-btn" onclick="window.CloudExSubmitQuickChoice('${c.value.replace(/'/g, "\\'")}')">
                        ${c.label}
                    </button>
                `).join("")}
            </div>
        `;
    }

    function renderUnderstoodExpandedCard(reqs, mode = "beginner") {
        if (!reqs) {
            return `
                <div class="understood-expanded-card">
                    <p style="color:var(--text-muted);font-size:12px;margin:0;">No specific requirements recorded yet.</p>
                </div>
            `;
        }

        const sigs = reqs.requirementSignals || reqs;
        const modeKey = ["beginner", "intermediate", "expert"].includes(mode) ? mode : "beginner";

        const items = [];
        if (sigs.workloadType) items.push({ icon: "fa-laptop-code", label: "Workload Type", val: sigs.workloadType });
        if (sigs.projectPurpose) items.push({ icon: "fa-bullseye", label: "Project Purpose", val: sigs.projectPurpose });
        if (sigs.traffic) items.push({ icon: "fa-users", label: "Expected Scale / Users", val: `~${sigs.traffic.replace(/users/i, '').trim()}` });
        else if (sigs.expectedScale) items.push({ icon: "fa-users", label: "Expected Scale", val: sigs.expectedScale });
        if (sigs.databaseNeeds) items.push({ icon: "fa-database", label: "Database / Storage", val: sigs.databaseNeeds });
        if (sigs.costPriority) items.push({ icon: "fa-tag", label: "Cost Priority", val: sigs.costPriority });
        else if (sigs.budgetSensitivity) items.push({ icon: "fa-tag", label: "Budget Sensitivity", val: sigs.budgetSensitivity });
        if (sigs.simplicityPreference) items.push({ icon: "fa-wand-magic-sparkles", label: "Simplicity Preference", val: sigs.simplicityPreference });
        if (sigs.technicalPreference) items.push({ icon: "fa-server", label: "Architecture / Control", val: sigs.technicalPreference });

        const badgesHtml = PREFERENCE_DIMENSION_CONFIG.map((dim) => {
            let level = "Medium";
            if (reqs.fuzzyInterpretation && reqs.fuzzyInterpretation[dim.key]) {
                level = reqs.fuzzyInterpretation[dim.key].linguisticLevel;
            } else if (userModifiedPreferences && typeof userModifiedPreferences[dim.key] === "number") {
                level = toLinguisticLabel(userModifiedPreferences[dim.key]);
            } else if (originalFuzzyPreferences && typeof originalFuzzyPreferences[dim.key] === "number") {
                level = toLinguisticLabel(originalFuzzyPreferences[dim.key]);
            }
            const cssLevel = level.toLowerCase().replace(/\s+/g, "-");
            const dimLabel = dim[modeKey] || dim.beginner;
            return `
                <div class="understood-dim-badge level-${cssLevel}">
                    <span>${dim.icon} ${dimLabel}:</span>
                    <strong>${level}</strong>
                </div>
            `;
        }).join("");

        return `
            <div class="understood-expanded-card">
                <div class="understood-expanded-title">
                    <i class="fa-solid fa-brain"></i>
                    <span>What CLOUDEx Understood From Your Workload</span>
                </div>
                <p class="understood-expanded-intro">
                    CLOUDEx translated your answers and requirements into the following operational parameters:
                </p>
                <div class="understood-signals-grid">
                    ${items.map((it) => `
                        <div class="understood-signal-item">
                            <div class="understood-signal-label">
                                <i class="fa-solid ${it.icon}"></i>
                                <span>${it.label}</span>
                            </div>
                            <div class="understood-signal-val">${it.val}</div>
                        </div>
                    `).join("")}
                </div>
                <div style="margin-top: 10px;">
                    <div style="font-size: 11px; font-weight: 700; color: #cbd5e1; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
                        Inferred Priority Levels:
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                        ${badgesHtml}
                    </div>
                </div>
            </div>
        `;
    }

    function renderMyPriorityValuesCard(preferences, mode = "beginner") {
        const modeKey = ["beginner", "intermediate", "expert"].includes(mode) ? mode : "beginner";
        const activePrefs = preferences || userModifiedPreferences || updatedPreferences || originalFuzzyPreferences || currentFuzzyPreferences || {};

        const rowsHtml = PREFERENCE_DIMENSION_CONFIG.map((dim) => {
            const rawVal = typeof activePrefs[dim.key] === "number" ? activePrefs[dim.key] : 0.5;
            const pct = Math.round(rawVal * 100);
            const label = dim[modeKey] || dim.beginner;
            const level = toLinguisticLabel(rawVal);
            const cssLevel = level.toLowerCase().replace(/\s+/g, "-");

            return `
                <div class="priority-val-row">
                    <div class="priority-val-info">
                        <span class="priority-val-icon">${dim.icon}</span>
                        <span class="priority-val-name">${label}</span>
                        <span class="understood-dim-badge level-${cssLevel}" style="margin-left: auto; font-size: 10px;">
                            <strong>${level}</strong>
                        </span>
                        <span class="priority-val-pct" style="min-width: 40px; text-align: right; font-weight: 700; color: #38bdf8;">${pct}%</span>
                    </div>
                    <div class="priority-val-bar-bg" style="background: rgba(255,255,255,0.06); height: 6px; border-radius: 3px; overflow: hidden; margin-top: 4px;">
                        <div class="priority-val-bar-fill" style="background: linear-gradient(90deg, #6366f1, #38bdf8); height: 100%; width: ${pct}%; border-radius: 3px; transition: width 0.3s;"></div>
                    </div>
                </div>
            `;
        }).join("");

        return `
            <div class="my-priorities-card">
                <div class="my-priorities-title">
                    <i class="fa-solid fa-sliders"></i>
                    <span>Active Decision Priority Weights</span>
                </div>
                <p class="my-priorities-intro">
                    These normalized weights were evaluated by the Multi-Criteria Decision Making (MCDM) engine to rank all 15 cloud providers.
                </p>
                <div class="my-priorities-list" style="display: flex; flex-direction: column; gap: 8px;">
                    ${rowsHtml}
                </div>
                <div style="margin-top: 10px; font-size: 11.5px; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
                    <i class="fa-solid fa-circle-info" style="color: #38bdf8;"></i>
                    <span>To adjust any priority, click <strong>Make Changes &amp; Recalculate</strong> above.</span>
                </div>
            </div>
        `;
    }

    function renderCompareProvidersCard(rec, mcdmResult) {
        const allRanked = (rec && rec.allRankings) || (mcdmResult && mcdmResult.rankedProviders) || [];
        const topThree = allRanked.slice(0, 3);
        const winnerId = rec && rec.recommendedProvider ? rec.recommendedProvider.id : (topThree[0] ? topThree[0].providerId : null);

        if (topThree.length === 0) {
            return `
                <div class="compare-providers-card">
                    <p style="color:var(--text-muted);font-size:12px;margin:0;">Comparison data not available yet.</p>
                </div>
            `;
        }

        const cardsHtml = topThree.map((item, idx) => {
            const isWinner = item.providerId === winnerId || idx === 0;
            const pName = item.providerName || (item.provider && item.provider.name) || item.name || item.providerId;
            const scorePct = item.matchPercentage || Math.round((item.score || item.recommendationScore || 0) * 100);
            const rank = idx + 1;
            const officialUrl = item.officialUrl || (item.provider && item.provider.officialUrl) || (rec && rec.recommendedProvider && rec.recommendedProvider.id === item.providerId ? rec.recommendedProvider.officialUrl : null);

            return `
                <div class="compare-mini-card ${isWinner ? 'winner-card' : ''}">
                    <div class="compare-mini-badge ${isWinner ? 'winner' : 'runner'}">
                        ${isWinner ? '🥇 #1 RECOMMENDED' : `#${rank} ALTERNATIVE`}
                    </div>
                    <h4>${pName}</h4>
                    <div class="compare-mini-score">${scorePct}% Fit Score</div>
                    ${officialUrl ? `
                        <div style="margin-top: 4px;">
                            <a href="${officialUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 11px; color: #38bdf8; text-decoration: none;">
                                <i class="fa-solid fa-arrow-up-right-from-square"></i> Official site &rarr;
                            </a>
                        </div>
                    ` : ""}
                </div>
            `;
        }).join("");

        return `
            <div class="compare-providers-card">
                <div class="compare-providers-title">
                    <i class="fa-solid fa-layer-group"></i>
                    <span>Top Provider Comparison</span>
                </div>
                <p class="compare-providers-intro">
                    MCDM evaluated all 15 cloud service providers across your priority weights. Here are the top contenders:
                </p>
                <div class="compare-mini-cards-row">
                    ${cardsHtml}
                </div>
                <div style="margin-top: 10px; display: flex; justify-content: flex-end;">
                    <a href="cloud-explorer.html" class="compare-open-page-btn" title="Explore all 15 cloud providers">
                        <i class="fa-solid fa-compass"></i> Explore All 15 Providers in Cloud Explorer &rarr;
                    </a>
                </div>
            </div>
        `;
    }

    function renderTradeoffDrawerContent(rec, mode = "beginner") {
        const activePrefs = updatedPreferences || userModifiedPreferences || originalFuzzyPreferences || currentFuzzyPreferences || {};
        const tradeResult = detectClientTradeoffs(activePrefs, mode);
        return renderTradeoffPanelHtml(tradeResult, mode);
    }

    // =========================================================
    // PERSONALIZED FINAL RECOMMENDATION CARD (FEATURE #16)
    // =========================================================

    function createPersonalizedRecommendationCard(rec, mode = "beginner") {
        if (!rec || !rec.recommendedProvider) {
            return "";
        }

        const provider = rec.recommendedProvider;
        const confidence = rec.confidence || { level: "Medium", percentage: 75, basis: "" };
        const levelClass = (confidence.level || "medium").toLowerCase();
        const scorePct = rec.matchPercentage || Math.round((rec.recommendationScore || 0.85) * 100);

        let whyLines = [];
        if (Array.isArray(rec.whyRecommended) && rec.whyRecommended.length > 0) {
            whyLines = rec.whyRecommended;
        } else {
            whyLines = [`${provider.name} emerged as the best overall match across your active criteria.`];
        }

        const whyHtml = whyLines.map((line) => `<p class="final-rec-why-text">${line}</p>`).join("");

        let strongestHtml = "";
        if (Array.isArray(rec.strongestMatches) && rec.strongestMatches.length > 0) {
            strongestHtml = `
                <div class="final-rec-matches-list">
                    ${rec.strongestMatches.map((m) => `
                        <div class="final-rec-match-item">
                            <i class="fa-solid fa-check"></i>
                            <span><strong>${m.label}:</strong> ${m.note}</span>
                        </div>
                    `).join("")}
                </div>
            `;
        }

        let tradeoffHtml = "";
        if (Array.isArray(rec.tradeoffs) && rec.tradeoffs.length > 0) {
            const topTradeoff = rec.tradeoffs[0];
            const tradeExplanation = (topTradeoff.explanations && topTradeoff.explanations[mode]) || topTradeoff.explanation || "";
            tradeoffHtml = `
                <div class="final-rec-section trade-off-section">
                    <div class="final-rec-section-title">
                        <i class="fa-solid fa-scale-balanced"></i>
                        <span>Where The Trade-Off Is (${topTradeoff.title})</span>
                    </div>
                    <p class="final-rec-tradeoff-text">${tradeExplanation}</p>
                </div>
            `;
        }

        let compromiseHtml = "";
        if (Array.isArray(rec.weakerMatches) && rec.weakerMatches.length > 0) {
            compromiseHtml = `
                <div class="final-rec-section relative-compromise-section">
                    <div class="final-rec-section-title">
                        <i class="fa-solid fa-circle-info"></i>
                        <span>Relative Compromises</span>
                    </div>
                    <div class="final-rec-matches-list">
                        ${rec.weakerMatches.map((w) => `
                            <div class="final-rec-compromise-item">
                                <i class="fa-solid fa-arrow-right"></i>
                                <span>${w.note}</span>
                            </div>
                        `).join("")}
                    </div>
                </div>
            `;
        }

        const runnerUpNote = rec.runnerUp ? ` (Runner-up: ${rec.runnerUp.name} at ${rec.runnerUp.matchPercentage}%)` : "";

        return `
            <div class="final-recommendation-card" id="finalRecommendationCard">
                <div class="final-rec-badge-row">
                    <div class="final-rec-tag">
                        <i class="fa-solid fa-award"></i>
                        <span>Personalized Recommendation</span>
                    </div>
                    <span class="final-rec-confidence-pill ${levelClass}" title="${confidence.basis || ''}">
                        Confidence: ${confidence.level} (${confidence.percentage}%)
                    </span>
                </div>
                <div class="final-rec-hero">
                    <div class="final-rec-hero-info">
                        <h3 class="final-rec-provider-name">${provider.name}</h3>
                        <p class="final-rec-provider-desc">${provider.description || (Array.isArray(provider.categories) ? provider.categories.join(" • ") : "")}</p>
                    </div>
                    <div class="final-rec-score-badge">
                        <span class="final-rec-score-value">${scorePct}%</span>
                        <span class="final-rec-score-label">Fit Score</span>
                    </div>
                </div>
                <div class="final-rec-compact-body">
                    <div class="final-rec-section">
                        <div class="final-rec-section-title">
                            <i class="fa-solid fa-circle-check"></i>
                            <span>Why This Matches You</span>
                        </div>
                        ${whyHtml}
                        ${strongestHtml}
                    </div>
                    ${compromiseHtml}
                </div>
                <div class="final-rec-footer">
                    <div class="final-rec-method-note">
                        <i class="fa-solid fa-microchip"></i>
                        <span>Ranked #1 using Weighted MCDM across all 15 Cloud Service Providers based on your active priority weights.${runnerUpNote}</span>
                    </div>
                    ${provider.officialUrl ? `
                        <a href="${provider.officialUrl}" target="_blank" rel="noopener noreferrer" class="final-rec-official-btn" style="display:none;" aria-hidden="true"></a>
                    ` : ""}
                </div>

                <!-- Progressive Disclosure Action Toolbar -->
                <div class="rec-action-toolbar" id="recActionToolbar">
                    <button type="button" class="rec-toolbar-btn" data-section="understood" onclick="window.CloudExToggleRecSection('understood', this)">
                        <i class="fa-solid fa-brain"></i>
                        <span>What CLOUDEx Understood</span>
                    </button>
                    <button type="button" class="rec-toolbar-btn" data-section="assumptions" onclick="window.CloudExToggleRecSection('assumptions', this)">
                        <i class="fa-solid fa-lightbulb"></i>
                        <span>Assumptions Made</span>
                    </button>
                    <button type="button" class="rec-toolbar-btn" data-section="priorities" onclick="window.CloudExToggleRecSection('priorities', this)">
                        <i class="fa-solid fa-sliders"></i>
                        <span>My Priority Values</span>
                    </button>
                    <button type="button" class="rec-toolbar-btn" data-section="how-decided" onclick="window.CloudExToggleRecSection('how-decided', this)">
                        <i class="fa-solid fa-calculator"></i>
                        <span>How CLOUDEx Decided</span>
                    </button>
                    <button type="button" class="rec-toolbar-btn" data-section="tradeoffs" onclick="window.CloudExToggleRecSection('tradeoffs', this)">
                        <i class="fa-solid fa-scale-balanced"></i>
                        <span>Trade-Offs</span>
                    </button>
                    <button type="button" class="rec-toolbar-btn" data-section="recalculate" onclick="window.CloudExToggleRecSection('recalculate', this)">
                        <i class="fa-solid fa-arrows-rotate"></i>
                        <span>Make Changes &amp; Recalculate</span>
                    </button>
                    <button type="button" class="rec-toolbar-btn" data-section="compare" onclick="window.CloudExToggleRecSection('compare', this)">
                        <i class="fa-solid fa-layer-group"></i>
                        <span>Compare Providers</span>
                    </button>
                    ${provider.officialUrl ? `
                        <a href="${provider.officialUrl}" target="_blank" rel="noopener noreferrer" class="final-rec-official-btn rec-toolbar-btn rec-toolbar-btn-link" title="Visit ${provider.name} Official Website">
                            <i class="fa-solid fa-arrow-up-right-from-square"></i>
                            <span>Visit Official Website &rarr;</span>
                        </a>
                    ` : ""}
                </div>

                <!-- Progressive Disclosure Collapsible Drawer -->
                <div class="rec-drawer-container" id="recDrawerContainer">
                    <div class="rec-drawer-section" id="recDrawerSection-understood" data-section="understood">
                        ${renderUnderstoodExpandedCard(currentFuzzyRequirements || rec.requirementsUnderstood, mode)}
                    </div>
                    <div class="rec-drawer-section" id="recDrawerSection-assumptions" data-section="assumptions">
                        ${rec.assumptions ? renderAssumptionsCardHtml(rec.assumptions, mode) : (currentAssumptions ? renderAssumptionsCardHtml(currentAssumptions, mode) : renderAssumptionsCardHtml({ hasAssumptions: false }, mode))}
                    </div>
                    <div class="rec-drawer-section" id="recDrawerSection-priorities" data-section="priorities">
                        ${renderMyPriorityValuesCard(updatedPreferences || userModifiedPreferences || originalFuzzyPreferences || currentFuzzyPreferences || (rec.mcdmResult && rec.mcdmResult.userWeights), mode)}
                    </div>
                    <div class="rec-drawer-section" id="recDrawerSection-how-decided" data-section="how-decided">
                        ${rec.howDecided ? renderHowDecidedHtml(rec.howDecided, mode) : ""}
                    </div>
                    <div class="rec-drawer-section" id="recDrawerSection-tradeoffs" data-section="tradeoffs">
                        ${renderTradeoffDrawerContent(rec, mode)}
                    </div>
                    <div class="rec-drawer-section" id="recDrawerSection-recalculate" data-section="recalculate">
                        ${createInitialPreferencesPanel(updatedPreferences || userModifiedPreferences || originalFuzzyPreferences || currentFuzzyPreferences, mode)}
                    </div>
                    <div class="rec-drawer-section" id="recDrawerSection-compare" data-section="compare">
                        ${renderCompareProvidersCard(rec, currentMcdmResult)}
                    </div>
                </div>
            </div>
        `;
    }

    // =========================================================
    // ADD MESSAGE TO CHAT
    // =========================================================

    function addMessage(
        role,
        text,
        fuzzyPreferences = null,
        recommendation = null,
        isRecommendationReady = false,
        requirementsData = null
    ) {

        const message =
            document.createElement("div");


        message.className =
            role === "user"
                ? "message user-message"
                : "message ai-message";


        const avatar =
            role === "user"
                ? "👤"
                : "☁";


        const name =
            role === "user"
                ? "You"
                : "Cloudex AI";


        const actions =
            role === "assistant"
                ? createProviderActions(text)
                : "";

        const isRecReady = typeof isRecommendationReady === "boolean"
            ? (isRecommendationReady || Boolean(isRecalculated))
            : (Boolean(isRecalculated) || (typeof text === "string" && (text.includes("🥇") || /my recommendation/i.test(text) || /my pick/i.test(text))));

        const recommendationHtml =
            (role === "assistant" && isRecReady && (recommendation || currentRecommendation))
                ? createPersonalizedRecommendationCard(recommendation || currentRecommendation, currentExperienceMode)
                : "";

        // When the recommendation is ready, do NOT render the raw AI text.
        // The LLM narrative may reference a different provider than the structured
        // recommendation engine result. The structured card is the single authoritative source.
        // During discovery, show the AI's conversational reply text normally.
        const displayText = (role === "assistant" && isRecReady && recommendationHtml)
            ? "" // suppress raw AI text when structured card is shown
            : formatMessage(text);

        // Discovery quick-choice chips (only shown during discovery, never when rec is ready)
        const quickChoicesHtml =
            (role === "assistant" && !isRecReady)
                ? renderQuickChoicesHtml(text, requirementsData || currentFuzzyRequirements, currentExperienceMode)
                : "";

        // NOTE: understoodHtml (renderUnderstoodSummaryCard) is intentionally removed.
        // It was showing "What CLOUDEx Understands" on every discovery message.
        // This information is now ONLY available via the [What CLOUDEx Understood] toolbar button
        // on the final recommendation card.

        message.innerHTML = `

            <div class="message-avatar">
                ${avatar}
            </div>


            <div class="message-content">

                <div class="message-name">
                    ${name}
                </div>


                <div class="message-bubble">

                    ${displayText}

                    ${quickChoicesHtml}

                    ${recommendationHtml}

                    ${actions}

                </div>

            </div>

        `;


        chatMessages.appendChild(
            message
        );


        setupProviderButtons(
            message
        );

        setupPreferenceSliders(
            message
        );


        scrollToBottom();

    }



    // =========================================================
    // SYSTEM NOTICE (FEATURE #7)
    // =========================================================

    function addSystemNotice(text) {

        if (!chatMessages) {
            return;
        }

        const notice =
            document.createElement("div");

        notice.className =
            "system-notice";

        notice.textContent =
            text;

        chatMessages.appendChild(
            notice
        );

        scrollToBottom();

    }


    // =========================================================
    // TYPING INDICATOR
    // =========================================================

    function showTyping() {

        typingIndicator.classList.add(
            "active"
        );


        scrollToBottom();

    }


    function hideTyping() {

        typingIndicator.classList.remove(
            "active"
        );

    }


    // =========================================================
    // SEND MESSAGE TO BACKEND
    // =========================================================

    async function sendMessage(message) {

        if (
            !message ||
            !message.trim()
        ) {

            return;

        }


        const cleanMessage =
            message.trim();


        addMessage(
            "user",
            cleanMessage
        );


        messageInput.value = "";

        messageInput.style.height =
            "auto";

        sendButton.disabled = true;

        showTyping();


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/ai/chat`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            message:
                                cleanMessage,

                            conversation:
                                conversation,

                            userId:
                                currentUserId,

                            chatId:
                                currentChatId,

                            experienceMode:
                                currentExperienceMode,

                            userPreferences:
                                updatedPreferences || userModifiedPreferences || null,

                            isRecalculatedPreferences:
                                isRecalculated

                        })
                    }
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Cloudex AI could not respond."
                );

            }


            if (
                Array.isArray(
                    data.conversation
                )
            ) {

                conversation =
                    data.conversation;

            } else {

                conversation.push({

                    role: "user",

                    content:
                        cleanMessage

                });


                conversation.push({

                    role: "assistant",

                    content:
                        data.reply

                });

            }


            hideTyping();


            if (data.fuzzyPreferences) {
                currentFuzzyPreferences = data.fuzzyPreferences;
                if (!originalFuzzyPreferences) {
                    originalFuzzyPreferences = { ...data.fuzzyPreferences };
                }
            }

            if (data.fuzzyRequirements) {
                currentFuzzyRequirements = data.fuzzyRequirements;
            }

            if (data.mcdm) {
                currentMcdmResult = data.mcdm;
            }

            if (data.recommendation) {
                currentRecommendation = data.recommendation;
                if (data.recommendation.assumptions) {
                    currentAssumptions = data.recommendation.assumptions;
                }
                if (!originalRecommendation && !isRecalculated) {
                    originalRecommendation = data.recommendation;
                }
                if (isRecalculated) {
                    updatedRecommendation = data.recommendation;
                }
            } else if (data.assumptions) {
                currentAssumptions = data.assumptions;
            }

            const isRecReady = Boolean(data.isRecommendationReady) || isRecalculated;

            addMessage(
                "assistant",
                data.reply,
                data.fuzzyPreferences,
                data.recommendation,
                isRecReady,
                data.fuzzyRequirements || data.requirements
            );


            await saveRecommendation(
                cleanMessage,
                data.reply
            );


            await loadChatHistory();


        } catch (error) {

            console.error(
                "Cloudex AI error:",
                error
            );


            hideTyping();


            addMessage(
                "assistant",
                error.message || "Sorry, I couldn't connect to Cloudex AI right now. Please make sure the backend is running and try again."
            );

        } finally {

            sendButton.disabled = false;

            messageInput.focus();

        }

    }


    // =========================================================
    // FORM SUBMIT
    // =========================================================

    chatForm.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();


            sendMessage(
                messageInput.value
            );

        }
    );


    // =========================================================
    // ENTER TO SEND
    // SHIFT + ENTER = NEW LINE
    // =========================================================

    messageInput.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                chatForm.requestSubmit();

            }

        }
    );


    // =========================================================
    // AUTO-GROW TEXTAREA
    // =========================================================

    messageInput.addEventListener(
        "input",
        () => {

            messageInput.style.height =
                "auto";


            messageInput.style.height =
                Math.min(
                    messageInput.scrollHeight,
                    130
                ) + "px";

        }
    );


    // =========================================================
    // HOW CLOUDEx WORKS / DECISION SYSTEM GUIDE BUTTONS
    // =========================================================

    const navDecisionGuideBtn = document.getElementById("navDecisionGuideBtn");
    if (navDecisionGuideBtn) {
        navDecisionGuideBtn.addEventListener("click", () => {
            openDecisionSystemGuide();
        });
    }

    const headerDecisionGuideBtn = document.getElementById("headerDecisionGuideBtn");
    if (headerDecisionGuideBtn) {
        headerDecisionGuideBtn.addEventListener("click", () => {
            openDecisionSystemGuide();
        });
    }


    // =========================================================
    // MOBILE HISTORY DRAWER TOGGLE
    // =========================================================

    const historyToggleBtn = document.getElementById("historyToggleBtn");
    if (historyToggleBtn && chatHistory) {
        historyToggleBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            chatHistory.classList.toggle("drawer-open");
        });

        document.addEventListener("click", (e) => {
            if (chatHistory.classList.contains("drawer-open") && !chatHistory.contains(e.target) && e.target !== historyToggleBtn) {
                chatHistory.classList.remove("drawer-open");
            }
        });
    }


    // =========================================================
    // QUICK PROMPTS
    // =========================================================

    quickPrompts.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const message =
                        button.dataset.message;


                    sendMessage(
                        message
                    );

                }
            );

        }
    );


    // =========================================================
    // NEW CHAT - SIDEBAR +
    // =========================================================

    if (newChatButton) {

        newChatButton.addEventListener(
            "click",
            async () => {

                await createNewChat();

            }
        );

    }


    // =========================================================
    // NEW CONVERSATION - CHAT HEADER BUTTON
    // =========================================================

    if (clearChatButton) {

        clearChatButton.addEventListener(
            "click",
            async () => {

                await createNewChat();

            }
        );

    }


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    try {

        const historyResponse =
            await fetch(
                `${API_BASE_URL}/api/chat/user/${currentUserId}`
            );


        const historyData =
            await historyResponse.json();


        if (
            historyResponse.ok &&
            historyData.success &&
            Array.isArray(
                historyData.chats
            ) &&
            historyData.chats.length > 0
        ) {

            const chats =
                [...historyData.chats].sort(
                    (a, b) => {

                        const dateA =
                            new Date(
                                a.updatedAt ||
                                a.createdAt ||
                                0
                            );

                        const dateB =
                            new Date(
                                b.updatedAt ||
                                b.createdAt ||
                                0
                            );

                        return dateB - dateA;

                    }
                );


            currentChatId =
                chats[0]._id;


            const chatResponse =
                await fetch(
                    `${API_BASE_URL}/api/chat/${currentChatId}`
                );


            const chatData =
                await chatResponse.json();


            if (
                chatResponse.ok &&
                chatData.success &&
                chatData.chat
            ) {

                conversation =
                    Array.isArray(
                        chatData.chat.messages
                    )
                        ? chatData.chat.messages.map(
                            (message) => ({

                                role:
                                    message.role,

                                content:
                                    message.content

                            })
                        )
                        : [];

            }


        } else {

            const chatResponse =
                await fetch(
                    `${API_BASE_URL}/api/chat`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            userId:
                                currentUserId

                        })
                    }
                );


            const chatData =
                await chatResponse.json();


            if (
                !chatResponse.ok ||
                !chatData.success
            ) {

                console.error(
                    "Could not create chat."
                );

                return;

            }


            currentChatId =
                chatData.chat._id;


            conversation = [];

        }


        renderConversation();


        await loadChatHistory();


    } catch (error) {

        console.error(
            "Could not initialize chat:",
            error
        );


        if (historyList) {

            historyList.innerHTML = `

                <div class="history-empty">
                    Could not load conversations.
                </div>

            `;

        }


        return;

    }


    // =========================================================
    // INITIAL FOCUS
    // =========================================================

    messageInput.focus();

});