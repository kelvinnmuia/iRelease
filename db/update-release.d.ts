/**
 * Update an existing release
 */
export declare function updateRelease(releaseId: string, releaseData: any): Promise<any>;
/**
 * Transform form data to backend format for updates
 */
export declare function transformToBackendFormatForUpdate(formData: any): any;
/**
 * Update release from form data
 */
export declare function updateReleaseFromForm(releaseId: string, formData: any): Promise<any>;
