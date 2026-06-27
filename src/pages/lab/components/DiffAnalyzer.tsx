import React, { useState, useRef } from 'react';
import { Microscope, MousePointer2, Activity } from 'lucide-react';
import { LabData } from '../SecurityLab';
import { ImageComparator } from '../../../lib/image-compare';

export const DiffAnalyzer = ({ data }: { data: LabData }) => {
  const { comparisonResult } = data;
  const [hoverPos, setHoverPos] = useState<{x: number, y: number} | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (comparisonResult.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (comparisonResult.height / rect.height));
    
    if (x >= 0 && x < comparisonResult.width && y >= 0 && y < comparisonResult.height) {
      setHoverPos({ x, y });
    } else {
      setHoverPos(null);
    }
  };

  let origPixelStr = '';
  let protPixelStr = '';
  let diffDetected = false;

  if (hoverPos) {
    const o = ImageComparator.getPixelAt(comparisonResult.originalData, comparisonResult.width, hoverPos.x, hoverPos.y);
    const p = ImageComparator.getPixelAt(comparisonResult.protectedData, comparisonResult.width, hoverPos.x, hoverPos.y);
    origPixelStr = `R:${o.r.toString().padStart(3,'0')} G:${o.g.toString().padStart(3,'0')} B:${o.b.toString().padStart(3,'0')}`;
    protPixelStr = `R:${p.r.toString().padStart(3,'0')} G:${p.g.toString().padStart(3,'0')} B:${p.b.toString().padStart(3,'0')}`;
    diffDetected = o.r !== p.r || o.g !== p.g || o.b !== p.b;
  }

  return (
    <div className="glass-card p-8 border border-gray-200 rounded-3xl bg-white/50 backdrop-blur-xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Microscope className="text-red-500 w-6 h-6" /> Section 6: Difference Map Analyzer
        </h2>
        <p className="text-gray-600 mt-2">Peta perbedaan ini menyoroti piksel mana saja yang telah dimanipulasi LSB-nya. Warna merah muda merepresentasikan piksel yang membawa data rahasia.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Diff Map Viewer */}
        <div className="lg:col-span-2">
          <div className="bg-white p-1 rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gray-50 p-3 flex justify-between items-center border-b border-gray-200 rounded-t-xl">
              <h3 className="text-gray-900 font-bold flex items-center gap-2"><Activity className="w-5 h-5 text-red-500"/> Peta Perbedaan Piksel (DiffViewer)</h3>
            </div>
            <div className="flex justify-center bg-[#0a0a0a] p-4 cursor-crosshair">
              <img 
                ref={imgRef}
                src={comparisonResult.diffDataUrl} 
                className="max-w-full max-h-[400px] object-contain border border-gray-800" 
                alt="Diff Map"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoverPos(null)}
              />
            </div>
          </div>
        </div>

        {/* Pixel Inspector */}
        <div>
          <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm sticky top-24">
            <h3 className="text-gray-900 font-bold flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <MousePointer2 className="w-5 h-5 text-accent"/> Live Pixel Inspector
            </h3>
            
            {hoverPos ? (
              <div className="space-y-5">
                <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-center shadow-inner">
                  <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Koordinat Piksel (X, Y)</p>
                  <p className="text-gray-900 font-mono font-bold text-lg">{hoverPos.x}, {hoverPos.y}</p>
                </div>

                <div className="space-y-3 bg-white border border-gray-100 p-4 rounded-lg">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-semibold">Original RGB</span>
                    <span className="text-gray-800 font-mono bg-gray-100 px-2 py-1 rounded">{origPixelStr}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-gray-50 pt-3">
                    <span className="text-primary font-semibold">Protected RGB</span>
                    <span className={`${diffDetected ? 'text-white bg-red-500' : 'text-gray-800 bg-gray-100'} font-mono px-2 py-1 rounded font-bold`}>
                      {protPixelStr}
                    </span>
                  </div>
                </div>

                <div className={`p-3 rounded-lg border text-center font-bold shadow-sm ${diffDetected ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-600'}`}>
                  {diffDetected ? 'Modifikasi Terdeteksi (Bit Berubah)' : 'Piksel Identik (Tidak Ada Data)'}
                </div>

                {/* Magnifier View */}
                <div className="mt-4 p-2 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden relative h-32 flex items-center justify-center">
                   <span className="text-gray-400 text-xs italic absolute bottom-2 font-medium">Pembesaran 4x (Magnified)</span>
                   <div className="w-16 h-16 border border-gray-300 shadow-md relative flex items-center justify-center rounded overflow-hidden" 
                     style={{
                       backgroundImage: `url(${comparisonResult.diffDataUrl})`,
                       backgroundPosition: `-${hoverPos.x * 4}px -${hoverPos.y * 4}px`,
                       backgroundSize: `${comparisonResult.width * 4}px ${comparisonResult.height * 4}px`,
                       imageRendering: 'pixelated'
                     }}
                   >
                     {/* crosshair */}
                     <div className="absolute w-full h-[2px] bg-white mix-blend-difference opacity-50"></div>
                     <div className="absolute h-full w-[2px] bg-white mix-blend-difference opacity-50"></div>
                   </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <MousePointer2 className="w-10 h-10 mb-3 opacity-30"/>
                <p className="px-4 text-sm font-medium">Arahkan kursor ke Peta Perbedaan (gambar hitam) untuk menginspeksi nilai piksel secara langsung.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
