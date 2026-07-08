import React from 'react';
import { Play, Pause, RotateCcw, FastForward, Settings2 } from 'lucide-react';
import { LabAnimationState } from '../useLabAnimation';

export const GlobalAnimationControls = ({ anim }: { anim: LabAnimationState }) => {
  const progressPercent = Math.min(100, Math.max(0, (anim.globalStep / anim.maxSteps) * 100)) || 0;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-full px-6 py-4 flex items-center gap-6 min-w-[600px]">
      
      {/* Playback Controls */}
      <div className="flex items-center gap-3 border-r border-gray-200 pr-6">
        <button 
          onClick={anim.reset}
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        
        <button 
          onClick={anim.isPlaying ? anim.pause : anim.play}
          className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-full hover:bg-primary/90 transition-transform active:scale-95 shadow-lg shadow-primary/30"
          title={anim.isPlaying ? "Pause" : "Play"}
        >
          {anim.isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex justify-between text-xs font-semibold text-gray-500 font-mono">
          <span>Step {anim.globalStep}</span>
          <span>Max {anim.maxSteps}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden w-full relative">
          <div 
            className="absolute top-0 left-0 h-full bg-accent transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Speed Control */}
      <div className="flex items-center gap-2 border-l border-gray-200 pl-6 relative group">
        <Settings2 className="w-5 h-5 text-gray-500" />
        <select 
          value={anim.speed} 
          onChange={(e) => anim.setSpeed(Number(e.target.value))}
          className="bg-transparent text-sm font-semibold text-gray-700 outline-none cursor-pointer appearance-none pr-4"
        >
          <option value={2000}>0.5x (Slow)</option>
          <option value={1000}>1.0x (Normal)</option>
          <option value={500}>2.0x (Fast)</option>
          <option value={200}>5.0x (Super Fast)</option>
        </select>
        <FastForward className="w-4 h-4 text-gray-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
};
