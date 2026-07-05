import React, { useState, useRef } from 'react';
import { ShieldCheck, Upload, Key, Loader2, FileImage, ShieldAlert, CheckCircle, FileText, ArrowRight, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { LSBSteganography } from '../../lib/stego';
import { AESCrypto, MetadataPayload } from '../../lib/crypto';
import toast from 'react-hot-toast';
// Removed @react-pdf/renderer due to Vite polyfill crashing
// Will use window.print() instead for the report generation
export const VerificationCenter = () => {
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Asset
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Extraction & Decryption
  const [extractedCiphertext, setExtractedCiphertext] = useState<string | null>(null);
  const [aesKeyInput, setAesKeyInput] = useState('');
  const [metadata, setMetadata] = useState<MetadataPayload | null>(null);

  // Results
  const [verificationStatus, setVerificationStatus] = useState<'Verified Original' | 'Not Verified' | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setStep(1);
      setExtractedCiphertext(null);
      setMetadata(null);
      setVerificationStatus(null);
    } else {
      toast.error('Harap unggah gambar PNG atau JPEG yang valid');
    }
  };

  const extractHiddenData = async () => {
    if (!imagePreview) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image into memory'));
        img.src = imagePreview;
      });

      // Ensure width/height are strictly positive to prevent Canvas IndexSizeError
      if (!img.naturalWidth || !img.naturalHeight) {
        throw new Error('Image has invalid dimensions');
      }

      const { text } = await LSBSteganography.extractData(img);

      // Safety: Prevent browser freeze by truncating absurdly long noise strings
      // Legitimate AES ciphertext for our JSON is rarely over 1000 characters.
      const safeText = text.length > 10000 ? text.substring(0, 10000) : text;

      setExtractedCiphertext(safeText);
      setStep(2);
      toast.success('Data tersembunyi berhasil diekstrak!');
    } catch (error: any) {
      toast.error(error?.message || 'Gagal mengekstrak. Gambar mungkin tidak terproteksi.');
      setVerificationStatus('Not Verified');
      setStep(4);
      logVerification('Not Verified', null);
    } finally {
      setIsProcessing(false);
    }
  };

  const decryptData = () => {
    if (!extractedCiphertext || !aesKeyInput) {
      toast.error('Kunci AES diperlukan untuk mendekripsi metadata');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      try {
        // Aggressively clean strings from any invisible characters, whitespaces, or BOMs
        const cleanCiphertext = extractedCiphertext.replace(/[^A-Za-z0-9+/=]/g, '');
        const cleanKey = aesKeyInput.replace(/[^0-9a-fA-F]/g, '');
        
        if (!cleanCiphertext || !cleanKey) {
            throw new Error('Data ciphertext atau kunci tidak valid setelah dibersihkan.');
        }

        const decoded = AESCrypto.decryptMetadata(cleanCiphertext, cleanKey);
        setMetadata(decoded);
        setVerificationStatus('Verified Original');
        setStep(4);
        toast.success('Kepemilikan Berhasil Diverifikasi!');
        logVerification('Verified Original', decoded);
      } catch (error: any) {
        console.error('Decryption error details:', error);
        toast.error('Dekripsi gagal: Kunci salah atau data telah dimanipulasi');
        setVerificationStatus('Not Verified');
        setStep(4);
        logVerification('Not Verified', null);
      } finally {
        setIsProcessing(false);
      }
    }, 1000); // Simulate crypto delay for visualization
  };

  const logVerification = async (status: string, meta: MetadataPayload | null) => {
    if (!user) return; // Only log if authenticated

    try {
      // DEMO MODE: Bypass actual database insertion for presentation
      /*
      let uploadedUrl = '';
      if (imageFile) {
        const filePath = `${user.id}/${Date.now()}_verify_${imageFile.name}`;
        await supabase.storage.from('verification-uploads').upload(filePath, imageFile);
        uploadedUrl = filePath;
      }

      await supabase.from('verification_logs').insert({
        verifier_id: user.id,
        uploaded_image_url: uploadedUrl,
        status,
        extracted_metadata: meta as any
      });
      */
    } catch (e) {
      console.error('Failed to log verification', e);
    }
  };

  const generateReport = async () => {
    if (!verificationStatus) return;
    setIsGeneratingPdf(true);
    try {
      window.print();
      toast.success('Dialog cetak berhasil dibuka');
    } catch (error) {
      toast.error('Gagal membuka dialog cetak');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-4 bg-accent/20 rounded-2xl border border-accent/40 shadow-[0_0_30px_rgba(176,38,255,0.3)]">
          <ShieldCheck className="w-10 h-10 text-accent drop-shadow-[0_0_10px_rgba(176,38,255,0.8)]" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight drop-shadow-md">Pusat Verifikasi Kepemilikan</h1>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Column: Actions */}
        <div className="space-y-8">
          <div className={`glass-card p-8 rounded-3xl border ${step >= 1 ? 'border-primary/50 shadow-[0_0_20px_rgba(0,240,255,0.1)]' : 'border-gray-200'} transition-all duration-500`}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">1</span>
              Unggah Aset Mencurigakan
            </h2>
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[250px] hover:border-primary/50 transition-colors bg-gray-50">
              {imagePreview ? (
                <div className="space-y-6 flex flex-col items-center w-full">
                  <img ref={imageRef} src={imagePreview} alt="Target" className="max-h-48 rounded-xl shadow-2xl ring-1 ring-white/10" />
                  <label className="text-sm font-semibold px-4 py-2 bg-white border border-gray-200 rounded-lg text-primary hover:bg-primary hover:text-white cursor-pointer transition-colors shadow-lg">
                    Ganti Gambar
                    <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageUpload} />
                  </label>
                  {step === 1 && (
                    <button onClick={extractHiddenData} disabled={isProcessing} className="w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-6 py-4 mt-2 transition-all flex justify-center items-center gap-3 shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:-translate-y-1">
                      {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Ekstrak Data Tersembunyi'}
                    </button>
                  )}
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Upload className="w-8 h-8 text-gray-600" />
                  </div>
                  <span className="text-gray-900 font-semibold text-lg">Klik untuk mengunggah gambar</span>
                  <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </div>

          <div className={`glass-card p-8 rounded-3xl border ${step >= 2 ? 'border-accent/50 shadow-[0_0_20px_rgba(176,38,255,0.1)]' : 'border-gray-200 opacity-50 pointer-events-none'} transition-all duration-500`}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm">2</span>
              Dekripsi AES-256
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Masukkan Kunci Rahasia</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={aesKeyInput}
                    onChange={(e) => setAesKeyInput(e.target.value)}
                    placeholder="Masukkan kunci dekripsi AES-256"
                    className="w-full bg-white border border-gray-200 rounded-xl pl-12 px-5 py-4 text-gray-900 focus:border-accent focus:ring-2 focus:ring-accent/50 transition-all shadow-inner text-lg"
                  />
                </div>
              </div>
              <button onClick={decryptData} disabled={isProcessing || !aesKeyInput} className="w-full bg-gradient-to-r from-accent to-purple-500 hover:opacity-90 text-white font-bold rounded-xl px-6 py-4 transition-all shadow-[0_0_20px_rgba(176,38,255,0.4)] disabled:opacity-50 flex items-center justify-center gap-3 hover:-translate-y-1">
                {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Dekripsi Metadata'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Visualization & Results */}
        <div className="space-y-8">
          <div className="glass-card p-8 border border-gray-200 rounded-3xl relative overflow-hidden min-h-[300px]">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <FileImage className="w-6 h-6 text-gray-600" />
              Lini Masa Ekstraksi
            </h2>

            {step === 1 && !isProcessing && (
              <div className="h-48 flex items-center justify-center text-gray-500 italic text-lg">
                Unggah gambar untuk memulai verifikasi
              </div>
            )}

            {(step >= 2 || isProcessing) && (
              <div className="space-y-8 relative ml-2">
                <div className="absolute left-4 top-5 bottom-5 w-1 bg-gradient-to-b from-primary via-accent to-transparent opacity-30 z-0 rounded-full"></div>

                <div className="relative z-10 flex items-start gap-6">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors duration-500 ${step >= 2 ? 'bg-primary text-white shadow-[0_0_15px_rgba(0,240,255,0.5)] scale-110' : 'bg-gray-800 text-gray-500'}`}>
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-bold text-lg">Ekstrak Data LSB</p>
                    {step >= 2 && extractedCiphertext && (
                      <div className="mt-3 bg-white border border-primary/20 p-4 rounded-xl text-xs text-primary font-mono line-clamp-3 shadow-inner">
                        {extractedCiphertext}
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative z-10 flex items-start gap-6">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors duration-500 ${step >= 4 ? (verificationStatus === 'Verified Original' ? 'bg-accent text-white shadow-[0_0_15px_rgba(176,38,255,0.5)] scale-110' : 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] scale-110') : 'bg-gray-800 text-gray-500'}`}>
                    {step >= 4 && verificationStatus === 'Not Verified' ? <ShieldAlert className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-bold text-lg">Dekripsi AES-256</p>
                    {step >= 4 && metadata && (
                      <div className="mt-3 bg-white border border-accent/20 p-4 rounded-xl text-xs text-accent font-mono overflow-auto max-h-40 shadow-inner">
                        <pre>{JSON.stringify(metadata, null, 2)}</pre>
                      </div>
                    )}
                    {step >= 4 && !metadata && (
                      <div className="mt-3 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-sm font-semibold">Dekripsi Gagal - Kunci Tidak Valid</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {step >= 4 && verificationStatus && (
            <div className={`glass-card p-8 border rounded-3xl animate-in fade-in slide-in-from-bottom-8 duration-700 shadow-2xl relative overflow-hidden ${verificationStatus === 'Verified Original' ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-50'}`}>
              <div className={`absolute top-0 left-0 w-full h-1 ${verificationStatus === 'Verified Original' ? 'bg-gradient-to-r from-transparent via-green-500 to-transparent' : 'bg-gradient-to-r from-transparent via-red-500 to-transparent'}`}></div>
              <div className="flex flex-col items-center text-center mb-8 mt-2">
                {verificationStatus === 'Verified Original' ? (
                  <ShieldCheck className="w-20 h-20 text-green-600 mb-4 drop-shadow-[0_0_20px_rgba(74,222,128,0.5)]" />
                ) : (
                  <ShieldAlert className="w-20 h-20 text-red-600 mb-4 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
                )}
                <h2 className={`text-3xl font-extrabold tracking-tight ${verificationStatus === 'Verified Original' ? 'text-green-600' : 'text-red-600'}`}>
                  {verificationStatus === 'Verified Original' ? 'Terverifikasi Asli' : 'Tidak Terverifikasi'}
                </h2>
              </div>

              {metadata && (
                <div className="space-y-4 text-base mb-8 border-t border-gray-200 pt-6">
                  <div className="flex justify-between items-center"><span className="text-gray-600">Nama Pemilik</span> <span className="text-gray-900 font-bold bg-gray-50 px-3 py-1 rounded-md">{metadata.owner_name}</span></div>
                  <div className="flex justify-between items-center"><span className="text-gray-600">Jenis Aset</span> <span className="text-gray-900 font-bold">{metadata.asset_type}</span></div>
                  <div className="flex justify-between items-center"><span className="text-gray-600">Tanggal Dibuat</span> <span className="text-gray-900 font-bold">{new Date(metadata.timestamp).toLocaleDateString('id-ID')}</span></div>
                  <div className="flex flex-col mt-4"><span className="text-gray-600 mb-2">Catatan Hak Cipta</span> <span className="text-gray-700 italic bg-white p-3 rounded-xl text-sm leading-relaxed border border-gray-100">{metadata.copyright_note}</span></div>
                </div>
              )}

              <button
                onClick={generateReport}
                disabled={isGeneratingPdf}
                className="w-full flex items-center justify-center gap-3 py-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-900 font-bold rounded-xl transition-all shadow-lg hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:-translate-y-1"
              >
                {isGeneratingPdf ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileText className="w-6 h-6" />}
                Hasilkan Laporan Verifikasi (PDF)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
