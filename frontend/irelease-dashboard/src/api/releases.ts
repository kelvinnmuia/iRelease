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
  if (!releases || releases.length === 0) {
    return [];
  }
  
  // Month names for display
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // Initialize data structure for all months
  const monthlyData: Record<string, { Major: number; Medium: number; Minor: number }> = {};
  
  // Initialize all months with zero counts
  monthNames.forEach(month => {
    monthlyData[month] = { Major: 0, Medium: 0, Minor: 0 };
  });
  
  // Process each release
  releases.forEach((release) => {
    // Extract date from release - assuming there's a date field
    // You might need to adjust this based on your actual data structure
    const releaseDate = release.Release_date || release.Date || release.created_at;
    
    if (!releaseDate) return;
    
    const date = new Date(releaseDate);
    
    // Check if the release is in the selected year
    const releaseYear = date.getFullYear().toString();
    if (releaseYear !== selectedYear) return;
    
    // Get month (0-11)
    const monthIndex = date.getMonth();
    const monthName = monthNames[monthIndex];
    
    // Get release type - assuming there's a Type or Release_type field
    // You might need to adjust this based on your actual data structure
    const releaseType = (release.Type || release.Release_type || release.release_type || "Unknown").toString().toLowerCase().trim();
    
    // Increment the appropriate counter
    if (monthlyData[monthName]) {
      if (releaseType.includes('major') || releaseType === 'major') {
        monthlyData[monthName].Major++;
      } else if (releaseType.includes('medium') || releaseType === 'medium') {
        monthlyData[monthName].Medium++;
      } else if (releaseType.includes('minor') || releaseType === 'minor') {
        monthlyData[monthName].Minor++;
      }
      // If type doesn't match, you could add to "Other" or ignore
    }
  });
  
  // Convert to array format
  return monthNames.map(month => ({
    month,
    Major: monthlyData[month].Major,
    Medium: monthlyData[month].Medium,
    Minor: monthlyData[month].Minor
  }));
}
