// src/api/releases.ts - SIMPLE VERSION

export interface ReleaseStats {
  allReleases: number
  inTesting: number
  passed: number
  failed: number
  trends?: {
    allReleases: string
    inTesting: string
    passed: string
    failed: string
  }
}

export interface SystemData {
  name: string;
  value: number;
}

export interface ReleaseItem {
  System_name?: string;
  Test_status?: string;
  [key: string]: any;
}

// PROCESSING FUNCTION for release type chart
export interface MonthlyReleaseType {
  month: string;
  Major: number;
  Medium: number;
  Minor: number;
}

export interface MonthlyReleaseType {
  month: string;
  Major: number;
  Medium: number;
  Minor: number;
}


// JSONP fetch function (unchanged)
function jsonpFetch<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const callbackName = 'jsonp_cb_' + Date.now();
    const script = document.createElement('script');
    
    const jsonpUrl = `${url}${url.includes('?') ? '&' : '?'}callback=${callbackName}`;
    
    script.src = jsonpUrl;
    script.async = true;
    
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('JSONP timeout'));
    }, 10000);
    
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
      reject(new Error('JSONP failed'));
    };
    
    document.body.appendChild(script);
  });
}

// SINGLE FETCH FUNCTION - Gets raw JSON data
export async function getReleasesData(): Promise<ReleaseItem[]> {
  const API_URL = 'https://script.google.com/macros/s/AKfycbxA8wFlmM0NMKhNSG-fOWA4tRpV-k9w-sJ9P0KWpSAlKL8qkctT27-kDAvF65Vhw50H/exec/api/releases';
  
  console.log('Fetching releases data via JSONP...');
  
  const data = await jsonpFetch<any>(API_URL);
  
  if (!data.success) {
    throw new Error('API failed');
  }
  
  console.log('Got', data.releases?.length || 0, 'releases');
  return data.releases || [];
}

// PROCESSING FUNCTION for stats cards
export function processForStats(releases: ReleaseItem[]): ReleaseStats {
  let passed = 0, failed = 0, inTesting = 0;
  
  releases.forEach((release) => {
    const status = String(release.Test_status || '').toLowerCase().trim();
    if (status === 'passed') passed++;
    else if (status === 'failed') failed++;
    else inTesting++;
  });
  
  return {
    allReleases: releases.length,
    inTesting,
    passed,
    failed,
    trends: {
      allReleases: "+0%",
      inTesting: "+0%",
      passed: "+0%",
      failed: "+0%"
    }
  };
}

// PROCESSING FUNCTION for system names
export function processForSystem(releases: ReleaseItem[]): SystemData[] {
  const systemCounts: Record<string, number> = {};
  
  releases.forEach((release) => {
    const systemName = release.System_name || "Unknown";
    systemCounts[systemName] = (systemCounts[systemName] || 0) + 1;
  });
  
  return Object.entries(systemCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

// KEEP OLD FUNCTIONS for backward compatibility
export async function getReleasesStats(): Promise<ReleaseStats> {
  const releases = await getReleasesData();
  return processForStats(releases);
}

export async function getReleasesBySystem(): Promise<SystemData[]> {
  const releases = await getReleasesData();
  return processForSystem(releases);
}

export function processForReleaseType(releases: ReleaseItem[], selectedYear: string): MonthlyReleaseType[] {
  console.log('🔍 Processing release types for year:', selectedYear)
  
  if (!releases || releases.length === 0) {
    console.log('⚠️ No releases data')
    return []
  }
  
  // Month mapping from full name to short name
  const monthMap: Record<string, string> = {
    "January": "Jan", "February": "Feb", "March": "Mar", "April": "Apr",
    "May": "May", "June": "Jun", "July": "Jul", "August": "Aug",
    "September": "Sep", "October": "Oct", "November": "Nov", "December": "Dec"
  }
  
  // All month short names in order
  const allMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  
  // Initialize data structure for all months
  const monthlyData: Record<string, { Major: number; Medium: number; Minor: number }> = {}
  
  // Initialize all months with zero counts
  allMonthNames.forEach(month => {
    monthlyData[month] = { Major: 0, Medium: 0, Minor: 0 }
  })
  
  // Counter for debugging
  let yearMatchCount = 0
  
  // Process each release
  releases.forEach((release) => {
    // Get the release type from Type_of_release field
    const releaseType = release.Type_of_release || "Unknown"
    
    // Get month from Month field (full name like "November")
    const fullMonthName = release.Month || ""
    const monthShort = monthMap[fullMonthName]
    
    if (!monthShort) {
      return // Skip releases without valid month
    }
    
    // Try to extract year from date fields
    // Check multiple date fields in order of preference
    const dateFields = [
      'Date_delivered_by_vendor',
      'Date_deployed_to_test', 
      'Date_of_test_commencement',
      'Date_of_test_completion',
      'Notification_date_for_deployment_to_test',
      'Date_updated'
    ]
    
    let releaseYear = ''
    
    for (const field of dateFields) {
      const dateStr = release[field]
      if (dateStr && typeof dateStr === 'string' && dateStr.includes('-')) {
        try {
          // Extract year from ISO date string like "2024-11-12T21:00:00.000Z"
          const yearMatch = dateStr.match(/^(\d{4})-/)
          if (yearMatch) {
            releaseYear = yearMatch[1]
            break
          }
        } catch (e) {
          // Continue to next date field
        }
      }
    }
    
    if (!releaseYear) {
      return // Skip releases without year
    }
    
    // Check if the release is in the selected year
    if (releaseYear !== selectedYear) {
      return // Skip releases from other years
    }
    
    yearMatchCount++
    
    // Increment the appropriate counter
    if (monthlyData[monthShort]) {
      const typeLower = releaseType.toLowerCase().trim()
      
      if (typeLower.includes('major') || typeLower === 'major') {
        monthlyData[monthShort].Major++
      } else if (typeLower.includes('medium') || typeLower === 'medium') {
        monthlyData[monthShort].Medium++
      } else if (typeLower.includes('minor') || typeLower === 'minor') {
        monthlyData[monthShort].Minor++
      } else {
        // For unknown types, default to Minor
        monthlyData[monthShort].Minor++
      }
    }
  })
  
  console.log('📈 Processing summary for year', selectedYear, ':', {
    totalReleases: releases.length,
    yearMatchCount
  })
  
  // Convert to array format in correct month order
  const result = allMonthNames.map(month => ({
    month,
    Major: monthlyData[month].Major,
    Medium: monthlyData[month].Medium,
    Minor: monthlyData[month].Minor
  }))
  
  return result
}