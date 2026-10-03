"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement: new (
          options: { pageLanguage: string; includedLanguages: string; autoDisplay: boolean },
          elementId: string
        ) => void;
      };
    };
  }
}

export type SupportedLanguage = "ES" | "EN" | "FR" | "AR";

const LANG_CODE_MAP: Record<SupportedLanguage, string> = {
  ES: "es",
  EN: "en",
  FR: "fr",
  AR: "ar",
};

export function setPageLanguage(lang: SupportedLanguage) {
  const targetCode = LANG_CODE_MAP[lang] || "es";

  if (typeof document !== "undefined") {
    // Set google translate cookie for current domain
    const cookieValue = `/es/${targetCode}`;
    const domain = window.location.hostname;
    
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${domain}`;
    document.cookie = `googtrans=${cookieValue}; path=/`;

    // Store preference in localStorage
    localStorage.setItem("selected_site_lang", lang);

    const select = document.querySelector(".goog-te-combo");
    if (select) {
      select.value = targetCode;
      select.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
    } else {
      // Reload page to apply google translate cookie
      window.location.reload();
    }
  }
}

export function LanguageTranslator() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;

    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "es",
            includedLanguages: "es,en,fr,ar",
            autoDisplay: false,
          },
          "google_translate_element"
        );
      }
    };

    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  if (!mounted) return null;

  return <div id="google_translate_element" className="hidden" aria-hidden="true" />;
}
