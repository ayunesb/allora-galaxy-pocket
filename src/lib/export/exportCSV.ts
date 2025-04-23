
/**
 * Exports data to CSV file
 * @param data Array of objects to export
 * @param filename Filename without extension
 */
export function exportToCSV(data: any[], filename: string): void {
  if (!data || !data.length) {
    console.warn('No data to export');
    return;
  }
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const cell = row[header] === null || row[header] === undefined ? '' : row[header];
        // Handle special characters in CSV
        const value = typeof cell === 'string' ? cell.replace(/"/g, '""') : cell;
        return `"${value}"`;
      }).join(',')
    )
  ];
  
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
