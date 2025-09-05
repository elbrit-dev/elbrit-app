// PERFORMANCE: Performance monitoring and optimization utilities

// Performance metrics collection
const performanceMetrics = {
  apiCalls: new Map(),
  cacheHits: 0,
  cacheMisses: 0,
  totalRequests: 0,
  averageResponseTime: 0,
  slowRequests: []
};

// Track API call performance
export const trackApiCall = (endpoint, startTime, success = true, responseSize = 0) => {
  const duration = Date.now() - startTime;
  const key = `${endpoint}_${success ? 'success' : 'error'}`;
  
  if (!performanceMetrics.apiCalls.has(key)) {
    performanceMetrics.apiCalls.set(key, {
      count: 0,
      totalTime: 0,
      averageTime: 0,
      minTime: Infinity,
      maxTime: 0,
      totalSize: 0,
      averageSize: 0
    });
  }
  
  const metrics = performanceMetrics.apiCalls.get(key);
  metrics.count++;
  metrics.totalTime += duration;
  metrics.averageTime = metrics.totalTime / metrics.count;
  metrics.minTime = Math.min(metrics.minTime, duration);
  metrics.maxTime = Math.max(metrics.maxTime, duration);
  metrics.totalSize += responseSize;
  metrics.averageSize = metrics.totalSize / metrics.count;
  
  // Track slow requests (>1 second)
  if (duration > 1000) {
    performanceMetrics.slowRequests.push({
      endpoint,
      duration,
      timestamp: new Date().toISOString(),
      success,
      responseSize
    });
    
    // Keep only last 50 slow requests
    if (performanceMetrics.slowRequests.length > 50) {
      performanceMetrics.slowRequests = performanceMetrics.slowRequests.slice(-50);
    }
  }
  
  performanceMetrics.totalRequests++;
  performanceMetrics.averageResponseTime = 
    (performanceMetrics.averageResponseTime * (performanceMetrics.totalRequests - 1) + duration) / 
    performanceMetrics.totalRequests;
};

// Track cache performance
export const trackCacheHit = () => {
  performanceMetrics.cacheHits++;
};

export const trackCacheMiss = () => {
  performanceMetrics.cacheMisses++;
};

// Get performance metrics
export const getPerformanceMetrics = () => {
  const cacheHitRate = performanceMetrics.cacheHits / 
    (performanceMetrics.cacheHits + performanceMetrics.cacheMisses) * 100 || 0;
  
  return {
    ...performanceMetrics,
    cacheHitRate: Math.round(cacheHitRate * 100) / 100,
    apiCalls: Object.fromEntries(performanceMetrics.apiCalls),
    slowRequests: performanceMetrics.slowRequests.slice(-10) // Last 10 slow requests
  };
};

// Reset performance metrics
export const resetPerformanceMetrics = () => {
  performanceMetrics.apiCalls.clear();
  performanceMetrics.cacheHits = 0;
  performanceMetrics.cacheMisses = 0;
  performanceMetrics.totalRequests = 0;
  performanceMetrics.averageResponseTime = 0;
  performanceMetrics.slowRequests = [];
};

// Performance monitoring middleware
export const performanceMiddleware = (handler) => {
  return async (req, res) => {
    const startTime = Date.now();
    const originalJson = res.json;
    
    // Override res.json to capture response size
    res.json = function(data) {
      const responseSize = JSON.stringify(data).length;
      trackApiCall(req.url, startTime, res.statusCode < 400, responseSize);
      return originalJson.call(this, data);
    };
    
    try {
      await handler(req, res);
    } catch (error) {
      trackApiCall(req.url, startTime, false, 0);
      throw error;
    }
  };
};

// Request deduplication
const pendingRequests = new Map();

export const deduplicateRequest = async (key, requestFn) => {
  if (pendingRequests.has(key)) {
    console.log('⚡ Deduplicating request:', key);
    return pendingRequests.get(key);
  }
  
  const promise = requestFn().finally(() => {
    pendingRequests.delete(key);
  });
  
  pendingRequests.set(key, promise);
  return promise;
};

// Connection pooling simulation
const connectionPool = new Map();

export const getConnection = (url) => {
  if (!connectionPool.has(url)) {
    connectionPool.set(url, {
      lastUsed: Date.now(),
      active: false
    });
  }
  return connectionPool.get(url);
};

export const releaseConnection = (url) => {
  const conn = connectionPool.get(url);
  if (conn) {
    conn.active = false;
    conn.lastUsed = Date.now();
  }
};

// Clean up old connections
setInterval(() => {
  const now = Date.now();
  for (const [url, conn] of connectionPool.entries()) {
    if (!conn.active && now - conn.lastUsed > 30000) { // 30 seconds
      connectionPool.delete(url);
    }
  }
}, 60000); // Clean up every minute

// Memory usage monitoring
export const getMemoryUsage = () => {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024 * 100) / 100, // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024 * 100) / 100, // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100, // MB
      external: Math.round(usage.external / 1024 / 1024 * 100) / 100, // MB
    };
  }
  return null;
};

// Performance optimization suggestions
export const getOptimizationSuggestions = () => {
  const metrics = getPerformanceMetrics();
  const suggestions = [];
  
  if (metrics.cacheHitRate < 50) {
    suggestions.push('Consider increasing cache TTL or implementing more aggressive caching');
  }
  
  if (metrics.averageResponseTime > 1000) {
    suggestions.push('Average response time is high - consider optimizing database queries or adding more caching');
  }
  
  if (metrics.slowRequests.length > 10) {
    suggestions.push('Many slow requests detected - review and optimize slow endpoints');
  }
  
  const memoryUsage = getMemoryUsage();
  if (memoryUsage && memoryUsage.heapUsed > 100) {
    suggestions.push('High memory usage detected - consider implementing memory cleanup or reducing cache size');
  }
  
  return suggestions;
};
