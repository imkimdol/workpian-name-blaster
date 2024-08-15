import type { Config } from "./configParser";
export type Platform = "Workday" | "Appian";

/**
 * Holds all information about the current instance of the extension.
 * Configs and platform info are stored here.
 */
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

    /**
     * Returns the list of algorithms required for the platform in local path form.
     * 
     * @param config Parsed config data
     */
    abstract getAlgorithmPaths(config: Config): string[];

    /**
     * Returns the splitBeforeNumericPivot value that matches the current platform.
     * 
     * e.g. WorkdayExtensionInfo returns config.splitBeforeNumericPivotWorkday.
     * 
     * @param config Parsed config data
     */
    abstract getSplitBeforeNumericPivot(config: Config): boolean;
};
class WorkdayExtensionInfo extends ExtensionInfo {
    getPlatform(): Platform {
        return "Workday"
    }

    getAlgorithmPaths(config: Config): string[] {
        const paths: string[] = [];

        if (config.enableTableAlgorithm) paths.push("algorithm/tableData.js");
        if (config.enableListAlgorithm) paths.push("algorithm/listData.js");
        if (config.enableSimpleTemplateAlgorithm) paths.push("algorithm/simpleTemplateData.js");

        return paths;
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

        if (config.enableTableAlgorithm) algorithms.push("algorithm/tableData.js");
        if (config.enableListAlgorithm) algorithms.push("algorithm/listData.js");
        if (config.enableSimpleTemplateAlgorithm) algorithms.push("algorithm/simpleTemplateData.js");

        return algorithms;
    };

    getSplitBeforeNumericPivot(config: Config): boolean {
        return config.splitBeforeNumericPivotAppian;
    }
};

/**
 * Creates an instance of `ExtensionInfo` that matches the current platform.
 * @returns Instantiated class
 */
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