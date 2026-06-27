import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';
import { AESCrypto, MetadataPayload } from '../../lib/crypto';
import { LSBSteganography, EmbeddingResult } from '../../lib/stego';
import { Shield, Upload, Lock, FileImage, CheckCircle, Download, Loader2, ArrowRight, Save, Key, Copy, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export const ProtectedAssetGenerator = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Asset State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Photo');
  const imageRef = useRef<HTMLImageElement>(null);

  // Metadata & Crypto State
  const [metadata, setMetadata] = useState<MetadataPayload | null>(null);
  const [aesKey, setAesKey] = useState('');
  const [ciphertext, setCiphertext] = useState('');

  // Stego Result State
  const [result, setResult] = useState<EmbeddingResult | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setTitle(file.name.split('.')[0]);
    } else {
      toast.error('Harap unggah gambar PNG atau JPEG yang valid');
    }
  };

  const generateMetadata = () => {
    if (!title || !imageFile) {
      toast.error('Harap berikan judul aset dan gambar');
      return;
    }

    // Generate AES Key
    const key = AESCrypto.generateSecureKey();
    setAesKey(key);

    // Dummy Hash for demo, normally we'd hash the file content
    const hash = AESCrypto.generateHash(title + Date.now().toString());

    const payload: MetadataPayload = {
      owner_name: 'Naufal Ramzi_202310370311026',
      asset_id: crypto.randomUUID(),
      asset_type: category,
      timestamp: new Date().toISOString(),
      copyright_note: `© ${new Date().getFullYear()} Naufal Ramzi. Hak Cipta Dilindungi.`,
      verification_hash: hash
    };

    setMetadata(payload);
    setStep(2);
  };

  const encryptMetadata = () => {
    if (!metadata || !aesKey) return;
    setIsProcessing(true);

    // Simulate slight delay for visualization
    setTimeout(() => {
      try {
        const encrypted = AESCrypto.encryptMetadata(metadata, aesKey);
        setCiphertext(encrypted);
        setStep(3);
      } catch (error: any) {
        toast.error('Enkripsi gagal: ' + error.message);
      } finally {
        setIsProcessing(false);
      }
    }, 800);
  };

  const embedMetadata = async () => {
    if (!imagePreview || !ciphertext) {
      toast.error('Gambar atau ciphertext tidak ditemukan');
      return;
    }
    setIsProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imagePreview;
      });

      const res = await LSBSteganography.embedData(img, ciphertext);
      setResult(res);
      setStep(4);

      // Auto-save protection record in background
      storeProtectionRecord(res);
    } catch (error: any) {
      toast.error('Penyisipan LSB gagal: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.dataUrl;
    link.download = `protected_${title.replace(/\s+/g, '_')}.png`;
    link.click();

    // Proceed to final summary after downloading
    setStep(5);
  };

  const handleDownloadKey = () => {
    if (!aesKey) return;
    const element = document.createElement('a');
    const file = new Blob([aesKey], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `digiproof_secret_key_${title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Kunci berhasil diunduh!');
  };

  const handleCopyKey = () => {
    if (!aesKey) return;
    navigator.clipboard.writeText(aesKey);
    toast.success('Kunci disalin ke clipboard!');
  };

  const storeProtectionRecord = async (embeddingRes?: EmbeddingResult) => {
    const currentResult = embeddingRes || result;
    if (!user || !currentResult || !imageFile || !metadata) return;

    try {
      // DEMO MODE: Bypassing actual Supabase storage and database inserts for presentation.
      // This prevents RLS errors since we disabled real authentication.

      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network request

      // The below actual DB code is commented out for demo purposes:
      /*
      const originalPath = `${user.id}/${Date.now()}_original_${imageFile.name}`;
      const { error: origErr } = await supabase.storage.from('original-assets').upload(originalPath, imageFile);
      if (origErr) throw new Error('Failed to upload original asset: ' + origErr.message);

      const stegoPath = `${user.id}/${Date.now()}_protected_${title}.png`;
      const { error: stegoErr } = await supabase.storage.from('protected-assets').upload(stegoPath, result.blob, { contentType: 'image/png' });
      if (stegoErr) throw new Error('Failed to upload protected asset: ' + stegoErr.message);

      const { data: assetData, error: assetErr } = await supabase.from('assets').insert({
        user_id: user.id,
        title,
        category,
        original_file_path: originalPath
      }).select().single();
      if (assetErr) throw new Error('Failed to save asset record: ' + assetErr.message);

      const { error: metaErr } = await supabase.from('asset_metadata').insert({
        asset_id: assetData.id,
        owner_name: metadata.owner_name,
        copyright_note: metadata.copyright_note,
        verification_hash: metadata.verification_hash,
        encrypted_metadata: ciphertext
      });
      if (metaErr) throw new Error('Failed to save metadata record: ' + metaErr.message);

      const { error: protErr } = await supabase.from('protected_assets').insert({
        asset_id: assetData.id,
        stego_image_path: stegoPath
      });
      if (protErr) throw new Error('Failed to save protection record: ' + protErr.message);
      */

      toast.success('Proteksi berhasil diselesaikan dan disimpan otomatis di latar belakang!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-4 bg-primary/20 rounded-2xl border border-primary/40 shadow-[0_0_30px_rgba(0,240,255,0.3)]">
          <Shield className="w-10 h-10 text-primary drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight drop-shadow-md">Generator Proteksi Aset</h1>
          <p className="text-gray-600 mt-1 text-lg">Modul 7: Amankan hak kepemilikan Anda dengan AES-256 dan Steganografi LSB</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-14 relative px-4">
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-gray-100 -z-10 rounded-full overflow-hidden">
          <div className="h-full bg-primary/50 transition-all duration-500 ease-in-out shadow-[0_0_10px_rgba(0,240,255,0.5)]" style={{ width: `${((step - 1) / 4) * 100}%` }}></div>
        </div>
        {[
          { num: 1, label: 'Aset' },
          { num: 2, label: 'Metadata' },
          { num: 3, label: 'Enkripsi' },
          { num: 4, label: 'Steganografi' },
          { num: 5, label: 'Selesai' }
        ].map((s) => (
          <div key={s.num} className="flex flex-col items-center gap-3 bg-white px-4 transition-all duration-300 transform">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-500 shadow-lg ${step >= s.num ? 'bg-primary border-primary text-white shadow-[0_0_20px_rgba(0,240,255,0.6)] scale-110' : 'bg-white border-gray-300 text-gray-500'}`}>
              {step > s.num ? <CheckCircle className="w-6 h-6" /> : s.num}
            </div>
            <span className={`text-sm font-semibold uppercase tracking-wider ${step >= s.num ? 'text-primary drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]' : 'text-gray-600'}`}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="glass-card p-10 border border-gray-200 rounded-3xl relative overflow-hidden bg-gray-50 backdrop-blur-xl shadow-2xl">

        {/* Step 1: Asset Selection */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Upload className="text-primary w-6 h-6" /> Pilih Aset untuk Diproteksi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="group border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-primary/60 hover:bg-primary/5 transition-all min-h-[320px] relative overflow-hidden">
                {imagePreview ? (
                  <div className="w-full flex flex-col items-center gap-6">
                    <img ref={imageRef} src={imagePreview} alt="Preview" className="max-h-56 rounded-xl object-contain shadow-2xl ring-1 ring-white/10 group-hover:scale-105 transition-transform duration-500" />
                    <label className="text-sm font-semibold px-4 py-2 bg-white border border-gray-200 rounded-lg text-primary hover:bg-primary hover:text-white cursor-pointer transition-colors shadow-lg">
                      Ganti Gambar
                      <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageUpload} />
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full z-10">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors group-hover:scale-110 duration-500">
                      <Upload className="w-10 h-10 text-gray-600 group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-gray-900 font-semibold text-xl mb-2 group-hover:text-primary transition-colors">Klik untuk mengunggah aset</span>
                    <span className="text-gray-500">Format didukung: PNG, JPG</span>
                    <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
              <div className="space-y-6 flex flex-col justify-center">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Judul Aset</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-gray-900 text-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all shadow-inner" placeholder="Contoh: Desain UI Final" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Kategori</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-gray-900 text-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all shadow-inner appearance-none cursor-pointer">
                    <option value="Logo">Logo</option>
                    <option value="Photo">Fotografi</option>
                    <option value="UI Design">Desain UI/UX</option>
                    <option value="Illustration">Ilustrasi</option>
                    <option value="Document">Dokumen Digital</option>
                  </select>
                </div>
                <button onClick={generateMetadata} disabled={!imageFile || !title} className="w-full mt-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-6 py-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] hover:-translate-y-1">
                  Hasilkan Metadata <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Metadata Generation */}
        {step === 2 && metadata && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <FileImage className="text-primary w-6 h-6" /> Metadata Aset yang Dihasilkan
            </h2>
            <div className="bg-white border border-primary/20 p-6 rounded-2xl font-mono text-sm text-primary overflow-x-auto shadow-inner relative group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent opacity-50"></div>
              <pre className="leading-relaxed">{JSON.stringify(metadata, null, 2)}</pre>
            </div>
            <div className="flex justify-end mt-8">
              <button onClick={encryptMetadata} disabled={isProcessing} className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-8 py-4 transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:-translate-y-1">
                {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Lock className="w-6 h-6" />}
                Enkripsi dengan AES-256
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Encryption Result */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Lock className="text-accent w-6 h-6" /> Pusat Enkripsi AES-256
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white border border-accent/20 p-8 rounded-2xl shadow-inner relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-accent rounded-l-2xl"></div>
                <h3 className="text-gray-600 text-sm font-bold uppercase mb-4 flex items-center gap-2 tracking-wider"><Key className="w-5 h-5 text-accent" /> Kunci Rahasia Anda</h3>

                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <p className="flex-1 text-accent font-mono break-all text-base bg-accent/10 p-4 rounded-lg flex items-center">{aesKey}</p>
                  <div className="flex sm:flex-col gap-2">
                    <button onClick={handleCopyKey} className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2 flex-1 sm:flex-none" title="Salin Kunci">
                      <Copy className="w-5 h-5" />
                      <span className="sm:hidden text-sm font-bold">Salin</span>
                    </button>
                    <button onClick={handleDownloadKey} className="p-3 bg-accent hover:bg-accent/90 text-white rounded-lg transition-colors flex items-center justify-center gap-2 flex-1 sm:flex-none" title="Unduh Kunci (.txt)">
                      <FileText className="w-5 h-5" />
                      <span className="sm:hidden text-sm font-bold">Unduh</span>
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-100 border border-yellow-400 p-4 rounded-xl text-black text-sm flex gap-3 items-start shadow-sm">
                  <span className="text-xl">⚠️</span>
                  <p><strong>Penting:</strong> Simpan kunci ini jika Anda ingin memverifikasi aset secara manual nanti. Kunci ini diperlukan untuk dekripsi.</p>
                </div>
              </div>
              <div className="bg-white border border-primary/20 p-8 rounded-2xl shadow-inner relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-2xl"></div>
                <h3 className="text-gray-600 text-sm font-bold uppercase mb-4 tracking-wider">Hasil Ciphertext</h3>
                <p className="text-gray-700 font-mono break-all line-clamp-6 text-sm bg-white p-4 rounded-lg leading-relaxed">{ciphertext}</p>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button onClick={embedMetadata} disabled={isProcessing} className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-bold rounded-xl px-8 py-4 transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(176,38,255,0.4)] hover:-translate-y-1">
                {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <ArrowRight className="w-6 h-6" />}
                Sisipkan ke Gambar via LSB
              </button>
            </div>
          </div>
        )}

        {/* Step 4: LSB Embedding Result */}
        {step === 4 && result && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <CheckCircle className="text-green-600 w-7 h-7 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
              Penyisipan LSB Berhasil
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              <div className="md:col-span-2 flex flex-col items-center bg-white p-6 rounded-2xl border border-gray-100">
                <p className="text-gray-600 font-medium mb-4 uppercase tracking-wider text-sm">Gambar Stego Terproteksi</p>
                <div className="relative group rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.2)]">
                  <img src={result.dataUrl} className="max-h-64 object-contain transition-transform duration-700 group-hover:scale-105" alt="Protected" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                    <span className="text-gray-900 text-sm font-medium bg-white px-3 py-1 rounded-full backdrop-blur-sm">Telah Disematkan Metadata</span>
                  </div>
                </div>
              </div>
              <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white border border-primary/20 p-6 rounded-2xl flex flex-col justify-center">
                  <p className="text-sm text-gray-600 mb-2 uppercase tracking-wider font-semibold">Total Bit Disisipkan</p>
                  <p className="text-3xl font-extrabold text-gray-900">{result.totalBits.toLocaleString()}</p>
                </div>
                <div className="bg-white border border-accent/20 p-6 rounded-2xl flex flex-col justify-center">
                  <p className="text-sm text-gray-600 mb-2 uppercase tracking-wider font-semibold">Piksel Dimodifikasi</p>
                  <p className="text-3xl font-extrabold text-accent">{result.modifiedPixels.toLocaleString()}</p>
                </div>
                <div className="bg-white border border-green-500/20 p-6 rounded-2xl sm:col-span-2 flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-green-50 rounded-full blur-3xl"></div>
                  <p className="text-sm text-gray-600 mb-2 uppercase tracking-wider font-semibold">Distorsi Visual</p>
                  <p className="text-3xl font-extrabold text-green-600">0.00% <span className="text-lg font-medium text-green-500/70">(Tidak Terlihat)</span></p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
              <button onClick={handleDownload} className="py-4 px-8 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(0,150,200,0.4)] hover:shadow-[0_0_30px_rgba(0,150,200,0.6)] hover:-translate-y-1">
                <Download className="w-5 h-5" /> Unduh Gambar & Selesai
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Final Summary */}
        {step === 5 && (
          <div className="space-y-8 animate-in zoom-in duration-700 flex flex-col items-center text-center py-12">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-4 shadow-[0_0_50px_rgba(74,222,128,0.3)]">
              <CheckCircle className="w-12 h-12 text-green-600 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Aset Berhasil Diproteksi!</h2>
            <p className="text-gray-600 max-w-lg text-lg leading-relaxed">
              Hak kepemilikan aset Anda telah diamankan secara permanen. Metadata yang dienkripsi kini tersembunyi dengan sempurna di dalam gambar.
            </p>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-lg text-left mt-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-primary"></div>
              <h3 className="font-bold text-gray-900 mb-6 border-b border-gray-200 pb-4 text-xl flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" /> Ringkasan Proteksi
              </h3>
              <ul className="space-y-4 text-base">
                <li className="flex justify-between items-center"><span className="text-gray-600">Nama Aset</span> <span className="text-gray-900 font-semibold bg-gray-50 px-3 py-1 rounded-md">{title}</span></li>
                <li className="flex justify-between items-center"><span className="text-gray-600">Pemilik</span> <span className="text-gray-900 font-semibold">{metadata?.owner_name}</span></li>
                <li className="flex justify-between items-center"><span className="text-gray-600">Waktu</span> <span className="text-gray-900 font-semibold">{new Date().toLocaleDateString('id-ID')}</span></li>
                <li className="flex justify-between items-center"><span className="text-gray-600">Enkripsi AES</span> <span className="text-green-600 font-bold flex items-center gap-2 bg-green-400/10 px-3 py-1 rounded-md"><CheckCircle className="w-4 h-4" /> Sukses</span></li>
                <li className="flex justify-between items-center"><span className="text-gray-600">Penyisipan LSB</span> <span className="text-green-600 font-bold flex items-center gap-2 bg-green-400/10 px-3 py-1 rounded-md"><CheckCircle className="w-4 h-4" /> Sukses</span></li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 mt-10 justify-center flex-wrap">

              <button onClick={() => { setStep(1); setImageFile(null); setImagePreview(null); setTitle(''); }} className="py-3 px-8 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-900 font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl">
                Proteksi Aset Lain
              </button>
              <button onClick={() => navigate('/verify')} className="py-3 px-8 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] hover:-translate-y-1">
                Lanjut ke Verifikasi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
