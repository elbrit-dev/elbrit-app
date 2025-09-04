import React from 'react';
import { Skeleton } from 'antd';

const UnifiedSkeleton = ({
  // Basic props
  active = true,
  loading = true,
  round = false,
  
  // Skeleton type/shape
  type = 'default', // 'default', 'button', 'input', 'image', 'avatar', 'title', 'paragraph'
  
  // Avatar specific props
  avatar = false,
  avatarSize = 'default',
  avatarShape = 'circle',
  
  // Title specific props
  title = false,
  titleWidth = '38%',
  
  // Paragraph specific props
  paragraph = false,
  paragraphRows = 3,
  
  // Button specific props
  buttonSize = 'default',
  block = false,
  
  // Input specific props
  inputSize = 'default',
  
  // Image specific props
  imageWidth = 200,
  imageHeight = 200,
  
  // Styling
  className = '',
  style = {},
  size = 'default',
  
  // Children for custom content
  children,
  
  ...props
}) => {
  // Don't render skeleton if loading is false
  if (!loading) {
    return children || null;
  }

  // Handle different skeleton types
  const renderSkeleton = () => {
    switch (type) {
      case 'button':
        return (
          <Skeleton.Button
            active={active}
            size={buttonSize}
            block={block}
            className={className}
            style={style}
            {...props}
          />
        );
        
      case 'input':
        return (
          <Skeleton.Input
            active={active}
            size={inputSize}
            className={className}
            style={style}
            {...props}
          />
        );
        
      case 'image':
        return (
          <Skeleton.Image
            active={active}
            className={className}
            style={{
              width: imageWidth,
              height: imageHeight,
              ...style
            }}
            {...props}
          />
        );
        
      case 'avatar':
        return (
          <Skeleton.Avatar
            active={active}
            size={avatarSize}
            shape={avatarShape}
            className={className}
            style={style}
            {...props}
          />
        );
        
      case 'title':
        return (
          <Skeleton
            active={active}
            title={{ width: titleWidth }}
            paragraph={false}
            round={round}
            className={className}
            style={style}
            {...props}
          />
        );
        
      case 'paragraph':
        return (
          <Skeleton
            active={active}
            title={false}
            paragraph={{ rows: paragraphRows }}
            round={round}
            className={className}
            style={style}
            {...props}
          />
        );
        
      case 'card':
        return (
          <Skeleton
            active={active}
            avatar={avatar}
            title={title ? { width: titleWidth } : false}
            paragraph={{ rows: paragraphRows }}
            round={round}
            className={className}
            style={style}
            {...props}
          />
        );
        
      case 'list':
        return (
          <Skeleton
            active={active}
            avatar={avatar}
            title={false}
            paragraph={{ rows: 1 }}
            round={round}
            className={className}
            style={style}
            {...props}
          />
        );
        
      case 'table':
        return (
          <Skeleton
            active={active}
            title={false}
            paragraph={{ rows: 4 }}
            round={round}
            className={className}
            style={style}
            {...props}
          />
        );
        
      default: // 'default'
        return (
          <Skeleton
            active={active}
            avatar={avatar}
            title={title ? { width: titleWidth } : false}
            paragraph={paragraph ? { rows: paragraphRows } : false}
            round={round}
            className={className}
            style={style}
            {...props}
          />
        );
    }
  };

  return (
    <div className={`unified-skeleton ${className}`} style={style}>
      {renderSkeleton()}
    </div>
  );
};

export default UnifiedSkeleton;
