import React from 'react';
import { Image as ImageIcon, ArrowRight, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LabData } from '../SecurityLab';
import { LabAnimationState } from '../useLabAnimation';

export const LsbVisualizer = ({ data, anim }: { data: LabData, anim: LabAnimationState }) => {
  const step = anim.globalStep;
  
  // LSB Phase is steps 39 to 46 (8 bits)
  const isLsbActive = step >= 39 && step <= 46;
  const embeddedBitsCount = Math.max(0, step - 39);

  const formatBinaryByte = (val: number) => val.toString(2).padStart(8, '0');

  // We only take the first 8 bytes for visualization (representing 1 character usually)
  const sampleOrig = data.embeddingResult.sampleOriginal.slice(0, 8);
  const sampleMod = data.embeddingResult.sampleModified.slice(0, 8);
  const hiddenBits = data.binaryStr.substring(0, 8).split('');

  return (
    <div className={`glass-card p-8 border ${isLsbActive ? 'border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.15)]' : 'border-gray-200'} rounded-3xl bg-white/50 backdrop-blur-xl transition-all duration-500`}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <ImageIcon className={`${isLsbActive ? 'text-blue-500' : 'text-gray-400'} w-6 h-6 transition-colors`} /> 
          Section 3: LSB Steganography
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
            <AnimatePresence>
              {sampleOrig.map((orig, idx) => {
                const mod = sampleMod[idx];
                const origBin = formatBinaryByte(orig);
                const modBin = formatBinaryByte(mod);
                const isChanged = orig !== mod;
                const bitToHide = hiddenBits[idx];
                
                // Show if it's past this bit's step, or if we are skipping to the end
                if (idx >= embeddedBitsCount && step < 47) return null;
                
                // Animate the currently processing bit specially
                const isCurrent = idx === embeddedBitsCount - 1 && isLsbActive;

                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={idx} 
                    className={`grid grid-cols-3 gap-6 items-center text-center bg-white p-3 rounded-lg border shadow-sm transition-all duration-300 ${isCurrent ? 'border-blue-400 scale-[1.02] shadow-blue-200' : 'border-gray-100 hover:shadow-md'}`}
                  >
                    {/* Original */}
                    <div className="font-mono text-lg tracking-[0.3em] text-gray-700 relative">
                      {origBin.slice(0, 7)}
                      <span className="text-gray-400 relative">
                        {origBin[7]}
                        {isCurrent && (
                          <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-red-500 font-bold"
                          >
                            LSB
                            <ArrowDown className="w-3 h-3 mx-auto" />
                          </motion.div>
                        )}
                      </span>
                    </div>
                    
                    {/* Operation */}
                    <div className="flex items-center justify-center gap-4">
                      <ArrowRight className="w-5 h-5 text-gray-300" />
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold shadow-[0_0_10px_rgba(176,38,255,0.4)] relative"
                      >
                        {bitToHide}
                        {isCurrent && (
                          <motion.span 
                            animate={{ x: [0, 40, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="absolute w-2 h-2 bg-accent rounded-full -right-4"
                          />
                        )}
                      </motion.div>
                      <ArrowRight className="w-5 h-5 text-gray-300" />
                    </div>

                    {/* Result */}
                    <div className="font-mono text-lg tracking-[0.3em]">
                      <span className="text-gray-700">{modBin.slice(0, 7)}</span>
                      <motion.span 
                        initial={isCurrent ? { backgroundColor: '#fff', color: '#000' } : false}
                        animate={isCurrent ? { 
                          backgroundColor: isChanged ? '#e11d48' : '#dbeafe', 
                          color: isChanged ? '#fff' : '#1d4ed8',
                          boxShadow: isChanged ? '0 0 20px rgba(225, 29, 72, 0.8)' : 'none'
                        } : false}
                        transition={{ delay: 0.5 }}
                        className={`font-bold px-1.5 py-0.5 rounded transition-colors ${!isCurrent ? (isChanged ? 'bg-rose-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.8)] ring-2 ring-rose-400 ring-offset-1 animate-pulse' : 'text-primary bg-primary/10') : ''}`}
                      >
                        {modBin[7]}
                      </motion.span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-center gap-8 text-sm">
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-rose-600 shadow-[0_0_10px_rgba(225,29,72,0.8)] ring-1 ring-rose-400 rounded-sm animate-pulse"></div> <span className="text-gray-700">Bit Berubah (Flipped)</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-primary/20 rounded-sm"></div> <span className="text-gray-700">Bit Tidak Berubah (Match)</span></div>
      </div>
    </div>
  );
};
