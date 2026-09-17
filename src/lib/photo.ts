import images from '../data/images.json';
export const photo = (h: string): string | null => {
  const k = h.toLowerCase().replace(/-/g, '_');
  const v = (images as Record<string, string>)[k];
  return v && v.trim() ? v : null;
};
