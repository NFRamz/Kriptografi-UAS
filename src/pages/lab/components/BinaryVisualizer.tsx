import React from 'react';
import { Binary, ArrowRight } from 'lucide-react';
import { LabData } from '../SecurityLab';

export const BinaryVisualizer = ({ data }: { data: LabData }) => {
  // Take first 16 characters for visual demo to avoid overwhelming UI
  const previewChars = data.ciphertext.substring(0, 16).split('');
  
  return (
    <div className="glass-card p-8 border border-gray-200 rounded-3xl bg-white/50 backdrop-blur-xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Binary className="text-accent w-6 h-6" /> Section 2: Binary Conversion
        </h2>
        <p className="text-gray-600 mt-2">Setiap karakter Ciphertext dipecah menjadi nilai ASCII dan dikonversi menjadi urutan Biner (8-bit) sebelum disisipkan ke piksel gambar.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="py-4 px-6 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 rounded-tl-xl w-1/4">Character</th>
              <th className="py-4 px-6 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 w-1/4">ASCII Decimal</th>
              <th className="py-4 px-6 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 rounded-tr-xl">Binary (8-bit)</th>
            </tr>
          </thead>
          <tbody>
            {previewChars.map((char, index) => {
              const ascii = char.charCodeAt(0);
              const binary = ascii.toString(2).padStart(8, '0');
              return (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 font-mono text-lg font-bold text-gray-900">
                    <span className="bg-white border border-gray-200 px-3 py-1 rounded-md shadow-sm">{char}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3 text-gray-600">
                      <ArrowRight className="w-4 h-4 text-gray-300"/>
                      <span className="font-mono text-gray-700">{ascii}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <ArrowRight className="w-4 h-4 text-gray-300"/>
                      <span className="font-mono text-accent tracking-widest font-bold">{binary}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {data.ciphertext.length > 16 && (
          <div className="text-center py-4 text-gray-500 text-sm border-t border-gray-100 bg-gray-50 rounded-b-xl">
            ... dan {data.ciphertext.length - 16} karakter lainnya
          </div>
        )}
      </div>
      
      <div className="mt-8 bg-accent/5 border border-accent/20 p-6 rounded-2xl">
        <h4 className="font-bold text-gray-900 mb-2">Total Panjang Biner</h4>
        <p className="text-gray-700 font-mono text-sm break-all line-clamp-3">
          {data.binaryStr.substring(0, 300)}... <span className="text-accent font-bold">({data.binaryStr.length.toLocaleString()} bits total)</span>
        </p>
      </div>
    </div>
  );
};
