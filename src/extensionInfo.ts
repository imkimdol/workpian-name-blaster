import type { Config, SplitBeforeNumericPivotConfigName } from "./configParser";
export type Algorithm = { name: AlgorithmName, filePath: string };
export type AlgorithmName = "table" | "list" | "simpleTemplateName";
export type Platform = "Workday" | "Appian";

export abstract class ExtensionInfo {
    platform: Platform;
    algorithms: Algorithm[];

    flaggedNameLabels: RegExp[];
    flaggedOtherLabels: RegExp[];

    scanUsingNumericPivot: boolean;
    splitBeforeNumericPivot: boolean;
    scanUsingColonPivot: boolean;
    splitBeforeColonPivot: boolean;

    protected config: Config;

    constructor(config: Config) {
        this.config = config;

        this.platform = this.getPlatform();
        this.algorithms = this.getAlgorithms();

        this.flaggedNameLabels = config.flaggedNameLabels.map(l => RegExp(l, 'g'));
        this.flaggedOtherLabels = config.flaggedOtherLabels.map(l => RegExp(l, 'g'));;

        this.scanUsingNumericPivot = config.scanUsingNumericPivot;
        this.splitBeforeNumericPivot = this.getSplitBeforeNumericPivot();
        this.scanUsingColonPivot = config.scanUsingColonPivot;
        this.splitBeforeColonPivot = config.splitBeforeColonPivot;
    };

    abstract getPlatform(): Platform;
    abstract getAlgorithms(): Algorithm[];

    getSplitBeforeNumericPivot(): boolean {
        const dict: {[key in Platform]: SplitBeforeNumericPivotConfigName} = {
            "Workday": "splitBeforeNumericPivotWorkday",
            "Appian": "splitBeforeNumericPivotAppian"
        };
        const platformSpecificConfigName = dict[this.platform];

        return this.config[platformSpecificConfigName];
    };
};
class WorkdayExtensionInfo extends ExtensionInfo {
    getPlatform(): Platform {
        return "Workday"
    }

    getAlgorithms(): Algorithm[] {
        const algorithms: Algorithm[] = [];

        if (this.config.enableTableReplacement) algorithms.push({name: "table", filePath: "replace/tableNames.js"});
        if (this.config.enableListReplacement) algorithms.push({name: "list", filePath: "replace/listNames.js"});
        if (this.config.enableSimpleTemplateNameReplacement) algorithms.push({name: "simpleTemplateName", filePath: "replace/simpleTemplateNames.js"});

        return algorithms;
    };
};
class AppianExtensionInfo extends ExtensionInfo {
    getPlatform(): Platform {
        return "Appian"
    }

    getAlgorithms(): Algorithm[] {
        const algorithms: Algorithm[] = [];

        if (this.config.enableTableReplacement) algorithms.push({name: "table", filePath: "replace/tableNames.js"});
        if (this.config.enableListReplacement) algorithms.push({name: "list", filePath: "replace/listNames.js"});
        if (this.config.enableSimpleTemplateNameReplacement) algorithms.push({name: "simpleTemplateName", filePath: "replace/simpleTemplateNames.js"});

        return algorithms;
    };
};

async function getExtensionInfo(): Promise<ExtensionInfo> {
    const config = (await import(chrome.runtime.getURL("configParser.js"))).default as Config;

    const currentHost = window.location.host;
    if (currentHost.includes("myworkday")) {
        return new WorkdayExtensionInfo(config);
    } else {
        return new AppianExtensionInfo(config);
    }
}
export const info = await getExtensionInfo();