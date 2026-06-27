import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Loader2, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      setIsSent(true);
      toast.success('Password reset link sent!');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
        
        <div className="flex justify-center mb-8">
          <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl border border-gray-200">
            <Shield className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Reset Password</h2>
        
        {!isSent ? (
          <>
            <p className="text-gray-600 text-center mb-8 text-sm">Enter your email and we'll send you a link to reset your password.</p>
            <form className="space-y-4" onSubmit={handleReset}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  placeholder="name@company.com" 
                  required
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg px-4 py-2 mt-4 transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <p className="text-gray-700">
              We have sent a password reset link to <span className="font-semibold text-gray-900">{email}</span>. Please check your inbox.
            </p>
          </div>
        )}
        
        <p className="text-center text-gray-600 text-sm mt-6">
          Remember your password? <Link to="/auth/login" className="text-primary hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
};
