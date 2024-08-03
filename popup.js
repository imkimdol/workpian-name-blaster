
const blastText = "Blast!"
const unblastText = "Unblast..."

const blastbutton = document.getElementById('blastButton');

function setHTML(isBlastin) {
    blastbutton.innerText = !isBlastin ? blastText : unblastText;
}

function addEventListeners(activeTab, isBlastin) {-
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

async function run() {
    try {
        const tabs = await chrome.tabs.query({active: true, currentWindow: true});
        const activeTab = tabs[0]

        const isBlastin = await chrome.tabs.sendMessage(activeTab.id, {action: 'isBlastin?'});

        setHTML(isBlastin);
        addEventListeners(activeTab, isBlastin);
    } catch (e) {
        blastbutton.disabled = true;
    }
};

run();
