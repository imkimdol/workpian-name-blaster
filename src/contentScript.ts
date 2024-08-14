// Using this format prevents the content script from becoming a module. All other files will be used as modules.
const url = chrome.runtime.getURL("setupPage.js");
import(url).then(m => m.default());