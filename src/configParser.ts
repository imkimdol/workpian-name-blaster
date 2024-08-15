/**
 * The expected format for `config.json`.
 */
export interface Config {
  enableTableAlgorithm: boolean;
  enableListAlgorithm: boolean;
  enableSimpleTemplateAlgorithm: boolean;

  useNumericDividerSubalgorithm: boolean;
  useTextBeforeNumericDividerWorkday: boolean;
  useTextBeforeNumericDividerAppian: boolean;

  useColonDividerSubalgorithm: boolean;
  useTextBeforeColonDivider: boolean;

  flaggedNameExpressions: string[];
  flaggedOtherExpressions: string[];
}

/**
 * Loads and reads config data from config.json.
 * @returns Parsed config data.
 */
async function fetchConfigFile(): Promise<Config> {
  const url = chrome.runtime.getURL("config.json");
  const response = await fetch(url);
  if (!response.ok) throw new Error(response.statusText);

  return (await response.json()) as Config;
}

export default await fetchConfigFile();
