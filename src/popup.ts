type ElementContainer = {
    border: HTMLButtonElement;
    blastButton: HTMLButtonElement
};

const blastText = "<p>Blast!</p>"
const unblastText = "<p>Unblast</p>"

function getElements(): ElementContainer {
    const border = document.getElementById('border') as HTMLButtonElement | null;
    const blastButton = document.getElementById('blastButton') as HTMLButtonElement | null;
    if (!border) throw new Error("Border not found!");
    if (!blastButton) throw new Error("Blast button not found!");
    
    return {border, blastButton};
}

async function getActiveTabId(): Promise<number> {
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    const activeTab = tabs[0];
    const id = activeTab.id;
    if (!id) throw new Error("Active tab id not found!");

    return id;
}

function setHTML(elements: ElementContainer, isBlastin: boolean) {
    if (isBlastin) {
        elements.blastButton.innerHTML = unblastText;
        document.body.classList.add("blastin");
    } else {
        elements.blastButton.innerHTML = blastText;
        document.body.classList.remove("blastin");
    }
}

function addEventListeners(elements: ElementContainer, isBlastin: boolean, activeTabId: number) {
    elements.blastButton.addEventListener('click', () => {
        if (!isBlastin) {
            chrome.tabs.sendMessage(activeTabId, {action: 'startBlastin'}, () => {});
            isBlastin = true;
            elements.blastButton.innerHTML = unblastText;
            document.body.classList.add("blastin");
        } else {
            chrome.tabs.sendMessage(activeTabId, {action: 'stopBlastin'}, () => {});
            isBlastin = false;
            elements.blastButton.innerHTML = blastText;
            document.body.classList.remove("blastin");
        }
    });
};

async function run() {
    const elements = getElements();

    try {
        const activeTabId = await getActiveTabId();
        const isBlastin = await chrome.tabs.sendMessage(activeTabId, {action: 'isBlastin?'});

        setHTML(elements, isBlastin);
        addEventListeners(elements, isBlastin, activeTabId);

        elements.border.classList.remove("disabled");
        elements.blastButton.disabled = false;
    } catch {} // Do nothing
};

run();
