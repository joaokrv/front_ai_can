import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  variant?: 'text' | 'circle' | 'title' | 'custom';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = ''
}) => {
  const skeletonClasses = [
    styles.skeleton,
    variant !== 'custom' ? styles[variant] : '',
    className
  ].filter(Boolean).join(' ');

  const customStyle: React.CSSProperties = {
    width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined
  };

  return (
    <div
      className={skeletonClasses}
      style={customStyle}
      aria-hidden="true"
    />
  );
};
