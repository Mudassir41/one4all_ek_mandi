'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 12;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  responsive?: {
    sm?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 12;
    md?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 12;
    lg?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 12;
    xl?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 12;
  };
}

export function Grid({ 
  children, 
  cols = 1, 
  gap = 'md', 
  className,
  responsive 
}: GridProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    8: 'grid-cols-8',
    12: 'grid-cols-12',
  };

  const responsiveClasses = responsive ? [
    responsive.sm && `sm:grid-cols-${responsive.sm}`,
    responsive.md && `md:grid-cols-${responsive.md}`,
    responsive.lg && `lg:grid-cols-${responsive.lg}`,
    responsive.xl && `xl:grid-cols-${responsive.xl}`,
  ].filter(Boolean).join(' ') : '';

  return (
    <div
      className={cn(
        'grid',
        colClasses[cols],
        gapClasses[gap],
        responsiveClasses,
        className
      )}
    >
      {children}
    </div>
  );
}

interface GridItemProps {
  children: React.ReactNode;
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 12;
  className?: string;
}

export function GridItem({ children, span = 1, className }: GridItemProps) {
  const spanClasses = {
    1: 'col-span-1',
    2: 'col-span-2',
    3: 'col-span-3',
    4: 'col-span-4',
    5: 'col-span-5',
    6: 'col-span-6',
    8: 'col-span-8',
    12: 'col-span-12',
  };

  return (
    <div className={cn(spanClasses[span], className)}>
      {children}
    </div>
  );
}