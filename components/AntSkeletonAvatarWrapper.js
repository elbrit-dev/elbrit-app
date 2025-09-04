import React from 'react';
import { Skeleton } from 'antd';

/**
 * Ant Design Skeleton Avatar Wrapper Component
 * 
 * This wrapper ensures the Skeleton.Avatar component works properly in Plasmic Studio
 * and provides all the necessary props for configuration.
 */
const AntSkeletonAvatarWrapper = ({
  active = true,
  size = "default",
  shape = "circle",
  className = "",
  style = {},
  ...props
}) => {
  return (
    <Skeleton.Avatar
      active={active}
      size={size}
      shape={shape}
      className={className}
      style={style}
      {...props}
    />
  );
};

export default AntSkeletonAvatarWrapper;
