
(() => {
  "use strict";

  const button = document.getElementById("voice-stock-button");
  const output = document.getElementById("voice-stock-status");

  if (!button || !output) return;

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    button.disabled = true;
    output.textContent = "Voice input is not supported by this browser.";
    return;
  }

  button.addEventListener("click", () => {
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;

    output.textContent = "Listening...";

    recognition.onresult = event => {
      const spokenText = event.results[0][0].transcript;
      output.textContent = `You said: ${spokenText}`;
    };

    recognition.onerror = () => {
      output.textContent = "Could not recognise speech. Try again.";
    };

    recognition.start();
  });
})();
