// =========================================================
// CLOUDEX SIGN UP
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

    const signupForm =
        document.getElementById("signupForm");

    const nameInput =
        document.getElementById("name");

    const emailInput =
        document.getElementById("email");

    const passwordInput =
        document.getElementById("password");

    const confirmPasswordInput =
        document.getElementById("confirmPassword");

    const signupButton =
        document.getElementById("signupButton");

    const signupMessage =
        document.getElementById("signupMessage");

    const togglePassword =
        document.getElementById("togglePassword");

    const toggleConfirmPassword =
        document.getElementById("toggleConfirmPassword");


    // =====================================================
    // Show / hide password
    // =====================================================

    togglePassword.addEventListener("click", () => {

        if (passwordInput.type === "password") {

            passwordInput.type = "text";
            togglePassword.textContent = "🙈";

        } else {

            passwordInput.type = "password";
            togglePassword.textContent = "👁";

        }

    });


    // =====================================================
    // Show / hide confirm password
    // =====================================================

    toggleConfirmPassword.addEventListener("click", () => {

        if (confirmPasswordInput.type === "password") {

            confirmPasswordInput.type = "text";
            toggleConfirmPassword.textContent = "🙈";

        } else {

            confirmPasswordInput.type = "password";
            toggleConfirmPassword.textContent = "👁";

        }

    });


    // =====================================================
    // Display message
    // =====================================================

    function showMessage(message, type = "error") {

        signupMessage.textContent = message;

        signupMessage.className =
            `auth-message ${type}`;

    }


    // =====================================================
    // Signup
    // =====================================================

    signupForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const name =
                nameInput.value.trim();

            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;

            const confirmPassword =
                confirmPasswordInput.value;


            // -------------------------------------------------
            // Basic validation
            // -------------------------------------------------

            if (!name || !email || !password || !confirmPassword) {

                showMessage(
                    "Please fill in all fields."
                );

                return;

            }


            if (password.length < 6) {

                showMessage(
                    "Password must contain at least 6 characters."
                );

                return;

            }


            if (password !== confirmPassword) {

                showMessage(
                    "Passwords do not match."
                );

                return;

            }


            // -------------------------------------------------
            // Loading state
            // -------------------------------------------------

            signupButton.disabled = true;

            signupButton.classList.add("loading");

            showMessage("");


            try {

                // ---------------------------------------------
                // Send signup request to backend
                // ---------------------------------------------

                const response =
                    await fetch(
                        "/api/auth/signup",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                name,
                                email,
                                password
                            })
                        }
                    );


                const data =
                    await response.json();


                // ---------------------------------------------
                // Backend error
                // ---------------------------------------------

                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Unable to create account."
                    );

                }


                // ---------------------------------------------
                // Successful signup
                // ---------------------------------------------

                showMessage(
                    "Account created successfully! Redirecting to login...",
                    "success"
                );


                // ---------------------------------------------
                // Clear password fields
                // ---------------------------------------------

                passwordInput.value = "";
                confirmPasswordInput.value = "";


                // ---------------------------------------------
                // Go to login page
                // ---------------------------------------------

                setTimeout(() => {

                    window.location.href =
                        "login.html";

                }, 1000);


            } catch (error) {

                console.error(
                    "CLOUDEx signup error:",
                    error
                );


                showMessage(
                    error.message ||
                    "Unable to create account. Please try again."
                );

            } finally {

                signupButton.disabled = false;

                signupButton.classList.remove(
                    "loading"
                );

            }

        }
    );

});