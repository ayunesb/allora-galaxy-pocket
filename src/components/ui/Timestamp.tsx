
import React from 'react';
import { format, formatDistanceToNow, isValid } from 'date-fns';

interface TimestampProps {
  date: string | Date;
  format?: string;
  showRelative?: boolean;
}

/**
 * Timestamp component for consistently displaying dates throughout the application
 * Supports both absolute and relative time formatting
 */
export function Timestamp({ 
  date, 
  format: dateFormat = 'PPpp', 
  showRelative = true 
}: TimestampProps) {
  if (!date) return null;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (!isValid(dateObj)) {
    return <span className="text-muted-foreground">Invalid date</span>;
  }
  
  return (
    <time 
      dateTime={dateObj.toISOString()} 
      title={format(dateObj, 'PPpp')}
      className="whitespace-nowrap"
    >
      {dateFormat && format(dateObj, dateFormat)}
      {showRelative && (
        <span className="text-muted-foreground ml-1">
          ({formatDistanceToNow(dateObj, { addSuffix: true })})
        </span>
      )}
    </time>
  );
}
