export type Config = {
    enableTableReplacement: boolean,
    enableListReplacement: boolean,
    enableSimpleTemplateNameReplacement: boolean,

    flaggedNameLabels: string[],
    flaggedOtherLabels: string[],

    scanUsingNumericPivot: boolean,
    splitBeforeNumericPivotWorkday: boolean,
    splitBeforeNumericPivotAppian: boolean,
    scanUsingColonPivot: boolean,
    splitBeforeColonPivot: boolean
};

async function fetchConfigFile(): Promise<Config> {
    const url = chrome.runtime.getURL("config.json");
    const response = await fetch(url);
    if (!response.ok) throw new Error(response.statusText);

    return await response.json() as Config;
};

export default await fetchConfigFile();