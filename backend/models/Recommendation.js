const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        userMessage: {
            type: String,
            required: true
        },

        provider: {
            type: String,
            required: true
        },

        reason: {
            type: String,
            required: true
        },

        createdAt: {
            type: Date,
            default: Date.now
        }
    }
);

module.exports = mongoose.model(
    "Recommendation",
    recommendationSchema
);