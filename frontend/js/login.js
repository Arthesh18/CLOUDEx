// =========================================================
// CLOUDEX LOGIN
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

    const loginForm =
        document.getElementById("loginForm");

    const emailInput =
        document.getElementById("email");

    const passwordInput =
        document.getElementById("password");

    const loginButton =
        document.getElementById("loginButton");

    const loginMessage =
        document.getElementById("loginMessage");

    const togglePassword =
        document.getElementById("togglePassword");


    // =====================================================
    // Show / hide password
    // =====================================================

    togglePassword.addEventListener("click", () => {

        if (
            passwordInput.type === "password"
        ) {

            passwordInput.type = "text";

            togglePassword.textContent = "🙈";

        } else {

            passwordInput.type = "password";

            togglePassword.textContent = "👁";

        }

    });


    // =====================================================
    // Display message
    // =====================================================

    function showMessage(
        message,
        type = "error"
    ) {

        loginMessage.textContent = message;

        loginMessage.className =
            `auth-message ${type}`;

    }


    // =====================================================
    // Login
    // =====================================================

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;


            if (!email || !password) {

                showMessage(
                    "Please enter your email and password."
                );

                return;

            }


            // ---------------------------------------------
            // Loading state
            // ---------------------------------------------

            loginButton.disabled = true;

            loginButton.classList.add(
                "loading"
            );

            showMessage("");


            try {

                const response =
                    await fetch(
                        "https://cloudex-backend-are6.onrender.com/api/auth/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email,
                                password
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
                        "Login failed."
                    );

                }


                // -----------------------------------------
                // Save login information
                // -----------------------------------------

                localStorage.setItem(
                    "cloudexToken",
                    data.token
                );


                localStorage.setItem(
                    "cloudexUser",
                    JSON.stringify(
                        data.user
                    )
                );


                showMessage(
                    "Login successful! Redirecting...",
                    "success"
                );


                // -----------------------------------------
                // Go to dashboard
                // -----------------------------------------

                setTimeout(() => {

                    window.location.href =
                        "index.html";

                }, 600);


            } catch (error) {

                console.error(
                    "CLOUDEx login error:",
                    error
                );


                showMessage(
                    error.message ||
                    "Unable to login. Please try again."
                );

            } finally {

                loginButton.disabled = false;

                loginButton.classList.remove(
                    "loading"
                );

            }

        }
    );

});