// src/api/sirs.ts
// API integration for SIRs data - following the same pattern as releases.ts

export interface SIRsItem {
  [key: string]: any;
  // Fields from your API response
  Bug_id?: string;
  Open_date?: string;
  Change_date?: string;
  Bug_severity?: string;
  Priority?: string;
  Assigned_to?: string;
  Reporter?: string;
  Bug_status?: string;
  Resolution?: string;
  Component?: string;
  Op_sys?: string;
  Short_desc?: string;
  Cf_sirwith?: string;
}

export interface SIRsTypeData {
  name: string;
  value: number;
}

// Helper function to safely extract error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  } else if (typeof error === 'string') {
    return error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    return String((error as any).message);
  }
  return 'Unknown error occurred';
}

// JSONP fetch function (same as releases.ts)
function jsonpFetch<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const callbackName = 'jsonp_cb_' + Date.now();
    const script = document.createElement('script');
    
    const jsonpUrl = `${url}${url.includes('?') ? '&' : '?'}callback=${callbackName}`;
    
    script.src = jsonpUrl;
    script.async = true;
    
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('JSONP timeout after 15 seconds'));
    }, 15000);
    
    (window as any)[callbackName] = (data: T) => {
      clearTimeout(timeoutId);
      cleanup();
      resolve(data);
    };
    
    const cleanup = () => {
      delete (window as any)[callbackName];
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
    
    script.onerror = () => {
      clearTimeout(timeoutId);
      cleanup();
      reject(new Error('JSONP failed to load script'));
    };
    
    document.body.appendChild(script);
  });
}

// SINGLE FETCH FUNCTION - Gets raw SIRs JSON data
export async function getSIRsData(): Promise<SIRsItem[]> {
  // IMPORTANT: Replace with your actual SIRs API endpoint
  const API_URL = 'https://script.google.com/macros/s/AKfycbxA8wFlmM0NMKhNSG-fOWA4tRpV-k9w-sJ9P0KWpSAlKL8qkctT27-kDAvF65Vhw50H/exec/api/sirs';
  
  console.log('Fetching SIRs data via JSONP from:', API_URL);
  
  try {
    const data = await jsonpFetch<any>(API_URL);
    console.log('Raw API response received:', {
      success: data.success,
      count: data.count,
      sirsCount: data.sirs?.length || 0
    });
    
    if (data.success && Array.isArray(data.sirs)) {
      console.log('Successfully parsed SIRs data');
      return data.sirs;
    } else {
      console.error('❌ Unexpected API format:', data);
      throw new Error('Invalid API response format');
    }
  } catch (error) {
    console.error('❌ JSONP fetch error:', error);
    throw new Error(`Failed to fetch SIRs data: ${getErrorMessage(error)}`);
  }
}

// PROCESSING FUNCTION for SIRs by severity type (for pie chart)
export function processForSIRsTypes(sirs: SIRsItem[], selectedYear: string): SIRsTypeData[] {
  console.log(`Processing ${sirs.length} SIRs for year:`, selectedYear);
  
  if (!sirs || sirs.length === 0) {
    console.log('No SIRs data available');
    return [];
  }
  
  // Define all severity types (matching your original hardcoded data)
  const severityTypes = [
    "Blocker", "Critical", "Major", "Minor", 
    "Normal", "Enhancement", "Spec", "Setup"
  ];
  
  // Mapping from API severity values to chart severity types
  const severityMapping: Record<string, string> = {
    'blocker': 'Blocker',
    'critical': 'Critical',
    'major': 'Major',
    'minor': 'Minor',
    'normal': 'Normal',
    'enhancement': 'Enhancement',
    'spec': 'Spec',
    'setup': 'Setup'
  };
  
  // Initialize counters for all severity types
  const severityCounts: Record<string, number> = {};
  severityTypes.forEach(type => {
    severityCounts[type] = 0;
  });
  
  // Counters for debugging
  let yearMatchCount = 0;
  let noDateCount = 0;
  
  // Process each SIRs record
  sirs.forEach((sir) => {
    // Get severity from Bug_severity field (from your API)
    const rawSeverity = sir.Bug_severity || "normal";
    const severityLower = rawSeverity.toLowerCase().trim();
    
    // Map to chart severity type
    let mappedSeverity = severityMapping[severityLower] || "Normal";
    
    // Extract year from Open_date (primary) or Change_date (fallback)
    let sirYear = '';
    
    // Try Open_date first
    if (sir.Open_date) {
      try {
        const date = new Date(sir.Open_date);
        if (!isNaN(date.getTime())) {
          sirYear = date.getFullYear().toString();
        }
      } catch (e) {
        // Try next date field
      }
    }
    
    // Try Change_date if Open_date didn't work
    if (!sirYear && sir.Change_date) {
      try {
        const date = new Date(sir.Change_date);
        if (!isNaN(date.getTime())) {
          sirYear = date.getFullYear().toString();
        }
      } catch (e) {
        // Date parsing failed
      }
    }
    
    if (!sirYear) {
      noDateCount++;
      return; // Skip records without valid year
    }
    
    // Check if the SIR is in the selected year
    if (sirYear !== selectedYear) {
      return; // Skip SIRs from other years
    }
    
    yearMatchCount++;
    
    // Increment counter for the mapped severity
    if (severityCounts[mappedSeverity] !== undefined) {
      severityCounts[mappedSeverity]++;
    } else {
      // If we encounter a new severity type not in our mapping
      severityCounts[mappedSeverity] = 1;
    }
  });
  
  console.log('Processing summary for year', selectedYear, ':', {
    totalSIRs: sirs.length,
    yearMatchCount,
    noDateCount,
    severityCounts
  });
  
  // Convert to array format matching the chart's expected structure
  const result = severityTypes
    .filter(type => severityCounts[type] > 0) // Only include types with data
    .map(type => ({
      name: type,
      value: severityCounts[type]
    }));
  
  console.log('Processed result:', result);
  return result;
}

// Helper function to get available years from SIRs data
export function getAvailableYears(sirs: SIRsItem[]): string[] {
  const years = new Set<string>();
  
  sirs.forEach((sir) => {
    // Try to extract year from date fields
    const dateFields = ['Open_date', 'Change_date'];
    
    for (const field of dateFields) {
      const value = sir[field];
      
      if (value) {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            const year = date.getFullYear().toString();
            if (year >= "2015" && year <= "2027") {
              years.add(year);
            }
            break; // Found a valid date, move to next SIR
          }
        } catch (e) {
          // Continue to next date field
        }
      }
    }
  });
  
  // Convert to array and sort descending
  const yearsArray = Array.from(years)
    .sort((a, b) => parseInt(b) - parseInt(a));
  
  console.log('📅 Available years from SIRs data:', yearsArray);
  return yearsArray;
}

// Simple test function to verify the API is working
export async function testSIRsAPI(): Promise<boolean> {
  try {
    const sirs = await getSIRsData();
    console.log('🧪 API Test Result:', {
      hasData: sirs.length > 0,
      count: sirs.length,
      firstItem: sirs[0]
    });
    return sirs.length > 0;
  } catch (error) {
    console.error('🧪 API Test Failed:', getErrorMessage(error));
    return false;
  }
}

// Backward compatibility function (similar to releases.ts pattern)
export async function getSIRsByYear(year: string): Promise<SIRsTypeData[]> {
  try {
    const sirs = await getSIRsData();
    return processForSIRsTypes(sirs, year);
  } catch (error) {
    console.error('Error getting SIRs by year:', getErrorMessage(error));
    return [];
  }
}