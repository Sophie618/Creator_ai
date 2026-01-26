import React from 'react';

type Props = {
  src: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

export default function OptimizedImg({ src, alt = '', className, width, height, priority = false }: Props) {
  const loading = priority ? 'eager' : 'lazy';
  const fetchpriority = priority ? 'high' : 'low';
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading as any}
      decoding="async"
      width={width}
      height={height}
      fetchpriority={fetchpriority as any}
    />
  );
}
