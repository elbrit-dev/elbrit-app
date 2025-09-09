import React, { useState, useEffect, useRef } from 'react';
import { Skeleton } from 'primereact/skeleton';

/**
 * AdvancedSkeleton - A sophisticated skeleton loader with force rendering, animations, and templates
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.loading - Whether to show skeleton or content
 * @param {ReactNode} props.children - Content to show when not loading
 * @param {boolean} props.forceRender - Force skeleton to render even when not loading
 * @param {number} props.forceRenderInterval - Interval for force render updates
 * @param {number} props.forceRenderDuration - Duration for force rendering (0 = infinite)
 * @param {boolean} props.autoStopForceRender - Auto stop force rendering after duration
 * @param {string} props.shape - Skeleton shape (rectangle, circle, square)
 * @param {string} props.size - Predefined size (small, normal, large, custom)
 * @param {string} props.width - Custom width
 * @param {string} props.height - Custom height
 * @param {string} props.borderRadius - Border radius
 * @param {string} props.animation - Animation type (wave, pulse, shimmer, none)
 * @param {string} props.animationSpeed - Animation speed (slow, normal, fast)
 * @param {number} props.lines - Number of skeleton lines
 * @param {string} props.spacing - Spacing between lines
 * @param {string} props.template - Predefined template (text, card, list, avatar)
 * @param {string} props.backgroundColor - Background color
 * @param {string} props.highlightColor - Highlight color for animations
 * @param {boolean} props.responsive - Auto-detect dimensions from content
 * @param {boolean} props.fadeIn - Fade in content when loading completes
 * @param {boolean} props.randomize - Randomize dimensions for realistic look
 * @param {boolean} props.throttleUpdates - Throttle updates for performance
 * @param {number} props.updateInterval - Update interval when throttling
 */
const AdvancedSkeleton = ({
  loading = true,
  children = null,
  
  // Force rendering props
  forceRender = false,
  forceRenderInterval = 1000,
  forceRenderDuration = 5000,
  autoStopForceRender = true,
  
  // Skeleton appearance
  shape = 'rectangle',
  size = 'normal',
  width = null,
  height = null,
  borderRadius = '4px',
  
  // Animation props
  animation = 'wave',
  animationSpeed = 'normal',
  
  // Layout props
  lines = 1,
  spacing = '0.5rem',
  template = null,
  
  // Styling
  backgroundColor = '#f0f0f0',
  highlightColor = '#e0e0e0',
  className = '',
  style = {},
  
  // Advanced features
  responsive = false,
  fadeIn = true,
  randomize = false,
  throttleUpdates = false,
  updateInterval = 100,
  
  // Event handlers
  onForceRenderStart = () => {},
  onForceRenderStop = () => {},
  onLoadingComplete = () => {},
  
  ...otherProps
}) => {
  const [isForceRendering, setIsForceRendering] = useState(false);
  const [shouldShowSkeleton, setShouldShowSkeleton] = useState(loading);
  const [contentOpacity, setContentOpacity] = useState(loading ? 0 : 1);
  const [randomDimensions, setRandomDimensions] = useState({});
  
  const forceRenderTimeoutRef = useRef(null);
  const updateIntervalRef = useRef(null);
  const contentRef = useRef(null);
  const previousLoadingRef = useRef(loading);

  // Handle force rendering
  useEffect(() => {
    if (forceRender && !isForceRendering) {
      setIsForceRendering(true);
      setShouldShowSkeleton(true);
      onForceRenderStart();
      
      if (autoStopForceRender && forceRenderDuration > 0) {
        forceRenderTimeoutRef.current = setTimeout(() => {
          setIsForceRendering(false);
          setShouldShowSkeleton(loading);
          onForceRenderStop();
        }, forceRenderDuration);
      }
    } else if (!forceRender && isForceRendering) {
      setIsForceRendering(false);
      setShouldShowSkeleton(loading);
      onForceRenderStop();
    }

    return () => {
      if (forceRenderTimeoutRef.current) {
        clearTimeout(forceRenderTimeoutRef.current);
      }
    };
  }, [forceRender, loading, isForceRendering, autoStopForceRender, forceRenderDuration]);

  // Handle loading state changes
  useEffect(() => {
    if (throttleUpdates) {
      if (updateIntervalRef.current) {
        clearTimeout(updateIntervalRef.current);
      }
      
      updateIntervalRef.current = setTimeout(() => {
        if (!isForceRendering) {
          setShouldShowSkeleton(loading);
        }
        
        // Trigger loading complete callback
        if (previousLoadingRef.current && !loading) {
          onLoadingComplete();
        }
        previousLoadingRef.current = loading;
      }, updateInterval);
    } else {
      if (!isForceRendering) {
        setShouldShowSkeleton(loading);
      }
      
      // Trigger loading complete callback
      if (previousLoadingRef.current && !loading) {
        onLoadingComplete();
      }
      previousLoadingRef.current = loading;
    }

    return () => {
      if (updateIntervalRef.current) {
        clearTimeout(updateIntervalRef.current);
      }
    };
  }, [loading, isForceRendering, throttleUpdates, updateInterval]);

  // Handle fade in effect
  useEffect(() => {
    if (fadeIn) {
      if (shouldShowSkeleton) {
        setContentOpacity(0);
      } else {
        const timer = setTimeout(() => setContentOpacity(1), 50);
        return () => clearTimeout(timer);
      }
    } else {
      setContentOpacity(1);
    }
  }, [shouldShowSkeleton, fadeIn]);

  // Generate random dimensions for realistic look
  useEffect(() => {
    if (randomize) {
      const generateRandomDimensions = () => {
        const baseWidth = parseInt(width) || 200;
        const baseHeight = parseInt(height) || 20;
        
        return {
          width: `${baseWidth * (0.7 + Math.random() * 0.6)}px`,
          height: `${baseHeight * (0.8 + Math.random() * 0.4)}px`
        };
      };

      setRandomDimensions(generateRandomDimensions());
      
      if (isForceRendering) {
        const interval = setInterval(() => {
          setRandomDimensions(generateRandomDimensions());
        }, forceRenderInterval);
        
        return () => clearInterval(interval);
      }
    }
  }, [randomize, isForceRendering, forceRenderInterval, width, height]);

  // Size mappings
  const sizeMap = {
    small: { width: '100px', height: '16px' },
    normal: { width: '200px', height: '20px' },
    large: { width: '300px', height: '24px' },
    custom: { width: width || '100%', height: height || '20px' }
  };

  // Animation speed mappings
  const animationSpeedMap = {
    slow: '2s',
    normal: '1.5s',
    fast: '1s'
  };

  // Get skeleton dimensions
  const skeletonDimensions = randomize ? randomDimensions : sizeMap[size] || sizeMap.custom;
  const finalWidth = width || skeletonDimensions.width;
  const finalHeight = height || skeletonDimensions.height;

  // Build skeleton style
  const skeletonStyle = {
    backgroundColor,
    borderRadius: shape === 'circle' ? '50%' : borderRadius,
    width: shape === 'circle' ? finalHeight : finalWidth,
    height: finalHeight,
    animationDuration: animationSpeedMap[animationSpeed],
    ...style
  };

  // Template configurations
  const renderTemplate = () => {
    switch (template) {
      case 'text':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing }}>
            {Array.from({ length: lines }, (_, i) => (
              <Skeleton
                key={i}
                animation={animation}
                style={{
                  ...skeletonStyle,
                  width: i === lines - 1 ? `${70 + Math.random() * 30}%` : finalWidth
                }}
                className={className}
                {...otherProps}
              />
            ))}
          </div>
        );
      
      case 'card':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Skeleton
              animation={animation}
              style={{ ...skeletonStyle, width: '100%', height: '200px' }}
              className={className}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing }}>
              <Skeleton
                animation={animation}
                style={{ ...skeletonStyle, width: '60%', height: '24px' }}
                className={className}
              />
              <Skeleton
                animation={animation}
                style={{ ...skeletonStyle, width: '40%', height: '16px' }}
                className={className}
              />
              <Skeleton
                animation={animation}
                style={{ ...skeletonStyle, width: '80%', height: '16px' }}
                className={className}
              />
            </div>
          </div>
        );
      
      case 'list':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Array.from({ length: lines }, (_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Skeleton
                  animation={animation}
                  style={{ ...skeletonStyle, width: '40px', height: '40px', borderRadius: '50%' }}
                  className={className}
                />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Skeleton
                    animation={animation}
                    style={{ ...skeletonStyle, width: '70%', height: '16px' }}
                    className={className}
                  />
                  <Skeleton
                    animation={animation}
                    style={{ ...skeletonStyle, width: '50%', height: '14px' }}
                    className={className}
                  />
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'avatar':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Skeleton
              animation={animation}
              style={{ ...skeletonStyle, width: '60px', height: '60px', borderRadius: '50%' }}
              className={className}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Skeleton
                animation={animation}
                style={{ ...skeletonStyle, width: '120px', height: '18px' }}
                className={className}
              />
              <Skeleton
                animation={animation}
                style={{ ...skeletonStyle, width: '80px', height: '14px' }}
                className={className}
              />
            </div>
          </div>
        );
      
      default:
        if (lines > 1) {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing }}>
              {Array.from({ length: lines }, (_, i) => (
                <Skeleton
                  key={i}
                  animation={animation}
                  style={skeletonStyle}
                  className={className}
                  {...otherProps}
                />
              ))}
            </div>
          );
        }
        return (
          <Skeleton
            animation={animation}
            style={skeletonStyle}
            className={className}
            {...otherProps}
          />
        );
    }
  };

  if (shouldShowSkeleton) {
    return renderTemplate();
  }

  return (
    <div
      ref={contentRef}
      style={{
        opacity: contentOpacity,
        transition: fadeIn ? 'opacity 0.3s ease-in-out' : 'none'
      }}
    >
      {children}
    </div>
  );
};

export default AdvancedSkeleton;
