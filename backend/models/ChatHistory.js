const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true
        },

        content: {
            type: String,
            required: true
        },

        // Optional Advisor explanation cards shown with this reply (UI only;
        // never sent to the model). Older messages simply don't have it.
        questionCards: {
            type: mongoose.Schema.Types.Mixed,
            default: undefined
        }
    },
    {
        _id: false
    }
);

const chatHistorySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        title: {
            type: String,
            default: "New Conversation"
        },

        messages: {
            type: [messageSchema],
            default: []
        },

        // Advisor requirement state (known/assumed slots, asked topics) so the
        // Advisor never re-asks something after a reload.
        advisorState: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "ChatHistory",
    chatHistorySchema
);