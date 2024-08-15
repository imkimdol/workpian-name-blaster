// This file only exists for TypeScript. It has no implications on the compiled code.

import type { ExtensionInfo } from "../extensionInfo";
import type { AlgorithmHelper } from "./helper";

/**
 * The base interface for all algorithm classes.
 */
export interface Algorithm {
    extensionInfo: ExtensionInfo;
    helper: AlgorithmHelper;
    
    /**
     * The base function used to run the algorithm.
     */
    censorData(): void;
};
/**
 * Functions that create an instance of `Algorithm` that matches the current platform.
 * @returns Instantiated class
 */
export type AlgorithmInstantiatorFunction = (extensionInfo: ExtensionInfo, helper: AlgorithmHelper) => Algorithm;