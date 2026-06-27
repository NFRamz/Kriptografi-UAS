import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Lock, FileImage, ShieldCheck, ChevronRight } from 'lucide-react';
import DecryptedText from '../components/DecryptedText';
import Antigravity from '../components/Antigravity';

export const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="flex flex-col items-center justify-center relative flex-1 bg-white">
      {/* User's Custom Antigravity Background */}
      <div className="absolute inset-0 z-0 h-[600px] overflow-hidden pointer-events-none">
        <Antigravity
          count={1500}
          magnetRadius={13}
          ringRadius={12}
          waveSpeed={0.4}
          waveAmplitude={1}
          particleSize={1.1}
          lerpSpeed={0.06}
          color="#5227FF"
          autoAnimate
          particleVariance={1}
          rotationSpeed={0}
          depthFactor={2.4}
          pulseSpeed={4.9}
          particleShape="sphere"
          fieldStrength={14}
        />
      </div>

      <div className="py-20 px-4 w-full relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-6xl mx-auto flex flex-col items-center text-center space-y-8"
        >
          <motion.div
            className="flex flex-col items-center text-center space-y-8 p-10 rounded-[3rem] relative group w-full max-w-5xl mx-auto"
          >
            {/* Permanent Subtle Background that intensifies on hover */}
            <div className="absolute inset-0 bg-white/30 backdrop-blur-[4px] rounded-[3rem] transition-all duration-700 ease-out -z-10 border border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.03)] group-hover:bg-white/70 group-hover:backdrop-blur-xl group-hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] group-hover:border-white/60 group-hover:scale-[1.02]" />

            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/70 border border-primary/20 text-primary text-sm font-semibold shadow-[0_0_15px_rgba(0,240,255,0.15)] backdrop-blur-md group-hover:bg-white group-hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] transition-all duration-500">
              <ShieldCheck className="w-4 h-4" />
              <DecryptedText text="Mesin Kriptografi & Steganografi Lanjutan" animateOn="view" sequential={true} revealDirection="center" />
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 relative z-10 leading-[1.1] transition-transform duration-500 group-hover:scale-[1.01]">
              <span className="drop-shadow-sm">
                <DecryptedText text="Lindungi Hak Kepemilikan" animateOn="view" sequential={true} revealDirection="start" speed={100} />
              </span> <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent relative inline-block drop-shadow-sm mt-2">
                <DecryptedText text="Aset Digital ." animateOn="view" sequential={true} revealDirection="start" speed={100} />
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-gray-800 max-w-3xl text-lg md:text-xl leading-relaxed font-medium drop-shadow-sm transition-transform duration-500 group-hover:scale-[1.01]">
              <DecryptedText
                text="DigiProof membuktikan kepemilikan aset digital dengan menyematkan metadata terenkripsi AES-256 langsung ke dalam file Anda menggunakan Steganografi LSB."
                animateOn="view"
                speed={60}
                maxIterations={10}
              />
            </motion.p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link to="/protect" className="flex items-center justify-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-md transition-all shadow-[0_0_20px_rgba(0,150,200,0.4)] hover:shadow-[0_0_30px_rgba(0,150,200,0.6)] text-lg">
              Proteksi Aset
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link to="/verify" className="flex items-center justify-center gap-2 px-8 py-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-900 font-semibold rounded-md transition-all backdrop-blur-md text-lg">
              Verifikasi Kepemilikan
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-24 pt-16 border-t border-gray-200">
            <div className="glass-card p-8 text-left group">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Enkripsi AES-256</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Metadata kepemilikan  dienkripsi dengan AES-256, membuatnya mustahil untuk dipalsukan atau dibaca tanpa kunci rahasia.</p>
            </div>
            <div className="glass-card p-8 text-left group">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileImage className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Steganografi LSB</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Ciphertext disembunyikan di dalam bit terendah (Least Significant Bits) piksel gambar, menjaga kualitas visual tetap sempurna sekaligus mengamankan data.</p>
            </div>
            <div className="glass-card p-8 text-left group">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Verifikasi Instan</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Siapa pun dapat mengunggah aset yang telah terproteksi untuk secara instan mengekstrak, mendekripsi, dan memverifikasi klaim kepemilikan asli.</p>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
};
