import React from 'react';

export interface CssHistogramProps {
  data: number[];
  title: string;
  icon: string;
  badgeText?: string;
  colorTheme?: "surface-tint" | "tertiary-container" | "primary" | "secondary";
}

export const CssHistogram: React.FC<CssHistogramProps> = ({ 
  data, 
  title, 
  icon, 
  badgeText,
  colorTheme = "surface-tint"
}) => {
  const maxVal = Math.max(...data, 1); // Avoid division by zero
  
  // Per il tema dei colori
  const hoverClass = 
    colorTheme === "surface-tint" ? "group-hover:bg-surface-tint" : 
    colorTheme === "tertiary-container" ? "group-hover:bg-tertiary-container" :
    colorTheme === "primary" ? "group-hover:bg-primary" :
    "group-hover:bg-secondary";

  const iconColorClass = 
    colorTheme === "surface-tint" ? "text-surface-tint" : 
    colorTheme === "tertiary-container" ? "text-tertiary-container" :
    colorTheme === "primary" ? "text-primary" :
    "text-secondary";
  
  // Normalizziamo per visualizzazione (limitiamo a max 12 barre per questioni di spazio)
  const displayData = (data || []).slice(0, 12);
  
  return (
    <section className="bg-surface-container-lowest border border-outline-variant h-full flex flex-col">
      <div className="px-4 py-3 border-b border-outline-variant bg-surface-container-low flex justify-between items-center shrink-0">
        <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
          <span className={`material-symbols-outlined text-sm ${iconColorClass}`}>{icon}</span>
          {title}
        </h3>
        {badgeText && (
          <span className="font-label-mono text-[10px] text-on-surface-variant border border-outline-variant px-2 py-0.5 uppercase">
            {badgeText}
          </span>
        )}
      </div>
      
      <div className="p-4 flex items-end gap-1 relative flex-1">
        {/* Griglia di sfondo */}
        <div className="absolute left-0 bottom-4 top-4 w-full flex flex-col justify-between pointer-events-none px-4 z-0">
          <div className="border-b border-outline-variant/30 w-full h-0"></div>
          <div className="border-b border-outline-variant/30 w-full h-0"></div>
          <div className="border-b border-outline-variant/30 w-full h-0"></div>
          <div className="border-b border-outline-variant/30 w-full h-0"></div>
        </div>
        
        {/* Barre */}
        {displayData.map((val, idx) => {
          const heightPercent = `${(val / maxVal) * 100}%`;
          return (
            <div key={idx} className="flex-1 flex flex-col justify-end group z-10 h-full">
              <div 
                className={`w-full bg-surface-variant ${hoverClass} transition-colors relative`} 
                style={{ height: heightPercent || '1%' }}
              >
                {/* Tooltip on Hover */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 font-data-tabular text-[10px] bg-inverse-surface text-inverse-on-surface px-1 py-0.5 z-20 whitespace-nowrap rounded-sm">
                  {val.toLocaleString()}
                </div>
              </div>
              <div className="text-center font-label-mono text-[10px] mt-2 text-outline">
                {idx}{idx === displayData.length - 1 && data.length > displayData.length ? '+' : ''}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
