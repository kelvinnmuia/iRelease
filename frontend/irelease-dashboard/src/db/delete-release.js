// db/delete-release.ts
import { toast } from "sonner";
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbyX2Hcoqhe-qZsgA6OsE0JzlnbSR1KdsH3JcKPqpAGI2c6EHtIWoqFEG8xkswdOcWBU/exec";
// =====================================
// HELPER FUNCTIONS
// =====================================
/**
 * Generate a random 5-character alphanumeric string
 */
function generateCallbackName() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `cb_${result}`;
}
/**
 * Make JSONP DELETE request via GET (simulating DELETE with _method parameter)
 */
function makeJsonpDeleteRequest(releaseId) {
    return new Promise((resolve, reject) => {
        const callbackName = generateCallbackName();
        console.log(`Using callback name: ${callbackName} for deleting release: ${releaseId}`);
        // Create URL with parameters for simulated DELETE request
        const params = new URLSearchParams();
        params.append('callback', callbackName);
        params.append('_method', 'DELETE'); // Simulate DELETE method
        // URL pattern: /api/releases/{releaseId}
        const url = `${BACKEND_URL}/api/releases/${releaseId}?${params.toString()}`;
        // Set up timeout
        const timeoutId = setTimeout(() => {
            cleanup();
            reject(new Error('Delete request timed out'));
        }, 300000); // 5 minutes timeout
        // Cleanup function
        const cleanup = () => {
            clearTimeout(timeoutId);
            if (window[callbackName]) {
                delete window[callbackName];
            }
            if (script && script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
        // Define callback with proper typing
        window[callbackName] = (response) => {
            cleanup();
            // Type guard to check if response has success property
            const jsonpResponse = response;
            if (jsonpResponse && jsonpResponse.success === false) {
                reject(new Error(jsonpResponse.error || 'Delete request failed'));
            }
            else {
                resolve(response);
            }
        };
        // Create and append script
        const script = document.createElement('script');
        script.src = url;
        script.onerror = () => {
            cleanup();
            reject(new Error('Failed to load script for delete request'));
        };
        document.body.appendChild(script);
    });
}
// =====================================
// MAIN FUNCTION
// =====================================
/**
 * Delete a release by its ID using JSONP DELETE via GET
 * @param releaseId - The ID of the release to delete
 * @returns Promise with the delete operation result
 */
export async function deleteRelease(releaseId) {
    try {
        console.log("Deleting release with ID:", releaseId);
        // Validate releaseId
        if (!releaseId || releaseId.trim() === '') {
            throw new Error('Release ID is required');
        }
        // Type the result as JsonpResponse
        const result = await makeJsonpDeleteRequest(releaseId);
        // Now TypeScript knows result has a success property
        if (!result.success) {
            throw new Error(result.error || 'Failed to delete release');
        }
        // Clean up the backend message if it contains "undefined"
        if (result.message) {
            const cleanMessage = result.message.replace('undefined', '').trim();
            toast.success(cleanMessage || "Release deleted successfully!");
        }
        else {
            toast.success("Release deleted successfully!");
        }
        return result;
    }
    catch (error) {
        console.error("Error deleting release:", error);
        toast.error(`Failed to delete release: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
    }
}
/**
 * Delete release using frontend release object
 * Convenience function that extracts releaseId from frontend data
 */
export async function deleteReleaseFromFrontendData(frontendReleaseData) {
    // Extract releaseId from frontend data
    const releaseId = frontendReleaseData.releaseId || frontendReleaseData.id || frontendReleaseData.Release_id;
    // Validate required fields
    if (!releaseId) {
        const error = new Error('Release ID is required for deletion');
        toast.error("Cannot delete release: Release ID is missing");
        throw error;
    }
    return await deleteRelease(releaseId);
}
