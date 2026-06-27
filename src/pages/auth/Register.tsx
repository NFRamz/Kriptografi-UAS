import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export const Register = () => {
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      toast.error('Harap isi semua kolom');
      return;
    }

    if (password.length < 6) {
      toast.error('Kata sandi harus minimal 6 karakter');
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      if (data.session) {
        toast.success('Registrasi berhasil!');
        navigate('/protect');
      } else {
        toast.success('Registrasi berhasil! Silakan periksa email Anda untuk verifikasi.');
        navigate('/auth/login');
      }
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-primary"></div>
        
        <div className="flex justify-center mb-8">
          <div className="p-3 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl border border-gray-200">
            <Shield className="w-8 h-8 text-accent" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Buat Akun</h2>
        <p className="text-gray-600 text-center mb-8 text-sm">Bergabung dengan DigiProof untuk memproteksi aset digital Anda</p>
        
        <form className="space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all" 
              placeholder="John Doe" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all" 
              placeholder="name@company.com" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kata Sandi</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all" 
              placeholder="••••••••" 
              required
              minLength={6}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-accent hover:bg-accent/90 text-white font-semibold rounded-lg px-4 py-2 mt-4 transition-all shadow-[0_0_15px_rgba(176,38,255,0.3)] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Buat Akun'}
          </button>
        </form>
        
        <p className="text-center text-gray-600 text-sm mt-6">
          Sudah punya akun? <Link to="/auth/login" className="text-accent hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  );
};
