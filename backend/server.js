const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const Groq = require("groq-sdk");
const ChatHistory = require("./models/ChatHistory");
const authRoutes = require("./routes/authRoutes");
const recommendationRoutes =
    require("./routes/recommendationRoutes");
const chatRoutes =
    require("./routes/chatRoutes");
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
app.use("/api/auth", authRoutes);
app.use(
    "/api/recommendations",
    recommendationRoutes
);
app.use(
    "/api/chat",
    chatRoutes
);
// ==================================================
// FRONTEND
// ==================================================

const frontendPath =
    path.join(__dirname, "..", "frontend");

app.use(express.static(frontendPath));


// ==================================================
// BASIC API
// ==================================================

app.get("/api/health", (req, res) => {

    res.json({
        success: true,
        message:
            "CLOUDEx backend is running successfully.",
        status: "online"
    });

});


app.get("/api", (req, res) => {

    res.json({
        name: "CLOUDEx API",
        version: "1.0.0",
        message:
            "Explore. Compare. Build Smarter."
    });

});


// ==================================================
// CLOUD PROVIDERS
// ==================================================

app.get(
    "/api/cloud/providers",
    (req, res) => {

        try {

            res.json({
                success: true,
                count: cloudProviders.length,
                providers: getAllProviders()
            });

        } catch (error) {

            console.error(
                "Provider API error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Could not load cloud providers."
            });

        }

    }
);


// ==================================================
// SINGLE PROVIDER
// ==================================================

app.get(
    "/api/providers/:id",
    (req, res) => {

        try {

            const provider =
                getProviderById(
                    req.params.id
                );


            if (!provider) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Cloud provider not found."
                });

            }


            res.json({
                success: true,
                provider
            });

        } catch (error) {

            console.error(
                "Provider details error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Could not load provider details."
            });

        }

    }
);


// ==================================================
// ALL SERVICES
// ==================================================

app.get(
    "/api/services",
    (req, res) => {

        try {

            const services =
                getAllServices();


            res.json({
                success: true,
                count: services.length,
                services
            });

        } catch (error) {

            console.error(
                "Services API error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Could not load cloud services."
            });

        }

    }
);


// ==================================================
// CLOUDEx AI ADVISOR
// ==================================================

app.post(
    "/api/ai/chat",
    async (req, res) => {

        try {

            const {
    message,
    conversation = [],
    userId,
    chatId
} = req.body;


            // ------------------------------------------
            // VALIDATE MESSAGE
            // ------------------------------------------

            if (
                !message ||
                message.trim() === ""
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Please enter a message."
                });

            }


            // ------------------------------------------
            // CHECK GROQ
            // ------------------------------------------

            if (!groq) {

                return res.status(500).json({
                    success: false,
                    message:
                        "Groq API key is not configured."
                });

            }


            console.log(
                "Cloudex AI received:",
                message
            );


            // ------------------------------------------
            // PROVIDER DATA
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

When you have enough information, use this
structure.

🥇 MY RECOMMENDATION

Provider Name

FIT SCORE: X.X / 10

WHY THIS PROVIDER FITS YOUR PROJECT

Start with one short sentence directly connecting
the user's requirements to the recommendation.

Then give 3–5 clear points.

Every point MUST follow this logic:

USER REQUIREMENT
→ PROVIDER CAPABILITY
→ WHY IT MATTERS


Example:

- 🗄️ You need a NoSQL database → Cloud Firestore
  provides a managed NoSQL database → this keeps
  your Node/Express application simple.

- 💰 You want to keep costs low → the provider
  offers suitable low-cost or free-tier options
  → this makes it appropriate for a small
  college project.

- 📈 You expect the project to grow → the provider
  supports scalable infrastructure → you can
  handle more users later without rebuilding
  everything.


IMPORTANT:

Do NOT give generic provider advantages.

Only mention advantages that are relevant to
what the user actually told you.

Always connect the provider's capability to
the user's requirement.


==================================================
WHY NOT THE OTHERS?
==================================================

Mention 1–2 strong alternative providers.

For each alternative, explain ONE important
reason why it was not the first choice for
THIS particular project.

Example:

AWS — Excellent scalability, but it may be
more complex than necessary for this project's
current requirements.

Azure — Strong enterprise capabilities, but
those advantages may not be necessary for
this project.


==================================================
MY PICK
==================================================

End with one clear sentence:

"I recommend [Provider] because it gives you
the best balance of [requirement], [requirement],
and [requirement] for your project."


==================================================
PERSONALIZED REASONING
==================================================

The recommendation MUST be personalized.

The user should understand WHY the provider
was selected.

Do not simply list provider features.

Always explain why a provider capability matters
for the user's project.

Use the user's actual answers from the conversation.

Do not invent requirements.

Do not claim the user needs something they never said.

Do not recommend a provider based only on its
overall reputation.

Base the recommendation on the user's needs.


==================================================
FIT SCORE
==================================================

The FIT SCORE represents how well the provider
matches the user's specific requirements.

It is NOT a universal ranking.

Consider factors such as:

- Cost
- Simplicity
- Required services
- Technology
- User count
- Location
- Scalability
- Reliability
- Security
- Ease of management

Give a reasonable score between 0 and 10.

Use one decimal place.

For example:

8.7 / 10

Do not give every provider the same score.


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


            if (
                Array.isArray(conversation)
            ) {

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

                            content:
                                item.content

                        });

                    }

                });

            }


            messages.push({

                role: "user",

                content:
                    message.trim()

            });


            // ==================================================
            // GROQ REQUEST
            // ==================================================

            const completion =
                await groq.chat.completions.create({

                    messages,

                    model:
                        "openai/gpt-oss-120b",

                    temperature:
                        0.4,

                    max_tokens:
                        900

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
                    content:
                        message.trim()
                },

                {
                    role: "assistant",
                    content:
                        reply
                }

            ];
            // ==================================================
// SAVE CHAT HISTORY
// ==================================================

if (userId && chatId) {

    const chat = await ChatHistory.findOne({
        _id: chatId,
        userId: userId
    });

    if (chat) {

        chat.messages.push(
            {
                role: "user",
                content: message.trim()
            },
            {
                role: "assistant",
                content: reply
            }
        );

        await chat.save();

    } else {

        console.log(
            "Chat not found or does not belong to user."
        );

    }
}

            // ==================================================
            // RESPONSE
            // ==================================================

            res.json({

                success: true,

                reply,

                conversation:
                    updatedConversation

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

    }
);


// ==================================================
// FRONTEND FALLBACK
// ==================================================

app.get(
    "*splat",
    (req, res) => {

        res.sendFile(

            path.join(
                frontendPath,
                "index.html"
            )

        );

    }
);


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


        app.listen(
            PORT,
            () => {

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

            }
        );


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


        app.listen(
            PORT,
            () => {

                console.log(
                    `CLOUDEx running at http://localhost:${PORT}`
                );

            }
        );

    }

};


startServer();