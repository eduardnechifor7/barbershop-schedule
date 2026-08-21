import { useEffect } from "react";
import { auth } from "../firebase.js";
import { RecaptchaVerifier } from "firebase/auth";

export function useRecaptcha(containerId = "recaptcha-container") {
    useEffect(() => {
        if (import.meta.env.DEV) {
            auth.settings.appVerificationDisabledForTesting = true;
        }

        const container = document.getElementById(containerId);
        if (container && !window.recaptchaVerifier) {
            auth.config.siteKey = undefined;
            try {
                window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
                    size: "invisible",
                    callback: () => {}
                });
                window.recaptchaVerifier.render();
            } catch (err) {
                console.error("Recaptcha init error:", err);
            }
        }

        return () => {
            if (window.recaptchaVerifier) {
                try {
                    window.recaptchaVerifier.clear();
                } catch (e) {}
                window.recaptchaVerifier = null;
            }
        };
    }, [containerId]);
}