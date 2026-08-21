import React from 'react';

interface SRMLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-11 h-11',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20'
};

export const SRMLogo: React.FC<SRMLogoProps> = ({
  className = '',
  size,
  showText = false
}) => {
  const logoDimensions = size ? sizeMap[size] : 'w-12 h-12';

  return (
    <div className={`inline-flex items-center gap-3 shrink-0 select-none ${className}`}>
      <img
        src="/srm-logo.svg"
        alt="SRM MCET Official Seal"
        className={`${logoDimensions} shrink-0 object-contain drop-shadow-xs`}
        loading="eager"
      />
      {showText && (
        <div className="flex flex-col text-left leading-tight justify-center shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="font-heading font-extrabold tracking-tight text-[#003882] text-[17px] leading-tight">
              SRM KDFC
            </span>
            <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded tracking-wide uppercase leading-none">
              CANTEEN
            </span>
          </div>
          <span className="text-[10.5px] font-semibold text-slate-500 tracking-wider uppercase mt-0.5">
            SRM MCET CAMPUS FOOD COURT
          </span>
        </div>
      )}
    </div>
  );
};


