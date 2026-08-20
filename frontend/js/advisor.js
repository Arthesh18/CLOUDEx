// =========================================================
// CLOUDEX AI ADVISOR
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

    const chatForm = document.getElementById("chatForm");
    const messageInput = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendButton");
    const chatMessages = document.getElementById("chatMessages");
    const typingIndicator = document.getElementById("typingIndicator");
    const clearChatButton = document.getElementById("clearChat");
    const quickPrompts = document.querySelectorAll(".quick-prompt");

    // -----------------------------------------------------
    // Conversation memory
    // -----------------------------------------------------

    let conversation = [];


    // -----------------------------------------------------
    // Add message to chat
    // -----------------------------------------------------

    function addMessage(role, text) {

        const message = document.createElement("div");

        message.className =
            role === "user"
                ? "message user-message"
                : "message ai-message";

        const avatar = role === "user" ? "👤" : "☁";
        const name = role === "user" ? "You" : "Cloudex AI";

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
                </div>

            </div>
        `;

        chatMessages.appendChild(message);

        scrollToBottom();
    }


    // -----------------------------------------------------
    // Basic text formatting
    // -----------------------------------------------------

    function formatMessage(text) {

        if (!text) {
            return "";
        }

        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\n/g, "<br>");
    }


    // -----------------------------------------------------
    // Scroll chat to bottom
    // -----------------------------------------------------

    function scrollToBottom() {

        chatMessages.scrollTo({
            top: chatMessages.scrollHeight,
            behavior: "smooth"
        });
    }


    // -----------------------------------------------------
    // Typing indicator
    // -----------------------------------------------------

    function showTyping() {

        typingIndicator.classList.add("active");

        scrollToBottom();
    }


    function hideTyping() {

        typingIndicator.classList.remove("active");
    }


    // -----------------------------------------------------
    // Send message to backend
    // -----------------------------------------------------

    async function sendMessage(message) {

        if (!message || !message.trim()) {
            return;
        }

        const cleanMessage = message.trim();

        addMessage("user", cleanMessage);

        messageInput.value = "";

        messageInput.style.height = "auto";

        sendButton.disabled = true;

        showTyping();

        try {

            const response = await fetch("/api/ai/chat", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    message: cleanMessage,
                    conversation: conversation
                })
            });


            const data = await response.json();


            if (!response.ok || !data.success) {

                throw new Error(
                    data.message ||
                    "Cloudex AI could not respond."
                );
            }


            // Save conversation returned by backend

            if (Array.isArray(data.conversation)) {

                conversation = data.conversation;

            } else {

                conversation.push({
                    role: "user",
                    content: cleanMessage
                });

                conversation.push({
                    role: "assistant",
                    content: data.reply
                });
            }


            hideTyping();

            addMessage(
                "assistant",
                data.reply
            );

        } catch (error) {

            console.error("Cloudex AI error:", error);

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


    // -----------------------------------------------------
    // Form submit
    // -----------------------------------------------------

    chatForm.addEventListener("submit", (event) => {

        event.preventDefault();

        sendMessage(messageInput.value);

    });


    // -----------------------------------------------------
    // Enter to send
    // Shift + Enter = new line
    // -----------------------------------------------------

    messageInput.addEventListener("keydown", (event) => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            chatForm.requestSubmit();
        }
    });


    // -----------------------------------------------------
    // Auto-grow textarea
    // -----------------------------------------------------

    messageInput.addEventListener("input", () => {

        messageInput.style.height = "auto";

        messageInput.style.height =
            Math.min(
                messageInput.scrollHeight,
                130
            ) + "px";
    });


    // -----------------------------------------------------
    // Quick prompts
    // -----------------------------------------------------

    quickPrompts.forEach((button) => {

        button.addEventListener("click", () => {

            const message =
                button.dataset.message;

            sendMessage(message);
        });

    });


    // -----------------------------------------------------
    // Clear conversation
    // -----------------------------------------------------

    clearChatButton.addEventListener("click", () => {

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
                            Tell me what you're planning to build,
                            and I'll help you find the right cloud
                            provider.
                        </p>

                    </div>

                </div>

            </div>
        `;

        messageInput.focus();

    });


    // -----------------------------------------------------
    // Initial focus
    // -----------------------------------------------------

    messageInput.focus();

});