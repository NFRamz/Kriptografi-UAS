import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowDown, Key, FileJson, Grid3x3 } from 'lucide-react';
import { LabData } from '../SecurityLab';
import { LabAnimationState } from '../useLabAnimation';

export const AesVisualizer = ({ data, anim }: { data: LabData, anim: LabAnimationState }) => {
  const step = anim.globalStep;
  
  // AES Phase is steps 0 to 22.
  const isAesActive = step <= 22;
  const isPlaintext = step >= 0;
  const isAddRoundKey = step >= 1;
  const subBytesStep = Math.max(0, Math.min(16, step - 1)); // 1 to 16
  const isShiftRows = step >= 18;
  const isMixColumns = step >= 19;
  const isCiphertext = step >= 20;

  // Mock S-Box data visualization for block 1
  const renderSBox = () => {
    if (subBytesStep === 0) return null;
    
    return (
      <motion.div 
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="w-full bg-slate-900 text-slate-300 p-6 rounded-2xl border border-slate-700 shadow-inner mt-4 overflow-hidden"
      >
        <h4 className="font-mono text-sm mb-4 flex items-center gap-2 text-accent">
          <Grid3x3 className="w-4 h-4" /> 
          SubBytes (S-Box Substitution) - Byte {subBytesStep}/16
        </h4>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 font-mono text-xs text-center">
          {Array.from({ length: 16 }).map((_, i) => {
            const isCurrent = i === subBytesStep - 1;
            const isProcessed = i < subBytesStep - 1;
            return (
              <div 
                key={i} 
                className={`p-2 rounded border transition-all duration-300 ${
                  isCurrent ? 'bg-accent/20 border-accent text-accent scale-110 shadow-[0_0_15px_rgba(176,38,255,0.5)] z-10' : 
                  isProcessed ? 'bg-slate-800 border-slate-600 text-slate-400' : 
                  'bg-slate-800/50 border-slate-700 text-slate-500 opacity-50'
                }`}
              >
                {isProcessed || isCurrent ? '0x' + Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase() : '??'}
              </div>
            );
          })}
        </div>
        
        {isCurrent => (
          <div className="mt-4 flex items-center justify-between text-xs bg-slate-800 p-3 rounded-lg border border-slate-700">
            <span>Lookup S-Box...</span>
            <span className="text-accent font-bold">Value Replaced</span>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className={`glass-card p-8 border ${isAesActive ? 'border-primary/50 shadow-[0_0_30px_rgba(0,150,200,0.1)]' : 'border-gray-200'} rounded-3xl bg-white/50 backdrop-blur-xl transition-all duration-500`}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Lock className={`${isAesActive ? 'text-primary' : 'text-gray-400'} w-6 h-6 transition-colors`} /> 
          Section 1: AES-256 Encryption
        </h2>
        <p className="text-gray-600 mt-2">Visualisasi konversi metadata menjadi Ciphertext secara mendalam dengan blok substitusi (S-Box).</p>
      </div>

      <div className="flex flex-col items-center max-w-4xl mx-auto space-y-6">
        {/* Step 1: Plaintext */}
        <AnimatePresence>
          {isPlaintext && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`w-full bg-white border ${step === 0 ? 'border-green-500 shadow-md' : 'border-gray-200'} p-6 rounded-2xl relative overflow-hidden transition-all duration-300`}
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><FileJson className="w-5 h-5 text-green-600"/> Plaintext Metadata</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg"><span className="text-gray-500 block text-xs">Owner Name</span><strong className="text-gray-900">{data.metadata.owner_name}</strong></div>
                <div className="bg-gray-50 p-3 rounded-lg"><span className="text-gray-500 block text-xs">Asset ID</span><strong className="text-gray-900 font-mono text-xs">{data.metadata.asset_id}</strong></div>
                <div className="bg-gray-50 p-3 rounded-lg"><span className="text-gray-500 block text-xs">Timestamp</span><strong className="text-gray-900">{data.metadata.timestamp}</strong></div>
                <div className="bg-gray-50 p-3 rounded-lg"><span className="text-gray-500 block text-xs">Copyright</span><strong className="text-gray-900">{data.metadata.copyright_note}</strong></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isAddRoundKey && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-primary w-full"
            >
              <ArrowDown className={`w-8 h-8 ${isAesActive ? 'animate-bounce text-primary' : 'text-gray-300'}`} />
              <div className={`w-full max-w-2xl border ${isAesActive ? 'border-primary/30 bg-primary/5' : 'border-gray-200 bg-gray-50'} rounded-2xl p-6 text-center transition-all duration-300`}>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Key className="w-5 h-5 text-primary" />
                  <span className="text-lg font-bold text-gray-900">AES-256 Engine Processing</span>
                </div>
                <p className="text-xs text-gray-500 font-mono mb-4 break-all bg-white p-2 rounded border border-gray-100">Key: {data.aesKey}</p>
                
                {/* Advanced AES Steps Visualization */}
                <div className="flex flex-wrap justify-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${isAddRoundKey && subBytesStep === 0 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>AddRoundKey</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${subBytesStep > 0 && !isShiftRows ? 'bg-accent text-white' : 'bg-gray-200 text-gray-500'}`}>SubBytes</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${isShiftRows && !isMixColumns ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'}`}>ShiftRows</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${isMixColumns && !isCiphertext ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>MixColumns</span>
                </div>
                
                {renderSBox()}

                {(isShiftRows || isMixColumns) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 text-sm font-mono text-gray-600 bg-white p-3 rounded-lg border border-gray-100"
                  >
                    {isShiftRows && !isMixColumns && "Menggeser baris state matrix (ShiftRows)..."}
                    {isMixColumns && !isCiphertext && "Mengalikan kolom dengan polynomial matrix (MixColumns)..."}
                    {isCiphertext && "Proses enkripsi 14 ronde selesai."}
                  </motion.div>
                )}
              </div>
              <ArrowDown className={`w-8 h-8 mt-2 ${isAesActive ? 'animate-bounce text-primary' : 'text-gray-300'}`} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 2: Ciphertext */}
        <AnimatePresence>
          {isCiphertext && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`w-full bg-white border ${step === 20 ? 'border-red-500 shadow-md' : 'border-gray-200'} p-6 rounded-2xl relative overflow-hidden transition-all duration-300`}
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Lock className="w-5 h-5 text-red-600"/> Resulting Ciphertext</h3>
              <p className="font-mono text-sm break-all bg-gray-50 p-4 rounded-xl text-gray-800 leading-relaxed border border-gray-100">
                {data.ciphertext}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
