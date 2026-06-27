import React, { useState } from 'react';
import { ShieldAlert, Shield, ShieldCheck, Play, ArrowRight } from 'lucide-react';
import { LabData } from '../SecurityLab';

export const AttackSimulation = ({ data }: { data: LabData }) => {
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  const scenarios = [
    {
      id: 'A',
      title: 'Tanpa Proteksi',
      desc: 'Gambar disebarkan tanpa enkripsi maupun steganografi.',
      icon: <ShieldAlert className="w-8 h-8 text-red-500" />,
      result: {
        securityScore: '0/100',
        detectability: 'Tinggi (Mudah Dicuri)',
        ownership: 'Tidak Dapat Dibuktikan',
        color: 'red'
      }
    },
    {
      id: 'B',
      title: 'Enkripsi AES Saja',
      desc: 'Metadata dienkripsi, namun disimpan terpisah dari gambar.',
      icon: <Shield className="w-8 h-8 text-yellow-500" />,
      result: {
        securityScore: '50/100',
        detectability: 'Sedang (File terpisah mudah hilang)',
        ownership: 'Dapat Dibuktikan (Jika file metadata ada)',
        color: 'yellow'
      }
    },
    {
      id: 'C',
      title: 'DigiProof (AES + LSB)',
      desc: 'Metadata dienkripsi dan disembunyikan di dalam piksel gambar.',
      icon: <ShieldCheck className="w-8 h-8 text-green-500" />,
      result: {
        securityScore: '100/100',
        detectability: 'Rendah (Kasat Mata Identik)',
        ownership: 'Terbukti Kuat & Permanen',
        color: 'green'
      }
    }
  ];

  return (
    <div className="glass-card p-8 border border-gray-200 rounded-3xl bg-white/50 backdrop-blur-xl mb-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <ShieldAlert className="text-orange-500 w-6 h-6" /> Section 8: Attack Simulation Center
        </h2>
        <p className="text-gray-600 mt-2">Pusat simulasi skenario serangan untuk membuktikan seberapa kuat arsitektur keamanan DigiProof dibandingkan metode konvensional.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {scenarios.map((scen) => (
          <div 
            key={scen.id} 
            className={`cursor-pointer transition-all duration-300 border-2 rounded-2xl p-6 ${activeScenario === scen.id ? `border-${scen.result.color}-500 shadow-lg bg-white scale-105` : 'border-gray-200 bg-gray-50 hover:border-primary/50'}`}
            onClick={() => setActiveScenario(scen.id)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-${scen.result.color}-100`}>
                {scen.icon}
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded bg-gray-200 text-gray-700`}>Skenario {scen.id}</span>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">{scen.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{scen.desc}</p>
            
            <button className={`mt-6 w-full py-2 rounded-lg text-sm font-bold flex justify-center items-center gap-2 ${activeScenario === scen.id ? `bg-${scen.result.color}-500 text-white` : 'bg-gray-200 text-gray-600'}`}>
              <Play className="w-4 h-4" /> {activeScenario === scen.id ? 'Simulasi Aktif' : 'Jalankan Simulasi'}
            </button>
          </div>
        ))}
      </div>

      {activeScenario && (
        <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            Hasil Analisis Skenario {activeScenario} <ArrowRight className="w-5 h-5 text-gray-400" />
          </h3>
          
          {scenarios.map(scen => scen.id === activeScenario && (
            <div key={`res-${scen.id}`} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className={`p-6 rounded-xl border border-${scen.result.color}-200 bg-${scen.result.color}-50 flex flex-col items-center text-center`}>
                <span className="text-sm text-gray-600 font-bold uppercase tracking-wider mb-2">Security Score</span>
                <span className={`text-4xl font-extrabold text-${scen.result.color}-600`}>{scen.result.securityScore}</span>
              </div>
              <div className={`p-6 rounded-xl border border-${scen.result.color}-200 bg-${scen.result.color}-50 flex flex-col items-center text-center`}>
                <span className="text-sm text-gray-600 font-bold uppercase tracking-wider mb-2">Detectability</span>
                <span className={`text-xl font-bold text-${scen.result.color}-600`}>{scen.result.detectability}</span>
              </div>
              <div className={`p-6 rounded-xl border border-${scen.result.color}-200 bg-${scen.result.color}-50 flex flex-col items-center text-center`}>
                <span className="text-sm text-gray-600 font-bold uppercase tracking-wider mb-2">Ownership Proof</span>
                <span className={`text-lg font-bold text-${scen.result.color}-600`}>{scen.result.ownership}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
