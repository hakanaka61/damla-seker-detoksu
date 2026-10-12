'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, PlusCircle, BarChart2, Image as ImageIcon, 
  Droplets, Camera, Heart, AlertCircle, CheckCircle2, XCircle, 
  Moon, Scale, Utensils, Smile, Meh, Frown, Sparkles, X, Gift
} from 'lucide-react';

const MOTIVATION_QUOTES = [
  "Bugün de harika görünüyorsun! Gülümsemen en büyük tatlım. 🍓",
  "Kendin için harika bir şey yapıyorsun, devam et! ✨",
  "Şeker yok, enerji çok! 💪",
  "Cildin şimdiden parlamaya başladı bile! ✨",
  "Zorlandığında aynaya bak ve ne kadar güçlü olduğunu gör! ❤️",
  "Harika gidiyorsun bebeğim, pes etmek yok! 🚀",
];

const CRISIS_MESSAGES = [
  "Derin bir nefes al! Bir bardak soğuk su içmeye ne dersin? 💧",
  "Hemen şekersiz bir Türk kahvesi veya yeşil çay yapıyoruz! ☕",
  "Şu anki kriz 10 dakika içinde geçecek. Sadece 10 dakika dayan! 🧘‍♀️",
  "Tatlı yerine 3 tane ceviz ve 1 tane kuru kayısı yiyebilirsin. 🥜",
  "Hemen telefonu eline al ve beni ara! Seni çok seviyorum. 📞❤️"
];

const LOVE_NOTES = [
  "Gözlerindeki o azim beni sana her gün yeniden aşık ediyor sevgilim. ❤️",
  "Seninle gurur duyuyorum! Sadece şekersiz bir hayat değil, benim için hayatın ta kendisisin. 🌸",
  "Yaptığın her şeyde yanındayım. Sen çok güçlüsün ve harika gidiyorsun aşkım! 🌟",
  "Dünyanın en güzel, en iradeli sevgilisine kocaman bir öpücük! 😘"
];

const MOODS = [
  { id: 'harika', icon: Smile, label: 'Harika', color: 'text-green-500', bg: 'bg-green-100' },
  { id: 'normal', icon: Meh, label: 'Normal', color: 'text-blue-500', bg: 'bg-blue-100' },
  { id: 'yorgun', icon: Frown, label: 'Yorgun', color: 'text-orange-500', bg: 'bg-orange-100' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'form' | 'stats' | 'album'>('calendar');
  const [records, setRecords] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [formStatus, setFormStatus] = useState('');
  
  const [showCrisis, setShowCrisis] = useState(false);
  const [crisisMsg, setCrisisMsg] = useState('');
  const [secretNoteModal, setSecretNoteModal] = useState<string | null>(null);
  
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    seker_tuketimi: true, su_bardagi: 0, adim_sayisi: '',
    ogun_detayi: '', gece_yemegi: false, kilo: '', tatli_istegi: 1, 
    fotograf_url: '', ruh_hali: 'harika', partner_gorevi: false
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    const { data } = await supabase.from('damla_detoks').select('*').order('gun_sayisi', { ascending: true });
    if (data) setRecords(data);
    setLoading(false);
  };

  const openFormForDay = (day: number) => {
    const existing = records.find(r => r.gun_sayisi === day);
    if (existing) {
      setFormData({
        seker_tuketimi: existing.seker_tuketimi,
        su_bardagi: existing.su_bardagi || 0,
        adim_sayisi: existing.adim_sayisi || '',
        ogun_detayi: existing.ogun_detayi || '',
        gece_yemegi: existing.gece_yemegi || false,
        kilo: existing.kilo || '',
        tatli_istegi: existing.tatli_istegi || 1,
        fotograf_url: existing.fotograf_url || '',
        ruh_hali: existing.ruh_hali || 'harika',
        partner_gorevi: existing.partner_gorevi || false
      });
    } else {
      setFormData({ 
        seker_tuketimi: true, su_bardagi: 0, adim_sayisi: '', 
        ogun_detayi: '', gece_yemegi: false, kilo: '', tatli_istegi: 1, 
        fotograf_url: '', ruh_hali: 'harika', partner_gorevi: false 
      });
    }
    setFile(null);
    setSelectedDay(day);
    setActiveTab('form');
    setFormStatus('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setFormStatus('Veriler işleniyor...');
    
    let finalPhotoUrl = formData.fotograf_url;

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `gun_${selectedDay}_${Math.random()}.${fileExt}`;
      const { data: uploadData } = await supabase.storage.from('detoks_fotograflari').upload(fileName, file);
      if (uploadData) {
        const { data: publicUrlData } = supabase.storage.from('detoks_fotograflari').getPublicUrl(fileName);
        finalPhotoUrl = publicUrlData.publicUrl;
      }
    }

    const payload = {
      gun_sayisi: selectedDay,
      seker_tuketimi: formData.seker_tuketimi,
      su_bardagi: formData.su_bardagi,
      adim_sayisi: formData.adim_sayisi ? parseInt(formData.adim_sayisi as string) : null,
      ogun_detayi: formData.ogun_detayi,
      gece_yemegi: formData.gece_yemegi,
      kilo: formData.kilo ? parseFloat(formData.kilo as string) : null,
      tatli_istegi: formData.tatli_istegi,
      fotograf_url: finalPhotoUrl,
      ruh_hali: formData.ruh_hali,
      partner_gorevi: formData.partner_gorevi
    };

    const existing = records.find(r => r.gun_sayisi === selectedDay);
    let error;
    
    if (existing) {
      const { error: updateError } = await supabase.from('damla_detoks').update(payload).eq('gun_sayisi', selectedDay);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('damla_detoks').insert([payload]);
      error = insertError;
    }

    setUploading(false);

    if (error) {
      setFormStatus('Hata: ' + error.message);
    } else {
      setFormStatus('✨ Başarıyla kaydedildi! ✨');
      if (selectedDay === 30 && formData.seker_tuketimi) {
        confetti({ particleCount: 300, spread: 120, origin: { y: 0.6 }, colors: ['#ff69b4', '#ffffff', '#ffb6c1'] });
      }
      fetchRecords();
      setTimeout(() => setActiveTab('calendar'), 1500);
    }
  };

  const getSmartCoaching = () => {
    if (selectedDay === 1) return "30 günlük serüvenin ilk günü! Bol su içmeyi ve adımlarını yüksek tutmayı unutma. Başarıyoruz! 🚀";
    const yesterday = records.find(r => r.gun_sayisi === selectedDay - 1);
    if (!yesterday) return `Dünün verisi girilmemiş. Bugün temiz bir sayfa açıyoruz! Bol hareket, bol su! 💧`;
    let tips = [];
    const prevWater = yesterday.su_bardagi || 0;
    const prevSteps = yesterday.adim_sayisi || 0;

    if (prevWater < 6) tips.push(`Dün suyunu az içtin. Bugün hedefin en az 8 bardak! 🚰`);
    if (prevSteps < 7000) tips.push(`Dün hareketin azdı. Bugün 8.000 adımın üstüne çıkıyoruz! 🚶‍♀️`);
    if (yesterday.gece_yemegi) tips.push(`Dün gece kaçamağı olmuş. Bugün yatmadan 3 saat önce mutfağı kapatıyoruz. 🌙`);
    if (tips.length === 0) tips.push(`Dün harikaydın! Tüm hedeflerini tutturdun, bugün de aynı tempoyla devam! 🌟`);
    
    return tips.join(" ");
  };

  const todayQuote = MOTIVATION_QUOTES[new Date().getDay() % MOTIVATION_QUOTES.length];

  // STATS
  const totalDays = records.length;
  const sugarFreeDays = records.filter(r => r.seker_tuketimi).length;
  const successRate = totalDays ? Math.round((sugarFreeDays / totalDays) * 100) : 0;
  const validSteps = records.map(r => r.adim_sayisi).filter(a => a && a > 0);
  const avgSteps = validSteps.length ? Math.round(validSteps.reduce((a,b)=>a+b,0) / validSteps.length) : 0;
  const photos = records.filter(r => r.fotograf_url).sort((a,b) => a.gun_sayisi - b.gun_sayisi);

  return (
    <main className="min-h-screen bg-[#FDFBFB] bg-gradient-to-br from-pink-50 via-rose-50 to-white pb-32 font-sans text-gray-800 selection:bg-pink-200">
      
      {/* HEADER - GLASSMORPHISM */}
      <div className="bg-white/70 backdrop-blur-xl shadow-sm p-6 text-center sticky top-0 z-30 rounded-b-[2.5rem] border-b border-white/50">
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400 tracking-tight">
          Damla'nın 30 Günlük Detoksu
        </h1>
        <p className="text-[13px] font-medium text-pink-500/80 mt-2 italic flex items-center justify-center gap-1">
          <Sparkles size={14}/> {todayQuote}
        </p>
      </div>

      <div className="p-4 max-w-md mx-auto mt-2">
        <AnimatePresence mode="wait">
          
          {/* 1. TAKVİM GÖRÜNÜMÜ */}
          {activeTab === 'calendar' && (
            <motion.div key="calendar" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="bg-white/60 backdrop-blur-lg rounded-[2rem] p-6 shadow-xl shadow-pink-100/50 border border-white">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Calendar className="text-pink-500" size={24} />
                <h2 className="font-bold text-gray-700 text-xl">Serüven Takvimi</h2>
              </div>
              
              {loading ? <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-pink-200 rounded w-3/4"></div><div className="space-y-2"><div className="h-4 bg-pink-200 rounded"></div></div></div></div> : (
                <div className="grid grid-cols-5 gap-3">
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
                    const rec = records.find(r => r.gun_sayisi === day);
                    const isSuccess = rec?.seker_tuketimi;
                    return (
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} key={day} onClick={() => openFormForDay(day)}
                        className={`aspect-square rounded-2xl flex flex-col items-center justify-center font-extrabold text-lg transition-all shadow-sm
                        ${rec ? (isSuccess ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-green-200' : 'bg-gradient-to-br from-red-400 to-rose-500 text-white shadow-red-200') : 'bg-white text-gray-400 border-2 border-dashed border-gray-200'}`}>
                        {day}
                        {rec && (isSuccess ? <CheckCircle2 size={14} className="mt-1" /> : <XCircle size={14} className="mt-1" />)}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* 2. FORM GÖRÜNÜMÜ */}
          {activeTab === 'form' && (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-2xl shadow-pink-100/50 border border-white">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-extrabold text-2xl text-pink-600 flex items-center gap-2">Gün {selectedDay}</h2>
                <button onClick={() => setActiveTab('calendar')} className="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"><X size={20}/></button>
              </div>

              {/* Akıllı Koç */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-4 rounded-2xl mb-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10"><Sparkles size={40}/></div>
                <p className="text-[11px] font-extrabold text-blue-600 mb-1 uppercase tracking-wider">Hakan'ın Akıllı Asistanı</p>
                <p className="text-sm text-blue-900 font-medium leading-relaxed">{getSmartCoaching()}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Şeker Durumu */}
                <div className="flex space-x-3">
                  <button type="button" onClick={() => setFormData({...formData, seker_tuketimi: true})} className={`flex-1 p-4 rounded-2xl font-bold text-sm transition-all flex flex-col items-center gap-2 ${formData.seker_tuketimi ? 'bg-green-500 text-white shadow-lg shadow-green-200 scale-[1.02]' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                    <CheckCircle2 size={28} /><span>Şekersiz Geçti</span>
                  </button>
                  <button type="button" onClick={() => setFormData({...formData, seker_tuketimi: false})} className={`flex-1 p-4 rounded-2xl font-bold text-sm transition-all flex flex-col items-center gap-2 ${!formData.seker_tuketimi ? 'bg-red-500 text-white shadow-lg shadow-red-200 scale-[1.02]' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                    <XCircle size={28} /><span>Şeker Yedim</span>
                  </button>
                </div>

                {/* Ruh Hali */}
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                  <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Bugün Nasıl Hissediyorsun?</label>
                  <div className="flex justify-between gap-3">
                    {MOODS.map(m => {
                      const Icon = m.icon;
                      const isActive = formData.ruh_hali === m.id;
                      return (
                        <button key={m.id} type="button" onClick={() => setFormData({...formData, ruh_hali: m.id})} className={`flex-1 py-3 flex flex-col items-center gap-1 rounded-2xl transition-all ${isActive ? `${m.bg}${m.color} shadow-sm border border-white/50 scale-105` : 'bg-gray-50 text-gray-400'}`}>
                          <Icon size={24} />
                          <span className="text-xs font-bold">{m.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Su Bardakları (Dokunmatik) */}
                <div className="bg-blue-50/50 p-4 rounded-3xl shadow-sm border border-blue-100">
                  <label className="block text-xs font-bold text-blue-400 mb-3 uppercase tracking-wider flex items-center gap-1"><Droplets size={14}/> İçilen Su (Bardak)</label>
                  <div className="flex justify-between">
                    {[1,2,3,4,5,6,7,8].map(num => (
                      <motion.button whileTap={{ scale: 0.8 }} type="button" key={num} onClick={() => setFormData({...formData, su_bardagi: num})} className="focus:outline-none">
                        <Droplets size={32} className={`transition-all duration-300 ${formData.su_bardagi >= num ? 'text-blue-500 fill-blue-500 drop-shadow-md' : 'text-blue-200'}`} />
                      </motion.button>
                    ))}
                  </div>
                  <p className="text-center text-[10px] text-blue-400/70 font-bold mt-2">{formData.su_bardagi} / 8 Bardak</p>
                </div>

                {/* Fotoğraf Yükleme */}
                <div className="bg-purple-50/50 p-5 rounded-3xl shadow-sm border border-purple-100 text-center relative overflow-hidden">
                  <Camera className="absolute -right-4 -bottom-4 text-purple-200/50" size={100} />
                  <label className="block text-xs font-bold text-purple-500 mb-1 uppercase tracking-wider relative z-10">📸 Günün Anısı (Albüm İçin)</label>
                  <p className="text-[11px] text-purple-400 mb-4 relative z-10">Değişimini veya yemeğini çek!</p>
                  <div className="relative z-10 bg-white rounded-2xl p-2 border border-purple-100 shadow-sm">
                    <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-500 file:text-white hover:file:bg-purple-600 transition-all cursor-pointer" />
                  </div>
                  {formData.fotograf_url && !file && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 relative z-10">
                      <img src={formData.fotograf_url} alt="Anı" className="h-24 mx-auto rounded-xl shadow-md object-cover border-2 border-white" />
                    </motion.div>
                  )}
                </div>

                {/* Diğer Girdiler */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase flex items-center gap-1"><Utensils size={14}/> Adım</label>
                    <input type="number" placeholder="Örn: 8000" value={formData.adim_sayisi} onChange={e => setFormData({...formData, adim_sayisi: e.target.value})} className="w-full bg-gray-50 rounded-xl p-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-pink-200 outline-none transition-all" />
                  </div>
                  <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase flex items-center gap-1"><Scale size={14}/> Kilo</label>
                    <input type="number" step="0.1" placeholder="Opsiyonel" value={formData.kilo} onChange={e => setFormData({...formData, kilo: e.target.value})} className="w-full bg-gray-50 rounded-xl p-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-pink-200 outline-none transition-all" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Günün Öğünleri</label>
                  <textarea placeholder="Kahvaltı, Öğle..." value={formData.ogun_detayi} onChange={e => setFormData({...formData, ogun_detayi: e.target.value})} className="w-full bg-gray-50 rounded-xl p-3 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-pink-200 outline-none transition-all h-20 resize-none" />
                </div>

                <label className="flex items-center justify-between p-4 rounded-3xl border border-indigo-100 bg-indigo-50/50 cursor-pointer shadow-sm">
                  <div className="flex items-center gap-2"><Moon className="text-indigo-500" size={20}/><span className="text-sm font-bold text-indigo-700">Gece Yemeği Yedin Mi?</span></div>
                  <input type="checkbox" checked={formData.gece_yemegi} onChange={e => setFormData({...formData, gece_yemegi: e.target.checked})} className="w-6 h-6 accent-indigo-600 rounded-md" />
                </label>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={uploading} className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-extrabold rounded-3xl p-5 shadow-lg shadow-pink-200 flex justify-center items-center gap-2 text-lg disabled:opacity-70">
                  {uploading ? <span className="animate-pulse">Kaydediliyor... ⏳</span> : <><CheckCircle2 /> Günü Kaydet</>}
                </motion.button>
                {formStatus && <p className="text-center text-sm font-bold text-pink-500 mt-2">{formStatus}</p>}
              </form>
            </motion.div>
          )}

          {/* 3. İSTATİSTİKLER */}
          {activeTab === 'stats' && (
            <motion.div key="stats" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl shadow-sm border border-white text-center flex flex-col items-center">
                  <div className="bg-pink-100 p-2 rounded-full mb-2"><BarChart2 className="text-pink-500" size={20}/></div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Başarı</p>
                  <p className="text-3xl font-extrabold text-pink-500">%{successRate}</p>
                </div>
                <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl shadow-sm border border-white text-center flex flex-col items-center">
                  <div className="bg-green-100 p-2 rounded-full mb-2"><Utensils className="text-green-500" size={20}/></div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Adım Ort.</p>
                  <p className="text-3xl font-extrabold text-green-500">{avgSteps}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* 4. ALBÜM */}
          {activeTab === 'album' && (
            <motion.div key="album" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-xl border border-white">
              <div className="flex flex-col items-center justify-center mb-6 text-center">
                <div className="bg-purple-100 p-3 rounded-full mb-3"><ImageIcon className="text-purple-500" size={28}/></div>
                <h2 className="font-extrabold text-gray-700 text-xl">Değişim Galerisi</h2>
                <p className="text-xs text-gray-400 mt-1">30 günün sonunda oluşan muazzam sanat eserin.</p>
              </div>
              
              {photos.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-purple-100 shadow-inner">
                  <Camera size={40} className="mx-auto text-purple-200 mb-3" />
                  <p className="text-purple-400 font-bold text-sm">Henüz fotoğraf yok.<br/>Günlüklerden eklemeye başla!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {photos.map((rec) => (
                    <motion.div whileHover={{ scale: 1.05 }} key={rec.gun_sayisi} className="relative group rounded-2xl overflow-hidden shadow-md aspect-square bg-gray-100">
                      <img src={rec.fotograf_url} alt={`${rec.gun_sayisi}. Gün`} className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
                        <p className="text-white font-bold text-sm">{rec.gun_sayisi}. Gün</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* YÜZEN BUTONLAR (Kriz ve Not) */}
      <div className="fixed top-6 right-4 z-40 flex flex-col gap-3">
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { setCrisisMsg(CRISIS_MESSAGES[Math.floor(Math.random() * CRISIS_MESSAGES.length)]); setShowCrisis(true); }} className="bg-red-500 text-white p-3 rounded-full shadow-lg shadow-red-200 flex items-center justify-center">
          <AlertCircle size={24} />
        </motion.button>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setSecretNoteModal(LOVE_NOTES[Math.floor(Math.random() * LOVE_NOTES.length)])} className="bg-rose-500 text-white p-3 rounded-full shadow-lg shadow-rose-200 flex items-center justify-center">
          <Heart size={24} />
        </motion.button>
      </div>

      {/* BOTTOM NAVIGATION BAR (Gerçek Mobil Uygulama Menüsü) */}
      <div className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 pb-safe pt-2 px-6 flex justify-between items-center z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] h-20">
        <button onClick={() => setActiveTab('calendar')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'calendar' ? 'text-pink-500 scale-110' : 'text-gray-400 hover:text-gray-600'}`}>
          <Calendar size={24} className={activeTab === 'calendar' ? 'fill-pink-100' : ''}/>
          <span className="text-[10px] font-bold">Takvim</span>
        </button>
        <button onClick={() => openFormForDay(selectedDay)} className="relative -top-6">
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-4 rounded-full text-white shadow-lg shadow-pink-300 flex items-center justify-center transform transition-transform active:scale-95">
            <PlusCircle size={28} />
          </div>
        </button>
        <button onClick={() => setActiveTab('stats')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'stats' ? 'text-pink-500 scale-110' : 'text-gray-400 hover:text-gray-600'}`}>
          <BarChart2 size={24} className={activeTab === 'stats' ? 'fill-pink-100' : ''}/>
          <span className="text-[10px] font-bold">Analiz</span>
        </button>
        <button onClick={() => setActiveTab('album')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'album' ? 'text-pink-500 scale-110' : 'text-gray-400 hover:text-gray-600'}`}>
          <ImageIcon size={24} className={activeTab === 'album' ? 'fill-pink-100' : ''}/>
          <span className="text-[10px] font-bold">Albüm</span>
        </button>
      </div>

      {/* MODALLAR */}
      <AnimatePresence>
        {showCrisis && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-2 bg-red-500"></div>
              <AlertCircle size={60} className="mx-auto text-red-500 mb-4" />
              <h3 className="text-2xl font-extrabold text-red-500 mb-4">Derin Bir Nefes Al!</h3>
              <p className="text-gray-700 font-medium text-lg leading-relaxed mb-8">"{crisisMsg}"</p>
              <button onClick={() => setShowCrisis(false)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-2xl transition-colors">Tamam, Sakinleştim 😌</button>
            </motion.div>
          </motion.div>
        )}

        {secretNoteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-rose-500/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, rotate: -2 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.9, rotate: 2 }} className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl relative">
              <Heart size={60} className="mx-auto text-rose-500 mb-4 fill-rose-100" />
              <h3 className="text-2xl font-extrabold text-rose-500 mb-4 font-serif italic">Sevgilim...</h3>
              <p className="text-gray-700 font-medium text-lg leading-relaxed mb-8 italic">"{secretNoteModal}"</p>
              <button onClick={() => setSecretNoteModal(null)} className="w-full bg-rose-50 text-rose-600 font-bold py-4 rounded-2xl border border-rose-100">Seni Seviyorum! ❤️</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
