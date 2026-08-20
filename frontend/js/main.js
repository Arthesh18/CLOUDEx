// ========================================================
// CLOUDEx Main JavaScript
// ========================================================

document.addEventListener("DOMContentLoaded", () => {

    // ----------------------------------------------------
    // Mobile Menu
    // ----------------------------------------------------

    const mobileMenuButton =
        document.getElementById("mobileMenuButton");

    const mobileMenu =
        document.getElementById("mobileMenu");

    if (mobileMenuButton && mobileMenu) {

        mobileMenuButton.addEventListener("click", () => {

            mobileMenu.classList.toggle("active");

            if (mobileMenu.classList.contains("active")) {
                mobileMenuButton.textContent = "✕";
            } else {
                mobileMenuButton.textContent = "☰";
            }

        });


        const mobileLinks =
            mobileMenu.querySelectorAll("a");

        mobileLinks.forEach((link) => {

            link.addEventListener("click", () => {

                mobileMenu.classList.remove("active");

                mobileMenuButton.textContent = "☰";

            });

        });

    }


    // ----------------------------------------------------
    // Smooth Scroll
    // ----------------------------------------------------

    const anchorLinks =
        document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach((link) => {

        link.addEventListener("click", (event) => {

            const targetId =
                link.getAttribute("href");

            if (!targetId || targetId === "#") {
                return;
            }

            const target =
                document.querySelector(targetId);

            if (!target) {
                return;
            }

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    });


    // ----------------------------------------------------
    // Navbar Scroll Effect
    // ----------------------------------------------------

    const navbar =
        document.querySelector(".navbar");

    const updateNavbar =
        () => {

            if (!navbar) {
                return;
            }

            if (window.scrollY > 30) {

                navbar.style.background =
                    "rgba(6, 8, 15, 0.92)";

            } else {

                navbar.style.background =
                    "rgba(6, 8, 15, 0.78)";

            }

        };

    window.addEventListener(
        "scroll",
        updateNavbar,
        { passive: true }
    );

    updateNavbar();


    // ----------------------------------------------------
    // Simple Reveal Animation
    // ----------------------------------------------------

    const revealElements =
        document.querySelectorAll(
            ".feature-card, .process-step, .explorer-preview"
        );

    const revealObserver =
        new IntersectionObserver(
            (entries, observer) => {

                entries.forEach((entry) => {

                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)";

                    observer.unobserve(entry.target);

                });

            },
            {
                threshold: 0.12
            }
        );


    revealElements.forEach((element) => {

        element.style.opacity = "0";
        element.style.transform = "translateY(18px)";
        element.style.transition =
            "opacity 0.7s ease, transform 0.7s ease";

        revealObserver.observe(element);

    });
    

});