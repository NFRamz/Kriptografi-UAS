import React, { useState, useRef, useEffect } from 'react';
import { Shield, Upload, Image as ImageIcon, Binary, Lock, Download, Save, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { LSBSteganography, EmbeddingResult } from '../../lib/stego';
import toast from 'react-hot-toast';

export const LSBCenter = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ciphertext, setCiphertext] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<EmbeddingResult | null>(null);
  const [binaryDataStr, setBinaryDataStr] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setResult(null); // reset result
    } else {
      toast.error('Please upload a valid PNG or JPEG image');
    }
  };

  const handleEmbed = async () => {
    if (!imageRef.current || !ciphertext) {
      toast.error('Please upload an image and enter ciphertext');
      return;
    }

    setIsProcessing(true);
    try {
      // Show binary conversion (Visualizer A)
      const binaryArr = LSBSteganography.stringToBinary(ciphertext);
      const binStr = binaryArr.join('');
      setBinaryDataStr(binStr);

      const res = await LSBSteganography.embedData(imageRef.current, ciphertext);
      setResult(res);
      toast.success('LSB Embedding successful!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to embed data');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.dataUrl;
    link.download = `protected_stego_${Date.now()}.png`;
    link.click();
  };

  const handleSaveToSupabase = async () => {
    if (!result) return;
    
    setIsUploading(true);
    try {
      const fileName = `stego_${Date.now()}.png`;
      const { data, error } = await supabase.storage
        .from('protected-assets')
        .upload(fileName, result.blob, {
          contentType: 'image/png',
          upsert: false
        });
        
      if (error) throw error;
      toast.success('Successfully saved to Supabase Storage!');
    } catch (error: any) {
      toast.error('Storage Upload Failed: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const formatBinaryByte = (val: number) => val.toString(2).padStart(8, '0');

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-accent/20 rounded-xl border border-accent/30">
          <Binary className="w-8 h-8 text-accent" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">LSB Steganography Center</h1>
          <p className="text-gray-600">Module 6: Hide encrypted metadata inside image pixels</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Inputs */}
        <div className="space-y-6">
          {/* Step 1: Image Upload */}
          <div className="glass-panel p-6 rounded-xl border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              Upload Cover Image
            </h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors">
              {imagePreview ? (
                <div className="space-y-4 w-full flex flex-col items-center">
                  <img 
                    ref={imageRef} 
                    src={imagePreview} 
                    alt="Cover" 
                    className="max-h-48 rounded-lg object-contain shadow-lg"
                  />
                  <label className="cursor-pointer text-sm text-primary hover:underline">
                    Change Image
                    <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageUpload} />
                  </label>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                  <ImageIcon className="w-12 h-12 text-gray-500 mb-2" />
                  <span className="text-gray-700 font-medium">Click to upload cover image</span>
                  <span className="text-gray-500 text-sm mt-1">PNG or JPEG supported</span>
                  <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </div>

          {/* Step 2: Ciphertext */}
          <div className="glass-panel p-6 rounded-xl border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              Input Ciphertext
            </h2>
            <textarea
              className="w-full h-32 bg-white border border-gray-200 rounded-lg p-4 text-gray-900 font-mono text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none"
              placeholder="e.g. U2FsdGVkX19H... (Encrypted Metadata from Module 5)"
              value={ciphertext}
              onChange={(e) => setCiphertext(e.target.value)}
            />
          </div>

          <button 
            onClick={handleEmbed}
            disabled={!imageFile || !ciphertext || isProcessing}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-bold rounded-xl px-6 py-4 shadow-[0_0_20px_rgba(176,38,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all text-lg"
          >
            {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Shield className="w-6 h-6" />}
            {isProcessing ? 'Embedding Data...' : 'Embed Data into Image'}
          </button>
        </div>

        {/* Right Column: Visualizers */}
        <div className="space-y-6">
          {/* Visualizer A: Binary Conversion Viewer */}
          <div className="glass-card p-6 border border-gray-200 rounded-xl relative overflow-hidden">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Binary className="w-5 h-5 text-accent" />
              Visualizer A: Binary Conversion
            </h2>
            {binaryDataStr ? (
              <div className="space-y-4">
                <div className="bg-white p-3 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1 uppercase font-bold tracking-wider">ASCII Input (Snippet)</p>
                  <p className="text-sm text-gray-700 font-mono truncate">{ciphertext}</p>
                </div>
                <div className="flex justify-center text-gray-500">
                  <ArrowRight className="w-5 h-5 rotate-90" />
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-100">
                  <p className="text-xs text-accent mb-1 uppercase font-bold tracking-wider">Binary Output (Snippet)</p>
                  <p className="text-xs text-accent font-mono break-all line-clamp-3 leading-relaxed">
                    {binaryDataStr}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-gray-600 italic">
                Awaiting embedding process...
              </div>
            )}
          </div>

          {/* Visualizer B: LSB Embedding Viewer */}
          <div className="glass-card p-6 border border-gray-200 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              Visualizer B: LSB Embedding
            </h2>
            {result ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="text-gray-600 font-medium text-sm">Original Pixel Byte</div>
                  <div className="text-primary font-medium text-sm">Modified Pixel Byte</div>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {result.sampleOriginal.map((orig, idx) => {
                    const mod = result.sampleModified[idx];
                    const origBin = formatBinaryByte(orig);
                    const modBin = formatBinaryByte(mod);
                    
                    // Highlight the last bit if changed
                    const isChanged = orig !== mod;
                    
                    return (
                      <div key={idx} className="grid grid-cols-2 gap-4 bg-white p-2 rounded border border-gray-100 font-mono text-sm text-center items-center">
                        <div className="text-gray-700 tracking-widest">{origBin}</div>
                        <div className={`tracking-widest flex justify-center ${isChanged ? 'text-primary' : 'text-gray-700'}`}>
                          <span>{modBin.slice(0, 7)}</span>
                          <span className={isChanged ? 'bg-primary/30 font-bold px-1 rounded text-white' : ''}>{modBin[7]}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">Showing first 8 modified bytes (RGB channels)</p>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-gray-600 italic">
                Awaiting embedding process...
              </div>
            )}
          </div>

          {/* Visualizer C: Embedding Statistics */}
          <div className="glass-card p-6 border border-gray-200 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Visualizer C: Embedding Statistics
            </h2>
            {result ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-600 uppercase">Total Bits Embedded</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{result.totalBits.toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-600 uppercase">Modified Pixels</p>
                  <p className="text-xl font-bold text-accent mt-1">{result.modifiedPixels.toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-600 uppercase">Capacity Used</p>
                  <p className="text-xl font-bold text-primary mt-1">
                    {((result.totalBits / result.capacity) * 100).toFixed(2)}%
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-600 uppercase">Total Capacity</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{(result.capacity).toLocaleString()} bits</p>
                </div>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-gray-600 italic">
                Awaiting embedding process...
              </div>
            )}
          </div>
          
          {/* Output Actions */}
          {result && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <button 
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-900 font-medium rounded-lg transition-colors"
              >
                <Download className="w-5 h-5" />
                Download Stego PNG
              </button>
              <button 
                onClick={handleSaveToSupabase}
                disabled={isUploading}
                className="flex items-center justify-center gap-2 py-3 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {isUploading ? 'Saving...' : 'Save to Supabase'}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
