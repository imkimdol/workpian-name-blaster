import type { Config, SplitBeforeNumericPivotConfigName } from "./configParser";

export type Algorithm = { name: AlgorithmName, filePath: string };
export type AlgorithmName = "table" | "list" | "simpleTemplateName";
export type Platform = "Workday" | "Appian";

const config = (await import(chrome.runtime.getURL("configParser.js"))) as Config;

export class ExtensionInfo {
    platform: Platform;
    algorithms: Algorithm[];

    flaggedNameLabels: RegExp[];
    flaggedOtherLabels: RegExp[];

    scanUsingNumericPivot: boolean;
    splitBeforeNumericPivot: boolean;
    scanUsingColonPivot: boolean;
    splitBeforeColonPivot: boolean;

    constructor() {
        this.platform = this.getPlatform();
        this.algorithms = this.getAlgorithms();

        this.flaggedNameLabels = config.flaggedNameLabels.map(l => RegExp(l, 'g'));
        this.flaggedOtherLabels = config.flaggedOtherLabels.map(l => RegExp(l, 'g'));;

        this.scanUsingNumericPivot = config.scanUsingNumericPivot;
        this.splitBeforeNumericPivot = this.getSplitBeforeNumericPivot();
        this.scanUsingColonPivot = config.scanUsingColonPivot;
        this.splitBeforeColonPivot = config.splitBeforeColonPivot;
    };

    getPlatform(): Platform {
        const currentHost = window.location.host;
        if (currentHost.includes("appian")) {
            return "Appian";
        } else {
            return "Workday";
        }
    };

    getAlgorithms(): Algorithm[] {
        const algorithms: Algorithm[] = [];

        if (config.enableTableReplacement) algorithms.push({name: "table", filePath: "replace/tableNames.js"});
        if (config.enableListReplacement) algorithms.push({name: "list", filePath: "replace/listNames.js"});
        if (config.enableSimpleTemplateNameReplacement) algorithms.push({name: "simpleTemplateName", filePath: "replace/simpleTemplateNames.js"});

        return algorithms;
    };

    getSplitBeforeNumericPivot(): boolean {
        const dict: {[key in Platform]: SplitBeforeNumericPivotConfigName} = {
            "Workday": "splitBeforeNumericPivotWorkday",
            "Appian": "splitBeforeNumericPivotAppian"
        };
        const platformSpecificConfigName = dict[this.platform];

        return config[platformSpecificConfigName];
    };
};