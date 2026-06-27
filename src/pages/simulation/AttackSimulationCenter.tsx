import React, { useState, useEffect } from 'react';
import { Target, ShieldAlert, ShieldCheck, FileSearch, BugPlay, Database, FileCode2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { AESCrypto } from '../../lib/crypto';
import toast from 'react-hot-toast';

type ScenarioType = 'A' | 'B' | 'C';

export const AttackSimulationCenter = () => {
  const [targetMetadata, setTargetMetadata] = useState('{"owner": "John Doe", "copyright": "2026", "asset_id": "12345"}');
  const [activeScenario, setActiveScenario] = useState<ScenarioType>('A');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0); // 0: Idle, 1: Attack, 2: Analysis, 3: Result

  const [simResults, setSimResults] = useState<{
    [key in ScenarioType]: {
      interceptedData: string;
      attackerConclusion: string;
      success: boolean;
    }
  }>({
    A: { interceptedData: '', attackerConclusion: '', success: true },
    B: { interceptedData: '', attackerConclusion: '', success: false },
    C: { interceptedData: '', attackerConclusion: '', success: false }
  });

  const runSimulation = () => {
    if (!targetMetadata) {
      toast.error('Please enter sample metadata to protect');
      return;
    }

    setIsSimulating(true);
    setSimStep(1); // Attack Attempt

    setTimeout(() => {
      setSimStep(2); // Analysis
      
      // Calculate results dynamically
      const aesKey = AESCrypto.generateSecureKey();
      const ciphertext = AESCrypto.encryptMetadata(JSON.parse(targetMetadata || '{}'), aesKey);

      setSimResults({
        A: {
          interceptedData: targetMetadata,
          attackerConclusion: 'Plaintext found in EXIF/Metadata. Ownership successfully stolen.',
          success: true
        },
        B: {
          interceptedData: `EXIF_TAG: ${ciphertext.substring(0, 40)}...`,
          attackerConclusion: 'Encrypted block found. Cannot read contents without AES-256 key, but existence of hidden data is obvious.',
          success: false
        },
        C: {
          interceptedData: 'NO_OBVIOUS_DATA_FOUND',
          attackerConclusion: 'No metadata found. Image appears completely normal. Attacker moves on.',
          success: false
        }
      });

      setTimeout(() => {
        setSimStep(3); // Result
        setIsSimulating(false);
      }, 1500);

    }, 1500);
  };

  const scenarios = {
    A: {
      title: 'Scenario A: No Protection',
      desc: 'Metadata attached as plaintext (EXIF)',
      icon: <ShieldAlert className="w-6 h-6 text-red-600" />,
      metrics: { readability: 'High', detectability: 'High', protection: 'None', score: 10 }
    },
    B: {
      title: 'Scenario B: AES-256 Only',
      desc: 'Encrypted metadata attached to file',
      icon: <FileCode2 className="w-6 h-6 text-yellow-500" />,
      metrics: { readability: 'Zero', detectability: 'High', protection: 'Strong', score: 65 }
    },
    C: {
      title: 'Scenario C: AES + LSB Steganography',
      desc: 'Encrypted data hidden inside pixel bits',
      icon: <ShieldCheck className="w-6 h-6 text-green-500" />,
      metrics: { readability: 'Zero', detectability: 'Zero', protection: 'Maximum', score: 99 }
    }
  };

  const active = scenarios[activeScenario];
  const result = simResults[activeScenario];

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-red-500/20 rounded-xl border border-red-500/30">
          <BugPlay className="w-8 h-8 text-red-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attack Simulation Center</h1>
          <p className="text-gray-600">Module 10: Demonstrate security advantages against metadata theft</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Panel: Configuration */}
        <div className="space-y-6">
          <div className="glass-panel p-6 border border-gray-200 rounded-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Simulation Target Data</h2>
            <p className="text-sm text-gray-600 mb-2">Input mock ownership metadata to be attacked:</p>
            <textarea 
              value={targetMetadata}
              onChange={(e) => setTargetMetadata(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg p-3 text-primary font-mono text-xs h-32 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
            />
            
            <button 
              onClick={runSimulation}
              disabled={isSimulating}
              className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSimulating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Target className="w-5 h-5" />}
              {isSimulating ? 'Running Attack...' : 'Launch Simulation Attack'}
            </button>
          </div>

          <div className="glass-panel p-6 border border-gray-200 rounded-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Matrix</h2>
            <div className="space-y-4">
              {Object.entries(scenarios).map(([key, sc]) => (
                <button
                  key={key}
                  onClick={() => setActiveScenario(key as ScenarioType)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${activeScenario === key ? 'bg-gray-100 border-white/30' : 'bg-white border-gray-100 hover:border-gray-300'}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {sc.icon}
                    <span className="font-semibold text-gray-900">{sc.title}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-gray-600">Protection: <span className={sc.metrics.protection === 'None' ? 'text-red-400' : 'text-green-600'}>{sc.metrics.protection}</span></div>
                    <div className="text-gray-600">Detectability: <span className={sc.metrics.detectability === 'High' ? 'text-red-400' : 'text-green-600'}>{sc.metrics.detectability}</span></div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Interactive Timeline & Results */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-8 border border-gray-200 rounded-xl min-h-[500px] flex flex-col">
            
            <div className="flex items-center justify-between border-b border-gray-200 pb-6 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  {active.icon} {active.title}
                </h2>
                <p className="text-gray-600 mt-1">{active.desc}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Security Score</p>
                <div className={`text-4xl font-black ${active.metrics.score > 80 ? 'text-green-500' : active.metrics.score > 50 ? 'text-yellow-500' : 'text-red-600'}`}>
                  {active.metrics.score}/100
                </div>
              </div>
            </div>

            {simStep === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 space-y-4">
                <Target className="w-16 h-16 opacity-20" />
                <p>Click "Launch Simulation Attack" to observe how an attacker extracts data from this scenario.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col space-y-8 relative">
                <div className="absolute left-6 top-6 bottom-6 w-px bg-gray-100 z-0"></div>

                {/* Step 1: Attack Attempt */}
                <div className={`relative z-10 flex gap-6 transition-all duration-500 ${simStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-background shrink-0 ${simStep === 1 ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-800 text-gray-600'}`}>
                    <BugPlay className="w-5 h-5" />
                  </div>
                  <div className="flex-1 bg-white p-5 rounded-xl border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">1. Attack Attempt: Data Scraping</h3>
                    <p className="text-sm text-gray-600">Attacker runs string extraction tools (`strings`, `exiftool`, hex editors) against the asset.</p>
                  </div>
                </div>

                {/* Step 2: Analysis */}
                <div className={`relative z-10 flex gap-6 transition-all duration-500 ${simStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-background shrink-0 ${simStep === 2 ? 'bg-yellow-500 text-black animate-pulse' : 'bg-gray-800 text-gray-600'}`}>
                    <FileSearch className="w-5 h-5" />
                  </div>
                  <div className="flex-1 bg-white p-5 rounded-xl border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Interception Analysis</h3>
                    <p className="text-sm text-gray-600 mb-3">Data intercepted by attacker:</p>
                    <div className="bg-white border border-gray-200 p-3 rounded text-xs font-mono break-all text-primary">
                      {simStep >= 2 ? result.interceptedData : '...'}
                    </div>
                  </div>
                </div>

                {/* Step 3: Result */}
                <div className={`relative z-10 flex gap-6 transition-all duration-500 ${simStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-background shrink-0 ${simStep >= 3 ? (result.success ? 'bg-red-500 text-white' : 'bg-green-500 text-white') : 'bg-gray-800 text-gray-600'}`}>
                    {result.success ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </div>
                  <div className={`flex-1 p-5 rounded-xl border ${result.success ? 'bg-red-500/10 border-red-500/30' : 'bg-green-50 border-green-500/30'}`}>
                    <h3 className={`text-lg font-bold mb-2 ${result.success ? 'text-red-400' : 'text-green-600'}`}>
                      3. Attack Result: {result.success ? 'DATA COMPROMISED' : 'DATA SECURED'}
                    </h3>
                    <p className="text-sm text-gray-700">
                      <strong>Attacker Conclusion:</strong> {simStep >= 3 ? result.attackerConclusion : ''}
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>
          
          {/* Educational Explanation Box */}
          <div className="glass-card p-6 border-l-4 border-l-primary rounded-xl">
            <h3 className="text-gray-900 font-semibold flex items-center gap-2 mb-2"><Database className="w-5 h-5 text-primary"/> Educational Summary</h3>
            <p className="text-gray-600 text-sm">
              While <strong>AES-256 (Scenario B)</strong> guarantees data confidentiality, an attacker can still easily <em>detect</em> that encrypted data is present. This invites cryptanalysis or brute-force attempts. By combining AES with <strong>LSB Steganography (Scenario C)</strong>, we achieve true "security through obscurity" layered on top of cryptographic strength. The attacker cannot steal what they cannot detect.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
