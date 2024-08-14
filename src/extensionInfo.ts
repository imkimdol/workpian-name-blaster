import type { Config } from "./configParser";
export type Algorithm = { name: AlgorithmName, filePath: string };
export type AlgorithmName = "table" | "list" | "simpleTemplateName";
export type Platform = "Workday" | "Appian";

export abstract class ExtensionInfo {
    platform: Platform;
    algorithmPaths: string[];

    flaggedNameLabels: RegExp[];
    flaggedOtherLabels: RegExp[];

    scanUsingNumericPivot: boolean;
    splitBeforeNumericPivot: boolean;
    scanUsingColonPivot: boolean;
    splitBeforeColonPivot: boolean;

    constructor(config: Config) {
        this.platform = this.getPlatform();
        this.algorithmPaths = this.getAlgorithmPaths(config);

        this.flaggedNameLabels = config.flaggedNameLabels.map(l => RegExp(l, 'g'));
        this.flaggedOtherLabels = config.flaggedOtherLabels.map(l => RegExp(l, 'g'));;

        this.scanUsingNumericPivot = config.scanUsingNumericPivot;
        this.splitBeforeNumericPivot = this.getSplitBeforeNumericPivot(config);
        this.scanUsingColonPivot = config.scanUsingColonPivot;
        this.splitBeforeColonPivot = config.splitBeforeColonPivot;
    };
    
    abstract getPlatform(): Platform;
    abstract getAlgorithmPaths(config: Config): string[];
    abstract getSplitBeforeNumericPivot(config: Config): boolean;
};
class WorkdayExtensionInfo extends ExtensionInfo {
    getPlatform(): Platform {
        return "Workday"
    }

    getAlgorithmPaths(config: Config): string[] {
        const algorithms: string[] = [];

        if (config.enableTableReplacement) algorithms.push("replace/tableNames.js");
        if (config.enableListReplacement) algorithms.push("replace/listNames.js");
        if (config.enableSimpleTemplateNameReplacement) algorithms.push("replace/simpleTemplateNames.js");

        return algorithms;
    };

    getSplitBeforeNumericPivot(config: Config): boolean {
        return config.splitBeforeNumericPivotWorkday;
    }
};
class AppianExtensionInfo extends ExtensionInfo {
    getPlatform(): Platform {
        return "Appian"
    }

    getAlgorithmPaths(config: Config): string[] {
        const algorithms: string[] = [];

        if (config.enableTableReplacement) algorithms.push("replace/tableNames.js");
        if (config.enableListReplacement) algorithms.push("replace/listNames.js");
        if (config.enableSimpleTemplateNameReplacement) algorithms.push("replace/simpleTemplateNames.js");

        return algorithms;
    };

    getSplitBeforeNumericPivot(config: Config): boolean {
        return config.splitBeforeNumericPivotAppian;
    }
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