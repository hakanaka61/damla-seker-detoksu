'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [formData, setFormData] = useState({
    gun_sayisi: 1, seker_tuketimi: false, su_miktari: '', 
    adim_sayisi: '', ogun_detayi: '', gece_yemegi: false, kilo: ''
  });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Kaydediliyor...');
    
    const { error } = await supabase
      .from('damla_detoks')
      .insert([
        {
          gun_sayisi: formData.gun_sayisi,
          seker_tuketimi: formData.seker_tuketimi,
          su_miktari: formData.su_miktari,
          adim_sayisi: parseInt(formData.adim_sayisi),
          ogun_detayi: formData.ogun_detayi,
          gece_yemegi: formData.gece_yemegi,
          kilo: formData.kilo ? parseFloat(formData.kilo) : null
        }
      ]);

    if (error) {
      setStatus('Hata oluştu: ' + error.message);
    } else {
      setStatus('Gün başarıyla kaydedildi! Harikasın Damla! 🎉');
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] p-5 font-sans text-gray-800">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 mt-10">
        <h1 className="text-2xl font-bold text-center text-pink-500 mb-6">Damla'nın Şeker Detoksu</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Kaçıncı Gün? (1-21)</label>
            <input type="number" min="1" max="21" required
              className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-pink-300"
              onChange={e => setFormData({...formData, gun_sayisi: e.target.value})} />
          </div>

          <div className="flex items-center space-x-3 bg-pink-50 p-3 rounded-lg">
            <input type="checkbox" id="seker" className="w-5 h-5 text-pink-500 rounded focus:ring-pink-400"
              onChange={e => setFormData({...formData, seker_tuketimi: e.target.checked})} />
            <label htmlFor="seker" className="font-medium">Bugün hiç şeker yemedim! 🚫🍬</label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">İçilen Su (Litre/Bardak)</label>
            <input type="text" required placeholder="Örn: 2.5 Litre"
              className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-pink-300"
              onChange={e => setFormData({...formData, su_miktari: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Adım Sayısı</label>
            <input type="number" required placeholder="Örn: 8500"
              className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-pink-300"
              onChange={e => setFormData({...formData, adim_sayisi: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Bugün Neler Yedin?</label>
            <textarea required placeholder="Sabah: Yumurta, Öğle: Salata..."
              className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-pink-300 h-24"
              onChange={e => setFormData({...formData, ogun_detayi: e.target.value})} />
          </div>

          <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
            <input type="checkbox" id="gece" className="w-5 h-5"
              onChange={e => setFormData({...formData, gece_yemegi: e.target.checked})} />
            <label htmlFor="gece" className="font-medium">Gece bir şeyler atıştırdım 🌙</label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kilo (Zorunlu Değil)</label>
            <input type="number" step="0.1" placeholder="Örn: 65.5"
              className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-pink-300"
              onChange={e => setFormData({...formData, kilo: e.target.value})} />
          </div>

          <button type="submit" className="w-full bg-pink-500 text-white font-bold rounded-lg p-4 mt-4 active:scale-95 transition-transform">
            Günü Kaydet
          </button>

          {status && <p className="text-center mt-4 font-medium text-pink-600">{status}</p>}
        </form>
      </div>
    </main>
  );
}
