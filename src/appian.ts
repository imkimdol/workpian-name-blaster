class Appian {
    private config: any;
    private replaceFunctions: VoidFunction[] = [];
    
    private isBlastin = false;
    
    constructor() {
        this.addListener()
        this.setReplacementLoop()
    }

    /**
     * Imports parser for config file and required modules.
     */
    private async importFiles() {
        const configParser = await import(chrome.runtime.getURL("configParser.js"));
        this.config = configParser.config;
    
        if (this.config.enableListReplacement) {
            const listNamesUrl = chrome.runtime.getURL("replace/listNamesAppian.js");
            const replaceListNames = (await import(listNamesUrl)).default;
            if (replaceListNames) this.replaceFunctions.push(replaceListNames);
        }
        if (this.config.enableTableReplacement) {
            const tableNamesUrl = chrome.runtime.getURL("replace/tableNames.js");
            const replaceTableNames = (await import(tableNamesUrl)).default;
            if (replaceTableNames) this.replaceFunctions.push(replaceTableNames);
        }
        if (this.config.enableNSIDReplacement) { // leave this unchanged! until we update flags
            const sidnNamesUrl = chrome.runtime.getURL("replace/sidnNames.js");
            const replaceSIDNNames = (await import(sidnNamesUrl)).default;
            if (replaceSIDNNames) this.replaceFunctions.push(replaceSIDNNames);
        }
    }
    
    /**
     * Runs selected modules to begin anonymizing.
     */
    private async replaceNames() {
        if (this.replaceFunctions.length === 0) await this.importFiles();
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
        setInterval(() => {if (this.isBlastin) this.replaceNames();}, 2000);
    }
};

const appian = new Appian();