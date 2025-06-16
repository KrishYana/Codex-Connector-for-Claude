import React, { useMemo } from 'react';
import { SkeletonCard } from './SkeletonCard';
import { SkeletonRow } from './SkeletonRow';
import { SkeletonAccordion } from './SkeletonAccordion';
import { SkeletonList } from './SkeletonList';
import { SkeletonStats } from './SkeletonStats';
import { SkeletonTable } from './SkeletonTable';
import { SkeletonForm } from './SkeletonForm';

interface AutoSkeletonProps {
  type?: 'auto' | 'card' | 'row' | 'accordion' | 'list' | 'stats' | 'table' | 'form';
  count?: number;
  className?: string;
  // Card-specific props
  showImage?: boolean;
  showProgress?: boolean;
  // Row/Table-specific props
  columns?: number;
  showActions?: boolean;
  showHeader?: boolean;
  // List-specific props
  variant?: 'simple' | 'detailed' | 'media';
  // Form-specific props
  showTextarea?: boolean;
  showButtons?: boolean;
  // General props
  showAvatar?: boolean;
  showMetadata?: boolean;
  showStatus?: boolean;
  showIcons?: boolean;
}

export const AutoSkeleton: React.FC<AutoSkeletonProps> = ({
  type = 'auto',
  count = 3,
  className = '',
  ...props
}) => {
  // Auto-detect skeleton type based on parent component context
  const detectedType = useMemo(() => {
    if (type !== 'auto') return type;

    // Check parent element classes and context
    const parentElement = document.querySelector('[data-skeleton-context]');
    if (parentElement) {
      const context = parentElement.getAttribute('data-skeleton-context');
      switch (context) {
        case 'grid':
        case 'cards':
          return 'card';
        case 'table':
          return 'table';
        case 'list':
          return 'list';
        case 'stats':
          return 'stats';
        case 'form':
          return 'form';
        case 'accordion':
          return 'accordion';
        default:
          return 'row';
      }
    }

    // Fallback detection based on common patterns
    const gridParent = document.querySelector('.grid');
    const tableParent = document.querySelector('table, .table');
    const formParent = document.querySelector('form');
    
    if (gridParent) return 'card';
    if (tableParent) return 'table';
    if (formParent) return 'form';
    
    return 'row';
  }, [type]);

  const renderSkeleton = () => {
    const commonProps = { className, ...props };

    switch (detectedType) {
      case 'card':
        return Array.from({ length: count }).map((_, index) => (
          <SkeletonCard key={index} {...commonProps} />
        ));
      
      case 'row':
        return Array.from({ length: count }).map((_, index) => (
          <SkeletonRow key={index} {...commonProps} />
        ));
      
      case 'accordion':
        return <SkeletonAccordion items={count} {...commonProps} />;
      
      case 'list':
        return <SkeletonList items={count} {...commonProps} />;
      
      case 'stats':
        return <SkeletonStats columns={count} {...commonProps} />;
      
      case 'table':
        return <SkeletonTable rows={count} {...commonProps} />;
      
      case 'form':
        return <SkeletonForm fields={count} {...commonProps} />;
      
      default:
        return Array.from({ length: count }).map((_, index) => (
          <SkeletonRow key={index} {...commonProps} />
        ));
    }
  };

  return <>{renderSkeleton()}</>;
};