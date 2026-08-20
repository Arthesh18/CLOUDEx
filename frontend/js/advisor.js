// =========================================================
// CLOUDEX AI ADVISOR
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

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


    // =====================================================
    // CONVERSATION MEMORY
    // =====================================================

    let conversation = [];


    // =====================================================
    // PROVIDER INFORMATION
    // =====================================================

    const providerMap = {

        aws: {
            id: "aws",
            name: "AWS",
            aliases: [
                "aws",
                "amazon web services",
                "amazon"
            ]
        },

        azure: {
            id: "azure",
            name: "Microsoft Azure",
            aliases: [
                "azure",
                "microsoft azure"
            ]
        },

        gcp: {
            id: "gcp",
            name: "Google Cloud",
            aliases: [
                "gcp",
                "google cloud",
                "google cloud platform"
            ]
        },

        digitalocean: {
            id: "digitalocean",
            name: "DigitalOcean",
            aliases: [
                "digitalocean",
                "digital ocean"
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

        oracle: {
            id: "oracle",
            name: "Oracle Cloud",
            aliases: [
                "oracle cloud",
                "oracle"
            ]
        }

    };


    // =====================================================
    // DETECT RECOMMENDED PROVIDER
    // =====================================================

    function detectProvider(text) {

        if (!text) {
            return null;
        }


        const lowerText =
            text.toLowerCase();


        /*
         * Look for recommendation-style phrases first.
         */

        const recommendationPatterns = [

            /my recommendation[\s\S]{0,300}/i,

            /recommend(?:ed|ation)?[\s\S]{0,300}/i,

            /best (?:choice|fit|option)[\s\S]{0,300}/i,

            /my pick[\s\S]{0,300}/i

        ];


        let recommendationArea =
            lowerText;


        for (
            const pattern
            of recommendationPatterns
        ) {

            const match =
                lowerText.match(pattern);


            if (match) {

                recommendationArea =
                    match[0];

                break;

            }

        }


        // -------------------------------------------------
        // Check recommendation area first
        // -------------------------------------------------

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
                    recommendationArea.includes(
                        alias.toLowerCase()
                    )
                ) {

                    return provider;

                }

            }

        }


        // -------------------------------------------------
        // Fallback: search complete response
        // -------------------------------------------------

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
    // SAVE RECOMMENDATION TO MONGODB
    // =====================================================

    async function saveRecommendation(
        userMessage,
        aiReply
    ) {

        try {

            // ---------------------------------------------
            // Get logged-in user
            // ---------------------------------------------

            const storedUser =
                localStorage.getItem(
                    "cloudexUser"
                );


            if (!storedUser) {

                console.warn(
                    "No logged-in CLOUDEx user found."
                );

                return;

            }


            const user =
                JSON.parse(storedUser);


            if (!user.id) {

                console.warn(
                    "CLOUDEx user ID not found."
                );

                return;

            }


            // ---------------------------------------------
            // Detect provider
            // ---------------------------------------------

            const provider =
                detectProvider(aiReply);


            if (!provider) {

                console.log(
                    "No cloud provider detected. Recommendation not saved."
                );

                return;

            }


            // ---------------------------------------------
            // Save recommendation
            // ---------------------------------------------

            const response =
                await fetch(
                    "/api/recommendations/save",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            userId:
                                user.id,

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

            /*
             * Saving history should NOT break
             * the AI Advisor.
             */

            console.error(
                "Recommendation save error:",
                error
            );

        }

    }


    // =====================================================
    // CREATE PROVIDER ACTION BUTTONS
    // =====================================================

    function createProviderActions(text) {

        const provider =
            detectProvider(text);


        if (!provider) {
            return "";
        }


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
                    data-provider="${provider.id}"
                >

                    <i class="fa-solid fa-chart-column"></i>

                    Compare Providers

                </button>

            </div>

        `;

    }


    // =====================================================
    // ADD MESSAGE TO CHAT
    // =====================================================

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


        // Add button events

        setupProviderButtons(
            message
        );


        scrollToBottom();

    }


    // =====================================================
    // PROVIDER ACTION BUTTONS
    // =====================================================

    function setupProviderButtons(
        container
    ) {

        const exploreButton =
            container.querySelector(
                ".explore-provider-btn"
            );


        const compareButton =
            container.querySelector(
                ".compare-provider-btn"
            );


        // -------------------------------------------------
        // Explore provider
        // -------------------------------------------------

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


        // -------------------------------------------------
        // Compare providers
        // -------------------------------------------------

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


    // =====================================================
    // BASIC TEXT FORMATTING
    // =====================================================

    function formatMessage(text) {

        if (!text) {
            return "";
        }


        return text

            .replace(
                /&/g,
                "&amp;"
            )

            .replace(
                /</g,
                "&lt;"
            )

            .replace(
                />/g,
                "&gt;"
            )

            .replace(
                /\*\*(.*?)\*\*/g,
                "<strong>$1</strong>"
            )

            .replace(
                /\n/g,
                "<br>"
            );

    }


    // =====================================================
    // SCROLL CHAT TO BOTTOM
    // =====================================================

    function scrollToBottom() {

        chatMessages.scrollTo({

            top:
                chatMessages.scrollHeight,

            behavior:
                "smooth"

        });

    }


    // =====================================================
    // TYPING INDICATOR
    // =====================================================

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


    // =====================================================
    // SEND MESSAGE TO BACKEND
    // =====================================================

    async function sendMessage(
        message
    ) {

        if (
            !message ||
            !message.trim()
        ) {

            return;

        }


        const cleanMessage =
            message.trim();


        // -------------------------------------------------
        // Show user message
        // -------------------------------------------------

        addMessage(
            "user",
            cleanMessage
        );


        messageInput.value =
            "";


        messageInput.style.height =
            "auto";


        sendButton.disabled =
            true;


        showTyping();


        try {

            // ---------------------------------------------
            // Send message to AI backend
            // ---------------------------------------------

            const response =
                await fetch(
                    "/api/ai/chat",
                    {

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                message:
                                    cleanMessage,

                                conversation:
                                    conversation

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


            // ---------------------------------------------
            // Save conversation
            // ---------------------------------------------

            if (
                Array.isArray(
                    data.conversation
                )
            ) {

                conversation =
                    data.conversation;

            } else {

                conversation.push({

                    role:
                        "user",

                    content:
                        cleanMessage

                });


                conversation.push({

                    role:
                        "assistant",

                    content:
                        data.reply

                });

            }


            hideTyping();


            // ---------------------------------------------
            // Show AI response
            // ---------------------------------------------

            addMessage(
                "assistant",
                data.reply
            );


            // ---------------------------------------------
            // SAVE RECOMMENDATION TO MONGODB
            // ---------------------------------------------

            await saveRecommendation(
                cleanMessage,
                data.reply
            );


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

            sendButton.disabled =
                false;


            messageInput.focus();

        }

    }


    // =====================================================
    // FORM SUBMIT
    // =====================================================

    chatForm.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();


            sendMessage(
                messageInput.value
            );

        }
    );


    // =====================================================
    // ENTER TO SEND
    // SHIFT + ENTER = NEW LINE
    // =====================================================

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


    // =====================================================
    // AUTO-GROW TEXTAREA
    // =====================================================

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


    // =====================================================
    // QUICK PROMPTS
    // =====================================================

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


    // =====================================================
    // CLEAR CONVERSATION
    // =====================================================

    clearChatButton.addEventListener(
        "click",
        () => {

            conversation = [];


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
                                Fresh conversation started. 👋
                            </p>


                            <p>
                                Tell me what you're planning
                                to build, and I'll help you
                                find the right cloud provider.
                            </p>

                        </div>

                    </div>

                </div>

            `;


            messageInput.focus();

        }
    );


    // =====================================================
    // INITIAL FOCUS
    // =====================================================

    messageInput.focus();

});