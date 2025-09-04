import React from 'react';
import { Skeleton } from 'antd';

/**
 * Ant Design Skeleton Button Wrapper Component
 * 
 * This wrapper ensures the Skeleton.Button component works properly in Plasmic Studio
 * and provides all the necessary props for configuration.
 */
const AntSkeletonButtonWrapper = ({
  active = true,
  size = "default",
  block = false,
  className = "",
  style = {},
  ...props
}) => {
  return (
    <Skeleton.Button
      active={active}
      size={size}
      block={block}
      className={className}
      style={style}
      {...props}
    />
  );
};

export default AntSkeletonButtonWrapper;
