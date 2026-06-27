import React from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowDown, Key, FileJson } from 'lucide-react';
import { LabData } from '../SecurityLab';

export const AesVisualizer = ({ data }: { data: LabData }) => {
  return (
    <div className="glass-card p-8 border border-gray-200 rounded-3xl bg-white/50 backdrop-blur-xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Lock className="text-primary w-6 h-6" /> Section 1: AES-256 Encryption
        </h2>
        <p className="text-gray-600 mt-2">Visualisasi konversi metadata menjadi Ciphertext menggunakan algoritma enkripsi standar militer.</p>
      </div>

      <div className="flex flex-col items-center max-w-4xl mx-auto space-y-6">
        {/* Step 1: Plaintext */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full bg-white border border-gray-200 p-6 rounded-2xl shadow-sm relative overflow-hidden"
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

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="flex flex-col items-center text-primary"
        >
          <ArrowDown className="w-8 h-8 animate-bounce" />
          <div className="bg-primary/10 px-4 py-2 rounded-full border border-primary/20 flex items-center gap-2 my-2">
            <Key className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-gray-900">AES-256 Engine</span>
          </div>
          <p className="text-xs text-gray-500 font-mono">Key: {data.aesKey}</p>
          <ArrowDown className="w-8 h-8 animate-bounce mt-2" />
        </motion.div>

        {/* Step 2: Ciphertext */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full bg-white border border-gray-200 p-6 rounded-2xl shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Lock className="w-5 h-5 text-red-600"/> Resulting Ciphertext</h3>
          <p className="font-mono text-sm break-all bg-gray-50 p-4 rounded-xl text-gray-800 leading-relaxed border border-gray-100">
            {data.ciphertext}
          </p>
        </motion.div>
      </div>
    </div>
  );
};
