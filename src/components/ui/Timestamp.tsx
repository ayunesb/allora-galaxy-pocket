
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TimestampProps {
  date: string | Date;
  format?: 'relative' | 'absolute' | 'both';
  className?: string;
}

export function Timestamp({ date, format = 'relative', className = '' }: TimestampProps) {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  // Ensure valid date
  if (!parsedDate || isNaN(parsedDate.getTime())) {
    return <span className={className}>Invalid date</span>;
  }

  // Format the date as an absolute timestamp
  const formatAbsolute = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    }).format(date);
  };

  // Format the date as a relative timestamp
  const formatRelative = (date: Date, now: Date) => {
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds === 1 ? '' : 's'} ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
    }
    
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
  };

  if (format === 'absolute') {
    return <span className={className}>{formatAbsolute(parsedDate)}</span>;
  }

  if (format === 'relative') {
    return <span className={className}>{formatRelative(parsedDate, now)}</span>;
  }

  // Both formats with tooltip
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className={className}>
          <span>{formatRelative(parsedDate, now)}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{formatAbsolute(parsedDate)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
