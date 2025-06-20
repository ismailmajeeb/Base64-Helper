document.addEventListener("DOMContentLoaded", () => {
  const inputText = document.getElementById("input-text");
  const outputContainer = document.getElementById("output-container");
  const encodeBtn = document.getElementById("encode-btn");
  const decodeBtn = document.getElementById("decode-btn");
  const copyBtn = document.getElementById("copy-btn");
  const message = document.getElementById("message");

  /**
   * Checks if a given string is a valid, absolute URL.
   * @param {string} string The string to validate.
   * @returns {boolean} True if the string is a valid URL.
   */
  const isValidUrl = (string) => {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  // Encode text to Base64
  encodeBtn.addEventListener("click", () => {
    const text = inputText.value;
    if (text) {
      try {
        // The btoa function can throw an error for non-latin1 characters
        const utf8Bytes = new TextEncoder().encode(text);
        const base64 = btoa(String.fromCharCode(...utf8Bytes));
        outputContainer.textContent = base64;
        clearMessage();
      } catch (error) {
        showMessage(
          "Error: Could not encode text. Ensure it is valid UTF-8.",
          true,
        );
        console.error("Encoding error:", error);
      }
    }
  });

  // Decode Base64 to text
  decodeBtn.addEventListener("click", () => {
    const text = inputText.value.trim();
    if (text) {
      try {
        const binaryString = atob(text);
        const bytes = Uint8Array.from(binaryString, (c) => c.charCodeAt(0));
        const decodedText = new TextDecoder().decode(bytes);

        // Check if the decoded text is a URL
        if (isValidUrl(decodedText)) {
          outputContainer.innerHTML = `<a href="${decodedText}" target="_blank" class="text-cyan-400 hover:text-cyan-300 hover:underline">${decodedText}</a>`;
        } else {
          outputContainer.textContent = decodedText;
        }
        clearMessage();
      } catch (error) {
        showMessage("Error: Invalid Base64 string.", true);
        outputContainer.textContent = "";
        console.error("Decoding error:", error);
      }
    }
  });

  // Copy output to clipboard
  copyBtn.addEventListener("click", () => {
    // .textContent works for both plain text and links
    const textToCopy = outputContainer.textContent;
    if (textToCopy) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          showMessage("Copied to clipboard!", false);
          setTimeout(clearMessage, 2000);
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
          showMessage("Failed to copy.", true);
        });
    }
  });

  function showMessage(msg, isError = false) {
    message.textContent = msg;
    message.className = isError
      ? "text-sm mt-2 h-4 text-center text-red-400"
      : "text-sm mt-2 h-4 text-center text-green-400";
  }

  function clearMessage() {
    message.textContent = "";
  }
});
