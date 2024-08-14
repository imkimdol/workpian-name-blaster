import type { Algorithm, AlgorithmInstantiatorFunction } from "./algorithm/algorithm";
import type { ExtensionInfo } from "./extensionInfo";
import type { AlgorithmHelper } from "./algorithm/helper";

class SetupHelper {
    private readonly loopInterval = 2000;

    private extensionInfo: ExtensionInfo;
    private algorithmHelper: AlgorithmHelper;
    private algorithms: Algorithm[] = [];
    
    private isBlastin = false;
    
    constructor(extensionInfo: ExtensionInfo, algorithmHelper: AlgorithmHelper) {
        this.extensionInfo = extensionInfo;
        this.algorithmHelper = algorithmHelper;

        this.addListener();
        this.setReplacementLoop();
    };

    /**
     * Imports parser for config file and required modules.
     */
    private async importModules() {        
        for (const p of this.extensionInfo.algorithmPaths) {
            const url = chrome.runtime.getURL(p);
            const instantiator: AlgorithmInstantiatorFunction = (await import(url)).default;
            const algorithm: Algorithm = instantiator(this.extensionInfo, this.algorithmHelper);
            if (algorithm) this.algorithms.push(algorithm);
        }
    };
    
    /**
     * Runs selected modules to begin anonymizing.
     */
    private async censorData() {
        if (this.algorithms.length === 0) await this.importModules();
        this.algorithms.forEach(a => a.censorData());
    }
    
    /**
     * Listener function for extension/page interactions.
     */
    private addListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === 'startBlastin') {
                this.censorData()
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
        setInterval(() => {if (this.isBlastin) this.censorData();}, this.loopInterval);
    }
};

export default async function setupPage() {
    const infoModule = await import(chrome.runtime.getURL("extensionInfo.js"));
    const extensionInfo = infoModule.info as ExtensionInfo;

    const helperModule = await import(chrome.runtime.getURL("algorithm/helper.js"));
    const algorithmHelper = new helperModule.AlgorithmHelper(extensionInfo) as AlgorithmHelper;

    new SetupHelper(extensionInfo, algorithmHelper);
};