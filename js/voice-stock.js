
(() => {
  "use strict";

  const button = document.getElementById("voice-stock-button");
  const output = document.getElementById("voice-stock-status");

  if (!button || !output) return;

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    button.disabled = true;
    output.textContent = "Voice input needs Chrome or Edge.";
    return;
  }

  let selector = document.getElementById("voice-stock-language");

  if (!selector) {
    selector = document.createElement("select");
    selector.id = "voice-stock-language";
    selector.setAttribute("aria-label", "Voice language");

    [
      ["ta-IN", "தமிழ் (Tamil)"],
      ["en-IN", "English (India)"]
    ].forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      selector.appendChild(option);
    });

    button.parentNode.insertBefore(selector, button);
  }

  const field = id => document.getElementById(id);

  function fillProductForm(transcript) {
    // Open the form FIRST; this can reset its fields.
    if (typeof window.addNewProduct === "function") {
      window.addNewProduct();
    }

    const nameField = field("product-name");
    const priceField = field("product-price");
    const quantityField = field("product-quantity");
    const unitField = field("product-unit");

    if (!nameField || !priceField || !quantityField || !unitField) {
      output.textContent = "Product form fields were not found.";
      return;
    }

    const text = transcript.trim();
    const numbers = text.match(/\d+(?:\.\d+)?/g) || [];

    // Keep Tamil letters; remove common command words and numeric values.
    let name = text.replace(/\d+(?:\.\d+)?/g, " ");

    name = name
      .replace(/\b(add|product|price|rupees?|rs|quantity|stock|kg|kilograms?|grams?|litres?|liters?|ml|packets?|pieces?|piece|boxes?|box|dozen|in|for|at|of)\b/gi, " ")
      .replace(/விலை|ரூபாய்|ரூ|கிலோ|கிராம்|லிட்டர்|மில்லி|பாக்கெட்|பீஸ்|சேர்க்கவும்|சேர்|எண்ணிக்கை|அளவு/g, " ")
      .replace(/[,.]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (name) nameField.value = name;
    if (numbers[0]) priceField.value = numbers[0];
    if (numbers[1]) quantityField.value = numbers[1];

    if (/\bkg\b|kilogram|கிலோ/i.test(text)) {
      unitField.value = "kg";
    } else if (/\bgrams?\b|\bg\b|கிராம்/i.test(text)) {
      unitField.value = "g";
    } else if (/\blitres?\b|\bliters?\b|லிட்டர்/i.test(text)) {
      unitField.value = "litre";
    } else if (/\bml\b|மில்லி/i.test(text)) {
      unitField.value = "ml";
    } else if (/\bpackets?\b|பாக்கெட்/i.test(text)) {
      unitField.value = "packet";
    } else if (/\bboxes?\b/i.test(text)) {
      unitField.value = "box";
    } else if (/\bdozen\b/i.test(text)) {
      unitField.value = "dozen";
    } else if (/\bpieces?\b|பீஸ்/i.test(text)) {
      unitField.value = "piece";
    }

    output.textContent =
      `Recognised: "${text}". Check the filled fields and enter the shop name before saving.`;
  }

  button.addEventListener("click", () => {
    const recognition = new SpeechRecognition();
    recognition.lang = selector.value;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    button.disabled = true;
    output.textContent =
      selector.value === "ta-IN"
        ? "கேட்கிறது… இப்போது பேசுங்கள்."
        : "Listening… Speak now.";

    recognition.onresult = event => {
      fillProductForm(event.results[0][0].transcript);
    };

    recognition.onerror = event => {
      output.textContent = `Voice error: ${event.error}. Try again.`;
    };

    recognition.onend = () => {
      button.disabled = false;
    };

    try {
      recognition.start();
    } catch (error) {
      button.disabled = false;
      output.textContent = "Could not start voice input. Try again.";
    }
  });
})();

