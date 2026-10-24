
(() => {
  "use strict";

  const translations = {
    en: {
      title: "Pakkathu Kadai",
      dashboard: "Shopkeeper Dashboard",
      inventory: "Inventory",
      sharedPurchasing: "Shared Purchasing",
      expiryTracking: "Expiry Tracking & Alerts",
      pickup: "Pickup from shop",
      delivery: "Home delivery",
      save: "Save",
      cancel: "Cancel",
      search: "Search products",
      loading: "Loading...",
      language: "Language"
    },
    ta: {
      title: "பக்கத்து கடை",
      dashboard: "கடைக்காரர் முகப்பு",
      inventory: "சரக்கு இருப்பு",
      sharedPurchasing: "கூட்டு மொத்த கொள்முதல்",
      expiryTracking: "காலாவதி கண்காணிப்பு மற்றும் எச்சரிக்கைகள்",
      pickup: "கடையிலிருந்து பெற்றுக்கொள்ளுதல்",
      delivery: "வீட்டிற்கு விநியோகம்",
      save: "சேமி",
      cancel: "ரத்து செய்",
      search: "பொருட்களைத் தேடுங்கள்",
      loading: "ஏற்றப்படுகிறது...",
      language: "மொழி"
    }
  };

  let currentLanguage = "en";

  function translatePage(language) {
    if (!translations[language]) return;
    currentLanguage = language;
    document.documentElement.lang = language;

    document.querySelectorAll("[data-i18n]").forEach(element => {
      const key = element.dataset.i18n;
      if (translations[language][key]) {
        element.textContent = translations[language][key];
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
      const key = element.dataset.i18nPlaceholder;
      if (translations[language][key]) {
        element.placeholder = translations[language][key];
      }
    });

    try {
      localStorage.setItem("pakkathuLanguage", language);
    } catch (_) {}

    document.dispatchEvent(new CustomEvent("pakkathuLanguageChanged", {
      detail: { language }
    }));
  }

  function toggle() {
    translatePage(currentLanguage === "en" ? "ta" : "en");
    const selector = document.getElementById("pakkathu-language-selector");
    if (selector) selector.value = currentLanguage;
  }

  function init() {
    if (!document.getElementById("pakkathu-language-selector")) {
      const wrapper = document.createElement("div");
      wrapper.style.cssText =
        "padding:10px;display:flex;gap:10px;align-items:center;";

      const label = document.createElement("label");
      label.htmlFor = "pakkathu-language-selector";
      label.textContent = "Language / மொழி:";

      const selector = document.createElement("select");
      selector.id = "pakkathu-language-selector";

      [["en", "English"], ["ta", "தமிழ்"]].forEach(([value, text]) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = text;
        selector.appendChild(option);
      });

      selector.addEventListener("change", () => translatePage(selector.value));
      wrapper.append(label, selector);
      (document.querySelector("main") || document.body).prepend(wrapper);
    }

    let saved = "en";
    try {
      saved = localStorage.getItem("pakkathuLanguage") || "en";
    } catch (_) {}

    translatePage(translations[saved] ? saved : "en");
    document.getElementById("pakkathu-language-selector").value = currentLanguage;
  }

  window.PKLanguageSupport = {
    translatePage,
    toggle,
    getLanguage: () => currentLanguage,
    getTranslations: () => translations[currentLanguage]
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
