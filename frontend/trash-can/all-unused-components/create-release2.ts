// db/create-release.ts
import { toast } from "sonner";

const BACKEND_URL = "https://script.google.com/macros/s/AKfycbwu-TMFI7tI4F12ClWJUhiC3c4_L9VfeBnL_rRUsaVQgeiPbieLKj1T_M0bP9Cd9sPL/exec";

// =====================================
// TYPE DEFINITIONS
// =====================================

interface JsonpResponse {
  success: boolean;
  error?: string;
  release?: any;
  message?: string;
  [key: string]: any; // Allow additional properties
}

// =====================================
// HELPER FUNCTIONS
// =====================================

/**
 * Generate a random 5-character alphanumeric string
 */
function generateCallbackName(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `cb_${result}`;
}

/**
 * Make JSONP POST request
 */
function makeJsonpPostRequest<T = JsonpResponse>(endpoint: string, data: any): Promise<T> {
  return new Promise((resolve, reject) => {
    const callbackName = generateCallbackName();
    console.log(`Using callback name: ${callbackName}`);
    
    // Create URL with parameters
    const params = new URLSearchParams();
    params.append('callback', callbackName);
    params.append('_method', 'POST');
    params.append('_data', encodeURIComponent(JSON.stringify(data)));
    
    const url = `${BACKEND_URL}${endpoint}?${params.toString()}`;
    
    // Set up timeout
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('Request timed out'));
    }, 300000);
    
    // Cleanup function
    const cleanup = () => {
      clearTimeout(timeoutId);
      if ((window as any)[callbackName]) {
        delete (window as any)[callbackName];
      }
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
    
    // Define callback with proper typing
    (window as any)[callbackName] = (response: T) => {
      cleanup();
      
      // Type guard to check if response has success property
      const jsonpResponse = response as JsonpResponse;
      if (jsonpResponse && jsonpResponse.success === false) {
        reject(new Error(jsonpResponse.error || 'Request failed'));
      } else {
        resolve(response);
      }
    };
    
    // Create and append script
    const script = document.createElement('script');
    script.src = url;
    
    script.onerror = () => {
      cleanup();
      reject(new Error('Failed to load script'));
    };
    
    document.body.appendChild(script);
  });
}

// =====================================
// MAIN FUNCTIONS
// =====================================

/**
 * Create a new release
 */
export async function createRelease(releaseData: any): Promise<any> {
  try {
    console.log("Creating release:", releaseData);
    
    // Type the result as JsonpResponse
    const result = await makeJsonpPostRequest<JsonpResponse>('/api/releases', releaseData);
    
    // Now TypeScript knows result has a success property
    if (!result.success) {
      throw new Error(result.error || 'Failed to create release');
    }
    
    toast.success("Release created successfully!");
    return result.release || result;

  } catch (error) {
    console.error("Error creating release:", error);
    toast.error(`Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

/**
 * Transform form data to backend format
 */
export function transformToBackendFormat(formData: any): any {
  const transformed: any = {};
  
  const fieldMappings: Record<string, any> = {
    'System_name': formData.systemName || '',
    'System_id': formData.systemId || '',
    'Release_version': formData.releaseVersion || '',
    'Iteration': formData.iteration ? parseInt(formData.iteration) : 1,
    'Release_description': formData.releaseDescription || '',
    'Date_delivered_by_vendor': formData.deliveredDate || '',
    'Test_status': formData.testStatus || '',
    'Deployment_status': formData.deploymentStatus || '',
    'Type_of_release': formData.releaseType || '',
    'Financial_year': formData.financialYear || '',
    'Functionality_delivered': formData.functionalityDelivered || '',
    'Notification_date_for_deployment_to_test': formData.tdNoticeDate || '',
    'Date_deployed_to_test': formData.testDeployDate || '',
    'Date_of_test_commencement': formData.testStartDate || '',
    'Date_of_test_completion': formData.testEndDate || '',
    'Date_deployed_in_production': formData.prodDeployDate || '',
    'Outstanding_issues': formData.outstandingIssues || '',
    'Comments': formData.comments || '',
    'Month': formData.month || ''
  };
  
  Object.entries(fieldMappings).forEach(([backendField, value]) => {
    transformed[backendField] = value;
  });
  
  return transformed;
}

/**
 * Create release from form data
 */
export async function createReleaseFromForm(formData: any): Promise<any> {
  // Validate required fields
  const requiredFields = ['systemName', 'systemId', 'releaseVersion', 'releaseType', 
                         'financialYear', 'testStatus', 'deploymentStatus', 
                         'deliveredDate', 'releaseDescription'];
  
  const missingFields = requiredFields.filter(field => !formData[field]?.trim());
  
  if (missingFields.length > 0) {
    const error = new Error(`Missing: ${missingFields.join(', ')}`);
    toast.error(`Please fill in: ${missingFields.join(', ')}`);
    throw error;
  }
  
  const backendData = transformToBackendFormat(formData);
  return await createRelease(backendData);
}