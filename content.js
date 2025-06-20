let selectionPopup = null;
let modal = null;

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

/**
 * Creates the small popup that appears next to selected text.
 */
function createSelectionPopup() {
  if (!selectionPopup) {
    selectionPopup = document.createElement("div");
    selectionPopup.id = "b64-selection-popup";
    selectionPopup.textContent = "B64";
    document.body.appendChild(selectionPopup);

    selectionPopup.addEventListener("mousedown", (e) => {
      e.preventDefault(); // Prevent the click from deselecting text
      const selectedText = window.getSelection().toString().trim();
      if (selectedText) {
        showModalWithDecodedText(selectedText);
      }
      hideSelectionPopup();
    });
  }
}

/**
 * Positions and shows the small selection popup.
 * @param {Range} range - The user's selection range.
 */
function showSelectionPopup(range) {
  if (!selectionPopup) createSelectionPopup();
  const rect = range.getBoundingClientRect();
  selectionPopup.style.top = `${window.scrollY + rect.bottom + 5}px`;
  selectionPopup.style.left = `${window.scrollX + rect.left + rect.width / 2 - selectionPopup.offsetWidth / 2}px`;
  selectionPopup.style.display = "block";
}

function hideSelectionPopup() {
  if (selectionPopup) {
    selectionPopup.style.display = "none";
  }
}

/**
 * Creates the main modal for displaying the decoded text.
 */
function createModal() {
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "b64-modal-overlay";
    modal.innerHTML = `
            <div id="b64-modal-content">
                <div id="b64-modal-header">
                    <h3>Decoded Text</h3>
                    <button id="b64-modal-close">&times;</button>
                </div>
                <div id="b64-modal-body">
                    <pre id="b64-decoded-output"></pre>
                </div>
            </div>
        `;
    document.body.appendChild(modal);

    // Event listeners to close the modal
    modal
      .querySelector("#b64-modal-close")
      .addEventListener("click", hideModal);
    modal.addEventListener("click", (e) => {
      if (e.target.id === "b64-modal-overlay") {
        hideModal();
      }
    });
  }
}

/**
 * Shows the modal with the decoded version of the provided text.
 * @param {string} text - The Base64 text to decode.
 */
function showModalWithDecodedText(text) {
  if (!modal) createModal();
  const outputElement = modal.querySelector("#b64-decoded-output");
  outputElement.style.color = "#e5e7eb"; // default text-gray-200

  try {
    const binaryString = atob(text);
    const bytes = Uint8Array.from(binaryString, (c) => c.charCodeAt(0));
    const decodedText = new TextDecoder().decode(bytes);

    // Check if the decoded text is a URL
    if (isValidUrl(decodedText)) {
      // Use innerHTML to create a clickable link
      outputElement.innerHTML = `<a href="${decodedText}" target="_blank" rel="noopener noreferrer">${decodedText}</a>`;
    } else {
      outputElement.textContent = decodedText;
    }
  } catch (error) {
    outputElement.textContent =
      "Error: Could not decode. The selected text is not valid Base64.";
    outputElement.style.color = "#f87171"; // text-red-400
    console.error("Base64 Decoding Error:", error);
  }

  modal.style.display = "flex";
}

function hideModal() {
  if (modal) {
    modal.style.display = "none";
  }
}

// --- Event Listeners ---

document.addEventListener("mouseup", () => {
  setTimeout(() => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    if (selectedText.length > 0) {
      const range = selection.getRangeAt(0);
      showSelectionPopup(range);
    } else {
      hideSelectionPopup();
    }
  }, 10);
});

document.addEventListener("mousedown", (e) => {
  if (selectionPopup && !selectionPopup.contains(e.target)) {
    hideSelectionPopup();
  }
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.type === "DECODE_SELECTION") {
    showModalWithDecodedText(request.text);
  }
});
