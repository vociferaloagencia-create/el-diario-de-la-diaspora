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

const SUPPORTED_LANGUAGES = new Set(Object.keys(LANG_CODE_MAP));
let pendingTranslateObserver: MutationObserver | null = null;
let pendingTranslateTimeout: number | null = null;
let translateElementInitialized = false;

function readSavedLanguage(): SupportedLanguage {
  try {
    const saved = localStorage.getItem("selected_site_lang");
    if (saved && SUPPORTED_LANGUAGES.has(saved)) {
      return saved as SupportedLanguage;
    }
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }

  return "ES";
}

function clearGoogleTranslateCookie() {
  const hostname = window.location.hostname;
  const parentDomain = hostname.replace(/^www\./i, "");
  const domains = new Set([hostname, parentDomain, `.${parentDomain}`]);

  document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
  for (const domain of domains) {
    if (domain && domain !== "localhost") {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain};`;
    }
  }
}

function writeGoogleTranslateCookie(targetCode: string) {
  const cookie = `googtrans=/es/${targetCode}; path=/; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
  document.cookie = cookie;
}

function applyGoogleTranslateLanguage(targetCode: string, forceChange = false) {
  pendingTranslateObserver?.disconnect();
  if (pendingTranslateTimeout !== null) {
    window.clearTimeout(pendingTranslateTimeout);
    pendingTranslateTimeout = null;
  }

  const applyWhenReady = () => {
    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
    if (!select || !Array.from(select.options).some((option) => option.value === targetCode)) {
      return false;
    }

    pendingTranslateObserver?.disconnect();
    pendingTranslateObserver = null;
    if (pendingTranslateTimeout !== null) {
      window.clearTimeout(pendingTranslateTimeout);
      pendingTranslateTimeout = null;
    }

    if (forceChange || select.value !== targetCode) {
      select.value = targetCode;
      select.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
    }
    return true;
  };

  if (applyWhenReady() || typeof MutationObserver === "undefined" || !document.body) {
    return;
  }

  pendingTranslateObserver = new MutationObserver(() => {
    applyWhenReady();
  });
  pendingTranslateObserver.observe(document.body, { childList: true, subtree: true });
  // Google Translate may be blocked; stop observing without forcing a reload.
  pendingTranslateTimeout = window.setTimeout(() => {
    pendingTranslateObserver?.disconnect();
    pendingTranslateObserver = null;
    pendingTranslateTimeout = null;
  }, 15000);
}

function initializeGoogleTranslate() {
  if (translateElementInitialized || !window.google?.translate?.TranslateElement) {
    return;
  }

  translateElementInitialized = true;
  new window.google.translate.TranslateElement(
    {
      pageLanguage: "es",
      includedLanguages: "es,en,fr,ar",
      autoDisplay: false,
    },
    "google_translate_element"
  );

  const savedLanguage = readSavedLanguage();
  const savedCode = LANG_CODE_MAP[savedLanguage];
  document.documentElement.lang = savedCode;
  if (savedCode !== "es") {
    writeGoogleTranslateCookie(savedCode);
  }
  // Re-dispatch even when Google preselects the cookie's value. A selected
  // option alone does not guarantee that it translated this freshly rendered page.
  applyGoogleTranslateLanguage(savedCode, true);
}

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
    // Keep the document locale in sync with the selected translation. Static
    // label overrides use this attribute to choose their reviewed wording.
    document.documentElement.lang = targetCode;

    if (targetCode === "es") {
      clearGoogleTranslateCookie();
    } else {
      writeGoogleTranslateCookie(targetCode);
    }

    try {
      localStorage.setItem("selected_site_lang", lang);
    } catch (e) {
      // ignore
    }

    applyGoogleTranslateLanguage(targetCode);
  }
}

export function LanguageTranslator() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;

    window.googleTranslateElementInit = initializeGoogleTranslate;

    if (window.google?.translate?.TranslateElement) {
      initializeGoogleTranslate();
    } else if (!document.getElementById("google-translate-script")) {
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
