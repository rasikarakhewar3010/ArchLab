/**
 * BrandLogo — Modern Vector ArchLab Brand Component
 * ===================================================
 * Built with Hugeicons vector iconography (CpuIcon / Layers)
 * inside a futuristic glowing badge. Replaces raster logo images.
 */

import React from 'react';
import { CpuIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import './BrandLogo.css';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  onClick,
}) => {
  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 26,
    xl: 34,
  };

  return (
    <div
      className={`brand-logo brand-logo-${size} ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="brand-logo-badge">
        <HugeiconsIcon
          icon={CpuIcon}
          size={iconSizes[size]}
          strokeWidth={2}
          className="brand-logo-icon"
        />
        <div className="brand-logo-glow" />
      </div>
      {showText && <span className="brand-logo-text">ArchLab</span>}
    </div>
  );
};

export default BrandLogo;
