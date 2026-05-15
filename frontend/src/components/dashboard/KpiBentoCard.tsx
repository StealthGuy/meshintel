import React from 'react';

export interface KpiBentoCardProps {
  title: string;
  value: string | number;
  subtitle?: React.ReactNode;
  colorClass?: string;
  valueColorClass?: string;
}

export const KpiBentoCard: React.FC<KpiBentoCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  colorClass = "bg-primary-fixed-dim/20",
  valueColorClass = "text-on-surface"
}) => {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant p-4 flex flex-col justify-between relative overflow-hidden group hover:border-primary-container transition-colors">
      <div className={`absolute top-0 right-0 w-16 h-16 ${colorClass} rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
      <h3 className="font-label-mono text-label-mono text-on-surface-variant uppercase relative z-10">{title}</h3>
      <div className="mt-4 flex items-baseline gap-2 relative z-10">
        <span className={`font-headline-lg text-3xl font-black tracking-tight ${valueColorClass}`}>{value}</span>
        {subtitle && (
          <span className="font-label-mono text-[10px] text-outline">{subtitle}</span>
        )}
      </div>
    </div>
  );
};
