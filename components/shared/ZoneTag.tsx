import { MapPin } from 'lucide-react';

export default function ZoneTag({ zone }: { zone: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-[#F5F5F0] text-[#6B7280] border border-gray-200 px-2 py-0.5 rounded-full">
      <MapPin className="h-3 w-3" />
      {zone}
    </span>
  );
}
