import React from 'react';
import { Activity, PieChart } from 'lucide-react';
import { LabData } from '../SecurityLab';

export const EmbeddingStats = ({ data }: { data: LabData }) => {
  const { totalBits, modifiedPixels, capacity } = data.embeddingResult;
  const capacityUsedPercent = ((totalBits / capacity) * 100).toFixed(4);

  return (
    <div className="glass-card p-8 border border-gray-200 rounded-3xl bg-white/50 backdrop-blur-xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Activity className="text-green-500 w-6 h-6" /> Section 4: Embedding Statistics
        </h2>
        <p className="text-gray-600 mt-2">Data statistik dari proses penyisipan yang menunjukkan seberapa efisien algoritma memanfaatkan kapasitas gambar.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-2">Total Ciphertext</p>
          <p className="text-3xl font-extrabold text-gray-900">{data.ciphertext.length} <span className="text-lg font-normal text-gray-500">chars</span></p>
        </div>
        
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-2">Total Biner / Payload</p>
          <p className="text-3xl font-extrabold text-gray-900">{totalBits.toLocaleString()} <span className="text-lg font-normal text-gray-500">bits</span></p>
        </div>

        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-2">Piksel Dimodifikasi</p>
          <p className="text-3xl font-extrabold text-red-500">{modifiedPixels.toLocaleString()}</p>
        </div>

        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-2">Kapasitas Maksimal</p>
          <p className="text-3xl font-extrabold text-primary">{capacity.toLocaleString()} <span className="text-lg font-normal text-gray-500">bits</span></p>
        </div>
      </div>

      <div className="mt-8 bg-white border border-gray-100 p-8 rounded-2xl">
        <div className="flex justify-between items-end mb-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2"><PieChart className="w-5 h-5 text-accent"/> Penggunaan Kapasitas (Capacity Usage)</h3>
          <span className="text-2xl font-bold text-accent">{capacityUsedPercent}%</span>
        </div>
        <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out"
            style={{ width: `${Math.max(1, parseFloat(capacityUsedPercent))}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">Meskipun {totalBits.toLocaleString()} bit disisipkan, ini hanya mengambil {capacityUsedPercent}% dari total ruang LSB yang tersedia, memastikan distorsi visual yang sangat minimal.</p>
      </div>
    </div>
  );
};
