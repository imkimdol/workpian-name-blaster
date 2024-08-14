// Do this to prevent this file from becoming a module, while other files can be used as modules
const url = chrome.runtime.getURL("setupPage.js");
import(url).then(m => m.default());