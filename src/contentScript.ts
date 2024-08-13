async function loadConfigAndGetPlatform() {
    const configParser = await import(chrome.runtime.getURL("configParser.js"));
    const config = configParser.config;
    if (!config) throw new Error("Unable to load config!");
    return config.currentPage;
};

async function setupPage() {
    const platform = await loadConfigAndGetPlatform();
    const setupClasses = await import(chrome.runtime.getURL("setupPage.js"));

    if (platform === "workday") {
        new setupClasses.Workday();
    } else {
        new setupClasses.Appian();
    }
};

setupPage();