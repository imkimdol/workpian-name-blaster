import type { ExtensionInfo } from "../extensionInfo";
import type { AlgorithmHelper } from "./helper";

// This file only exists for TypeScript, it has no impact on the compiled code.
export interface Algorithm {
    extensionInfo: ExtensionInfo;
    helper: AlgorithmHelper;
    censorData(): void;
};