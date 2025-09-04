import React from 'react';
import { Skeleton } from 'antd';

/**
 * Ant Design Skeleton Image Wrapper Component
 * 
 * This wrapper ensures the Skeleton.Image component works properly in Plasmic Studio
 * and provides all the necessary props for configuration.
 */
const AntSkeletonImageWrapper = ({
  active = true,
  className = "",
  style = {},
  ...props
}) => {
  return (
    <Skeleton.Image
      active={active}
      className={className}
      style={style}
      {...props}
    />
  );
};

export default AntSkeletonImageWrapper;
