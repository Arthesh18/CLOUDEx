// =========================================================
// CLOUDEX AUTHENTICATION PROTECTION
// =========================================================

(function () {

    // =====================================================
    // CHECK LOGIN
    // =====================================================

    const token =
        localStorage.getItem("cloudexToken");


    // =====================================================
    // IF USER IS NOT LOGGED IN
    // =====================================================

    if (!token) {

        window.location.href =
            "login.html";

        return;

    }


    // =====================================================
    // LOGOUT FUNCTION
    // =====================================================

    window.cloudexLogout = function () {

        localStorage.removeItem(
            "cloudexToken"
        );

        localStorage.removeItem(
            "cloudexUser"
        );

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );


        window.location.href =
            "login.html";

    };


    // =====================================================
    // GET CURRENT USER
    // =====================================================

    window.cloudexUser = function () {

        try {

            const user =
                localStorage.getItem(
                    "cloudexUser"
                );

            if (!user) {
                return null;
            }

            return JSON.parse(user);

        } catch (error) {

            console.error(
                "Unable to read CLOUDEx user:",
                error
            );

            return null;

        }

    };


})();