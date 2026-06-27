import React, { useState, useRef } from 'react';
import { Search, Info } from 'lucide-react';
import { LabData } from '../SecurityLab';

export const ImageComparison = ({ data }: { data: LabData }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSliderMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || e.buttons !== 1) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = ((e.clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, pos)));
  };

  return (
    <div className="glass-card p-8 border border-gray-200 rounded-3xl bg-white/50 backdrop-blur-xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Search className="text-primary w-6 h-6" /> Section 5: Before vs After Comparison
        </h2>
        <p className="text-gray-600 mt-2">Membuktikan bahwa penyisipan LSB menjaga kualitas visual. Anda dapat menggeser slider ke kiri dan kanan untuk membandingkan piksel secara kasat mata.</p>
      </div>

      <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div 
          ref={containerRef}
          className="relative cursor-crosshair overflow-hidden w-full flex justify-center bg-gray-50 p-4 touch-none select-none rounded-xl"
          onMouseMove={handleSliderMove}
          onMouseDown={handleSliderMove}
        >
          <div className="relative inline-block border border-gray-200 shadow-xl rounded-md overflow-hidden">
            {/* Base Image (Protected) */}
            <img 
              src={data.protectedImageUrl} 
              className="block max-w-full max-h-[500px] object-contain" 
              alt="Protected Base" 
              draggable={false}
            />
            
            {/* Overlay Image (Original) masked by slider */}
            <div 
              className="absolute top-0 left-0 h-full overflow-hidden" 
              style={{ width: `${sliderPos}%` }}
            >
              <img 
                src={data.originalImageUrl} 
                className="block max-w-full max-h-[500px] object-contain" 
                style={{ width: data.comparisonResult.width, maxWidth: 'none', height: '100%' }} 
                alt="Original Overlay" 
                draggable={false}
              />
            </div>

            {/* Labels */}
            <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm shadow-lg pointer-events-none z-10">
              Original (Plain)
            </div>
            <div className="absolute top-4 right-4 bg-primary/80 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm shadow-lg pointer-events-none z-10">
              Protected (Stego)
            </div>

            {/* Slider Handle */}
            <div className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize drop-shadow-2xl z-20" style={{ left: `calc(${sliderPos}% - 2px)` }}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-[0_0_15px_rgba(0,0,0,0.3)] flex items-center justify-center border border-gray-200">
                <div className="w-1 h-5 bg-gray-300 rounded-full mx-0.5"></div>
                <div className="w-1 h-5 bg-gray-300 rounded-full mx-0.5"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500 bg-gray-50 py-3 rounded-xl border border-gray-100">
        <Info className="w-5 h-5 text-gray-400" />
        Geser (drag) kursor ke kiri dan kanan pada gambar untuk melihat transisi. Gambar terlihat 100% identik bagi mata manusia.
      </div>
    </div>
  );
};
