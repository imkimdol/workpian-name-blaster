
document.addEventListener('DOMContentLoaded', onDomContentLoaded);

const blastText = "Blast!"
const unblastText = "Unblast..."

async function onDomContentLoaded() {
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    const activeTab = tabs[0];

    const isBlastin = await chrome.tabs.sendMessage(activeTab.id, {action: 'isBlastin?'});

    setHTML(isBlastin);
    addEventListeners(activeTab, isBlastin);
}

function setHTML(isBlastin) {
    const blastbutton = document.getElementById('blastButton');
    blastbutton.innerText = !isBlastin ? blastText : unblastText;
}

function addEventListeners(activeTab, isBlastin) {
    const blastbutton = document.getElementById('blastButton');
-
    blastbutton.addEventListener('click', () => {
        if (!isBlastin) {
            chrome.tabs.sendMessage(activeTab.id, {action: 'startBlastin'}, () => {});
            isBlastin = true;
            blastbutton.innerText = unblastText;
        } else {
            chrome.tabs.sendMessage(activeTab.id, {action: 'stopBlastin'}, () => {});
            isBlastin = false;
            blastbutton.innerText = blastText;
        }
    });
};