
import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';

interface TimestampProps {
  date: string | Date;
  format?: string;
  showRelative?: boolean;
}

export function Timestamp({ 
  date, 
  format: formatString = 'PPp', 
  showRelative = true 
}: TimestampProps) {
  const dateValue = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateValue.getTime())) {
    return <span>Invalid date</span>;
  }
  
  const formattedDate = format(dateValue, formatString);
  const relativeDate = formatDistanceToNow(dateValue, { addSuffix: true });
  
  return (
    <span title={formattedDate}>
      {showRelative ? relativeDate : formattedDate}
    </span>
  );
}
