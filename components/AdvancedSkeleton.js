import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Skeleton } from 'primereact/skeleton';

/**
 * AdvancedSkeleton - A sophisticated skeleton loader with force rendering, animations, templates, and advanced customization
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.loading - Whether to show skeleton or content
 * @param {ReactNode} props.children - Content to show when not loading
 * @param {boolean} props.forceRender - Force skeleton to render even when not loading (for testing/demo)
 * @param {number} props.forceRenderInterval - Interval in milliseconds for force render updates
 * @param {number} props.forceRenderDuration - Duration in milliseconds for force rendering (0 = infinite)
 * @param {boolean} props.autoStopForceRender - Automatically stop force rendering after duration
 * @param {string} props.shape - Skeleton shape ('rectangle', 'circle', 'square')
 * @param {string} props.size - Predefined size ('small', 'normal', 'large', 'custom')
 * @param {string} props.width - Custom width
 * @param {string} props.height - Custom height
 * @param {string} props.borderRadius - Border radius
 * @param {string} props.animation - Animation type ('wave', 'pulse', 'shimmer', 'none')
 * @param {string} props.animationSpeed - Animation speed ('slow', 'normal', 'fast')
 * @param {number} props.lines - Number of skeleton lines
 * @param {string} props.spacing - Spacing between lines
 * @param {string} props.template - Predefined template ('text', 'card', 'list', 'avatar')
 * @param {string} props.backgroundColor - Skeleton background color
 * @param {string} props.highlightColor - Animation highlight color
 * @param {boolean} props.responsive - Auto-detect dimensions from content
 * @param {boolean} props.fadeIn - Fade in content when loading completes
 * @param {boolean} props.randomize - Randomize skeleton dimensions
 * @param {boolean} props.throttleUpdates - Throttle updates for performance
 * @param {number} props.updateInterval - Update interval when throttling
 * @param {function} props.onForceRenderStart - Called when force rendering starts
 * @param {function} props.onForceRenderStop - Called when force rendering stops
 * @param {function} props.onLoadingComplete - Called when loading completes
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
  // State for force rendering
  const [isForceRendering, setIsForceRendering] = useState(false);
  const [forceRenderKey, setForceRenderKey] = useState(0);
  const [contentVisible, setContentVisible] = useState(!loading && !forceRender);
  const [previousLoading, setPreviousLoading] = useState(loading);
  
  // Refs
  const forceRenderTimerRef = useRef(null);
  const forceRenderIntervalRef = useRef(null);
  const forceRenderStartTimeRef = useRef(null);
  const contentRef = useRef(null);
  const throttleTimerRef = useRef(null);
  
  // Determine if we should show skeleton
  const shouldShowSkeleton = loading || forceRender || isForceRendering;
  
  // Size mappings
  const sizeMap = {
    small: { width: '80px', height: '20px' },
    normal: { width: '120px', height: '24px' },
    large: { width: '200px', height: '32px' },
    custom: { width: width || '100%', height: height || '24px' }
  };
  
  // Animation speed mappings
  const animationSpeedMap = {
    slow: '2s',
    normal: '1.5s',
    fast: '1s'
  };
  
  // Get skeleton dimensions
  const skeletonDimensions = useMemo(() => {
    const baseDimensions = sizeMap[size] || sizeMap.normal;
    
    if (randomize && shouldShowSkeleton) {
      const randomWidth = `${Math.floor(Math.random() * 50) + 80}%`;
      const randomHeight = baseDimensions.height;
      return { width: randomWidth, height: randomHeight };
    }
    
    return {
      width: width || baseDimensions.width,
      height: height || baseDimensions.height
    };
  }, [size, width, height, randomize, shouldShowSkeleton, forceRenderKey]);
  
  // Responsive dimensions detection
  useEffect(() => {
    if (responsive && contentRef.current && !shouldShowSkeleton) {
      const rect = contentRef.current.getBoundingClientRect();
      if (rect.width && rect.height) {
        // Store dimensions for next skeleton render
        contentRef.current.dataset.detectedWidth = `${rect.width}px`;
        contentRef.current.dataset.detectedHeight = `${rect.height}px`;
      }
    }
  }, [responsive, shouldShowSkeleton, children]);
  
  // Force rendering logic
  useEffect(() => {
    if (forceRender && !isForceRendering) {
      setIsForceRendering(true);
      forceRenderStartTimeRef.current = Date.now();
      onForceRenderStart();
      
      // Set up interval for updates
      if (forceRenderInterval > 0) {
        forceRenderIntervalRef.current = setInterval(() => {
          setForceRenderKey(prev => prev + 1);
        }, forceRenderInterval);
      }
      
      // Set up auto-stop timer
      if (autoStopForceRender && forceRenderDuration > 0) {
        forceRenderTimerRef.current = setTimeout(() => {
          setIsForceRendering(false);
          if (forceRenderIntervalRef.current) {
            clearInterval(forceRenderIntervalRef.current);
            forceRenderIntervalRef.current = null;
          }
          onForceRenderStop();
        }, forceRenderDuration);
      }
    } else if (!forceRender && isForceRendering) {
      setIsForceRendering(false);
      if (forceRenderTimerRef.current) {
        clearTimeout(forceRenderTimerRef.current);
        forceRenderTimerRef.current = null;
      }
      if (forceRenderIntervalRef.current) {
        clearInterval(forceRenderIntervalRef.current);
        forceRenderIntervalRef.current = null;
      }
      onForceRenderStop();
    }
    
    return () => {
      if (forceRenderTimerRef.current) {
        clearTimeout(forceRenderTimerRef.current);
      }
      if (forceRenderIntervalRef.current) {
        clearInterval(forceRenderIntervalRef.current);
      }
    };
  }, [forceRender, forceRenderDuration, forceRenderInterval, autoStopForceRender, isForceRendering]);
  
  // Loading state change detection
  useEffect(() => {
    if (previousLoading && !loading) {
      onLoadingComplete();
    }
    setPreviousLoading(loading);
  }, [loading, previousLoading, onLoadingComplete]);
  
  // Content visibility with fade in
  useEffect(() => {
    if (!shouldShowSkeleton) {
      if (fadeIn) {
        const timer = setTimeout(() => setContentVisible(true), 50);
        return () => clearTimeout(timer);
      } else {
        setContentVisible(true);
      }
    } else {
      setContentVisible(false);
    }
  }, [shouldShowSkeleton, fadeIn]);
  
  // Throttled updates
  useEffect(() => {
    if (throttleUpdates && shouldShowSkeleton) {
      throttleTimerRef.current = setInterval(() => {
        setForceRenderKey(prev => prev + 1);
      }, updateInterval);
      
      return () => {
        if (throttleTimerRef.current) {
          clearInterval(throttleTimerRef.current);
        }
      };
    }
  }, [throttleUpdates, updateInterval, shouldShowSkeleton]);
  
  // Generate skeleton styles
  const skeletonStyle = {
    backgroundColor,
    borderRadius: shape === 'circle' ? '50%' : borderRadius,
    animationDuration: animationSpeedMap[animationSpeed],
    ...style
  };
  
  // Template configurations
  const templates = {
    text: () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing }}>
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton
            key={`${i}-${forceRenderKey}`}
            width={i === lines - 1 && randomize ? '70%' : skeletonDimensions.width}
            height={skeletonDimensions.height}
            animation={animation}
            style={skeletonStyle}
            className={className}
            {...otherProps}
          />
        ))}
      </div>
    ),
    
    card: () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing }}>
        <Skeleton
          key={`header-${forceRenderKey}`}
          width="100%"
          height="200px"
          animation={animation}
          style={skeletonStyle}
          className={className}
          {...otherProps}
        />
        <Skeleton
          key={`title-${forceRenderKey}`}
          width="60%"
          height="24px"
          animation={animation}
          style={skeletonStyle}
          className={className}
          {...otherProps}
        />
        <Skeleton
          key={`subtitle-${forceRenderKey}`}
          width="40%"
          height="16px"
          animation={animation}
          style={skeletonStyle}
          className={className}
          {...otherProps}
        />
        <Skeleton
          key={`content-${forceRenderKey}`}
          width="100%"
          height="60px"
          animation={animation}
          style={skeletonStyle}
          className={className}
          {...otherProps}
        />
      </div>
    ),
    
    list: () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing }}>
        {Array.from({ length: lines }, (_, i) => (
          <div key={`list-item-${i}-${forceRenderKey}`} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Skeleton
              width="40px"
              height="40px"
              shape="circle"
              animation={animation}
              style={skeletonStyle}
              className={className}
              {...otherProps}
            />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Skeleton
                width={randomize ? `${Math.floor(Math.random() * 40) + 60}%` : '80%'}
                height="16px"
                animation={animation}
                style={skeletonStyle}
                className={className}
                {...otherProps}
              />
              <Skeleton
                width={randomize ? `${Math.floor(Math.random() * 30) + 40}%` : '60%'}
                height="12px"
                animation={animation}
                style={skeletonStyle}
                className={className}
                {...otherProps}
              />
            </div>
          </div>
        ))}
      </div>
    ),
    
    avatar: () => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Skeleton
          key={`avatar-${forceRenderKey}`}
          width="60px"
          height="60px"
          shape="circle"
          animation={animation}
          style={skeletonStyle}
          className={className}
          {...otherProps}
        />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Skeleton
            width="120px"
            height="20px"
            animation={animation}
            style={skeletonStyle}
            className={className}
            {...otherProps}
          />
          <Skeleton
            width="80px"
            height="16px"
            animation={animation}
            style={skeletonStyle}
            className={className}
            {...otherProps}
          />
        </div>
      </div>
    )
  };
  
  // Render skeleton
  const renderSkeleton = () => {
    if (template && templates[template]) {
      return templates[template]();
    }
    
    if (lines > 1) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing }}>
          {Array.from({ length: lines }, (_, i) => (
            <Skeleton
              key={`${i}-${forceRenderKey}`}
              width={i === lines - 1 && randomize ? '70%' : skeletonDimensions.width}
              height={skeletonDimensions.height}
              shape={shape}
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
        key={forceRenderKey}
        width={skeletonDimensions.width}
        height={skeletonDimensions.height}
        shape={shape}
        animation={animation}
        style={skeletonStyle}
        className={className}
        {...otherProps}
      />
    );
  };
  
  // Render content
  if (shouldShowSkeleton) {
    return renderSkeleton();
  }
  
  return (
    <div
      ref={contentRef}
      style={{
        opacity: contentVisible ? 1 : 0,
        transition: fadeIn ? 'opacity 0.3s ease-in-out' : 'none'
      }}
    >
      {children}
    </div>
  );
};

export default AdvancedSkeleton;
