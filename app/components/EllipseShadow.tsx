'use client';
import React from 'react';

interface EllipseShadowProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  opacity?: number;
  color?: string;
  rotation?: number;
}

export default function EllipseShadow({ 
  className = '', 
  size = 'md',
  opacity = 0.6,
  color = '#60351B',
  rotation
}: EllipseShadowProps) {
  const stableId = React.useId();
  const stableRotation = React.useMemo(() => {
    if (typeof rotation === 'number') {
      return rotation;
    }

    let hash = 0;
    for (let i = 0; i < stableId.length; i += 1) {
      hash = (hash * 31 + stableId.charCodeAt(i)) % 360;
    }
    return hash;
  }, [rotation, stableId]);
  
  // Size configurations (width x height)
  const sizes = {
    sm: { width: '200px', height: '150px' },
    md: { width: '350px', height: '280px' },
    lg: { width: '500px', height: '400px' },
    xl: { width: '650px', height: '520px' },
  };

  const selectedSize = sizes[size];

  return (
    <div
      className={`pointer-events-none absolute ${className}`}
      style={{
        width: selectedSize.width,
        height: selectedSize.height,
        background: `radial-gradient(ellipse at center, ${color}20 0%, ${color}10 40%, transparent 70%)`,
        borderRadius: '50%',
        filter: 'blur(60px)',
        opacity,
        transform: `rotate(${stableRotation}deg)`,
      }}
      aria-hidden="true"
    />
  );
}
