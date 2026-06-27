import React from 'react';
import { Image as ImageIcon, ArrowRight } from 'lucide-react';
import { LabData } from '../SecurityLab';

export const LsbVisualizer = ({ data }: { data: LabData }) => {
  const formatBinaryByte = (val: number) => val.toString(2).padStart(8, '0');

  // We only take the first 8 bytes for visualization (representing 1 character usually)
  const sampleOrig = data.embeddingResult.sampleOriginal.slice(0, 8);
  const sampleMod = data.embeddingResult.sampleModified.slice(0, 8);
  const hiddenBits = data.binaryStr.substring(0, 8).split('');

  return (
    <div className="glass-card p-8 border border-gray-200 rounded-3xl bg-white/50 backdrop-blur-xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <ImageIcon className="text-blue-500 w-6 h-6" /> Section 3: LSB Steganography
        </h2>
        <p className="text-gray-600 mt-2">Demonstrasi penyisipan data biner ke dalam bit terakhir (Least Significant Bit) dari saluran warna piksel (RGB/A).</p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          <div className="grid grid-cols-3 gap-6 text-center mb-4">
            <div className="text-gray-700 font-bold uppercase tracking-wider text-sm bg-gray-100 py-2 rounded-t-xl">Original Pixel (Byte)</div>
            <div className="text-accent font-bold uppercase tracking-wider text-sm bg-accent/10 py-2 rounded-t-xl">Hidden Bit</div>
            <div className="text-primary font-bold uppercase tracking-wider text-sm bg-primary/10 py-2 rounded-t-xl">Result Pixel (Stego)</div>
          </div>
          
          <div className="space-y-3">
            {sampleOrig.map((orig, idx) => {
              const mod = sampleMod[idx];
              const origBin = formatBinaryByte(orig);
              const modBin = formatBinaryByte(mod);
              const isChanged = orig !== mod;
              const bitToHide = hiddenBits[idx];

              return (
                <div key={idx} className="grid grid-cols-3 gap-6 items-center text-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  {/* Original */}
                  <div className="font-mono text-lg tracking-[0.3em] text-gray-700">
                    {origBin.slice(0, 7)}<span className="text-gray-400">{origBin[7]}</span>
                  </div>
                  
                  {/* Operation */}
                  <div className="flex items-center justify-center gap-4">
                    <ArrowRight className="w-5 h-5 text-gray-300" />
                    <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold shadow-[0_0_10px_rgba(176,38,255,0.4)]">
                      {bitToHide}
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-300" />
                  </div>

                  {/* Result */}
                  <div className="font-mono text-lg tracking-[0.3em]">
                    <span className="text-gray-700">{modBin.slice(0, 7)}</span>
                    <span className={`font-bold px-1 rounded ${isChanged ? 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'text-primary bg-primary/10'}`}>
                      {modBin[7]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-center gap-8 text-sm">
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 rounded-sm"></div> <span className="text-gray-700">Bit Berubah (Flipped)</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-primary/20 rounded-sm"></div> <span className="text-gray-700">Bit Tidak Berubah (Match)</span></div>
      </div>
    </div>
  );
};
