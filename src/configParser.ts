export type Config = {
    enableTableAlgorithm: boolean,
    enableListAlgorithm: boolean,
    enableSimpleTemplateAlgorithm: boolean,

    scanUsingNumericPivot: boolean,
    splitBeforeNumericPivotWorkday: boolean,
    splitBeforeNumericPivotAppian: boolean,

    scanUsingColonPivot: boolean,
    splitBeforeColonPivot: boolean

    flaggedNameLabels: string[],
    flaggedOtherLabels: string[]
};

/**
 * Loads and reads config data from config.json.
 * @returns The parsed config data.
 */
async function fetchConfigFile(): Promise<Config> {
    const url = chrome.runtime.getURL("config.json");
    const response = await fetch(url);
    if (!response.ok) throw new Error(response.statusText);

    return await response.json() as Config;
};

export default await fetchConfigFile();