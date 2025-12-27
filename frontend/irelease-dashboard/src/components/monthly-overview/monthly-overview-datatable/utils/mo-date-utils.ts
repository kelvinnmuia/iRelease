export const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;

  const months: { [key: string]: number } = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };

  const parts = dateStr.split(' ');
  if (parts.length === 3) {
    const day = parseInt(parts[0]);
    const month = months[parts[1]];
    const year = parseInt(parts[2]);

    if (!isNaN(day) && month !== undefined && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }

  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
};

export const formatDate = (date: Date): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

export const getLatestDate = (item: any): Date | null => {
  const dateFields = [
    'deliveredDate', 'tdNoticeDate', 'testDeployDate',
    'testStartDate', 'testEndDate', 'prodDeployDate'
  ];

  const dates = dateFields
    .map(field => parseDate(item[field]))
    .filter(date => date !== null) as Date[];

  if (dates.length === 0) return null;
  return new Date(Math.max(...dates.map(d => d.getTime())));
};

export const getEarliestDate = (item: any): Date | null => {
  const dateFields = [
    'deliveredDate', 'tdNoticeDate', 'testDeployDate',
    'testStartDate', 'testEndDate', 'prodDeployDate'
  ];

  const dates = dateFields
    .map(field => parseDate(item[field]))
    .filter(date => date !== null) as Date[];

  if (dates.length === 0) return null;
  return new Date(Math.min(...dates.map(d => d.getTime())));
};