import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { User as UserIcon, Mail, Shield, Loader2, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export const Profile = () => {
  const { user, profile, setProfile } = useAuthStore();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id)
      .select()
      .single();
      
    setIsSaving(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Profile updated successfully');
      setProfile(data);
    }
  };

  if (!user) return null;

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary/20 rounded-xl border border-primary/30">
          <UserIcon className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
          <p className="text-gray-600">Manage your DigiProof account settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-xl border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input 
                    type="email" 
                    value={user.email}
                    disabled
                    className="w-full bg-white border border-gray-100 rounded-lg pl-10 px-4 py-2.5 text-gray-600 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Email address cannot be changed currently.</p>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isSaving || fullName === profile?.full_name}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg px-6 py-2.5 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-accent" />
              <h2 className="text-lg font-semibold text-gray-900">Account Status</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="text-gray-900 capitalize font-medium">{profile?.role || 'Creator'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="text-gray-900 font-medium">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Authentication</p>
                <div className="inline-flex mt-1 items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-500/20 text-green-600 text-xs font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  Secure
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
