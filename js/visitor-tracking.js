/**
 * Visitor Tracking System
 * Tracks page views, unique visitors, IP addresses, and referral sources
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    // Use localStorage for tracking (works client-side)
    STORAGE_KEY: 'visitor_tracking_data',
    SESSION_KEY: 'visitor_session',
    API_ENDPOINT: null, // Set to your API endpoint if available
    TRACK_PAGES: true,
    TRACK_REFERRER: true,
    TRACK_DEVICE: true,
    TRACK_BROWSER: true,
    TRACK_LOCATION: false, // Requires IP geolocation API
    DEBUG: false
  };

  // Get or initialize tracking data
  function getTrackingData() {
    try {
      const data = localStorage.getItem(CONFIG.STORAGE_KEY);
      const parsed = data ? JSON.parse(data) : {
        visitors: [],
        pageViews: [],
        uniqueIPs: [],
        quizResults: [],
        totalViews: 0,
        uniqueVisitors: 0,
        firstVisit: new Date().toISOString(),
        lastUpdate: new Date().toISOString()
      };
      // Ensure uniqueIPs is an array
      if (!Array.isArray(parsed.uniqueIPs)) {
        parsed.uniqueIPs = [];
      }
      // Ensure pageViews is an array
      if (!Array.isArray(parsed.pageViews)) {
        parsed.pageViews = [];
      }
      // Ensure visitors is an array
      if (!Array.isArray(parsed.visitors)) {
        parsed.visitors = [];
      }
      // Ensure quizResults is an array
      if (!Array.isArray(parsed.quizResults)) {
        parsed.quizResults = [];
      }
      return parsed;
    } catch (e) {
      console.error('Error reading tracking data:', e);
      return {
        visitors: [],
        pageViews: [],
        uniqueIPs: [],
        totalViews: 0,
        uniqueVisitors: 0,
        firstVisit: new Date().toISOString(),
        lastUpdate: new Date().toISOString()
      };
    }
  }

  // Save tracking data
  function saveTrackingData(data) {
    try {
      // Ensure uniqueIPs is an array (remove duplicates)
      const uniqueIPsArray = Array.isArray(data.uniqueIPs) 
        ? [...new Set(data.uniqueIPs)]
        : [];
      
      const dataToSave = {
        visitors: Array.isArray(data.visitors) ? data.visitors : [],
        pageViews: Array.isArray(data.pageViews) ? data.pageViews : [],
        uniqueIPs: uniqueIPsArray,
        quizResults: Array.isArray(data.quizResults) ? data.quizResults : [],
        totalViews: data.totalViews || 0,
        uniqueVisitors: uniqueIPsArray.length,
        firstVisit: data.firstVisit || new Date().toISOString(),
        lastUpdate: data.lastUpdate || new Date().toISOString()
      };
      
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(dataToSave));
      return true;
    } catch (e) {
      console.error('Error saving tracking data:', e);
      // If storage is full, try to clean up old data
      try {
        const currentData = getTrackingData();
        // Keep only last 1000 page views
        if (currentData.pageViews.length > 1000) {
          currentData.pageViews = currentData.pageViews.slice(-1000);
          currentData.totalViews = currentData.pageViews.length;
          saveTrackingData(currentData);
        }
      } catch (cleanupError) {
        console.error('Error cleaning up tracking data:', cleanupError);
      }
      return false;
    }
  }

  // Get visitor IP (approximation using WebRTC or API)
  async function getVisitorIP() {
    try {
      // Try to get IP from a free API
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || 'unknown';
    } catch (e) {
      // Fallback: generate a unique ID based on browser fingerprint
      return generateFingerprint();
    }
  }

  // Generate browser fingerprint
  function generateFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Browser fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return 'fp_' + Math.abs(hash).toString(16);
  }

  // Get device information
  function getDeviceInfo() {
    const ua = navigator.userAgent;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
    const isTablet = /iPad|Android/i.test(ua) && !/Mobile/i.test(ua);
    const isDesktop = !isMobile && !isTablet;
    
    return {
      type: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
      userAgent: ua,
      screen: {
        width: screen.width,
        height: screen.height
      },
      language: navigator.language,
      platform: navigator.platform
    };
  }

  // Get browser information
  function getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    
    if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
    else if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) browser = 'Chrome';
    else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) browser = 'Safari';
    else if (ua.indexOf('Edg') > -1) browser = 'Edge';
    else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) browser = 'Opera';
    
    return browser;
  }

  // Track page view
  async function trackPageView(page) {
    try {
      const data = getTrackingData();
      const sessionId = sessionStorage.getItem(CONFIG.SESSION_KEY) || generateSessionId();
      sessionStorage.setItem(CONFIG.SESSION_KEY, sessionId);
      
      // Get visitor IP
      const ip = await getVisitorIP();
      
      // Get visitor information
      const visitorInfo = {
        ip: ip,
        sessionId: sessionId,
        page: page || window.location.pathname,
        referrer: CONFIG.TRACK_REFERRER ? document.referrer || 'direct' : 'unknown',
        timestamp: new Date().toISOString(),
        device: CONFIG.TRACK_DEVICE ? getDeviceInfo() : null,
        browser: CONFIG.TRACK_BROWSER ? getBrowserInfo() : null,
        url: window.location.href
      };
      
      // Add to unique IPs
      if (!Array.isArray(data.uniqueIPs)) {
        data.uniqueIPs = [];
      }
      // Add IP if not already in the array
      if (!data.uniqueIPs.includes(ip)) {
        data.uniqueIPs.push(ip);
      }
      
      // Add page view
      data.pageViews.push(visitorInfo);
      data.totalViews = data.pageViews.length;
      data.uniqueVisitors = data.uniqueIPs.length;
      data.lastUpdate = new Date().toISOString();
      
      // Check if this is a new visitor
      const isNewVisitor = !data.visitors.some(v => v.ip === ip);
      if (isNewVisitor) {
        data.visitors.push({
          ip: ip,
          firstVisit: new Date().toISOString(),
          lastVisit: new Date().toISOString(),
          pageViews: 1,
          device: visitorInfo.device,
          browser: visitorInfo.browser
        });
      } else {
        // Update existing visitor
        const visitor = data.visitors.find(v => v.ip === ip);
        if (visitor) {
          visitor.lastVisit = new Date().toISOString();
          visitor.pageViews += 1;
        }
      }
      
      // Save data
      saveTrackingData(data);
      
      // Send to API if configured
      if (CONFIG.API_ENDPOINT) {
        sendToAPI(visitorInfo);
      }
      
      if (CONFIG.DEBUG) {
        console.log('Page view tracked:', visitorInfo);
      }
      
      return visitorInfo;
    } catch (e) {
      console.error('Error tracking page view:', e);
      return null;
    }
  }

  // Generate session ID
  function generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Send data to API
  async function sendToAPI(data) {
    if (!CONFIG.API_ENDPOINT) return;
    
    try {
      await fetch(CONFIG.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
    } catch (e) {
      console.error('Error sending data to API:', e);
    }
  }

  // Track quiz result
  async function trackQuizResult(quizName, score, totalQuestions, percentage) {
    try {
      const data = getTrackingData();
      const ip = await getVisitorIP();
      
      // Ensure quizResults is an array
      if (!Array.isArray(data.quizResults)) {
        data.quizResults = [];
      }
      
      const quizResult = {
        quizName: quizName,
        score: score,
        totalQuestions: totalQuestions,
        percentage: percentage,
        ip: ip,
        timestamp: new Date().toISOString(),
        device: CONFIG.TRACK_DEVICE ? getDeviceInfo() : null,
        browser: CONFIG.TRACK_BROWSER ? getBrowserInfo() : null,
        url: window.location.href
      };
      
      // Add quiz result
      data.quizResults.push(quizResult);
      data.lastUpdate = new Date().toISOString();
      
      // Save data
      saveTrackingData(data);
      
      // Send to API if configured
      if (CONFIG.API_ENDPOINT) {
        sendToAPI(quizResult);
      }
      
      if (CONFIG.DEBUG) {
        console.log('Quiz result tracked:', quizResult);
      }
      
      return quizResult;
    } catch (e) {
      console.error('Error tracking quiz result:', e);
      return null;
    }
  }

  // Get statistics
  function getStatistics() {
    const data = getTrackingData();
    
    // Ensure uniqueIPs is an array
    if (!Array.isArray(data.uniqueIPs)) {
      data.uniqueIPs = [];
    }
    
    // Calculate page views per page
    const pageViews = {};
    if (Array.isArray(data.pageViews)) {
      data.pageViews.forEach(view => {
        const page = view.page || view.url || 'unknown';
        pageViews[page] = (pageViews[page] || 0) + 1;
      });
    }
    
    // Calculate views by device
    const deviceViews = {};
    if (Array.isArray(data.pageViews)) {
      data.pageViews.forEach(view => {
        if (view.device && view.device.type) {
          deviceViews[view.device.type] = (deviceViews[view.device.type] || 0) + 1;
        }
      });
    }
    
    // Calculate views by browser
    const browserViews = {};
    if (Array.isArray(data.pageViews)) {
      data.pageViews.forEach(view => {
        if (view.browser) {
          browserViews[view.browser] = (browserViews[view.browser] || 0) + 1;
        }
      });
    }
    
    // Calculate views by referrer
    const referrerViews = {};
    if (Array.isArray(data.pageViews)) {
      data.pageViews.forEach(view => {
        try {
          const referrer = view.referrer === 'direct' || !view.referrer 
            ? 'Direct' 
            : view.referrer.startsWith('http') 
              ? new URL(view.referrer).hostname 
              : 'Unknown';
          referrerViews[referrer] = (referrerViews[referrer] || 0) + 1;
        } catch (e) {
          referrerViews['Direct'] = (referrerViews['Direct'] || 0) + 1;
        }
      });
    }
    
    // Calculate quiz statistics
    const quizStats = {};
    const quizResults = Array.isArray(data.quizResults) ? data.quizResults : [];
    
    // Calculate average score per quiz
    const quizAverages = {};
    const quizCounts = {};
    quizResults.forEach(result => {
      const quizName = result.quizName || 'Unknown';
      if (!quizAverages[quizName]) {
        quizAverages[quizName] = 0;
        quizCounts[quizName] = 0;
      }
      quizAverages[quizName] += result.percentage || 0;
      quizCounts[quizName] += 1;
    });
    
    // Calculate average
    Object.keys(quizAverages).forEach(quizName => {
      quizAverages[quizName] = Math.round(quizAverages[quizName] / quizCounts[quizName]);
    });
    
    // Calculate overall quiz statistics
    const totalQuizzes = quizResults.length;
    const averageScore = totalQuizzes > 0 
      ? Math.round(quizResults.reduce((sum, r) => sum + (r.percentage || 0), 0) / totalQuizzes)
      : 0;
    
    // Calculate score distribution
    const scoreDistribution = {
      perfect: quizResults.filter(r => r.percentage === 100).length,
      excellent: quizResults.filter(r => r.percentage >= 90 && r.percentage < 100).length,
      good: quizResults.filter(r => r.percentage >= 70 && r.percentage < 90).length,
      average: quizResults.filter(r => r.percentage >= 50 && r.percentage < 70).length,
      poor: quizResults.filter(r => r.percentage < 50).length
    };
    
    return {
      totalViews: data.totalViews || 0,
      uniqueVisitors: data.uniqueVisitors || data.uniqueIPs.length || 0,
      uniqueIPs: data.uniqueIPs.length || 0,
      firstVisit: data.firstVisit || new Date().toISOString(),
      lastUpdate: data.lastUpdate || new Date().toISOString(),
      pageViews: pageViews,
      deviceViews: deviceViews,
      browserViews: browserViews,
      referrerViews: referrerViews,
      visitors: data.visitors || [],
      recentViews: Array.isArray(data.pageViews) ? data.pageViews.slice(-50).reverse() : [],
      quizResults: quizResults,
      quizStats: {
        totalQuizzes: totalQuizzes,
        averageScore: averageScore,
        quizAverages: quizAverages,
        quizCounts: quizCounts,
        scoreDistribution: scoreDistribution
      }
    };
  }

  // Export data as JSON
  function exportData() {
    const data = getTrackingData();
    const stats = getStatistics();
    return {
      trackingData: data,
      statistics: stats,
      exportedAt: new Date().toISOString()
    };
  }

  // Clear all tracking data
  function clearData() {
    try {
      localStorage.removeItem(CONFIG.STORAGE_KEY);
      sessionStorage.removeItem(CONFIG.SESSION_KEY);
      return true;
    } catch (e) {
      console.error('Error clearing tracking data:', e);
      return false;
    }
  }

  // Initialize tracking
  function init() {
    if (CONFIG.TRACK_PAGES) {
      // Track current page view
      trackPageView(window.location.pathname);
      
      // Track page visibility changes
      document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
          // Track return visit
          trackPageView(window.location.pathname + '?return=true');
        }
      });
    }
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export public API
  window.VisitorTracking = {
    track: trackPageView,
    trackQuiz: trackQuizResult,
    getStats: getStatistics,
    exportData: exportData,
    clearData: clearData,
    config: CONFIG
  };

})();

(function(){
  // Minimal, reliable visitor tracking for heterogeneous environments.
  // 1) Try to obtain visitor public IP via ipify.
  // 2) Send payload to /api/visit on your server (expected to persist).
  // 3) Fallback: send reduced payload (without ip) if ip fetch fails.

  const VISIT_ENDPOINT = '/api/visit'; // server-side endpoint that stores visits
  const IP_SERVICE = 'https://api.ipify.org?format=json';
  const TIMEOUT = 4000; // ms

  function timeoutFetch(url, opts = {}, t = TIMEOUT){
    return Promise.race([
      fetch(url, opts),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), t))
    ]);
  }

  function buildPayload(ip){
    return {
      ip: ip || null,
      userAgent: navigator.userAgent || null,
      page: location.pathname + location.search,
      referrer: document.referrer || null,
      ts: new Date().toISOString()
    };
  }

  function sendVisit(payload){
    // Use keepalive to improve chance of delivery on page unload
    try{
      fetch(VISIT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(err => {
        // optional: fallback to logging to console or another endpoint
        console.warn('Visit post failed', err);
      });
    }catch(e){
      console.warn('Visit send error', e);
    }
  }

  // Main
  (function track(){
    // First, attempt to get public IP (ipify). If blocked, still send payload without ip.
    timeoutFetch(IP_SERVICE, { method: 'GET', mode: 'cors' }, TIMEOUT)
      .then(r => r.ok ? r.json() : Promise.reject(new Error('ip service response not ok')))
      .then(data => {
        const payload = buildPayload(data.ip);
        sendVisit(payload);
      })
      .catch(() => {
        // ipify failed — still send payload without ip
        const payload = buildPayload(null);
        sendVisit(payload);
      });
  })();

})();
