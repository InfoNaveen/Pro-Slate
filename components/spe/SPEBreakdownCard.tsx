'use client';
import { useEffect, useState } from 'react';
import { formatINR } from '@/lib/utils';
import type { SPEOutput } from '@/types';
import { Clock, Users, TrendingUp } from 'lucide-react';

interface SPEBreakdownCardProps {
  result: SPEOutput;
  onContinue?: () => void;
}

export default function SPEBreakdownCard({ result, onContinue }: SPEBreakdownCardProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const items = [
    { label: 'Base Labor', amount: result.base_cost, color: 'bg-[#1A1A2E]' },
    { label: 'Surface Condition', amount: result.surface_cost, color: 'bg-blue-500' },
    { label: 'Complexity', amount: result.complexity_cost, color: 'bg-purple-500' },
    { label: 'Pillar Work', amount: result.pillar_cost, color: 'bg-orange-500' },
    { label: 'Mitre Cuts', amount: result.mitre_cost, color: 'bg-pink-500' },
    { label: 'Epoxy Grouting', amount: result.epoxy_cost, color: 'bg-cyan-500' },
  ].filter((i) => i.amount > 0);

  return (
    <div className={`transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Total */}
      <div className="bg-[#1A1A2E] rounded-lg p-6 text-white mb-4">
        <p className="text-sm text-gray-300 mb-1">Estimated Project Cost</p>
        <p className="text-4xl font-bold">{formatINR(result.total_cost)}</p>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5 text-gray-300 text-sm">
            <Clock className="h-4 w-4" />
            {result.time_estimate_days}
          </div>
          <div className="flex items-center gap-1.5 text-gray-300 text-sm">
            <TrendingUp className="h-4 w-4" />
            ₹0 advance required
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-card p-5 mb-4">
        <h3 className="font-semibold text-[#1A1A2E] mb-4">Cost Breakdown</h3>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                <span className="text-sm text-[#6B7280]">{item.label}</span>
              </div>
              <span className="text-sm font-semibold text-[#1A1A2E]">{formatINR(item.amount)}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
            <span className="text-sm font-bold text-[#1A1A2E]">Total</span>
            <span className="text-base font-bold text-[#E94560]">{formatINR(result.total_cost)}</span>
          </div>
        </div>
      </div>

      {/* Recommended Specializations */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-card p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-[#E94560]" />
          <h3 className="font-semibold text-[#1A1A2E]">Recommended Specialists</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {result.recommended_specializations.map((spec) => (
            <span key={spec} className="text-xs bg-[#E94560]/10 text-[#E94560] border border-[#E94560]/20 px-2.5 py-1 rounded-full font-medium">
              {spec.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </span>
          ))}
        </div>
      </div>

      {onContinue && (
        <button
          onClick={onContinue}
          className="w-full bg-[#E94560] text-white py-3 rounded-md font-semibold hover:bg-[#d63d56] transition-colors"
        >
          Find Verified Workers →
        </button>
      )}
    </div>
  );
}
