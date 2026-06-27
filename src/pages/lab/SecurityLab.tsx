import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Upload, Loader2, Key, Database, ChevronDown } from 'lucide-react';
import { AESCrypto, MetadataPayload } from '../../lib/crypto';
import { LSBSteganography, EmbeddingResult } from '../../lib/stego';
import { ImageComparator, ComparisonResult } from '../../lib/image-compare';
import toast from 'react-hot-toast';

import { AesVisualizer } from './components/AesVisualizer';
import { BinaryVisualizer } from './components/BinaryVisualizer';
import { LsbVisualizer } from './components/LsbVisualizer';
import { EmbeddingStats } from './components/EmbeddingStats';
import { ImageComparison } from './components/ImageComparison';
import { DiffAnalyzer } from './components/DiffAnalyzer';
import { VerificationTimeline } from './components/VerificationTimeline';
import { AttackSimulation } from './components/AttackSimulation';

export interface LabData {
  originalImage: HTMLImageElement;
  originalImageUrl: string;
  protectedImageUrl: string;
  diffImageUrl: string;
  metadata: MetadataPayload;
  aesKey: string;
  ciphertext: string;
  binaryStr: string;
  comparisonResult: ComparisonResult;
  embeddingResult: EmbeddingResult;
}

export const SecurityLab = () => {
  const [labData, setLabData] = useState<LabData | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  
  // Init Form State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [owner, setOwner] = useState('Naufal Ramzi_202310370311026');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      if (!title) setTitle(file.name.split('.')[0]);
    } else {
      toast.error('Harap unggah gambar PNG atau JPEG yang valid');
    }
  };

  const initializeLab = async () => {
    if (!imagePreview || !title || !owner) return;
    setIsInitializing(true);
    setLoadingStep('Memuat gambar original...');
    
    try {
      // 1. Load Original Image
      await new Promise(r => setTimeout(r, 600)); // Visual delay
      const origImg = new Image();
      origImg.crossOrigin = 'Anonymous';
      await new Promise((resolve, reject) => {
        origImg.onload = resolve;
        origImg.onerror = reject;
        origImg.src = imagePreview;
      });

      // 2. AES Crypto
      setLoadingStep('Membangun Metadata & Melakukan Enkripsi AES-256...');
      await new Promise(r => setTimeout(r, 800)); // Visual delay
      
      const aesKey = AESCrypto.generateSecureKey();
      const metadata: MetadataPayload = {
        owner_name: owner,
        asset_id: crypto.randomUUID(),
        asset_type: 'Lab Test',
        timestamp: new Date().toISOString(),
        copyright_note: `© ${new Date().getFullYear()} ${owner}. Hak Cipta Dilindungi.`,
        verification_hash: AESCrypto.generateHash(title + Date.now().toString())
      };
      const ciphertext = AESCrypto.encryptMetadata(metadata, aesKey);

      // 3. Binary Conversion
      setLoadingStep('Mengonversi Ciphertext ke deret Biner...');
      await new Promise(r => setTimeout(r, 600)); // Visual delay
      
      const binaryArr = LSBSteganography.stringToBinary(ciphertext);
      const binaryStr = binaryArr.join('');

      // 4. LSB Embedding
      setLoadingStep('Menyisipkan Biner ke LSB piksel gambar...');
      await new Promise(r => setTimeout(r, 800)); // Visual delay
      
      const embeddingResult = await LSBSteganography.embedData(origImg, ciphertext);

      // 5. Load Protected Image for Comparison
      const protImg = new Image();
      protImg.crossOrigin = 'Anonymous';
      await new Promise((resolve, reject) => {
        protImg.onload = resolve;
        protImg.onerror = reject;
        protImg.src = embeddingResult.dataUrl;
      });

      // 6. Diff Mapping
      setLoadingStep('Menganalisis Distorsi Piksel (Peta Perbedaan)...');
      await new Promise(r => setTimeout(r, 800)); // Visual delay
      
      const comparisonResult = await ImageComparator.compareImages(origImg, protImg);

      setLoadingStep('Menyiapkan Visualisasi Lab...');
      await new Promise(r => setTimeout(r, 400)); // Visual delay

      setLabData({
        originalImage: origImg,
        originalImageUrl: imagePreview,
        protectedImageUrl: embeddingResult.dataUrl,
        diffImageUrl: comparisonResult.diffDataUrl,
        metadata,
        aesKey,
        ciphertext,
        binaryStr,
        comparisonResult,
        embeddingResult
      });
      
      toast.success('Lab Environment Initialized successfully!');
    } catch (error: any) {
      toast.error('Gagal menginisialisasi lab: ' + error.message);
    } finally {
      setIsInitializing(false);
      setLoadingStep(null);
    }
  };

  if (!labData) {
    return (
      <>
        <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-primary/10 rounded-2xl border border-primary/20 mb-6">
            <Database className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Security Visualization Lab</h1>
          <p className="text-gray-600 mt-4 text-lg max-w-2xl mx-auto">
            Pelajari cara kerja internal DigiProof. Modul ini mendemonstrasikan secara visual proses Kriptografi AES-256 dan Steganografi LSB secara step-by-step menggunakan data nyata.
          </p>
        </div>

        <div className="glass-card p-10 w-full rounded-3xl border border-gray-200 bg-white/50 backdrop-blur-xl shadow-xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">1</span>
            Inisialisasi Data Lab
          </h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors relative h-64">
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="max-h-full object-contain rounded" />
                    <label className="absolute inset-0 bg-black/50 text-white opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity rounded-xl font-medium">
                      Ganti Gambar
                      <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageUpload} />
                    </label>
                  </>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                    <span className="text-gray-900 font-medium">Unggah Gambar Uji Coba</span>
                    <span className="text-sm text-gray-500">PNG atau JPEG</span>
                    <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
              <div className="space-y-4 flex flex-col justify-center">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Judul Aset Simulasi</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-gray-900" placeholder="Contoh: Desain Rahasia" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Pemilik Data</label>
                  <input type="text" value={owner} onChange={(e) => setOwner(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-gray-900" />
                </div>
              </div>
            </div>

              <button 
                onClick={initializeLab}
                disabled={!imageFile || !title || isInitializing}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-6 py-4 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(0,150,200,0.3)] hover:-translate-y-1 mt-4 text-lg"
              >
                <Key className="w-6 h-6"/> Initialize Lab Engine
              </button>
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        {isInitializing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md">
            <div className="bg-white p-8 rounded-2xl shadow-2xl border border-primary/20 flex flex-col items-center max-w-md w-full text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Database className="w-6 h-6 text-primary animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Memproses Lab Engine...</h3>
              <div className="h-8 flex items-center justify-center">
                <p className="text-sm font-semibold text-accent animate-pulse">{loadingStep}</p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 space-y-24">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Security Visualization Lab</h1>
        <p className="text-gray-600 mt-2 text-lg">Menganalisis hasil nyata dari proses AES-256 dan Steganografi LSB</p>
        <motion.div 
          animate={{ y: [0, 10, 0] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex justify-center mt-8 text-primary"
        >
          <ChevronDown className="w-8 h-8" />
        </motion.div>
      </div>

      {/* Sections */}
      <section id="section-1">
        <AesVisualizer data={labData} />
      </section>

      <section id="section-2">
        <BinaryVisualizer data={labData} />
      </section>

      <section id="section-3">
        <LsbVisualizer data={labData} />
      </section>

      <section id="section-4">
        <EmbeddingStats data={labData} />
      </section>

      <section id="section-5">
        <ImageComparison data={labData} />
      </section>

      <section id="section-6">
        <DiffAnalyzer data={labData} />
      </section>

      <section id="section-7">
        <VerificationTimeline data={labData} />
      </section>

      <section id="section-8">
        <AttackSimulation data={labData} />
      </section>
      
      <div className="pb-20 text-center text-gray-500 font-medium">
        -- End of Visualization Lab --
      </div>
    </div>
  );
};
