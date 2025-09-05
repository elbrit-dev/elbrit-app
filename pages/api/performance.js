import { 
  getPerformanceMetrics, 
  resetPerformanceMetrics, 
  getMemoryUsage, 
  getOptimizationSuggestions 
} from '../../utils/performanceUtils';

export default async function handler(req, res) {
  // PERFORMANCE: Set response headers
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action } = req.query;
    
    if (action === 'reset') {
      resetPerformanceMetrics();
      return res.status(200).json({ 
        success: true, 
        message: 'Performance metrics reset successfully' 
      });
    }
    
    if (action === 'memory') {
      const memoryUsage = getMemoryUsage();
      return res.status(200).json({
        success: true,
        memory: memoryUsage,
        timestamp: new Date().toISOString()
      });
    }
    
    if (action === 'suggestions') {
      const suggestions = getOptimizationSuggestions();
      return res.status(200).json({
        success: true,
        suggestions,
        timestamp: new Date().toISOString()
      });
    }
    
    // Default: return all performance metrics
    const metrics = getPerformanceMetrics();
    const memoryUsage = getMemoryUsage();
    const suggestions = getOptimizationSuggestions();
    
    return res.status(200).json({
      success: true,
      metrics,
      memory: memoryUsage,
      suggestions,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Performance API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to get performance metrics', 
      details: error.message 
    });
  }
}
