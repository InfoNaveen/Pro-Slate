import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + '...' : str;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const SURFACE_TYPE_LABELS: Record<string, string> = {
  tile_ceramic: 'Ceramic Tile',
  tile_gvt: 'GVT Tile',
  tile_vitrified: 'Vitrified Tile',
  marble: 'Marble',
  granite: 'Granite',
  epoxy_flooring: 'Epoxy Flooring',
  waterproofing_membrane: 'Waterproofing Membrane',
  stone_natural: 'Natural Stone',
};

export const SPECIALIZATION_LABELS: Record<string, string> = {
  tile_laying: 'Tile Laying',
  large_format_tile: 'Large Format Tile',
  marble_installation: 'Marble Installation',
  granite_slab: 'Granite Slab',
  epoxy_grouting: 'Epoxy Grouting',
  waterproofing: 'Waterproofing',
  stone_polishing: 'Stone Polishing',
  tile_cutting: 'Tile Cutting',
  floor_leveling: 'Floor Leveling',
  tile_repair: 'Tile Repair',
  wall_cladding: 'Wall Cladding',
  bathroom_waterproofing: 'Bathroom Waterproofing',
};

export const ZONE_OPTIONS = [
  'Sarjapur',
  'Whitefield',
  'North Bangalore',
  'Electronic City',
  'HSR',
  'JP Nagar',
  'Koramangala',
  'Indiranagar',
  'Hebbal',
];

export const SERVICE_CATEGORY_ICONS: Record<string, string> = {
  tile_laying: '🪟',
  marble_installation: '💎',
  epoxy_grouting: '🔵',
  waterproofing: '💧',
  stone_polishing: '✨',
  large_format_tile: '⬛',
  floor_leveling: '📐',
  tile_repair: '🔧',
  wall_cladding: '🧱',
};
