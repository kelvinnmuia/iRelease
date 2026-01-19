// src/api/releases.ts - JSONP VERSION

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

// JSONP fetch function
function jsonpFetch<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const callbackName = 'jsonp_cb_' + Date.now();
    const script = document.createElement('script');
    
    // Add callback parameter
    const jsonpUrl = `${url}${url.includes('?') ? '&' : '?'}callback=${callbackName}`;
    
    script.src = jsonpUrl;
    script.async = true;
    
    // Timeout
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('JSONP timeout'));
    }, 10000);
    
    // Callback
    (window as any)[callbackName] = (data: T) => {
      clearTimeout(timeoutId);
      cleanup();
      resolve(data);
    };
    
    // Cleanup
    const cleanup = () => {
      delete (window as any)[callbackName];
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
    
    // Error handling
    script.onerror = () => {
      clearTimeout(timeoutId);
      cleanup();
      reject(new Error('JSONP failed'));
    };
    
    document.body.appendChild(script);
  });
}

export async function getReleasesStats(): Promise<ReleaseStats> {
  try {
    const API_URL = 'https://script.google.com/macros/s/AKfycbxA8wFlmM0NMKhNSG-fOWA4tRpV-k9w-sJ9P0KWpSAlKL8qkctT27-kDAvF65Vhw50H/exec/api/releases';
    
    console.log('Fetching via JSONP...');
    
    const data = await jsonpFetch<any>(API_URL);
    
    console.log('JSONP success:', { 
      success: data.success, 
      count: data.count,
      releases: data.releases?.length 
    });
    
    if (!data.success) throw new Error('API failed');
    
    const releases = data.releases || [];
    let passed = 0, failed = 0, inTesting = 0;
    
    releases.forEach((release: any) => {
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
    
  } catch (error) {
    console.error('❌ JSONP error:', error);
    return {
      allReleases: 0,
      inTesting: 0,
      passed: 0,
      failed: 0,
      trends: { allReleases: "+0%", inTesting: "+0%", passed: "+0%", failed: "+0%" }
    };
  }
}