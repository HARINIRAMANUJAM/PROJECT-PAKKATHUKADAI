
(() => {
  "use strict";

  const button = document.getElementById("voice-stock-button");
  const output = document.getElementById("voice-stock-status");

  if (!button || !output) return;

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    button.disabled = true;
    output.textContent =
      "Voice input is not supported here. Try Chrome or Edge.";
    return;
  }

  // Add a language selector without changing shopkeeper.html.
  const selector = document.createElement("select");
  selector.id = "voice-stock-language";
  selector.setAttribute("aria-label", "Voice input language");
  selector.style.width = "auto";
  selector.style.margin = "4px";

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

  function field(id) {
    return document.getElementById(id);
  }

  function fillProductForm(transcript) {
    const text = transcript.trim();
    if (!text) return;

    // Extract numbers spoken as digits, e.g. "40 rupees, 20 kg".
    const numbers = text.match(/\d+(?:\.\d+)?/g) || [];

    // Remove common command words and numeric values to get the name.
    const name = text
      .replace(/\d+(?:\.\d+)?/g, " ")
      .replace(
        /\b(add|product|price|rupees?|rs|quantity|stock|kg|kilograms?|grams?|g|litres?|liters?|ml|packets?|pieces?|piece|boxes?|box|dozen|in|for|at|of|is|விலை|ரூபாய்|ரூ|கிலோ|கிராம்|லிட்டர்|மில்லி|பாக்கெட்|பீஸ்|சேர்க்கவும்|சேர்|எண்ணிக்கை|அளவு)\b/gi,
        " "
      )
      .replace(/[,.]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (name) field("product-name").value = name;

    // First number = price; second number = quantity.
    if (numbers[0]) field("product-price").value = numbers[0];
    if (numbers[1]) field("product-quantity").value = numbers[1];

    const lower = text.toLowerCase();

    if (/\b(kg|kilogram|kilograms)\b|கிலோ/i.test(lower)) {
      field("product-unit").value = "kg";
    } else if (/\b(g|gram|grams)\b|கிராம்/i.test(lower)) {
      field("product-unit").value = "g";
    } else if (/\b(litre|litres|liter|liters)\b|லிட்டர்/i.test(lower)) {
      field("product-unit").value = "litre";
    } else if (/\b(ml|millilitre|milliliter)\b|மில்லி/i.test(lower)) {
      field("product-unit").value = "ml";
    } else if (/\b(packet|packets)\b|பாக்கெட்/i.test(lower)) {
      field("product-unit").value = "packet";
    } else if (/\b(box|boxes)\b/i.test(lower)) {
      field("product-unit").value = "box";
    } else if (/\b(dozen)\b/i.test(lower)) {
      field("product-unit").value = "dozen";
    } else if (/\b(piece|pieces)\b|பீஸ்/i.test(lower)) {
      field("product-unit").value = "piece";
    }

    // Open the existing form; never save automatically.
    if (typeof window.addNewProduct === "function") {
      window.addNewProduct();
    }

    output.textContent =
      `Recognised: "${text}". Check the fields, enter your shop name if needed, then press Save product.`;
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
      const transcript = event.results[0][0].transcript;
      fillProductForm(transcript);
    };

    recognition.onerror = event => {
      output.textContent =
        `Voice error: ${event.error}. Please try again or enter details manually.`;
    };

    recognition.onend = () => {
      button.disabled = false;
    };

    try {
      recognition.start();
    } catch (error) {
      button.disabled = false;
      output.textContent = "Could not start voice input. Please try again.";
    }
  });
})();
