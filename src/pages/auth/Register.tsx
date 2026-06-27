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
        <p className="text-gray-600 text-center mb-8 text-xl">Web ini memprioritaskan proses kriptografi & Steganografi. Jadi untuk simulasi login tinggal direload saja, agar langsung terlogin</p>


      </div>
    </div>
  );
};
