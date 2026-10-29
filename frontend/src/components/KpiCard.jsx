import React from 'react';
import { TrendingUp, TrendingDown, HelpCircle } from 'lucide-react';

const KpiCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'indigo' }) => {
  const colorMap = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:border-indigo-500/40',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:border-amber-500/40',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:border-rose-500/40',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:border-cyan-500/40',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:border-purple-500/40',
  };

  const badgeColorMap = {
    indigo: 'bg-indigo-500/20 text-indigo-300',
    emerald: 'bg-emerald-500/20 text-emerald-300',
    amber: 'bg-amber-500/20 text-amber-300',
    rose: 'bg-rose-500/20 text-rose-300',
    cyan: 'bg-cyan-500/20 text-cyan-300',
    purple: 'bg-purple-500/20 text-purple-300',
  };

  return (
    <div className={`p-5 rounded-xl bg-slate-900 border transition-all duration-200 shadow-lg ${colorMap[color] || colorMap.indigo}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-lg ${badgeColorMap[color] || badgeColorMap.indigo}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline space-x-2">
        <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
      </div>

      {(subtitle || trendValue) && (
        <div className="mt-2 flex items-center text-xs space-x-1 font-medium">
          {trend && (
            <span className={`inline-flex items-center ${trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend === 'up' ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
              {trendValue}
            </span>
          )}
          {subtitle && <span className="text-slate-400">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

export default KpiCard;
