const express = require("express");
const router = express.Router();

const ChatHistory = require("../models/ChatHistory");


// ==================================================
// CREATE NEW CHAT
// ==================================================

router.post("/", async (req, res) => {

    try {

        const { userId } = req.body;

        if (!userId) {

            return res.status(400).json({
                success: false,
                message: "User ID is required."
            });

        }

        const chat = await ChatHistory.create({
            userId: userId,
            title: "New Conversation",
            messages: []
        });

        res.status(201).json({
            success: true,
            chat
        });

    } catch (error) {

        console.error(
            "Create chat error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Could not create chat."
        });

    }

});


// ==================================================
// GET USER CHAT HISTORY
// ==================================================

router.get("/user/:userId", async (req, res) => {

    try {

        const chats = await ChatHistory.find({
            userId: req.params.userId
        })
        .sort({
            updatedAt: -1
        });

        res.json({
            success: true,
            chats
        });

    } catch (error) {

        console.error(
            "Get chat history error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Could not load chat history."
        });

    }

});


// ==================================================
// GET ONE CHAT
// ==================================================

router.get("/:chatId", async (req, res) => {

    try {

        const chat =
            await ChatHistory.findById(
                req.params.chatId
            );

        if (!chat) {

            return res.status(404).json({
                success: false,
                message: "Chat not found."
            });

        }

        res.json({
            success: true,
            chat
        });

    } catch (error) {

        console.error(
            "Get chat error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Could not load chat."
        });

    }

});


// ==================================================
// DELETE CHAT
// ==================================================

router.delete("/:chatId", async (req, res) => {

    try {

        const chat =
            await ChatHistory.findByIdAndDelete(
                req.params.chatId
            );

        if (!chat) {

            return res.status(404).json({
                success: false,
                message: "Chat not found."
            });

        }

        res.json({
            success: true,
            message: "Chat deleted successfully."
        });

    } catch (error) {

        console.error(
            "Delete chat error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Could not delete chat."
        });

    }

});


module.exports = router;