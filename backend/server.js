const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const Groq = require("groq-sdk");

const {
    cloudProviders,
    getAllProviders,
    getProviderById,
    getAllServices
} = require("./data/cloudData");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


// ==================================================
// GROQ
// ==================================================

const groq = process.env.GROQ_API_KEY
    ? new Groq({
        apiKey: process.env.GROQ_API_KEY
    })
    : null;


// ==================================================
// MIDDLEWARE
// ==================================================

app.use(cors());
app.use(express.json());


// ==================================================
// FRONTEND
// ==================================================

const frontendPath = path.join(__dirname, "..", "frontend");

app.use(express.static(frontendPath));


// ==================================================
// BASIC API
// ==================================================

app.get("/api/health", (req, res) => {

    res.json({
        success: true,
        message: "CLOUDEx backend is running successfully.",
        status: "online"
    });

});


app.get("/api", (req, res) => {

    res.json({
        name: "CLOUDEx API",
        version: "1.0.0",
        message: "Explore. Compare. Build Smarter."
    });

});


// ==================================================
// CLOUD PROVIDERS
// ==================================================

app.get("/api/cloud/providers", (req, res) => {

    try {

        res.json({
            success: true,
            count: cloudProviders.length,
            providers: getAllProviders()
        });

    } catch (error) {

        console.error("Provider API error:", error.message);

        res.status(500).json({
            success: false,
            message: "Could not load cloud providers."
        });

    }

});


// ==================================================
// SINGLE PROVIDER
// ==================================================

app.get("/api/providers/:id", (req, res) => {

    try {

        const provider = getProviderById(req.params.id);

        if (!provider) {

            return res.status(404).json({
                success: false,
                message: "Cloud provider not found."
            });

        }

        res.json({
            success: true,
            provider
        });

    } catch (error) {

        console.error("Provider details error:", error.message);

        res.status(500).json({
            success: false,
            message: "Could not load provider details."
        });

    }

});


// ==================================================
// ALL SERVICES
// ==================================================

app.get("/api/services", (req, res) => {

    try {

        const services = getAllServices();

        res.json({
            success: true,
            count: services.length,
            services
        });

    } catch (error) {

        console.error("Services API error:", error.message);

        res.status(500).json({
            success: false,
            message: "Could not load cloud services."
        });

    }

});


// ==================================================
// CLOUDEx AI ADVISOR
// ==================================================

app.post("/api/ai/chat", async (req, res) => {

    try {

        const {
            message,
            conversation = []
        } = req.body;


        // ------------------------------------------
        // Validate message
        // ------------------------------------------

        if (!message || message.trim() === "") {

            return res.status(400).json({
                success: false,
                message: "Please enter a message."
            });

        }


        // ------------------------------------------
        // Check Groq
        // ------------------------------------------

        if (!groq) {

            return res.status(500).json({
                success: false,
                message: "Groq API key is not configured."
            });

        }


        console.log(
            "Cloudex AI received:",
            message
        );


        // ------------------------------------------
        // Provider data
        // ------------------------------------------

        const providerContext =
            JSON.stringify(
                cloudProviders,
                null,
                2
            );


        // ==================================================
        // CLOUDEx AI SYSTEM PROMPT
        // ==================================================

        const systemPrompt = `

You are CLOUDEx AI.

CLOUDEx is an AI-powered cloud decision assistant.

Your job is to talk with users, understand what they
are building, discuss their needs, and eventually
recommend the cloud provider and services that make
the most sense for THEM.

You are a cloud advisor, not a questionnaire.

==================================================
CONVERSATION STYLE
==================================================

Think like a cloud expert.

Speak like a normal, friendly person.

The user may know very little about cloud computing.

Therefore:

- Use simple language.
- Avoid unnecessary technical terms.
- If a technical term is necessary, explain it simply.
- Do not make the user feel like they need cloud
  knowledge to answer your questions.

Think technically.

Speak simply.

==================================================
QUESTIONS
==================================================

Ask a MAXIMUM of 2–3 questions in one response.

Never give the user a long questionnaire.

Questions should be short and easy to understand.

Example:

"How many people do you expect to use it?
A few, hundreds, or thousands?"

Good.

Avoid:

"What is your expected monthly active user
traffic and peak request throughput?"

Bad.

Whenever useful, give simple examples or choices.

Always allow the user to say:

- I'm not sure
- I don't know
- Whatever is cheapest
- I haven't decided

==================================================
DISCUSS WITH THE USER
==================================================

Do not simply ask questions.

First react to what the user has told you.

For example:

"That makes sense. Since this is a small college
project and your budget is very low, we probably
don't need a complicated cloud setup."

Then ask the next 2–3 useful questions.

The conversation should feel like the user is
talking to a knowledgeable advisor.

==================================================
USE PREVIOUS ANSWERS
==================================================

Remember information from earlier messages.

If the user already told you something, do NOT
ask for it again.

For example, if the user already said:

- Small project
- Low budget
- Users are in India
- HTML/CSS/JavaScript

do not ask those questions again.

Use those answers when making decisions.

==================================================
DO NOT ASK EVERYTHING
==================================================

Only ask questions that actually help the
recommendation.

Do not unnecessarily ask about:

- Kubernetes
- advanced networking
- enterprise architecture
- disaster recovery
- complex compliance
- multi-region systems

unless the user's project actually needs them.

==================================================
IMPORTANT REQUIREMENTS TO UNDERSTAND
==================================================

Gradually try to understand relevant things such as:

- What the user is building
- Project size
- Number of users
- Budget
- User location
- Technology they are using
- Whether they need a database
- Whether they need storage
- Whether they need user accounts
- Whether they need payments
- Whether they need AI
- Whether they expect the project to grow
- How comfortable they are with cloud
- Whether they prefer simplicity
- Whether they prefer one provider

You do NOT need to ask all of these.

Ask only what is necessary.

==================================================
BUDGET
==================================================

Budget is extremely important.

Do not recommend a provider simply because it
has the most powerful services.

A technically powerful provider may be a bad
choice if it is too expensive or complicated
for the user's project.

Consider:

- Free tiers
- Low-cost options
- Expected usage
- Simplicity
- Number of services required
- Management effort
- Future growth

Never invent exact current prices.

The CLOUDEx dataset contains pricing information
and pricing models, but it may not represent
live prices.

==================================================
ONE PROVIDER VS MULTIPLE PROVIDERS
==================================================

This is extremely important.

Do NOT automatically choose a different company
for every service.

For example, do not automatically recommend:

Provider A for hosting
Provider B for database
Provider C for AI
Provider D for storage

just because each has a strong individual service.

Many users prefer using one provider for most
of their project because it can be:

- Easier to understand
- Easier to manage
- Easier to maintain
- Easier to learn
- Easier to control

Therefore, evaluate the user's OVERALL situation.

If one provider can reasonably handle most of
their requirements, strongly consider that option.

However, if using multiple providers gives a
major advantage, mention it as an alternative.

==================================================
WHEN TO RECOMMEND
==================================================

Do not recommend immediately if important
information is still missing.

Continue asking useful questions.

Once you have enough information, stop asking
questions.

Say something similar to:

"I think I have enough information now. Let me
compare the options for you."

Then give the recommendation.

==================================================
FINAL RECOMMENDATION LENGTH
==================================================

IMPORTANT:

Keep the final recommendation SHORT.

Normally stay around 150–250 words.

Do NOT produce a huge report.

Do NOT create large tables unless the user
specifically asks for detailed comparison.

The user should be able to understand the
recommendation in less than a minute.

==================================================
FINAL RECOMMENDATION FORMAT
==================================================

Use this general structure:

🥇 MY RECOMMENDATION

Provider Name

Why it fits:
- Simple reason
- Simple reason
- Simple reason

OTHER OPTIONS

Provider B — one short explanation.

Provider C — one short explanation.

MY PICK:
One short final sentence explaining why.

Then optionally say:

"If you'd like, I can show you the exact services
and architecture I'd use."

==================================================
RECOMMENDATION LOGIC
==================================================

Consider the WHOLE project.

Think about:

- Cost
- Simplicity
- Required services
- User experience
- Expected users
- Location
- Future growth
- Reliability
- Security
- Technology
- Ease of management

Do not choose a provider simply because it has
the largest number of features.

==================================================
CLOUD PROVIDER DATA
==================================================

Use this internal CLOUDEx provider dataset as the
primary reference when comparing providers and
services:

${providerContext}

Do not invent CLOUDEx-specific services or pricing
information that is not contained in the dataset.

==================================================
IMPORTANT
==================================================

You are allowed to say:

"I'm not sure."

"You don't need to decide that yet."

"We can keep this simple."

"It depends on how your project grows."

Never pretend to know something that isn't known.

==================================================
PERSONALITY
==================================================

Be:

- Friendly
- Intelligent
- Practical
- Conversational
- Reassuring
- Easy to understand

Never sound like a robotic questionnaire.

Never overwhelm the user.

You are a decision partner.

Think technically.

Speak simply.

`;


        // ==================================================
        // BUILD CONVERSATION
        // ==================================================

        const messages = [

            {
                role: "system",
                content: systemPrompt
            }

        ];


        if (Array.isArray(conversation)) {

            conversation.forEach(item => {

                if (
                    item &&
                    (
                        item.role === "user" ||
                        item.role === "assistant"
                    ) &&
                    typeof item.content === "string"
                ) {

                    messages.push({

                        role: item.role,
                        content: item.content

                    });

                }

            });

        }


        messages.push({

            role: "user",
            content: message.trim()

        });


        // ==================================================
        // GROQ REQUEST
        // ==================================================

        const completion =
            await groq.chat.completions.create({

                messages,

                model: "openai/gpt-oss-120b",

                temperature: 0.4,

                max_tokens: 900

            });


        // ==================================================
        // GET RESPONSE
        // ==================================================

        const reply =
            completion
                .choices?.[0]
                ?.message
                ?.content ||
            "I couldn't generate a response right now.";


        // ==================================================
        // UPDATED CONVERSATION
        // ==================================================

        const updatedConversation = [

            ...conversation,

            {
                role: "user",
                content: message.trim()
            },

            {
                role: "assistant",
                content: reply
            }

        ];


        // ==================================================
        // RESPONSE
        // ==================================================

        res.json({

            success: true,

            reply,

            conversation: updatedConversation

        });


    } catch (error) {

        console.error(
            "AI Advisor error:",
            error.message
        );

        res.status(500).json({

            success: false,

            message:
                "Cloudex AI could not process your request."

        });

    }

});


// ==================================================
// FRONTEND FALLBACK
// ==================================================

app.get("*splat", (req, res) => {

    res.sendFile(
        path.join(
            frontendPath,
            "index.html"
        )
    );

});


// ==================================================
// MONGODB
// ==================================================

const startServer = async () => {

    try {

        if (process.env.MONGO_URI) {

            await mongoose.connect(
                process.env.MONGO_URI
            );

            console.log(
                "MongoDB connected successfully."
            );

        } else {

            console.log(
                "MongoDB URI not configured yet."
            );

            console.log(
                "Starting CLOUDEx in frontend/demo mode."
            );

        }


        app.listen(PORT, () => {

            console.log(
                "----------------------------------------"
            );

            console.log(
                "       CLOUDEx Backend Started"
            );

            console.log(
                "----------------------------------------"
            );

            console.log(
                `Local URL: http://localhost:${PORT}`
            );

            console.log(
                `API URL:   http://localhost:${PORT}/api`
            );

            console.log(
                "----------------------------------------"
            );

        });

    } catch (error) {

        console.error(
            "MongoDB connection failed:"
        );

        console.error(
            error.message
        );

        console.log(
            "Starting server without MongoDB..."
        );

        app.listen(PORT, () => {

            console.log(
                `CLOUDEx running at http://localhost:${PORT}`
            );

        });

    }

};


startServer();