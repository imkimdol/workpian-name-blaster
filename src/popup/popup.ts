/**
 * Houses all the elements that will be changed with JavaScript
 */
type DynamicElementsContainer = {
    border: HTMLButtonElement;
    blastButton: HTMLButtonElement
};

const blastText = "<p>Blast!</p>"
const unblastText = "<p>Unblast</p>"

/**
 * Creates a `DynamicElementsContainer` with elements retrieved from popup.
 */
function getElements(): DynamicElementsContainer {
    const border = document.getElementById('border') as HTMLButtonElement | null;
    const blastButton = document.getElementById('blastButton') as HTMLButtonElement | null;
    if (!border) throw new Error("Border not found!");
    if (!blastButton) throw new Error("Blast button not found!");
    
    return {border, blastButton};
}

/**
 * Fetches the tab ID of the active tab.
 */
async function getActiveTabId(): Promise<number> {
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    const activeTab = tabs[0];
    const id = activeTab.id;
    if (!id) throw new Error("Active tab id not found!");

    return id;
}

/**
 * Changes elements according to blastin status.
 * @param elements Container with elements to change
 * @param isBlastin Current blastin status
 */
function changeHTMLElements(elements: DynamicElementsContainer, isBlastin: boolean) {
    if (isBlastin) {
        elements.blastButton.innerHTML = unblastText;
        document.body.classList.add("blastin");
    } else {
        elements.blastButton.innerHTML = blastText;
        document.body.classList.remove("blastin");
    }
}

/**
 * Adds event listener that triggers state changes on button clicks.
 * @param elements Container with button to add the listener to
 * @param isBlastin Current blastin status
 * @param activeTabId ID of the current tab
 */
function addButtonEventListener(elements: DynamicElementsContainer, isBlastin: boolean, activeTabId: number) {
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

/**
 * Initializes the popup.
 */
async function setup() {
    const elements = getElements();

    try {
        const activeTabId = await getActiveTabId();
        const isBlastin = await chrome.tabs.sendMessage(activeTabId, {action: 'isBlastin?'});

        changeHTMLElements(elements, isBlastin);
        addButtonEventListener(elements, isBlastin, activeTabId);

        elements.border.classList.remove("disabled");
        elements.blastButton.disabled = false;
    } catch {} // Do nothing
};

setup();
