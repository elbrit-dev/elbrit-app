import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

/**
 * PlasmicSkeleton - A flexible skeleton loading component for Plasmic
 * 
 * This component wraps react-loading-skeleton and provides a comprehensive
 * set of props that can be configured in Plasmic Studio for various
 * loading states and skeleton patterns.
 */
const PlasmicSkeleton = ({
  // Basic skeleton props
  count = 1,
  width = '100%',
  height = '1rem',
  circle = false,
  borderRadius = '0.25rem',
  
  // Animation props
  duration = 1.5,
  direction = 'ltr',
  enableAnimation = true,
  
  // Theme props
  baseColor = '#ebebeb',
  highlightColor = '#f5f5f5',
  customHighlightBackground,
  
  // Layout props
  inline = false,
  className = '',
  containerClassName = '',
  containerTestId = '',
  
  // Style props
  style = {},
  
  // Preset patterns
  pattern = 'default', // 'default', 'text', 'card', 'avatar', 'table', 'list'
  
  // Custom wrapper
  wrapper,
  
  // Additional props for different patterns
  textLines = 3,
  cardHeight = '200px',
  avatarSize = '40px',
  tableRows = 5,
  tableColumns = 4,
  listItems = 4,
  
  // Children for custom content
  children,
  
  ...props
}) => {
  // Handle different preset patterns
  const renderPattern = () => {
    switch (pattern) {
      case 'text':
        return (
          <Skeleton
            count={textLines}
            height={height}
            width={width}
            borderRadius={borderRadius}
            baseColor={baseColor}
            highlightColor={highlightColor}
            duration={duration}
            direction={direction}
            enableAnimation={enableAnimation}
            inline={inline}
            className={className}
            containerClassName={containerClassName}
            containerTestId={containerTestId}
            style={style}
            wrapper={wrapper}
            customHighlightBackground={customHighlightBackground}
            {...props}
          />
        );
        
      case 'card':
        return (
          <div style={{ width: '100%', maxWidth: '300px' }}>
            <Skeleton
              height={avatarSize}
              width={avatarSize}
              circle={true}
              baseColor={baseColor}
              highlightColor={highlightColor}
              duration={duration}
              direction={direction}
              enableAnimation={enableAnimation}
              className={className}
              containerClassName={containerClassName}
              style={{ marginBottom: '1rem', ...style }}
              {...props}
            />
            <Skeleton
              count={2}
              height="1rem"
              width="80%"
              borderRadius={borderRadius}
              baseColor={baseColor}
              highlightColor={highlightColor}
              duration={duration}
              direction={direction}
              enableAnimation={enableAnimation}
              className={className}
              containerClassName={containerClassName}
              style={{ marginBottom: '0.5rem', ...style }}
              {...props}
            />
            <Skeleton
              count={3}
              height="0.8rem"
              width="100%"
              borderRadius={borderRadius}
              baseColor={baseColor}
              highlightColor={highlightColor}
              duration={duration}
              direction={direction}
              enableAnimation={enableAnimation}
              className={className}
              containerClassName={containerClassName}
              style={style}
              {...props}
            />
          </div>
        );
        
      case 'avatar':
        return (
          <Skeleton
            height={avatarSize}
            width={avatarSize}
            circle={true}
            baseColor={baseColor}
            highlightColor={highlightColor}
            duration={duration}
            direction={direction}
            enableAnimation={enableAnimation}
            className={className}
            containerClassName={containerClassName}
            containerTestId={containerTestId}
            style={style}
            wrapper={wrapper}
            customHighlightBackground={customHighlightBackground}
            {...props}
          />
        );
        
      case 'table':
        return (
          <div style={{ width: '100%' }}>
            {/* Table header */}
            <div style={{ display: 'flex', marginBottom: '0.5rem' }}>
              {Array.from({ length: tableColumns }).map((_, index) => (
                <Skeleton
                  key={`header-${index}`}
                  height="2rem"
                  width={`${100 / tableColumns}%`}
                  borderRadius={borderRadius}
                  baseColor={baseColor}
                  highlightColor={highlightColor}
                  duration={duration}
                  direction={direction}
                  enableAnimation={enableAnimation}
                  className={className}
                  containerClassName={containerClassName}
                  style={{ 
                    marginRight: index < tableColumns - 1 ? '0.5rem' : 0,
                    ...style 
                  }}
                  {...props}
                />
              ))}
            </div>
            {/* Table rows */}
            {Array.from({ length: tableRows }).map((_, rowIndex) => (
              <div key={`row-${rowIndex}`} style={{ display: 'flex', marginBottom: '0.25rem' }}>
                {Array.from({ length: tableColumns }).map((_, colIndex) => (
                  <Skeleton
                    key={`cell-${rowIndex}-${colIndex}`}
                    height="1.5rem"
                    width={`${100 / tableColumns}%`}
                    borderRadius={borderRadius}
                    baseColor={baseColor}
                    highlightColor={highlightColor}
                    duration={duration}
                    direction={direction}
                    enableAnimation={enableAnimation}
                    className={className}
                    containerClassName={containerClassName}
                    style={{ 
                      marginRight: colIndex < tableColumns - 1 ? '0.5rem' : 0,
                      ...style 
                    }}
                    {...props}
                  />
                ))}
              </div>
            ))}
          </div>
        );
        
      case 'list':
        return (
          <div style={{ width: '100%' }}>
            {Array.from({ length: listItems }).map((_, index) => (
              <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <Skeleton
                  height={avatarSize}
                  width={avatarSize}
                  circle={true}
                  baseColor={baseColor}
                  highlightColor={highlightColor}
                  duration={duration}
                  direction={direction}
                  enableAnimation={enableAnimation}
                  className={className}
                  containerClassName={containerClassName}
                  style={{ marginRight: '1rem', ...style }}
                  {...props}
                />
                <div style={{ flex: 1 }}>
                  <Skeleton
                    height="1rem"
                    width="70%"
                    borderRadius={borderRadius}
                    baseColor={baseColor}
                    highlightColor={highlightColor}
                    duration={duration}
                    direction={direction}
                    enableAnimation={enableAnimation}
                    className={className}
                    containerClassName={containerClassName}
                    style={{ marginBottom: '0.5rem', ...style }}
                    {...props}
                  />
                  <Skeleton
                    height="0.8rem"
                    width="50%"
                    borderRadius={borderRadius}
                    baseColor={baseColor}
                    highlightColor={highlightColor}
                    duration={duration}
                    direction={direction}
                    enableAnimation={enableAnimation}
                    className={className}
                    containerClassName={containerClassName}
                    style={style}
                    {...props}
                  />
                </div>
              </div>
            ))}
          </div>
        );
        
      default:
        return (
          <Skeleton
            count={count}
            height={height}
            width={width}
            circle={circle}
            borderRadius={borderRadius}
            baseColor={baseColor}
            highlightColor={highlightColor}
            duration={duration}
            direction={direction}
            enableAnimation={enableAnimation}
            inline={inline}
            className={className}
            containerClassName={containerClassName}
            containerTestId={containerTestId}
            style={style}
            wrapper={wrapper}
            customHighlightBackground={customHighlightBackground}
            {...props}
          />
        );
    }
  };

  // If children are provided, render them instead of skeleton
  if (children) {
    return <>{children}</>;
  }

  // Wrap in SkeletonTheme for consistent theming
  return (
    <SkeletonTheme
      baseColor={baseColor}
      highlightColor={highlightColor}
      borderRadius={borderRadius}
      duration={duration}
      direction={direction}
      enableAnimation={enableAnimation}
    >
      {renderPattern()}
    </SkeletonTheme>
  );
};

export default PlasmicSkeleton;
