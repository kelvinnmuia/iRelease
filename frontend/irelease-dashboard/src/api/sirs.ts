// src/api/sirs.ts
// CLEAN VERSION - NO MOCK DATA

export interface SIRsItem {
  [key: string]: any;
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

// JSONP fetch - same pattern as releases.ts
function jsonpFetch<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const callbackName = 'jsonp_cb_sirs_' + Date.now();
    const script = document.createElement('script');
    
    const jsonpUrl = `${url}${url.includes('?') ? '&' : '?'}callback=${callbackName}`;
    
    console.log('📡 SIRs JSONP URL:', jsonpUrl);
    script.src = jsonpUrl;
    script.async = true;
    
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('SIRs JSONP timeout'));
    }, 30000);
    
    (window as any)[callbackName] = (data: T) => {
      console.log('✅ SIRs JSONP response received');
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
      console.error('❌ SIRs JSONP script error');
      clearTimeout(timeoutId);
      cleanup();
      reject(new Error('SIRs JSONP failed to load'));
    };
    
    document.body.appendChild(script);
  });
}

// SIMPLE FETCH FUNCTION
export async function getSIRsData(): Promise<SIRsItem[]> {
  const API_URL = 'https://script.google.com/macros/s/AKfycbxA8wFlmM0NMKhNSG-fOWA4tRpV-k9w-sJ9P0KWpSAlKL8qkctT27-kDAvF65Vhw50H/exec/api/sirs';
  
  console.log('🔄 Fetching SIRs data...');
  
  try {
    const data = await jsonpFetch<any>(API_URL);
    
    // DEBUG: Log the full response structure
    console.log('📊 Full API response:', data);
    
    // Since you mentioned it's an 8173-long JSON file, 
    // it's likely a direct array or has a property with the array
    
    let sirsArray: any[] = [];
    
    // Try direct array first
    if (Array.isArray(data)) {
      console.log(`✅ Direct array with ${data.length} items`);
      sirsArray = data;
    }
    // Try common property names
    else if (data && typeof data === 'object') {
      console.log('🔍 Object keys:', Object.keys(data));
      
      // Try all possible array properties
      const possibleArrayKeys = ['sirs', 'data', 'results', 'items', 'records', 'bugs', 'issues'];
      
      for (const key of possibleArrayKeys) {
        if (data[key] && Array.isArray(data[key])) {
          console.log(`✅ Found array in "${key}" with ${data[key].length} items`);
          sirsArray = data[key];
          break;
        }
      }
      
      // If still not found, look for any array property
      if (sirsArray.length === 0) {
        for (const key in data) {
          if (Array.isArray(data[key])) {
            console.log(`⚠️ Using array from property "${key}" with ${data[key].length} items`);
            sirsArray = data[key];
            break;
          }
        }
      }
    }
    
    if (sirsArray.length > 0) {
      console.log(`🎉 Successfully loaded ${sirsArray.length} SIRs records`);
      
      // Log the structure of first record
      if (sirsArray.length > 0) {
        const firstRecord = sirsArray[0];
        console.log('📝 First record:', firstRecord);
        console.log('📝 First record keys:', Object.keys(firstRecord));
        
        // Check for date and severity fields
        const dateFields = ['Open_date', 'open_date', 'Date', 'date', 'Created', 'created'];
        const severityFields = ['Bug_severity', 'bug_severity', 'Severity', 'severity'];
        
        const foundDateField = dateFields.find(field => field in firstRecord);
        const foundSeverityField = severityFields.find(field => field in firstRecord);
        
        console.log('🔍 Found date field:', foundDateField);
        console.log('🔍 Found severity field:', foundSeverityField);
      }
      
      // Ensure all records have proper field names
      const normalizedSirs = sirsArray.map(item => {
        // Normalize field names to match our interface
        const normalized: SIRsItem = { ...item };
        
        // Ensure Open_date exists (try multiple field names)
        if (!normalized.Open_date) {
          const possibleDateFields = ['open_date', 'Date', 'date', 'Created', 'created', 'Reported', 'reported'];
          for (const field of possibleDateFields) {
            if (item[field]) {
              normalized.Open_date = item[field];
              break;
            }
          }
        }
        
        // Ensure Bug_severity exists
        if (!normalized.Bug_severity) {
          const possibleSeverityFields = ['bug_severity', 'Severity', 'severity', 'Priority', 'priority'];
          for (const field of possibleSeverityFields) {
            if (item[field]) {
              normalized.Bug_severity = item[field];
              break;
            }
          }
        }
        
        return normalized;
      });
      
      return normalizedSirs;
    } else {
      console.error('❌ Could not find SIRs data array in response');
      console.error('Response structure:', data);
      throw new Error('No SIRs data found in API response');
    }
    
  } catch (error) {
    console.error('❌ Error in getSIRsData:', error);
    throw error; // Re-throw so component can handle it
  }
}

// PROCESSING FUNCTION
export function processForSIRsTypes(sirs: SIRsItem[], selectedYear: string): SIRsTypeData[] {
  console.log(`🔍 Processing SIRs for ${selectedYear}`);
  console.log(`📊 Input: ${sirs.length} records`);
  
  if (!sirs || sirs.length === 0) {
    console.log('📭 No SIRs data to process');
    return [];
  }
  
  // Severity mapping
  const severityMap: Record<string, string> = {
    'blocker': 'Blocker',
    'critical': 'Critical', 
    'major': 'Major', 
    'minor': 'Minor',
    'normal': 'Normal', 
    'enhancement': 'Enhancement', 
    'spec': 'Spec', 
    'setup': 'Setup'
  };
  
  // Initialize counts for all severity types
  const counts: Record<string, number> = {
    'Blocker': 0,
    'Critical': 0,
    'Major': 0,
    'Minor': 0,
    'Normal': 0,
    'Enhancement': 0,
    'Spec': 0,
    'Setup': 0
  };
  
  let processedCount = 0;
  let yearMatchCount = 0;
  
  // Process records
  for (const sir of sirs) {
    processedCount++;
    
    // Extract year from Open_date
    let year = '';
    const openDate = sir.Open_date;
    
    if (openDate) {
      try {
        // Try to parse date - handle different formats
        const dateStr = String(openDate).trim();
        if (dateStr) {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            year = date.getFullYear().toString();
          } else {
            // Try alternative date parsing
            const parts = dateStr.split(/[-\/]/);
            if (parts.length >= 1) {
              const possibleYear = parts[0];
              if (possibleYear.length === 4 && /^\d{4}$/.test(possibleYear)) {
                year = possibleYear;
              }
            }
          }
        }
      } catch (e) {
        // Skip records with invalid dates
        continue;
      }
    }
    
    // Skip if no year or wrong year
    if (!year || year !== selectedYear) {
      continue;
    }
    
    yearMatchCount++;
    
    // Extract and normalize severity
    const rawSeverity = sir.Bug_severity ? 
      String(sir.Bug_severity).toLowerCase().trim() : 
      'normal';
    
    const mappedSeverity = severityMap[rawSeverity] || 'Normal';
    counts[mappedSeverity]++;
  }
  
  console.log('📈 Processing results:', {
    totalProcessed: processedCount,
    yearMatches: yearMatchCount,
    severityCounts: counts
  });
  
  // Convert to chart data format
  const result = Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);
  
  console.log('🎯 Chart data:', result);
  return result;
}

// GET AVAILABLE YEARS
export function getAvailableYears(sirs: SIRsItem[]): string[] {
  const years = new Set<string>();
  
  for (const sir of sirs) {
    const openDate = sir.Open_date;
    
    if (openDate) {
      try {
        const dateStr = String(openDate).trim();
        if (dateStr) {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            years.add(date.getFullYear().toString());
          } else {
            // Try to extract year from string
            const yearMatch = dateStr.match(/\b(\d{4})\b/);
            if (yearMatch) {
              years.add(yearMatch[1]);
            }
          }
        }
      } catch (e) {
        // Skip invalid dates
      }
    }
  }
  
  // Convert to array and sort descending
  const yearsArray = Array.from(years)
    .sort((a, b) => parseInt(b) - parseInt(a))
    .filter(year => {
      const yearNum = parseInt(year);
      return yearNum >= 2000 && yearNum <= new Date().getFullYear() + 1;
    });
  
  console.log('📅 Available years found:', yearsArray);
  return yearsArray;
}