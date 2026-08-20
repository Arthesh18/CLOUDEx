const express = require("express");

const Recommendation = require("../models/Recommendation");

const router = express.Router();


// =====================================================
// SAVE RECOMMENDATION
// =====================================================

router.post("/save", async (req, res) => {

    try {

        const {
            userId,
            userMessage,
            provider,
            reason
        } = req.body;


        // -------------------------------------------------
        // Validate data
        // -------------------------------------------------

        if (
            !userId ||
            !userMessage ||
            !provider ||
            !reason
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Missing recommendation information."

            });

        }


        // -------------------------------------------------
        // Save to MongoDB
        // -------------------------------------------------

        const recommendation =
            await Recommendation.create({

                userId,

                userMessage,

                provider,

                reason

            });


        // -------------------------------------------------
        // Response
        // -------------------------------------------------

        res.status(201).json({

            success: true,

            message:
                "Recommendation saved successfully.",

            recommendation

        });


    } catch (error) {

        console.error(
            "Save recommendation error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to save recommendation."

        });

    }

});


// =====================================================
// GET USER RECOMMENDATIONS
// =====================================================

router.get("/:userId", async (req, res) => {

    try {

        const recommendations =
            await Recommendation
                .find({
                    userId:
                        req.params.userId
                })
                .sort({
                    createdAt: -1
                });


        res.json({

            success: true,

            recommendations

        });


    } catch (error) {

        console.error(
            "Get recommendations error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to load recommendations."

        });

    }

});


module.exports = router;