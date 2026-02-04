interface JsonpResponse {
    success: boolean;
    error?: string;
    message?: string;
    release?: any;
    [key: string]: any;
}
/**
 * Delete a release by its ID using JSONP DELETE via GET
 * @param releaseId - The ID of the release to delete
 * @returns Promise with the delete operation result
 */
export declare function deleteRelease(releaseId: string): Promise<JsonpResponse>;
/**
 * Delete release using frontend release object
 * Convenience function that extracts releaseId from frontend data
 */
export declare function deleteReleaseFromFrontendData(frontendReleaseData: any): Promise<JsonpResponse>;
export {};
