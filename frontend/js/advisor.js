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

                    </div>

                </div>

            </div>

        `;

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
    // ADD MESSAGE TO CHAT
    // =========================================================

    function addMessage(
        role,
        text
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


        message.innerHTML = `

            <div class="message-avatar">
                ${avatar}
            </div>


            <div class="message-content">

                <div class="message-name">
                    ${name}
                </div>


                <div class="message-bubble">

                    ${formatMessage(text)}

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
                                currentExperienceMode

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


            addMessage(
                "assistant",
                data.reply
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
                "Sorry, I couldn't connect to Cloudex AI right now. Please make sure the backend is running and try again."
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