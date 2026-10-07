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

export const LANGUAGES_LIST = [
  { code: "ES" as SupportedLanguage, label: "Español" },
  { code: "FR" as SupportedLanguage, label: "Français" },
  { code: "EN" as SupportedLanguage, label: "English" },
  { code: "AR" as SupportedLanguage, label: "Árabe" },
];

// Anti-crash patch for React / Next.js when Google Translate mutates DOM text nodes
if (typeof window !== "undefined" && typeof Node === "function" && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  // @ts-expect-error Google translate DOM mutation guard
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      return child;
    }
    return originalRemoveChild.apply(this, [child]) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  // @ts-expect-error Google translate DOM mutation guard
  Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      return newNode;
    }
    return originalInsertBefore.apply(this, [newNode, referenceNode]) as T;
  };
}

export function setPageLanguage(lang: SupportedLanguage) {
  const targetCode = LANG_CODE_MAP[lang] || "es";

  if (typeof document !== "undefined") {
    const domain = window.location.hostname;

    if (targetCode === "es") {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain};`;
    } else {
      const cookieValue = `/es/${targetCode}`;
      document.cookie = `googtrans=${cookieValue}; path=/;`;
      document.cookie = `googtrans=${cookieValue}; path=/; domain=${domain};`;
      document.cookie = `googtrans=${cookieValue}; path=/; domain=.${domain};`;
    }

    try {
      localStorage.setItem("selected_site_lang", lang);
    } catch (e) {
      // ignore
    }

    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
    if (select) {
      select.value = targetCode;
      select.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
    } else {
      setTimeout(() => {
        const retrySelect = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
        if (retrySelect) {
          retrySelect.value = targetCode;
          retrySelect.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
        } else {
          window.location.reload();
        }
      }, 300);
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

  return (
    <>
      <style jsx global>{`
        .goog-te-banner-frame.skiptranslate,
        .goog-te-banner-frame {
          display: none !important;
        }
        body {
          top: 0px !important;
        }
        .goog-tooltip {
          display: none !important;
        }
        .goog-tooltip:hover {
          display: none !important;
        }
        .goog-text-highlight {
          background-color: transparent !important;
          box-shadow: none !important;
        }
        #goog-gt-tt {
          display: none !important;
        }
      `}</style>
      <div id="google_translate_element" className="hidden" aria-hidden="true" />
    </>
  );
}
