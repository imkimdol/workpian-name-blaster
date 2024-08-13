type ModuleInfo = { enableConfigName: string, fileName: string };

abstract class SetupPage {
    private config: any;
    protected modules: ModuleInfo[] = [];
    private replaceFunctions: VoidFunction[] = [];
    
    private isBlastin = false;
    
    constructor() {
        this.addListener();
        this.setReplacementLoop();
    };

    /**
     * Imports parser for config file and required modules.
     */
    private async importModules() {
        const configParser = await import(chrome.runtime.getURL("configParser.js"));
        this.config = configParser.config;
        if (!this.config) throw new Error("Unable to load config!");
        
        for (const module of this.modules) {
            await this.importModule(module);
        }
    };

    private async importModule(info: ModuleInfo) {
        const enabled = this.config[info.enableConfigName];

        if (enabled) {
            const url = chrome.runtime.getURL(info.fileName);
            console.log(url);
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
        setInterval(() => {if (this.isBlastin) this.replaceNames();}, 2000);
    }
};

export class Workday extends SetupPage {
    constructor() {
        super();
        this.modules = [
            { enableConfigName: "enableListReplacement", fileName: "replace/listNames.js"},
            { enableConfigName: "enableTableReplacement", fileName: "replace/tableNames.js"},
            { enableConfigName: "enableSimpleTemplateNameReplacement", fileName: "replace/simpleTemplateNames.js"},
        ]
    };
};

export class Appian extends SetupPage {
    constructor() {
        super();
        this.modules = [
            { enableConfigName: "enableListReplacement", fileName: "replace/listNamesAppian.js"},
            { enableConfigName: "enableTableReplacement", fileName: "replace/tableNames.js"},
            { enableConfigName: "enableSimpleTemplateNameReplacement", fileName: "replace/simpleTemplateNames.js"},
        ]
    };
};