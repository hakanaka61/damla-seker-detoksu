'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import confetti from 'canvas-confetti';

const MOTIVATION_QUOTES = [
  "Başlamak için mükemmel bir gün! 🌸",
  "Kendin için harika bir şey yapıyorsun, devam et! ✨",
  "Şeker yok, enerji çok! 💪",
  "Cildin şimdiden parlamaya başladı bile! ✨",
  "Zorlandığında neden başladığını hatırla. Seni seviyorum! ❤️",
  "Harika gidiyorsun bebeğim, pes etmek yok! 🚀",
  "Tatlı olan sensin, şekere ihtiyacın yok! 🍓",
];

const CRISIS_MESSAGES = [
  "Derin bir nefes al! Bir bardak soğuk su içmeye ne dersin? 💧",
  "Hemen şekersiz bir Türk kahvesi veya yeşil çay yapıyoruz! ☕",
  "Canın tatlı değil, ilgi çekiyor olabilir. Seni çok seviyorum! ❤️",
  "Şu anki kriz 10 dakika içinde geçecek. Sadece 10 dakika dayan! 🧘‍♀️",
  "Git aynaya bak, ne kadar güzel göründüğünü fark et. Şeker bunu bozamaz! ✨",
  "Tatlı yerine 3 tane ceviz ve 1 tane kuru kayısı yiyebilirsin. 🥜"
];

// RASTGELE AŞK NOTLARI
const LOVE_NOTES = [
  "Gözlerindeki o azim beni sana her gün yeniden aşık ediyor sevgilim. ❤️",
  "Seninle gurur duyuyorum! Sadece şekersiz bir hayat değil, benim için hayatın ta kendisisin. 🌸",
  "Dünyanın en güzel, en iradeli sevgilisine kocaman bir öpücük! 😘",
  "Zorlandığında gözlerini kapat ve sana nasıl hayranlıkla baktığımı hatırla bebeğim. ✨",
  "Seni her halinle, her şeyinle çok seviyorum. Bu süreçte en büyük destekçin benim! 🌍❤️",
  "İçindeki gücü biliyorum. Sen istersen her şeyi başarırsın benim güzel sevgilim. 💪💖",
  "Bugün de harika görünüyorsun! Gülümsemen benim en büyük tatlım. 🍓",
  "Yaptığın her şeyde yanındayım. Sen çok güçlüsün ve harika gidiyorsun aşkım! 🌟"
];

const BIO_FACTS: Record<number, string> = {
  1: "İlk gün her zaman en zorudur. Vücudun şu an şekere ulaşamadığı için şaşkın ama hızlıca alışacak!",
  2: "Kan şekeri seviyelerin yavaş yavaş dengelenmeye başlıyor. İnsülin direncin kırılıyor.",
  3: "Tebrikler! Vücudundaki glikojen depoları boşalıyor ve yağ yakımı modu hızlanıyor.",
  4: "Dilindeki tat tomurcukları şekersizliğe alışıyor. Artık meyveler sana daha tatlı gelecek.",
  5: "Enerji seviyelerindeki ani düşüşler (öğleden sonraki uyku hali) ortadan kalkmaya başladı.",
  7: "Bir hafta bitti! Cildindeki kolajen yıkımı yavaşladı, aynaya bak daha parlak bir cildin var! ✨",
  10: "Bağırsak floran değişiyor! Kötü bakteriler azalırken, bağışıklığını güçlendiren bakteriler çoğalıyor.",
  14: "İki hafta geride kaldı! Kalp sağlığın iyileşiyor ve vücudundaki ödem/şişkinlik büyük oranda atıldı.",
  18: "Şeker bağımlılığı döngüsü tamamen kırıldı. Artık tatlı krizleri seni değil, sen onları yönetiyorsun.",
  21: "BAŞARDIN! Vücudun tamamen yenilendi, metabolizman hızlandı ve yepyeni bir sana dönüştün! 🦋"
};

const getBioFact = (day: number) => BIO_FACTS[day] || "Vücudun şekersizliğe alıştıkça hücrelerin yenileniyor ve gün boyu enerjin dengede kalıyor. Harika gidiyorsun!";

// GÜNCELLENEN ÖDÜL SİSTEMİ
const REWARDS = {
  3: "Güzel Başlangıç Rozeti! Hakan'dan sana kocaman bir aferin ve sarılma! 🤗",
  7: "7. Gün Ödülü: Harika gidiyorsun! Hakan'dan sana 500 TL nakit ödül! 💸💖",
  14: "14. Gün Ödülü: İradene hayranım! Hakan'dan sana 1000 TL nakit ödül! 💸💖",
  21: "🏆 BÜYÜK FİNAL! Şekeri yendin, sen bir harikasın! Hakan'dan sana tam 1500 TL büyük ödül! 💸💖"
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'form' | 'stats'>('calendar');
  const [records, setRecords] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [formStatus, setFormStatus] = useState('');
  
  // Modals
  const [showCrisis, setShowCrisis] = useState(false);
  const [crisisMsg, setCrisisMsg] = useState('');
  const [rewardModal, setRewardModal] = useState<{title: string, text: string} | null>(null);
  const [secretNoteModal, setSecretNoteModal] = useState<string | null>(null);
  
  const [streak, setStreak] = useState(0);

  const [formData, setFormData] = useState({
    seker_tuketimi: true, su_miktari: '', adim_sayisi: '',
    ogun_detayi: '', gece_yemegi: false, kilo: '', tatli_istegi: 1
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    const { data } = await supabase.from('damla_detoks').select('*').order('gun_sayisi', { ascending: true });
    if (data) {
      setRecords(data);
      calculateStreak(data);
    }
    setLoading(false);
  };

  const calculateStreak = (data: any[]) => {
    let maxStreak = 0;
    let currentStreak = 0;
    let prevDay = 0;

    const sorted = [...data].sort((a,b) => a.gun_sayisi - b.gun_sayisi);
    for (const rec of sorted) {
      if (rec.seker_tuketimi) {
        if (prevDay === 0 || rec.gun_sayisi === prevDay + 1) {
          currentStreak++;
        } else if (rec.gun_sayisi !== prevDay) {
          currentStreak = 1;
        }
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
      prevDay = rec.gun_sayisi;
    }
    setStreak(maxStreak);
  };

  const openFormForDay = (day: number) => {
    const existing = records.find(r => r.gun_sayisi === day);
    if (existing) {
      setFormData({
        seker_tuketimi: existing.seker_tuketimi,
        su_miktari: existing.su_miktari || '',
        adim_sayisi: existing.adim_sayisi || '',
        ogun_detayi: existing.ogun_detayi || '',
        gece_yemegi: existing.gece_yemegi || false,
        kilo: existing.kilo || '',
        tatli_istegi: existing.tatli_istegi || 1
      });
    } else {
      setFormData({ seker_tuketimi: true, su_miktari: '', adim_sayisi: '', ogun_detayi: '', gece_yemegi: false, kilo: '', tatli_istegi: 1 });
    }
    setSelectedDay(day);
    setActiveTab('form');
    setFormStatus('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('Kaydediliyor...');
    
    const existing = records.find(r => r.gun_sayisi === selectedDay);
    const payload = {
      gun_sayisi: selectedDay,
      seker_tuketimi: formData.seker_tuketimi,
      su_miktari: formData.su_miktari,
      adim_sayisi: formData.adim_sayisi ? parseInt(formData.adim_sayisi as string) : null,
      ogun_detayi: formData.ogun_detayi,
      gece_yemegi: formData.gece_yemegi,
      kilo: formData.kilo ? parseFloat(formData.kilo as string) : null,
      tatli_istegi: formData.tatli_istegi
    };

    let error;
    if (existing) {
      const { error: updateError } = await supabase.from('damla_detoks').update(payload).eq('gun_sayisi', selectedDay);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('damla_detoks').insert([payload]);
      error = insertError;
    }

    if (error) {
      setFormStatus('Hata: ' + error.message);
    } else {
      setFormStatus('✨ Başarıyla kaydedildi! ✨');
      if (selectedDay === 21 && formData.seker_tuketimi) {
        confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 }, colors: ['#ff69b4', '#ffffff', '#ffb6c1'] });
      }
      fetchRecords();
      setTimeout(() => setActiveTab('calendar'), 1500);
    }
  };

  const triggerCrisis = () => {
    const randomMsg = CRISIS_MESSAGES[Math.floor(Math.random() * CRISIS_MESSAGES.length)];
    setCrisisMsg(randomMsg);
    setShowCrisis(true);
  };

  const triggerLoveNote = () => {
    const randomNote = LOVE_NOTES[Math.floor(Math.random() * LOVE_NOTES.length)];
    setSecretNoteModal(randomNote);
  };

  const handleBadgeClick = (req: number, title: string) => {
    if (streak >= req) {
      setRewardModal({ title: `✨ ${title} Kilidi Açıldı! ✨`, text: REWARDS[req as keyof typeof REWARDS] });
    } else {
      setRewardModal({ title: `🔒 Kilitli Kutu (${title})`, text: `Bu ödülün kilidini açmak için ${req} gün boyunca aralıksız şekersiz beslenmelisin! Şu anki rekorun: ${streak} gün. Hadi yapabilirsin! 💪` });
    }
  };

  const todayQuote = MOTIVATION_QUOTES[new Date().getDay() % MOTIVATION_QUOTES.length];

  // STATS
  const totalDays = records.length;
  const sugarFreeDays = records.filter(r => r.seker_tuketimi).length;
  const successRate = totalDays ? Math.round((sugarFreeDays / totalDays) * 100) : 0;
  const validSteps = records.map(r => r.adim_sayisi).filter(a => a && a > 0);
  const avgSteps = validSteps.length ? Math.round(validSteps.reduce((a,b)=>a+b,0) / validSteps.length) : 0;
  const stepTarget = 10000;
  const stepPercent = avgSteps ? Math.round((avgSteps / stepTarget) * 100) : 0;
  const stepDiffPercent = Math.abs(100 - stepPercent);
  const validCravings = records.map(r => r.tatli_istegi).filter(t => t);
  const avgCraving = validCravings.length ? (validCravings.reduce((a,b)=>a+b,0) / validCravings.length).toFixed(1) : 0;
  const nightSnacks = records.filter(r => r.gece_yemegi).length;
  const weights = records.filter(r => r.kilo).sort((a,b) => a.gun_sayisi - b.gun_sayisi);
  const weightLost = weights.length >= 2 ? (weights[0].kilo - weights[weights.length - 1].kilo).toFixed(1) : 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-white pb-24 font-sans text-gray-800">
      
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-md shadow-sm p-6 text-center sticky top-0 z-10 rounded-b-[2rem] border-b border-white">
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400">
          Damla'nın Şeker Detoksu
        </h1>
        <p className="text-sm font-medium text-pink-600 mt-2 italic">"{todayQuote}"</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mt-6 space-x-2 px-4">
        <button onClick={() => setActiveTab('calendar')} className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'calendar' ? 'bg-pink-500 text-white shadow-md' : 'bg-white text-gray-500 border border-pink-200'}`}>📅 Takvim</button>
        <button onClick={() => setActiveTab('stats')} className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'stats' ? 'bg-pink-500 text-white shadow-md' : 'bg-white text-gray-500 border border-pink-200'}`}>📈 İlerleme & Analiz</button>
      </div>

      <div className="p-4 max-w-md mx-auto mt-4">
        
        {/* CALENDAR VIEW */}
        {activeTab === 'calendar' && (
          <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl border border-white">
            
            {/* ETKİLEŞİMLİ ROZETLER VE ÖDÜLLER */}
            <div className="bg-pink-50 rounded-2xl p-4 mb-6 border border-pink-100">
              <h3 className="text-xs font-bold text-center text-pink-500 mb-3 uppercase tracking-wider">Hediye & Ödül Kutuları</h3>
              <div className="flex justify-between items-center px-2">
                <button onClick={() => handleBadgeClick(3, '3 Gün Rozeti')} className={`flex flex-col items-center transition-all ${streak >= 3 ? 'opacity-100 scale-110 drop-shadow-md' : 'opacity-40 grayscale'}`}>
                  <span className="text-3xl">🥉</span><span className="text-[10px] font-bold mt-1 text-pink-600">3 Gün</span>
                </button>
                <button onClick={() => handleBadgeClick(7, '7 Gün Sürprizi')} className={`flex flex-col items-center transition-all ${streak >= 7 ? 'opacity-100 scale-110 drop-shadow-md animate-bounce' : 'opacity-40 grayscale'}`}>
                  <span className="text-3xl">🎁</span><span className="text-[10px] font-bold mt-1 text-pink-600">7 Gün</span>
                </button>
                <button onClick={() => handleBadgeClick(14, '14 Gün Sürprizi')} className={`flex flex-col items-center transition-all ${streak >= 14 ? 'opacity-100 scale-110 drop-shadow-md animate-bounce' : 'opacity-40 grayscale'}`}>
                  <span className="text-3xl">🎁</span><span className="text-[10px] font-bold mt-1 text-pink-600">14 Gün</span>
                </button>
                <button onClick={() => handleBadgeClick(21, 'Büyük Final Ödülü')} className={`flex flex-col items-center transition-all ${streak >= 21 ? 'opacity-100 scale-110 drop-shadow-lg' : 'opacity-40 grayscale'}`}>
                  <span className="text-3xl">🏆</span><span className="text-[10px] font-bold mt-1 text-pink-600">21 Gün</span>
                </button>
              </div>
              <p className="text-[10px] text-center text-gray-400 mt-3">* Ödüllerini görmek için kutulara dokun!</p>
            </div>

            <h2 className="text-center font-bold text-gray-700 mb-4">21 Günlük Serüven</h2>
            {loading ? <p className="text-center text-pink-400">Yükleniyor...</p> : (
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 21 }, (_, i) => i + 1).map(day => {
                  const rec = records.find(r => r.gun_sayisi === day);
                  let bgColor = 'bg-gray-100 border-gray-200 text-gray-400';
                  if (rec) bgColor = rec.seker_tuketimi ? 'bg-gradient-to-br from-green-400 to-green-500 text-white shadow-md border-none' : 'bg-gradient-to-br from-red-400 to-red-500 text-white shadow-md border-none';
                  return (
                    <button key={day} onClick={() => openFormForDay(day)} className={`aspect-square rounded-2xl flex flex-col items-center justify-center font-bold text-lg transition-transform active:scale-95 border-2 ${bgColor}`}>
                      {day}
                      {rec && <span className="text-xs font-normal mt-1">{rec.seker_tuketimi ? '🍬❌' : '🍬✅'}</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* FORM VIEW */}
        {activeTab === 'form' && (
          <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl border border-white animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-xl text-pink-600">Gün {selectedDay}</h2>
              <button onClick={() => setActiveTab('calendar')} className="text-sm bg-gray-100 px-3 py-1 rounded-full font-bold text-gray-500">Kapat ✕</button>
            </div>

            {/* BİLİMSEL GERÇEK KARTI */}
            <div className="bg-blue-50/80 border border-blue-100 p-4 rounded-2xl mb-5 shadow-sm">
              <p className="text-xs font-extrabold text-blue-500 mb-1 flex items-center">🧬 Vücudunda Neler Oluyor?</p>
              <p className="text-sm text-blue-800 leading-relaxed font-medium">{getBioFact(selectedDay)}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className={`flex items-center space-x-3 p-4 rounded-2xl shadow-sm border cursor-pointer transition-all ${formData.seker_tuketimi ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <input type="checkbox" className="w-6 h-6 text-green-500 rounded-md focus:ring-green-400" checked={formData.seker_tuketimi} onChange={e => setFormData({...formData, seker_tuketimi: e.target.checked})} />
                <span className={`font-bold ${formData.seker_tuketimi ? 'text-green-700' : 'text-red-700'}`}>
                  {formData.seker_tuketimi ? 'Başardım! Şeker Yemedim 🎉' : 'Maalesef Şeker Yedim 😔'}
                </span>
              </label>
              
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-pink-100">
                <label className="block text-sm font-bold text-gray-700 mb-2">Tatlı Krizim Ne Kadardı? (1-5)</label>
                <input type="range" min="1" max="5" value={formData.tatli_istegi} onChange={e => setFormData({...formData, tatli_istegi: Number(e.target.value)})} className="w-full accent-pink-500" />
                <div className="flex justify-between text-xs text-gray-400 mt-1 font-bold"><span>Hiç (1)</span><span>Çok (5)</span></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-2xl border border-blue-100">
                  <label className="block text-xs font-bold text-blue-500 mb-1">💧 İçilen Su</label>
                  <input type="text" required placeholder="2.5 L" value={formData.su_miktari} onChange={e => setFormData({...formData, su_miktari: e.target.value})} className="w-full bg-blue-50/50 rounded-xl p-2 text-sm focus:outline-none" />
                </div>
                <div className="bg-white p-3 rounded-2xl border border-green-100">
                  <label className="block text-xs font-bold text-green-500 mb-1">🚶‍♀️ Adım</label>
                  <input type="number" required placeholder="8000" value={formData.adim_sayisi} onChange={e => setFormData({...formData, adim_sayisi: e.target.value})} className="w-full bg-green-50/50 rounded-xl p-2 text-sm focus:outline-none" />
                </div>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-purple-100">
                <label className="block text-xs font-bold text-purple-500 mb-1">🍽 Neler Yedin?</label>
                <textarea required placeholder="Kahvaltı, Öğle..." value={formData.ogun_detayi} onChange={e => setFormData({...formData, ogun_detayi: e.target.value})} className="w-full bg-purple-50/50 rounded-xl p-2 text-sm focus:outline-none h-20 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col items-center justify-center p-3 rounded-2xl border border-gray-200 bg-gray-50">
                  <span className="text-xs font-bold text-gray-600 mb-2">Gece Yemeği 🌙</span>
                  <input type="checkbox" checked={formData.gece_yemegi} onChange={e => setFormData({...formData, gece_yemegi: e.target.checked})} className="w-5 h-5 accent-gray-600" />
                </label>
                <div className="bg-white p-3 rounded-2xl border border-orange-100">
                  <label className="block text-xs font-bold text-orange-500 mb-1">⚖️ Kilo</label>
                  <input type="number" step="0.1" placeholder="Opsiyonel" value={formData.kilo} onChange={e => setFormData({...formData, kilo: e.target.value})} className="w-full bg-orange-50/50 rounded-xl p-2 text-sm focus:outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white font-extrabold rounded-2xl p-4 shadow-lg active:scale-95 transition-all">Kaydet 🚀</button>
              {formStatus && <p className="text-center text-sm font-bold text-pink-600 mt-2">{formStatus}</p>}
            </form>
          </div>
        )}

        {/* DETAILED STATS VIEW */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-pink-100 text-center">
                <p className="text-xs font-bold text-gray-500 mb-1">Başarı Oranı</p>
                <p className="text-2xl font-extrabold text-pink-500">%{successRate}</p>
                <p className="text-[10px] text-gray-400 mt-1">{totalDays} günün {sugarFreeDays} günü şekersiz</p>
              </div>
              <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-green-100 text-center">
                <p className="text-xs font-bold text-gray-500 mb-1">Ortalama Adım</p>
                <p className="text-2xl font-extrabold text-green-500">{avgSteps}</p>
                <p className="text-[10px] text-gray-400 mt-1">Hedef: 10.000</p>
              </div>
              <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-purple-100 text-center">
                <p className="text-xs font-bold text-gray-500 mb-1">Tatlı Kriz Ort.</p>
                <p className="text-2xl font-extrabold text-purple-500">{avgCraving} <span className="text-sm">/ 5</span></p>
                <p className="text-[10px] text-gray-400 mt-1">İstek seviyesi</p>
              </div>
              <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-orange-100 text-center">
                <p className="text-xs font-bold text-gray-500 mb-1">Kilo Farkı</p>
                <p className="text-2xl font-extrabold text-orange-500">{Number(weightLost) > 0 ? `-${weightLost} kg` : `${weightLost} kg`}</p>
                <p className="text-[10px] text-gray-400 mt-1">İlk gün vs Son gün</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-md border border-white">
              <h3 className="font-bold text-gray-700 mb-3 flex items-center">💡 Sistem Analizi & Öneriler</h3>
              <ul className="space-y-3 text-sm font-medium">
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-0.5">🚶‍♀️</span>
                  <span className="text-gray-600">
                    {avgSteps >= stepTarget 
                      ? "Harika! Günlük 10.000 adım hedefinin üzerindesin. Metabolizman çok hızlı çalışıyor." 
                      : `Ortalama adımın ${avgSteps}. İdeal hedef olan 10.000 adımın %${stepDiffPercent} gerisindesin. Gün içine fazladan 20 dakikalık bir yürüyüş eklemelisin.`}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-500 mt-0.5">🧠</span>
                  <span className="text-gray-600">
                    {Number(avgCraving) > 3 
                      ? "Tatlı krizlerin genel olarak yüksek seyrediyor. Kan şekerini dengelemek için öğünlerine protein ekleyebilir veya tarçınlı su içebilirsin." 
                      : "Tatlı krizlerini çok iyi yönetiyorsun, istek seviyen oldukça düşük. İraden muazzam!"}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-0.5">🌙</span>
                  <span className="text-gray-600">
                    {nightSnacks > 0 
                      ? `Toplam ${totalDays} günün ${nightSnacks} gününde gece atıştırması yaptın. Gece yemeyi kesmek kilo vermeni %40 hızlandıracaktır.` 
                      : "Mükemmel! Gece yemeği alışkanlığını tamamen kırmış görünüyorsun. Sabahları çok daha dinç uyanacaksın."}
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-md border border-white">
              <h3 className="font-bold text-gray-700 mb-4 text-center">Adım Geçmişi (Trend)</h3>
              {records.length === 0 ? <p className="text-center text-gray-400 text-sm">Grafik için veri bekleniyor.</p> : (
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={records}>
                      <defs>
                        <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="gun_sayisi" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" name="Adım" dataKey="adim_sayisi" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSteps)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* LOVE NOTE BUTTON (Sabit Sol Alt) */}
      <button onClick={triggerLoveNote} className="fixed bottom-6 left-6 bg-rose-500 text-white font-extrabold py-3 px-5 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-bounce z-40 active:scale-90">
        💌 Aşk Notu
      </button>

      {/* CRISIS BUTTON (Sabit Sağ Alt) */}
      <button onClick={triggerCrisis} className="fixed bottom-6 right-6 bg-red-500 text-white font-extrabold py-3 px-5 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse z-40 active:scale-90">
        🚨 Kriz Anı!
      </button>

      {/* AÇILIR PENCERELER (MODALS) */}
      
      {/* 1. Kriz Modalı */}
      {showCrisis && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-200">
            <div className="text-5xl mb-4">🆘</div>
            <h3 className="text-xl font-bold text-red-500 mb-4">Dur, Sakin Ol!</h3>
            <p className="text-gray-700 font-medium text-lg leading-relaxed mb-6">"{crisisMsg}"</p>
            <button onClick={() => setShowCrisis(false)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors">Tamam, İyiyim 😌</button>
          </div>
        </div>
      )}

      {/* 2. Ödül Modalı */}
      {rewardModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-200 border-4 border-pink-100">
            <div className="text-5xl mb-4">🎁</div>
            <h3 className="text-xl font-extrabold text-pink-500 mb-4">{rewardModal.title}</h3>
            <p className="text-gray-700 font-medium text-lg leading-relaxed mb-6">{rewardModal.text}</p>
            <button onClick={() => setRewardModal(null)} className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-xl transition-colors shadow-md">Kapat</button>
          </div>
        </div>
      )}

      {/* 3. Gizli Aşk Notu Modalı */}
      {secretNoteModal && (
        <div className="fixed inset-0 bg-rose-500/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="text-5xl mb-4 animate-bounce">💌</div>
            <h3 className="text-2xl font-extrabold text-rose-500 mb-4 font-serif italic">Sevgilim...</h3>
            <p className="text-gray-700 font-medium text-lg leading-relaxed mb-8 italic">"{secretNoteModal}"</p>
            <button onClick={() => setSecretNoteModal(null)} className="w-full bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold py-3 rounded-xl transition-colors">Seni Seviyorum! ❤️</button>
          </div>
        </div>
      )}

    </main>
  );
}
