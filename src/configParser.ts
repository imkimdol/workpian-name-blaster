export type Config = {
    enableTableReplacement: boolean,
    enableListReplacement: boolean,
    enableNSIDReplacement: boolean,
    enableSIDNReplacement: boolean,
    currentPage: string,

    flaggedNameLabels: string[],
    flaggedOtherLabels: string[],

    ScanUsingNumericPivot: boolean,
    SplitBeforeNumericPivot: boolean,
    ScanUsingColonPivot: boolean,
    SplitBeforeColonPivot: boolean
}

async function fetchConfigFile(): Promise<any> {
    const url = chrome.runtime.getURL("config.json");
    const response = await fetch(url);
    if (!response.ok) throw new Error(response.statusText);

    const config = await response.json();
    config.currentPage = addCurrentPage(config);
    return config;
}

function addCurrentPage(config: Config): string {
    const currentHost = window.location.host;
    if (currentHost.includes("appian")) {
        return "appian";
    } else {
        return "workday";
    }
}
export const config = await fetchConfigFile() as Config;