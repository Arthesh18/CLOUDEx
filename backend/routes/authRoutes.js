const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();


// =====================================================
// SIGN UP
// =====================================================

router.post("/signup", async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;


        // ---------------------------------------------
        // Validate input
        // ---------------------------------------------

        if (
            !name ||
            !email ||
            !password
        ) {

            return res.status(400).json({
                success: false,
                message: "Please fill in all fields."
            });

        }


        if (password.length < 6) {

            return res.status(400).json({
                success: false,
                message:
                    "Password must contain at least 6 characters."
            });

        }


        // ---------------------------------------------
        // Check existing user
        // ---------------------------------------------

        const existingUser =
            await User.findOne({
                email: email.toLowerCase()
            });


        if (existingUser) {

            return res.status(409).json({
                success: false,
                message:
                    "An account with this email already exists."
            });

        }


        // ---------------------------------------------
        // Hash password
        // ---------------------------------------------

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // ---------------------------------------------
        // Create user
        // ---------------------------------------------

        const user =
            await User.create({

                name: name.trim(),

                email:
                    email.toLowerCase().trim(),

                password:
                    hashedPassword

            });


        res.status(201).json({

            success: true,

            message:
                "Account created successfully.",

            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }

        });


    } catch (error) {

        console.error(
            "Signup error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to create account."

        });

    }

});


// =====================================================
// LOGIN
// =====================================================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // ---------------------------------------------
        // Validate input
        // ---------------------------------------------

        if (
            !email ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter your email and password."

            });

        }


        // ---------------------------------------------
        // Find user
        // ---------------------------------------------

        const user =
            await User.findOne({
                email:
                    email.toLowerCase().trim()
            });


        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

            });

        }


        // ---------------------------------------------
        // Check password
        // ---------------------------------------------

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

            });

        }


        // ---------------------------------------------
        // Create JWT
        // ---------------------------------------------

        const token =
            jwt.sign(

                {
                    userId:
                        user._id.toString(),

                    name:
                        user.name,

                    email:
                        user.email
                },

                process.env.JWT_SECRET,

                {
                    expiresIn:
                        "7d"
                }

            );


        res.json({

            success: true,

            message:
                "Login successful.",

            token,

            user: {

                id:
                    user._id,

                name:
                    user.name,

                email:
                    user.email

            }

        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to login."

        });

    }

});


module.exports = router;