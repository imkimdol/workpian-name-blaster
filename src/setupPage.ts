import type {
  Algorithm,
  AlgorithmInstantiatorFunction,
} from "./algorithm/algorithm";
import type { ExtensionInfo } from "./extensionInfo";
import type { AlgorithmHelper } from "./algorithm/helper";

/**
 * Prepares the page by adding listeners and scheduling jobs.
 *
 * Keeping references to this class is not required. Setup occurs during instantiation.
 */
class SetupHelper {
  private readonly loopInterval = 2000;

  private extensionInfo: ExtensionInfo;
  private algorithms: Algorithm[] = [];

  private isBlastin = false;

  constructor(extensionInfo: ExtensionInfo) {
    this.extensionInfo = extensionInfo;

    this.addListeners();
    this.scheduleAlgorithms(this.loopInterval);
  }

  /**
   * Dynamically imports and instantiates algorithms specified in `this.extensionInfo`.
   */
  private async importAlgorithms() {
    const helperModule = await import(
      chrome.runtime.getURL("algorithm/helper.js")
    );
    const algorithmHelper = new helperModule.AlgorithmHelper(
      this.extensionInfo,
    ) as AlgorithmHelper;

    for (const p of this.extensionInfo.algorithmPaths) {
      const url = chrome.runtime.getURL(p);
      const instantiator: AlgorithmInstantiatorFunction = (await import(url))
        .default;
      const algorithm: Algorithm = instantiator(
        this.extensionInfo,
        algorithmHelper,
      );
      if (algorithm) this.algorithms.push(algorithm);
    }
  }

  /**
   * Runs all instantiated algorithms.
   * Attempts to instantiate algorithms if none are present.
   */
  private async runAlgorithms() {
    if (this.algorithms.length === 0) await this.importAlgorithms();
    this.algorithms.forEach((a) => a.censorSensitiveData());
  }

  /**
   * Adds listeners for communication with the front-end.
   */
  private addListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "startBlastin") {
        this.runAlgorithms();
        this.isBlastin = true;
        sendResponse();
      } else if (message.action === "stopBlastin") {
        this.isBlastin = false;
        sendResponse();
      } else if (message.action === "isBlastin?") {
        sendResponse(this.isBlastin);
      }
    });
  }

  /**
   * Schedules the algorithms to be repeately run when `isBlastin = true`.
   * @param interval Time between algorithm calls in milliseconds
   */
  private scheduleAlgorithms(interval: number) {
    setInterval(() => {
      if (this.isBlastin) this.runAlgorithms();
    }, interval);
  }
}

/**
 * Creates an instance of `SetupHelper`.
 */
export default async function setup() {
  const infoModule = await import(chrome.runtime.getURL("extensionInfo.js"));
  const extensionInfo = infoModule.info as ExtensionInfo;

  new SetupHelper(extensionInfo);
}
