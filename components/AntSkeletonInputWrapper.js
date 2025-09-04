import React from 'react';
import { Skeleton } from 'antd';

/**
 * Ant Design Skeleton Input Wrapper Component
 * 
 * This wrapper ensures the Skeleton.Input component works properly in Plasmic Studio
 * and provides all the necessary props for configuration.
 */
const AntSkeletonInputWrapper = ({
  active = true,
  size = "default",
  className = "",
  style = {},
  ...props
}) => {
  return (
    <Skeleton.Input
      active={active}
      size={size}
      className={className}
      style={style}
      {...props}
    />
  );
};

export default AntSkeletonInputWrapper;
