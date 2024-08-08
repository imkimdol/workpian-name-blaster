export type Config = {
    enableTableReplacement: boolean,
    enableListReplacement: boolean,
    enableNSIDReplacement: boolean,

    flaggedNameLabels: string[],
    flaggedOtherLabels: string[],

    NSIDExcludeNumeric: boolean,
    NSIDSplitBeforeNumeric: boolean,
    NSIDExcludeColon: boolean,
    NSIDSplitBeforeColon: boolean
}

async function fetchConfigFile(): Promise<any> {
    const url = chrome.runtime.getURL("config.json");
    const response = await fetch(url);
    if (!response.ok) throw new Error(response.statusText);

    const config = await response.json();
    return config;
}

export const config = await fetchConfigFile() as Config;