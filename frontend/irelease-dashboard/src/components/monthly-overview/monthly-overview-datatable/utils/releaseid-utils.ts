import { Release } from '../types/releases';

export const generateReleaseId = (data: Release[]): string => {
  const currentYear = new Date().getFullYear();
  const existingIds = data.map(item => item.releaseId);
  let counter = 1;

  while (true) {
    const newId = `REL-${currentYear}-${counter.toString().padStart(3, '0')}`;
    if (!existingIds.includes(newId)) {
      return newId;
    }
    counter++;
  }
};
