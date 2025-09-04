import React from 'react';
import { Skeleton } from 'antd';

/**
 * Ant Design Skeleton Wrapper Component
 * 
 * This wrapper ensures the Skeleton component works properly in Plasmic Studio
 * and provides all the necessary props for configuration.
 */
const AntSkeletonWrapper = ({
  active = true,
  avatar = false,
  loading = true,
  paragraph = { rows: 3 },
  title = { width: "38%" },
  round = false,
  size = "default",
  className = "",
  style = {},
  children,
  ...props
}) => {
  return (
    <Skeleton
      active={active}
      avatar={avatar}
      loading={loading}
      paragraph={paragraph}
      title={title}
      round={round}
      size={size}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </Skeleton>
  );
};

export default AntSkeletonWrapper;
