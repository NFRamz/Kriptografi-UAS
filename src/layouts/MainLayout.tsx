import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Shield, Lock, ShieldCheck, Microscope } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const AnimatedBackground = () => (
  <div className="fixed inset-0 z-[-1] overflow-hidden bg-white">
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none"></div>
    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[120px] pointer-events-none"></div>
    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 pointer-events-none"></div>
  </div>
);

export const MainLayout = () => {
  const { user, profile, signOut } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <AnimatedBackground />
      
      <nav className="border-b border-gray-200 bg-white backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 font-bold text-xl tracking-wide group">
            <div className="p-1.5 bg-gradient-to-br from-primary to-accent rounded-lg group-hover:shadow-[0_0_15px_rgba(0,150,200,0.5)] transition-shadow">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-900">Digi<span className="text-primary">Proof</span></span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <Link to="/protect" className="hover:text-primary transition-colors flex items-center gap-2 text-glow">
              <Lock className="w-4 h-4"/> Proteksi Aset
            </Link>
            <Link to="/verify" className="hover:text-accent transition-colors flex items-center gap-2">
              <ShieldCheck className="w-4 h-4"/> Verifikasi Kepemilikan
            </Link>
            <Link to="/lab" className="hover:text-red-500 transition-colors flex items-center gap-2">
              <Microscope className="w-4 h-4"/> Security Lab
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                  {profile?.full_name || user.email?.split('@')[0]}
                </Link>
                <button 
                  onClick={() => signOut()}
                  className="text-sm font-medium px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-md transition-colors backdrop-blur-md"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <>
                <Link to="/auth/login" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                  Masuk
                </Link>
                <Link to="/auth/register" className="text-sm font-medium px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-900 rounded-md transition-colors backdrop-blur-md">
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      
      <main className="flex-1 w-full mx-auto relative z-10 flex flex-col">
        <Outlet />
      </main>
      
      <footer className="border-t border-gray-200 py-6 text-center text-gray-500 text-sm backdrop-blur-md bg-white mt-auto">
        <p>&copy; {new Date().getFullYear()} DigiProof. Digital Asset Ownership Protection.</p>
      </footer>
    </div>
  );
};
