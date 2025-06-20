// Create the context menu item upon installation.
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "decode-base64-selection",
    title: "Decode Base64",
    contexts: ["selection"],
  });
});

// When the context menu item is clicked, send a message to the content script.
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "decode-base64-selection" && info.selectionText) {
    // Send a message to the active tab's content script to show the decoder modal
    chrome.tabs.sendMessage(tab.id, {
      type: "DECODE_SELECTION",
      text: info.selectionText,
    });
  }
});
