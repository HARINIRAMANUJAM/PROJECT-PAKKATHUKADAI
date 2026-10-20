
(() => {
  "use strict";

  window.startVoiceAssistant = function () {
    const Recognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!Recognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "ta-IN";
    recognition.interimResults = false;

    recognition.onresult = event => {
      const command =
        event.results[0][0].transcript.trim();

      alert("Recognised: " + command);
      console.log("Voice command:", command);
    };

    recognition.onerror = () => {
      alert("Voice recognition failed. Try again.");
    };

    recognition.start();
  };
})();
