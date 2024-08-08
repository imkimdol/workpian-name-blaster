class Workday {
    private config: any;
    private replaceFunctions: VoidFunction[] = [];
    
    private isBlastin = false;
    
    constructor() {
        this.addListener()
        this.setReplacementLoop()
    }

    private async importFiles() {
        const configParser = await import(chrome.runtime.getURL("configParser.js"));
        this.config = configParser.config;
    
        if (this.config.enableListReplacement) {
            const listNamesUrl = chrome.runtime.getURL("replace/listNames.js");
            const replaceListNames = (await import(listNamesUrl)).default;
            if (replaceListNames) this.replaceFunctions.push(replaceListNames);
        }
        if (this.config.enableTableReplacement) {
            const tableNamesUrl = chrome.runtime.getURL("replace/tableNames.js");
            const replaceTableNames = (await import(tableNamesUrl)).default;
            if (replaceTableNames) this.replaceFunctions.push(replaceTableNames);
        }
        if (this.config.enableNSIDReplacement) {
            const nsidNamesUrl = chrome.runtime.getURL("replace/nsidNames.js");
            const replaceNSIDNames = (await import(nsidNamesUrl)).default;
            if (replaceNSIDNames) this.replaceFunctions.push(replaceNSIDNames);
        }
    }
    
    private async replaceNames() {
        if (this.replaceFunctions.length === 0) await this.importFiles();
        this.replaceFunctions.forEach(f => f());
    }
    
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

    private setReplacementLoop() {
        setInterval(() => {if (this.isBlastin) this.replaceNames();}, 2000);
    }
};

const workday = new Workday();