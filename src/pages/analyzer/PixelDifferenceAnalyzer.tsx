import React, { useState, useRef, useEffect } from 'react';
import { Microscope, Image as ImageIcon, Upload, Activity, Search, MousePointer2, Loader2, ArrowRight } from 'lucide-react';
import { ImageComparator, ComparisonResult } from '../../lib/image-compare';
import toast from 'react-hot-toast';

export const PixelDifferenceAnalyzer = () => {
  const [origImageFile, setOrigImageFile] = useState<File | null>(null);
  const [protImageFile, setProtImageFile] = useState<File | null>(null);
  
  const [origPreview, setOrigPreview] = useState<string | null>(null);
  const [protPreview, setProtPreview] = useState<string | null>(null);
  
  const origImageRef = useRef<HTMLImageElement>(null);
  const protImageRef = useRef<HTMLImageElement>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);

  // Inspector State
  const [hoverPos, setHoverPos] = useState<{x: number, y: number} | null>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'orig' | 'prot') => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      const url = URL.createObjectURL(file);
      if (type === 'orig') {
        setOrigImageFile(file);
        setOrigPreview(url);
      } else {
        setProtImageFile(file);
        setProtPreview(url);
      }
      setResult(null); // reset analysis on new upload
    } else {
      toast.error('Please upload a valid PNG or JPEG image');
    }
  };

  const runAnalysis = async () => {
    if (!origImageRef.current || !protImageRef.current) return;
    setIsProcessing(true);
    
    // Slight delay for UI rendering
    setTimeout(async () => {
      try {
        const res = await ImageComparator.compareImages(origImageRef.current!, protImageRef.current!);
        setResult(res);
        toast.success('Pixel analysis complete');
      } catch (error: any) {
        toast.error(error.message || 'Analysis failed. Make sure images are identical in dimensions.');
      } finally {
        setIsProcessing(false);
      }
    }, 500);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!result || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (result.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (result.height / rect.height));
    
    if (x >= 0 && x < result.width && y >= 0 && y < result.height) {
      setHoverPos({ x, y });
    } else {
      setHoverPos(null);
    }
  };

  const handleSliderMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || e.buttons !== 1) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = ((e.clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, pos)));
  };

  // Extract pixel strings for inspector
  let origPixelStr = '';
  let protPixelStr = '';
  let diffDetected = false;

  if (result && hoverPos) {
    const o = ImageComparator.getPixelAt(result.originalData, result.width, hoverPos.x, hoverPos.y);
    const p = ImageComparator.getPixelAt(result.protectedData, result.width, hoverPos.x, hoverPos.y);
    origPixelStr = `R:${o.r.toString().padStart(3,'0')} G:${o.g.toString().padStart(3,'0')} B:${o.b.toString().padStart(3,'0')}`;
    protPixelStr = `R:${p.r.toString().padStart(3,'0')} G:${p.g.toString().padStart(3,'0')} B:${p.b.toString().padStart(3,'0')}`;
    diffDetected = o.r !== p.r || o.g !== p.g || o.b !== p.b;
  }

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-red-500/20 rounded-xl border border-red-500/30">
          <Microscope className="w-8 h-8 text-red-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pixel Difference Analyzer</h1>
          <p className="text-gray-600">Module 9: Cryptographic Steganalysis & Visual Distortion Lab</p>
        </div>
      </div>

      {!result ? (
        <div className="glass-panel p-8 border border-gray-200 rounded-2xl">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload Images to Compare</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Original Input */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center text-center min-h-[300px] hover:border-gray-400 transition-all">
              <h3 className="font-medium text-gray-700 mb-4">Target Original Image</h3>
              {origPreview ? (
                <div className="space-y-4">
                  <img ref={origImageRef} src={origPreview} alt="Original" className="max-h-48 object-contain rounded" crossOrigin="anonymous"/>
                  <label className="text-primary text-sm hover:underline cursor-pointer block">
                    Change Original
                    <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={(e) => handleUpload(e, 'orig')}/>
                  </label>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center h-full w-full">
                  <ImageIcon className="w-12 h-12 text-gray-500 mb-2" />
                  <span className="text-gray-900">Upload Original</span>
                  <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={(e) => handleUpload(e, 'orig')}/>
                </label>
              )}
            </div>

            {/* Protected Input */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center text-center min-h-[300px] hover:border-accent transition-all">
              <h3 className="font-medium text-accent mb-4">Target Protected (Stego) Image</h3>
              {protPreview ? (
                <div className="space-y-4">
                  <img ref={protImageRef} src={protPreview} alt="Protected" className="max-h-48 object-contain rounded" crossOrigin="anonymous"/>
                  <label className="text-accent text-sm hover:underline cursor-pointer block">
                    Change Protected
                    <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={(e) => handleUpload(e, 'prot')}/>
                  </label>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center h-full w-full">
                  <ImageIcon className="w-12 h-12 text-accent mb-2 opacity-50" />
                  <span className="text-gray-900">Upload Protected</span>
                  <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={(e) => handleUpload(e, 'prot')}/>
                </label>
              )}
            </div>
          </div>

          <button 
            onClick={runAnalysis}
            disabled={!origPreview || !protPreview || isProcessing}
            className="w-full mt-8 bg-gradient-to-r from-red-500 to-primary hover:opacity-90 text-white font-bold rounded-lg px-6 py-4 shadow-[0_0_20px_rgba(239,68,68,0.3)] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? <Loader2 className="w-6 h-6 animate-spin"/> : <Microscope className="w-6 h-6"/>}
            {isProcessing ? 'Analyzing Pixels...' : 'Run Pixel Analysis'}
          </button>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-700">
          
          {/* Top Panel: Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-600 uppercase tracking-wider">Similarity Rate</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{result.stats.similarityRate.toFixed(4)}%</p>
            </div>
            <div className="glass-card p-4 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-600 uppercase tracking-wider">Visual Distortion</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{result.stats.percentageDifference.toFixed(4)}%</p>
            </div>
            <div className="glass-card p-4 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-600 uppercase tracking-wider">Modified Pixels</p>
              <p className="text-2xl font-bold text-accent mt-1">{result.stats.modifiedPixels.toLocaleString()} <span className="text-sm font-normal text-gray-500">/ {result.stats.totalPixels.toLocaleString()}</span></p>
            </div>
            <div className="glass-card p-4 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-600 uppercase tracking-wider">Hidden Data Size</p>
              <p className="text-2xl font-bold text-primary mt-1">~{(result.stats.hiddenDataSizeBits / 8).toFixed(0)} Bytes</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Interactive Visualizer */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Diff Map Viewer */}
              <div className="glass-card p-1 rounded-xl border border-gray-200 overflow-hidden relative">
                <div className="bg-white p-3 flex justify-between items-center border-b border-gray-200">
                  <h3 className="text-gray-900 font-medium flex items-center gap-2"><Activity className="w-4 h-4 text-red-400"/> Difference Map (DiffViewer)</h3>
                  <span className="text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded">Highlighting Altered LSBs</span>
                </div>
                <div className="flex justify-center bg-[#0a0a0a] p-4">
                  <img src={result.diffDataUrl} className="max-w-full max-h-[400px] object-contain border border-gray-100" alt="Diff Map"/>
                </div>
              </div>

              {/* Advanced Image Overlay Slider */}
              <div className="glass-card p-1 rounded-xl border border-gray-200 overflow-hidden relative">
                <div className="bg-white p-3 flex justify-between items-center border-b border-gray-200">
                  <h3 className="text-gray-900 font-medium flex items-center gap-2"><Search className="w-4 h-4 text-primary"/> Overlay Compare (Slider)</h3>
                  <span className="text-xs text-gray-600">Drag to compare Original vs Protected</span>
                </div>
                
                <div 
                  ref={containerRef}
                  className="relative cursor-crosshair overflow-hidden w-full flex justify-center bg-[#0a0a0a] p-4 touch-none select-none"
                  onMouseMove={(e) => { handleMouseMove(e); handleSliderMove(e); }}
                  onMouseDown={handleSliderMove}
                  onMouseLeave={() => setHoverPos(null)}
                >
                  <div className="relative inline-block border border-gray-100 shadow-2xl">
                    {/* Base Image (Protected) */}
                    <img src={protPreview!} className="block max-w-full max-h-[400px] object-contain" alt="Protected Base" draggable={false}/>
                    
                    {/* Overlay Image (Original) masked by slider */}
                    <div 
                      className="absolute top-0 left-0 h-full overflow-hidden" 
                      style={{ width: `${sliderPos}%` }}
                    >
                      <img src={origPreview!} className="block max-w-full max-h-[400px] object-contain" style={{ width: result.width, maxWidth: 'none', height: '100%' }} alt="Original Overlay" draggable={false}/>
                    </div>

                    {/* Slider Handle */}
                    <div className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize drop-shadow-lg" style={{ left: `calc(${sliderPos}% - 2px)` }}>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                        <div className="w-1 h-4 bg-gray-400 rounded-full mx-0.5"></div>
                        <div className="w-1 h-4 bg-gray-400 rounded-full mx-0.5"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Advanced Tools */}
            <div className="space-y-6">
              
              {/* Pixel Inspector */}
              <div className="glass-panel p-6 border border-gray-200 rounded-xl sticky top-24">
                <h3 className="text-gray-900 font-medium flex items-center gap-2 mb-4">
                  <MousePointer2 className="w-4 h-4 text-accent"/> Live Pixel Inspector
                </h3>
                
                {hoverPos ? (
                  <div className="space-y-4">
                    <div className="bg-white border border-gray-100 p-3 rounded text-center">
                      <p className="text-gray-600 text-xs uppercase">Coordinates</p>
                      <p className="text-gray-900 font-mono">X: {hoverPos.x}, Y: {hoverPos.y}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Original RGB</span>
                        <span className="text-gray-700 font-mono text-xs">{origPixelStr}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-primary">Protected RGB</span>
                        <span className={`${diffDetected ? 'text-primary font-bold' : 'text-gray-700'} font-mono text-xs`}>
                          {protPixelStr}
                        </span>
                      </div>
                    </div>

                    <div className={`mt-4 p-3 rounded border text-center ${diffDetected ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-green-50 border-green-500/30 text-green-600'}`}>
                      {diffDetected ? 'Modification Detected (LSB Flipped)' : 'Pixels Identical (No Payload)'}
                    </div>

                    {/* Magnifier View Simulation */}
                    <div className="mt-4 p-2 bg-white rounded border border-gray-200 overflow-hidden relative h-32 flex items-center justify-center">
                       <span className="text-gray-600 text-xs italic absolute bottom-2">Magnified Zone Render</span>
                       <div className="w-16 h-16 border border-gray-300 shadow-lg relative flex items-center justify-center" 
                         style={{
                           backgroundImage: `url(${result.diffDataUrl})`,
                           backgroundPosition: `-${hoverPos.x * 4}px -${hoverPos.y * 4}px`,
                           backgroundSize: `${result.width * 4}px ${result.height * 4}px`,
                           imageRendering: 'pixelated'
                         }}
                       >
                         {/* crosshair */}
                         <div className="absolute w-full h-px bg-gray-500 mix-blend-difference"></div>
                         <div className="absolute h-full w-px bg-gray-500 mix-blend-difference"></div>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center text-gray-500 italic">
                    <MousePointer2 className="w-8 h-8 mb-2 opacity-50"/>
                    <p>Hover over the "Overlay Compare" image to inspect individual pixels in real-time.</p>
                  </div>
                )}
              </div>
              
              <button onClick={() => setResult(null)} className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition-all flex items-center justify-center gap-2">
                Analyze New Pair <ArrowRight className="w-4 h-4"/>
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
