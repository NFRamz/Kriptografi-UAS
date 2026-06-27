import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, LockOpen, CheckCircle, Database, ArrowRight } from 'lucide-react';
import { LabData } from '../SecurityLab';

export const VerificationTimeline = ({ data }: { data: LabData }) => {
  const [activeStep, setActiveStep] = useState(0);

  // Automatically progress timeline for visualization effect
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 2000); // 2 seconds per step

    return () => clearInterval(timer);
  }, []);

  const resetTimeline = () => setActiveStep(0);

  const steps = [
    {
      title: "Mengekstrak Pesan Tersembunyi (LSB)",
      icon: <Database className="w-6 h-6" />,
      content: (
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
          <p className="text-sm text-gray-600 mb-2 font-semibold">Biner LSB yang Terekstrak (Sample):</p>
          <p className="font-mono text-xs text-accent break-all line-clamp-3 bg-white p-2 rounded border border-gray-100">{data.binaryStr}</p>
        </div>
      )
    },
    {
      title: "Merekonstruksi Ciphertext AES",
      icon: <ArrowRight className="w-6 h-6" />,
      content: (
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
          <p className="text-sm text-gray-600 mb-2 font-semibold">Teks Sandi (Ciphertext) Dipulihkan:</p>
          <p className="font-mono text-xs text-gray-800 break-all bg-white p-2 rounded border border-gray-100">{data.ciphertext}</p>
        </div>
      )
    },
    {
      title: "Dekripsi AES-256",
      icon: <LockOpen className="w-6 h-6" />,
      content: (
        <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
          <p className="text-sm text-gray-700 mb-2 font-semibold flex items-center gap-2">Mendekripsi menggunakan kunci: <span className="font-mono bg-white px-2 py-1 rounded text-primary text-xs">{data.aesKey}</span></p>
          <div className="bg-white p-3 rounded-lg border border-primary/10 shadow-sm">
            <pre className="font-mono text-xs text-gray-800 whitespace-pre-wrap">{JSON.stringify(data.metadata, null, 2)}</pre>
          </div>
        </div>
      )
    },
    {
      title: "Verifikasi Kepemilikan Selesai",
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      content: (
        <div className="bg-green-50 border border-green-200 p-6 rounded-xl text-center shadow-inner">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h4 className="font-bold text-gray-900 text-xl mb-2">Terverifikasi Asli</h4>
          <p className="text-gray-700">Aset ini terbukti milik <strong className="text-green-700">{data.metadata.owner_name}</strong>.</p>
        </div>
      )
    }
  ];

  return (
    <div className="glass-card p-8 border border-gray-200 rounded-3xl bg-white/50 backdrop-blur-xl">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Upload className="text-primary w-6 h-6" /> Section 7: Verification Timeline
          </h2>
          <p className="text-gray-600 mt-2">Visualisasi proses *reverse engineering* yang terjadi saat seseorang mengunggah gambar untuk memverifikasi hak cipta.</p>
        </div>
        <button onClick={resetTimeline} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-colors">
          Ulangi Animasi
        </button>
      </div>

      <div className="max-w-3xl mx-auto relative pt-6">
        {/* Vertical Line */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-100 rounded-full z-0"></div>

        {steps.map((step, index) => {
          const isActive = index <= activeStep;
          const isCurrent = index === activeStep;

          return (
            <div key={index} className="relative z-10 flex gap-6 mb-12">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all duration-500 bg-white ${isActive ? 'border-primary text-primary shadow-[0_0_15px_rgba(0,150,200,0.3)] scale-110' : 'border-gray-200 text-gray-300'}`}>
                {step.icon}
              </div>
              
              <div className="flex-1 pt-3">
                <h3 className={`text-xl font-bold mb-4 transition-colors duration-500 ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.title}
                  {isCurrent && <span className="ml-3 inline-flex relative w-3 h-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span><span className="relative inline-flex rounded-full w-3 h-3 bg-primary"></span></span>}
                </h3>
                
                {isActive && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.5 }}
                  >
                    {step.content}
                  </motion.div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
