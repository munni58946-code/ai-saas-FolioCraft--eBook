import React, { useEffect, useRef } from 'react';

interface AdSenseBlockProps {
  adSlot?: string;
  className?: string;
  format?: 'auto' | 'horizontal' | 'rectangle';
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export const AdSenseBlock: React.FC<AdSenseBlockProps> = ({
  adSlot,
  className = '',
  format = 'auto',
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const isPushed = useRef(false);

  useEffect(() => {
    try {
      if (!isPushed.current && typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isPushed.current = true;
      }
    } catch (e) {
      console.warn('Google AdSense render error:', e);
    }
  }, []);

  return (
    <div
      className={`w-full my-6 p-4 rounded-xl border border-stone-200/80 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center text-center overflow-hidden ${className}`}
    >
      <div className="w-full flex items-center justify-between text-[10px] text-stone-400 font-sans uppercase tracking-widest mb-2 px-1">
        <span>Advertisement</span>
        <span className="text-[9px] text-stone-400">Google AdSense</span>
      </div>

      <div className="w-full min-h-[90px] flex items-center justify-center overflow-hidden">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', minHeight: '90px' }}
          data-ad-client="ca-pub-9859698707283876"
          data-ad-slot={adSlot || 'auto'}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
};
