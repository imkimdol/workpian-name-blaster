import type { ExtensionInfo, Algorithm } from "./extensionInfo";

class SetupHelper {
    private readonly loopInterval = 2000;

    private algorithms: Algorithm[];
    private replaceFunctions: VoidFunction[] = [];
    
    private isBlastin = false;
    
    constructor(algorithms: Algorithm[]) {
        this.algorithms = algorithms;

        this.addListener();
        this.setReplacementLoop();
    };

    /**
     * Imports parser for config file and required modules.
     */
    private async importModules() {        
        for (const a of this.algorithms) {
            const url = chrome.runtime.getURL(a.filePath);
            const importedFunction = (await import(url)).default;
            if (importedFunction) this.replaceFunctions.push(importedFunction);
        }
    };
    
    /**
     * Runs selected modules to begin anonymizing.
     */
    private async replaceNames() {
        if (this.replaceFunctions.length === 0) await this.importModules();
        this.replaceFunctions.forEach(f => f());
    }
    
    /**
     * Listener function for extension/page interactions.
     */
    private addListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === 'startBlastin') {
                this.replaceNames()
                this.isBlastin = true
                sendResponse();
            } else if (message.action === 'stopBlastin') {
                this.isBlastin = false
                sendResponse();
            } else if (message.action === 'isBlastin?') {
                sendResponse(this.isBlastin);
            }
        });
    }

    /**
     * Function to anonymize every defined amount of time (2 seconds).
     */
    private setReplacementLoop() {
        setInterval(() => {if (this.isBlastin) this.replaceNames();}, this.loopInterval);
    }
};

export default async function setupPage() {
    const infoModule = await import(chrome.runtime.getURL("extensionInfo.js"));
    const extensionInfo = infoModule.info as ExtensionInfo;
    new SetupHelper(extensionInfo.algorithms);
};