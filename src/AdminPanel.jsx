import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, appId, authReadyPromise } from './firebase.js';
import { NAMA_PETUGAS, DEFAULT_SETTINGS, compressImageFile } from './constants.js';

const getNextFriday = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = day <= 5 ? 5 - day : 7 - day + 5;
    const nextFri = new Date(today);
    nextFri.setDate(today.getDate() + (diff === 0 ? 7 : diff));
    return nextFri.toISOString().split('T')[0];
};

const playAdminBeep = (freq = 880, dur = 0.5, vol = 0.3) => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -20; comp.knee.value = 10;
        comp.ratio.value = 8; comp.attack.value = 0.003; comp.release.value = 0.1;
        osc.connect(gain); gain.connect(comp); comp.connect(ctx.destination);
        osc.frequency.value = freq; osc.type = 'sine';
        const sv = Math.min(vol * 0.05, 0.5);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(sv, ctx.currentTime + 0.02);
        gain.gain.setValueAtTime(sv, ctx.currentTime + dur - 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + dur + 0.05);
    } catch (e) { console.log('Beep error:', e); }
};

export default function AdminPanel() {
    const [user, setUser] = useState(null);
    const [authReady, setAuthReady] = useState(false);
    const [authError, setAuthError] = useState(null);
    const [pinInput, setPinInput] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem('admin_logged_in') === 'true');
    const [pinError, setPinError] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');

    // Shared Settings State
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);

    // Local inputs for sub-menus
    const [formPetugas, setFormPetugas] = useState({
        tanggal: getNextFriday(), khatib: '', imam: '', muadzin: '', bilal: ''
    });
    const [newPetugasName, setNewPetugasName] = useState('');
    const [newQuoteText, setNewQuoteText] = useState('');
    const [newQuoteSource, setNewQuoteSource] = useState('');
    
    // Keuangan local inputs
    const [formKeuangan, setFormKeuangan] = useState({
        pemasukan: '', pengeluaran: '', saldo: '', catatan: ''
    });
    
    // Link Gambar local input
    const [newImageUrl, setNewImageUrl] = useState('');

    // Wakaf Tarawih local inputs
    const [newWakafMalam, setNewWakafMalam] = useState('');
    const [newWakafJumlah, setNewWakafJumlah] = useState('');

    // Sleep Mode local inputs
    const [newSleepName, setNewSleepName] = useState('');
    const [newSleepStart, setNewSleepStart] = useState('22:00');
    const [newSleepEnd, setNewSleepEnd] = useState('03:00');

    // Custom Views local inputs
    const [newCustomName, setNewCustomName] = useState('');
    const [newCustomTitle, setNewCustomTitle] = useState('');
    const [newCustomContent, setNewCustomContent] = useState('');
    const [newCustomType, setNewCustomType] = useState('text'); // 'text' | 'image'
    const [newCustomSrc, setNewCustomSrc] = useState('');
    const [newCustomDuration, setNewCustomDuration] = useState(1);

    // Save status
    const [saveStatus, setSaveStatus] = useState(null); // null | 'ok' | 'error'
    const [isSaving, setIsSaving] = useState(false);
    const saveTimerRef = useRef(null);

    const showStatus = (ok) => {
        setSaveStatus(ok ? 'ok' : 'error');
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => setSaveStatus(null), 3000);
    };

    const isInitialLoadDone = useRef(false);

    // Firebase Auth — menggunakan shared module
    useEffect(() => {
        if (!auth) {
            console.error("AdminPanel: Firebase Auth object is null!");
            setAuthError('Firebase tidak terinisialisasi.');
            setAuthReady(true);
            return;
        }
        authReadyPromise.then((initialUser) => {
            console.log("AdminPanel: Auth ready dari shared module, user:", initialUser?.uid);
            if (initialUser) {
                setUser(initialUser);
                setAuthError(null);
            }
            setAuthReady(true);
        });
        return onAuthStateChanged(auth, (u) => {
            console.log("AdminPanel: Auth state berubah, user:", u?.uid);
            setUser(u);
            if (u) setAuthError(null);
        });
    }, []);

    // Sync settings from Firestore global_config
    useEffect(() => {
        if (!db) return;
        const ref = doc(db, 'artifacts', appId, 'settings', 'global_config');
        const unsub = onSnapshot(ref, (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                // Hanya update otomatis jika belum pernah load atau sedang di dashboard
                if (!isInitialLoadDone.current || activeTab === 'dashboard') {
                    setSettings(prev => ({ ...DEFAULT_SETTINGS, ...data }));
                    isInitialLoadDone.current = true;
                }
                if (data.khatibText) {
                    const parts = data.khatibText.split(' | ');
                    const p = {};
                    parts.forEach(part => {
                        const [k, v] = part.split(': ');
                        if (k && v) p[k.toLowerCase()] = v;
                    });
                    setFormPetugas(prev => ({
                        ...prev,
                        khatib: p['khatib'] || prev.khatib,
                        imam: p['imam'] || prev.imam,
                        muadzin: p['muadzin'] || prev.muadzin,
                        bilal: p['bilal'] || prev.bilal,
                    }));
                }
            }
        }, (err) => {
            console.error("AdminPanel: Error snapshot global_config:", err);
            setAuthError(`Akses database bermasalah: ${err.message}`);
        });
        return () => unsub();
    }, [activeTab]);

    // Generate khatibText aman tanpa throw exception
    const generateKhatibText = () => {
        try {
            const tglStr = formPetugas.tanggal 
                ? new Date(formPetugas.tanggal + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                : '-';
            return `Khatib: ${formPetugas.khatib || '-'} | Imam: ${formPetugas.imam || '-'} | Muadzin: ${formPetugas.muadzin || '-'} | Bilal: ${formPetugas.bilal || '-'} | Tanggal: ${tglStr}`;
        } catch (e) {
            return `Khatib: ${formPetugas.khatib || '-'} | Imam: ${formPetugas.imam || '-'} | Muadzin: ${formPetugas.muadzin || '-'} | Bilal: ${formPetugas.bilal || '-'}`;
        }
    };

    const saveToFirebase = async (updatedSettings = null) => {
        setIsSaving(true);
        console.log("AdminPanel: saveToFirebase dipanggil...");

        try {
            // Pastikan ada auth user aktif (cek state atau langsung ke auth.currentUser)
            let currentUser = user || auth?.currentUser;
            if (!currentUser && auth) {
                try {
                    const { signInAnonymously } = await import('firebase/auth');
                    const cred = await signInAnonymously(auth);
                    currentUser = cred.user;
                    setUser(currentUser);
                    console.log("AdminPanel: Auto sign-in berhasil -> UID:", currentUser?.uid);
                } catch (err) {
                    console.warn("AdminPanel: Auto sign-in gagal:", err);
                }
            }

            if (!db) {
                alert('Database Firebase tidak terinisialisasi. Periksa koneksi internet Anda.');
                showStatus(false);
                return;
            }

            const ref = doc(db, 'artifacts', appId, 'settings', 'global_config');
            let dataToSave = updatedSettings ? { ...settings, ...updatedSettings } : { ...settings };

            // Jika sedang di tab Petugas Jumat, otomatis sertakan khatibText terbarunya
            if (activeTab === 'petugas' && !updatedSettings?.khatibText) {
                dataToSave.khatibText = generateKhatibText();
            }

            // Filter dan sanitasi base64 images agar tidak melebihi batas Firestore 1MB
            if (dataToSave.images && Array.isArray(dataToSave.images)) {
                dataToSave.images = dataToSave.images.slice(0, 5).filter(img => {
                    if (typeof img === 'string' && img.startsWith('data:')) {
                        return img.length < 300000; // maksimal ~200KB per background image
                    }
                    return true;
                });
            }

            // Sanitasi customViews base64 images
            if (dataToSave.customViews && Array.isArray(dataToSave.customViews)) {
                dataToSave.customViews = dataToSave.customViews.map(cv => {
                    if (cv.type === 'image' && typeof cv.src === 'string' && cv.src.startsWith('data:')) {
                        if (cv.src.length > 500000) {
                            console.warn("Custom view image besar:", cv.name);
                        }
                    }
                    return cv;
                });
            }

            console.log("AdminPanel: Menulis ke Firestore path:", ref.path);
            await setDoc(ref, dataToSave, { merge: true });
            
            // Simpan ke localStorage agar sinkron langsung
            localStorage.setItem('masjid_settings', JSON.stringify(dataToSave));
            setSettings(dataToSave);

            console.log("AdminPanel: Berhasil menyimpan!");
            showStatus(true);
            playAdminBeep(880, 0.2, 0.3);
            alert("✅ Perubahan berhasil disimpan dan disinkronkan ke layar TV!");
        } catch (e) {
            console.error("AdminPanel: Error menulis Firestore:", e);
            let errorMsg = `Error menyimpan: ${e.message || e}`;
            if (e.message && e.message.includes('exceeds the maximum allowed size')) {
                errorMsg = 'Data terlalu besar! Hapus beberapa gambar lama atau unggah ulang gambar agar dikompres otomatis.';
            }
            alert(errorMsg);
            showStatus(false);
        } finally {
            setIsSaving(false);
        }
    };

    // Image compress
    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        for (const file of files) {
            try {
                const dataUrl = await compressImageFile(file, 1280, 75);
                setSettings(prev => {
                    const currentImages = (prev.images || []).slice(0, 4);
                    return { ...prev, images: [...currentImages, dataUrl] };
                });
            } catch (err) {
                console.error("Gagal kompres gambar:", err);
                alert("Gagal memproses gambar: " + (err.message || err));
            }
        }
        e.target.value = null;
    };

    // PIN check
    const handlePinKey = (digit) => {
        if (pinInput.length >= 4) return;
        const next = pinInput + digit;
        setPinInput(next);
        const correctPin = settings.adminPin || '1234';
        if (next.length === 4) {
            if (next === correctPin) {
                setIsLoggedIn(true);
                sessionStorage.setItem('admin_logged_in', 'true');
                setPinError(false);
            } else {
                setPinError(true);
                setTimeout(() => { setPinInput(''); setPinError(false); }, 800);
            }
        }
    };

    const handlePinBack = () => setPinInput(p => p.slice(0, -1));

    // === RENDER: PIN SCREEN ===
    if (!isLoggedIn) {
        const dots = Array(4).fill(null).map((_, i) => (
            <div key={i} className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${i < pinInput.length ? (pinError ? 'bg-red-500 border-red-500' : 'bg-emerald-500 border-emerald-500') : 'border-slate-400 bg-transparent'}`} />
        ));
        const numpad = ['1','2','3','4','5','6','7','8','9','','0','⌫'];
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex flex-col items-center justify-center p-6">
                <div className="text-5xl mb-3 animate-bounce">🕌</div>
                <h1 className="text-2xl font-black text-white mb-1 tracking-widest">ADMIN MASJID</h1>
                <p className="text-emerald-400 text-sm font-semibold mb-8">Masukkan PIN 4 Digit</p>

                <div className="flex gap-4 mb-8">{dots}</div>

                {pinError && (
                    <p className="text-red-400 text-sm font-bold mb-4 animate-pulse">PIN Salah! Coba lagi.</p>
                )}

                <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
                    {numpad.map((d, i) => {
                        if (d === '') return <div key={i} />;
                        return (
                            <button
                                key={i}
                                onClick={() => d === '⌫' ? handlePinBack() : handlePinKey(d)}
                                className={`h-16 rounded-2xl text-2xl font-black transition active:scale-95 shadow-lg
                                    ${d === '⌫'
                                        ? 'bg-slate-700 text-red-400 hover:bg-slate-600'
                                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                                    }`}
                            >
                                {d}
                            </button>
                        );
                    })}
                </div>
                <p className="text-slate-500 text-xs mt-8">Ubah PIN di Tab PIN Admin setelah masuk.</p>
            </div>
        );
    }

    // === DASHBOARD BUTTONS CONFIG ===
    const DASHBOARD_MENU = [
        { id: 'masjid', label: '🕌 Identitas & Murottal', desc: 'Nama, Alamat, & List Murottal', colorClass: 'bg-teal-105 text-emerald-900 border-emerald-300' },
        { id: 'petugas', label: '👤 Petugas Jumat', desc: 'Khatib, Imam, Bilal & Muadzin', colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
        { id: 'pengumuman', label: '📢 Pengumuman & Kas', desc: 'Running Text, Acara, & Kas', colorClass: 'bg-sky-100 text-sky-800 border-sky-200' },
        { id: 'media', label: '🖼️ Media & Tayangan', desc: 'Slide Gambar & YouTube Link', colorClass: 'bg-blue-100 text-blue-800 border-blue-200' },
        { id: 'customViews', label: '🖼️ Tampilan Kustom', desc: 'Kelola Layar Custom Pengurus', colorClass: 'bg-yellow-100 text-yellow-900 border-yellow-250' },
        { id: 'jadwal', label: '⏱️ Jadwal & Iqomah', desc: 'Jeda Iqomah, Offset, & Hijriah', colorClass: 'bg-amber-100 text-amber-800 border-amber-200' },
        { id: 'jumat', label: '🕌 Tampilan Jum\'at', desc: 'Tema, Murottal, & Elemen', colorClass: 'bg-teal-100 text-teal-800 border-teal-200' },
        { id: 'warna', label: '🎨 Warna & Tema TV', desc: 'Kustomisasi Palette Layar TV', colorClass: 'bg-pink-100 text-pink-800 border-pink-200' },
        { id: 'rotasi', label: '🔄 Rotasi & Event', desc: 'Transisi Otomatis & Hari Besar', colorClass: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
        { id: 'suara', label: '🔔 Suara Beep', desc: 'Uji & Atur Volume Beep TV', colorClass: 'bg-orange-100 text-orange-800 border-orange-200' },
        { id: 'ramadhan', label: '🌙 Fitur Ramadhan', desc: 'Countdown, Wakaf & Tarawih', colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
        { id: 'sleep', label: '💤 Mode Tidur TV', desc: 'Kelola Jadwal Layar Hitam TV', colorClass: 'bg-violet-100 text-violet-800 border-violet-200' },
        { id: 'warga', label: '📢 Info Warga', desc: 'Berita Duka (TTS) & Yasinan', colorClass: 'bg-purple-100 text-purple-800 border-purple-200' },
        { id: 'keamanan', label: '🔑 PIN Admin', desc: 'Ubah PIN Akses Pengurus', colorClass: 'bg-rose-100 text-rose-800 border-rose-200' }
    ];

    const TAB_TITLES = {
        masjid: '🕌 Identitas Masjid & Daftar Murottal',
        petugas: '👤 Penjadwalan Petugas Sholat Jumat',
        pengumuman: '📢 Running Text, Agenda, & Keuangan',
        media: '📺 Media Layar Utama TV',
        customViews: '🖼️ Kelola Tampilan Kustom (Custom Views)',
        jadwal: '⏱️ Jadwal & Jeda Waktu Sholat',
        jumat: '🕌 Konfigurasi Layar Hari Jum\'at',
        warna: '🎨 Warna & Kustomisasi Tema TV',
        rotasi: '🔄 Transisi & Hari Besar',
        suara: '🔔 Pengaturan Volume Beep',
        ramadhan: '🌙 Fitur Semarak Ramadhan & Jadwal',
        sleep: '💤 Kelola Jadwal Mode Tidur TV',
        warga: '📢 Layanan Info Warga (Duka & Yasinan)',
        keamanan: '🔑 Ubah PIN Keamanan Admin'
    };

    const combinedPetugasList = [...new Set([...NAMA_PETUGAS, ...(settings.extraPetugas || [])])].sort();

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 text-white px-4 py-4 shadow-lg sticky top-0 z-40">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-black tracking-wide">Panel Admin Masjid</h1>
                        <p className="text-emerald-200 text-xs font-semibold">Nurul Huda — Akses HP Cepat & Mudah</p>
                    </div>
                    {activeTab !== 'dashboard' && (
                        <button
                            onClick={() => { setActiveTab('dashboard'); playAdminBeep(660, 0.1, 0.1); }}
                            className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-2 rounded-xl transition"
                        >
                            🏠 Dashboard
                        </button>
                    )}
                    {activeTab === 'dashboard' && (
                        <button
                            onClick={() => { setIsLoggedIn(false); sessionStorage.removeItem('admin_logged_in'); }}
                            className="bg-red-700/50 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition border border-red-500/30"
                        >
                            Keluar
                        </button>
                    )}
                </div>
            </div>

            {settings.testLayoutMode && settings.testLayoutMode !== 'none' && (
                <div className="bg-red-650 text-white px-4 py-3 flex items-center justify-between shadow-md z-30 font-semibold animate-pulse text-sm">
                    <span className="flex items-center gap-2">
                        🧪 <strong>MODE UJI COBA AKTIF:</strong> Tampilan TV sedang dipaksa menampilkan '{settings.testLayoutMode === 'sleep' ? 'Mode Tidur' : settings.testLayoutMode === 'berita_duka' ? 'Berita Duka' : settings.testLayoutMode === 'info_yasinan' ? 'Jadwal Yasinan' : settings.testLayoutMode === 'adzan' ? 'Layar Adzan (Satu per Satu)' : 'Kas Keuangan'}' untuk pengetesan.
                    </span>
                    <button 
                        onClick={async () => {
                            const updated = { testLayoutMode: 'none' };
                            setSettings(prev => ({ ...prev, ...updated }));
                            await saveToFirebase(updated);
                        }}
                        className="bg-white text-red-700 px-3 py-1.5 rounded-lg text-xs font-black hover:bg-slate-100 transition shadow"
                    >
                        ✕ Matikan Uji Coba
                    </button>
                </div>
            )}

            {/* Content Container */}
            <div className="flex-1 p-4 pb-36 max-w-4xl mx-auto w-full">

                {/* ====== DASHBOARD LANDING SCREEN (Kotak-Kotak / Grid) ====== */}
                {activeTab === 'dashboard' && (
                    <div className="flex flex-col gap-5 animate-fadeIn">
                        {/* Welcome Card */}
                        <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden border border-white/10">
                            <div className="absolute right-0 bottom-0 opacity-10 text-9xl pointer-events-none translate-y-6 translate-x-4">🕌</div>
                            <h2 className="text-2xl font-black mb-1">Assalamu'alaikum, Admin</h2>
                            <p className="text-emerald-300 text-xs font-semibold">Selamat datang di Panel Kontrol Jam Masjid Nurul Huda. Atur semua setingan layar TV langsung dari HP Anda.</p>
                            
                            {/* Live Status — Menampilkan status koneksi yang sebenarnya */}
                            <div className={`flex items-center gap-2 mt-4 rounded-xl px-3 py-2 w-fit border ${
                                !authReady ? 'bg-yellow-500/20 border-yellow-500/30' :
                                (user && db) ? 'bg-white/10 border-white/15' :
                                'bg-red-500/20 border-red-500/30'
                            }`}>
                                <span className="relative flex h-2.5 w-2.5">
                                    {!authReady ? (
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-400 animate-pulse"></span>
                                    ) : (user && db) ? (
                                        <>
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                        </>
                                    ) : (
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                    )}
                                </span>
                                <span className={`text-[10px] font-black tracking-widest uppercase ${
                                    !authReady ? 'text-yellow-200' :
                                    (user && db) ? 'text-emerald-200' :
                                    'text-red-200'
                                }`}>
                                    {!authReady ? 'Menghubungkan Firebase...' :
                                     (user && db) ? 'Database Firebase Sinkron' :
                                     authError || 'Firebase Tidak Terhubung'}
                                </span>
                            </div>
                            {authError && authReady && (
                                <p className="text-[10px] text-red-300 mt-2 leading-relaxed">
                                    ⚠️ {authError}
                                </p>
                            )}
                        </div>

                        {/* Quick Action: Segerakan Iqomat Langsung */}
                        <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 text-white p-4 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 border border-amber-300">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-3xl animate-pulse shadow-inner">
                                    ⚡
                                </div>
                                <div>
                                    <h3 className="font-black text-sm sm:text-base tracking-wide flex items-center gap-1.5">
                                        SEGERAKAN / PERCEPAT IQOMAT TV
                                    </h3>
                                    <p className="text-xs text-amber-100 font-semibold leading-relaxed mt-0.5">
                                        Klik tombol ini saat jamaah sudah banyak/siap agar layar TV langsung berbunyi beep 3x & menampilkan <strong>"SAATNYA IQOMAT"</strong> tanpa menunggu hitung mundur habis.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={async () => {
                                    if (confirm("Segerakan Iqomat sekarang di layar TV? (Layar akan langsung berbunyi beep 3x dan menampilkan 'SAATNYA IQOMAT')")) {
                                        const updated = { forceIqomatTimestamp: Date.now() };
                                        setSettings(prev => ({ ...prev, ...updated }));
                                        await saveToFirebase(updated);
                                        alert("📢 Perintah 'SAATNYA IQOMAT' berhasil dikirim ke layar TV!");
                                    }
                                }}
                                className="w-full sm:w-auto bg-white text-red-700 hover:bg-amber-50 px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition shadow-md flex items-center justify-center gap-2 whitespace-nowrap active:scale-95 border border-white/50"
                            >
                                ⚡ SEGERAKAN IQOMAT SEKARANG
                            </button>
                        </div>

                        {/* Grid Menu Kotak-Kotak */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {DASHBOARD_MENU.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        playAdminBeep(880, 0.1, 0.1);
                                    }}
                                    className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md active:scale-95 text-center group min-h-[140px]"
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-3 shadow-inner border ${item.colorClass}`}>
                                        {item.id === 'masjid' && '🕌'}
                                        {item.id === 'petugas' && '👤'}
                                        {item.id === 'pengumuman' && '📢'}
                                        {item.id === 'media' && '🖼️'}
                                        {item.id === 'customViews' && '🖼️'}
                                        {item.id === 'jadwal' && '⏱️'}
                                        {item.id === 'jumat' && '🕌'}
                                        {item.id === 'warna' && '🎨'}
                                        {item.id === 'rotasi' && '🔄'}
                                        {item.id === 'suara' && '🔔'}
                                        {item.id === 'ramadhan' && '🌙'}
                                        {item.id === 'sleep' && '💤'}
                                        {item.id === 'warga' && '📢'}
                                        {item.id === 'keamanan' && '🔑'}
                                    </div>
                                    <span className="font-bold text-slate-800 text-sm mb-1 group-hover:text-emerald-700 transition">{item.label}</span>
                                    <span className="text-[10px] text-slate-400 font-semibold leading-tight">{item.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ====== SUB VIEW CONTAINER & HEADER ====== */}
                {activeTab !== 'dashboard' && (
                    <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4 animate-fadeIn">
                        {/* Tab Sub-Header */}
                        <div className="flex items-center gap-3 border-b pb-3 mb-2">
                            <button
                                onClick={() => {
                                    setActiveTab('dashboard');
                                    playAdminBeep(660, 0.1, 0.1);
                                }}
                                className="flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-black transition shadow-sm border border-slate-200"
                            >
                                ⬅️ Dashboard
                            </button>
                            <h2 className="text-base font-black text-slate-800">
                                {TAB_TITLES[activeTab]}
                            </h2>
                        </div>

                        {/* ====== TAB: MASJID IDENTITAS & MUROTTAL ====== */}
                        {activeTab === 'masjid' && (
                            <div className="flex flex-col gap-4 animate-fadeIn">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
                                    <h3 className="font-bold text-slate-700 text-sm border-b pb-1">🏢 Identitas Masjid & Informasi TV</h3>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1">Nama Masjid</label>
                                        <input
                                            type="text"
                                            value={settings.mosqueName || ''}
                                            onChange={e => setSettings({ ...settings, mosqueName: e.target.value })}
                                            className="w-full p-3 rounded-lg border border-slate-300 outline-none text-slate-700 font-semibold focus:border-emerald-650 bg-white"
                                            placeholder="Contoh: MASJID NURUL HUDA"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1">Alamat Lengkap</label>
                                        <input
                                            type="text"
                                            value={settings.mosqueAddress || ''}
                                            onChange={e => setSettings({ ...settings, mosqueAddress: e.target.value })}
                                            className="w-full p-3 rounded-lg border border-slate-300 outline-none text-slate-700 font-semibold focus:border-emerald-650 bg-white"
                                            placeholder="Contoh: Jl. Raya Desa Ujung Tanjung"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1">Kota/Kabupaten (Penting untuk Jadwal Sholat API)</label>
                                        <input
                                            type="text"
                                            value={settings.city || ''}
                                            onChange={e => setSettings({ ...settings, city: e.target.value })}
                                            className="w-full p-3 rounded-lg border border-slate-300 outline-none text-slate-700 font-semibold focus:border-emerald-650 bg-white"
                                            placeholder="Contoh: KAB. OGAN KOMERING ILIR"
                                        />
                                        <span className="text-[10px] text-slate-400 mt-1 block">Tulis nama Kabupaten/Kota yang terdaftar di database jadwal sholat (contoh: "Palembang", "Kabupaten Ogan Komering Ilir").</span>
                                    </div>
                                </div>

                                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-250 flex flex-col gap-3">
                                    <h3 className="font-bold text-emerald-800 text-sm border-b pb-1">🎵 Konfigurasi Daftar Putar Murottal (Audio MP3)</h3>
                                    <p className="text-xs text-emerald-650 font-semibold">Tulis satu tautan/URL MP3 audio murottal per baris. Audio ini akan diputar secara acak saat masa persiapan menjelang waktu sholat.</p>
                                    <textarea
                                        value={(settings.murottalLinks || []).join('\n')}
                                        onChange={e => {
                                            const arr = e.target.value.split('\n').map(s => s.trim()).filter(Boolean);
                                            setSettings({ ...settings, murottalLinks: arr });
                                        }}
                                        rows={10}
                                        className="w-full p-3 rounded-lg border border-emerald-300 font-mono text-xs outline-none text-slate-700 focus:border-emerald-600 bg-white"
                                        placeholder="https://example.com/audio/001.mp3"
                                    />
                                    <div className="text-[10px] text-emerald-700 font-bold">
                                        Total Tautan Terdaftar: {(settings.murottalLinks || []).length} audio.
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ====== TAB: TAMPILAN KUSTOM (CUSTOM VIEWS) ====== */}
                        {activeTab === 'customViews' && (
                            <div className="flex flex-col gap-4 animate-fadeIn">
                                {/* Form Tambah Tampilan Kustom Baru */}
                                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col gap-4">
                                    <h3 className="font-bold text-slate-700 text-sm border-b pb-1">➕ Tambah Tampilan Kustom Baru</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 block mb-1">Nama Tampilan (Untuk Referensi Admin)</label>
                                            <input 
                                                type="text" 
                                                value={newCustomName}
                                                onChange={e => setNewCustomName(e.target.value)}
                                                className="w-full p-2.5 rounded-lg border text-sm text-slate-700 bg-white" 
                                                placeholder="cth: Pengumuman Sholat Gerhana" 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 block mb-1">Durasi Tampil (Menit)</label>
                                            <input 
                                                type="number" 
                                                min="1"
                                                value={newCustomDuration}
                                                onChange={e => setNewCustomDuration(Number(e.target.value))}
                                                className="w-full p-2.5 rounded-lg border text-sm text-slate-700 bg-white" 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 block mb-1">Tipe Tampilan</label>
                                            <select 
                                                value={newCustomType}
                                                onChange={e => {
                                                    setNewCustomType(e.target.value);
                                                    setNewCustomSrc('');
                                                }}
                                                className="w-full p-2.5 rounded-lg border text-sm text-slate-700 bg-white"
                                            >
                                                <option value="text">📄 Pengumuman Teks Layar</option>
                                                <option value="image">🖼️ Gambar / Pamflet Background</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Jika Tipe Teks */}
                                    {newCustomType === 'text' && (
                                        <div className="flex flex-col gap-3 border-t pt-3">
                                            <div>
                                                <label className="text-xs font-bold text-slate-600 block mb-1">Judul Pengumuman</label>
                                                <input 
                                                    type="text" 
                                                    value={newCustomTitle}
                                                    onChange={e => setNewCustomTitle(e.target.value)}
                                                    className="w-full p-2.5 rounded-lg border text-sm text-slate-700 bg-white" 
                                                    placeholder="cth: SHOLAT GERHANA BULAN" 
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-600 block mb-1">Konten / Isi Pengumuman</label>
                                                <textarea 
                                                    value={newCustomContent}
                                                    onChange={e => setNewCustomContent(e.target.value)}
                                                    rows={4}
                                                    className="w-full p-2.5 rounded-lg border text-sm text-slate-700 bg-white leading-relaxed" 
                                                    placeholder="Tulis pengumuman lengkap di sini..." 
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Jika Tipe Gambar */}
                                    {newCustomType === 'image' && (
                                        <div className="flex flex-col gap-3 border-t pt-3">
                                            <div>
                                                <label className="text-xs font-bold text-slate-600 block mb-1">Pilih Sumber Gambar</label>
                                                <div className="flex flex-col gap-2">
                                                    <div className="bg-amber-50 p-3.5 rounded-xl border-2 border-dashed border-amber-300 flex flex-col gap-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                                                                📁 UNGGAH FILE GAMBAR DARI HP / LAPTOP
                                                            </span>
                                                            <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full shadow-sm">
                                                                💾 Cache Offline Otomatis
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-amber-800 leading-tight">
                                                            Gambar akan otomatis dikompres & disimpan secara permanen di cache TV, sehingga <strong>tetap muncul saat TV offline tanpa koneksi internet</strong>.
                                                        </p>
                                                        <input 
                                                            type="file" 
                                                            accept="image/*"
                                                            onChange={async (e) => {
                                                                const file = e.target.files[0];
                                                                if (!file) return;
                                                                try {
                                                                    const dataUrl = await compressImageFile(file, 1280, 75);
                                                                    setNewCustomSrc(dataUrl);
                                                                } catch (err) {
                                                                    alert("Gagal memproses gambar: " + (err.message || err));
                                                                }
                                                            }}
                                                            className="text-xs text-slate-700 block mt-1 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer" 
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {newCustomSrc && (
                                                <div className="mt-2">
                                                    <span className="text-xs font-bold text-slate-400 block mb-1">Pratinjau Gambar:</span>
                                                    <img src={newCustomSrc} alt="Preview" className="max-h-36 rounded border" />
                                                    {newCustomSrc.startsWith('data:') && (
                                                        <button 
                                                            type="button"
                                                            onClick={() => setNewCustomSrc('')}
                                                            className="text-red-500 text-[10px] font-bold mt-1 block"
                                                        >
                                                            ✕ Hapus Gambar Unggahan
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <button 
                                        type="button"
                                        onClick={async () => {
                                            if (!newCustomName) {
                                                alert("Harap isi Nama Tampilan terlebih dahulu!");
                                                return;
                                            }
                                            if (newCustomType === 'text' && (!newCustomTitle || !newCustomContent)) {
                                                alert("Harap lengkapi Judul dan Konten Teks!");
                                                return;
                                            }
                                            if (newCustomType === 'image' && !newCustomSrc) {
                                                alert("Harap isi URL gambar atau unggah file gambar lokal!");
                                                return;
                                            }

                                            const list = settings.customViews || [];
                                            const newId = 'custom_' + Date.now();
                                            const newItem = {
                                                id: newId,
                                                type: newCustomType,
                                                name: newCustomName,
                                                duration: newCustomDuration || 1,
                                                title: newCustomType === 'text' ? newCustomTitle : '',
                                                content: newCustomType === 'text' ? newCustomContent : '',
                                                src: newCustomType === 'image' ? newCustomSrc : ''
                                            };

                                            const updatedList = [...list, newItem];
                                            setSettings(prev => ({ ...prev, customViews: updatedList }));

                                            // Reset form inputs
                                            setNewCustomName('');
                                            setNewCustomTitle('');
                                            setNewCustomContent('');
                                            setNewCustomSrc('');
                                            setNewCustomDuration(1);
                                            
                                            // Auto-save langsung ke Firebase
                                            await saveToFirebase({ customViews: updatedList });
                                            alert("✅ Tampilan kustom berhasil dibuat & tersimpan ke TV!");
                                        }}
                                        className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow text-xs"
                                    >
                                        💾 Simpan & Tambahkan Tampilan Kustom
                                    </button>
                                </div>

                                {/* Daftar Tampilan Kustom yang Ada */}
                                <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col gap-3">
                                    <h3 className="font-bold text-slate-700 text-sm border-b pb-1">📋 Daftar Tampilan Kustom Anda</h3>
                                    {(settings.customViews || []).length === 0 ? (
                                        <p className="text-xs text-slate-400 italic text-center py-4">Belum ada tampilan kustom yang dibuat.</p>
                                    ) : (
                                        <div className="flex flex-col gap-2.5">
                                            {(settings.customViews || []).map((cv, idx) => (
                                                <div key={cv.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-250 bg-slate-50 gap-3">
                                                    <div className="flex items-center gap-3">
                                                        {cv.type === 'image' && cv.src ? (
                                                            <img src={cv.src} alt={cv.name} className="w-12 h-12 object-cover rounded-lg border shadow-sm flex-shrink-0 bg-black/10" />
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-lg bg-purple-100 border border-purple-300 flex items-center justify-center text-xl flex-shrink-0">
                                                                {cv.type === 'text' ? '📄' : '🖼️'}
                                                            </div>
                                                        )}
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-xs font-black text-slate-800">{cv.name}</span>
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                                Tipe: {cv.type === 'text' ? '📄 Teks' : '🖼️ Gambar Pamflet'} | Durasi: {cv.duration} Menit
                                                            </span>
                                                            {cv.type === 'image' && (
                                                                <span className="text-[9px] font-bold text-emerald-700">
                                                                    ✓ Tersimpan Offline di Cache TV
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 self-end sm:self-center">
                                                        {cv.type === 'image' && (
                                                            <label className="text-amber-700 hover:text-amber-900 font-bold text-[10px] bg-amber-50 border border-amber-250 hover:bg-amber-100 transition px-2.5 py-1.5 rounded cursor-pointer">
                                                                📁 Ganti Gambar
                                                                <input 
                                                                    type="file" 
                                                                    accept="image/*" 
                                                                    className="hidden" 
                                                                    onChange={async (e) => {
                                                                        const file = e.target.files[0];
                                                                        if (!file) return;
                                                                        try {
                                                                            const dataUrl = await compressImageFile(file, 1280, 75);
                                                                            const updatedList = [...(settings.customViews || [])];
                                                                            updatedList[idx] = { ...updatedList[idx], src: dataUrl };
                                                                            setSettings(prev => ({ ...prev, customViews: updatedList }));
                                                                            await saveToFirebase({ customViews: updatedList });
                                                                            alert(`✅ Gambar "${cv.name}" berhasil diganti dan disimpan ke TV!`);
                                                                        } catch (err) {
                                                                            alert("Gagal memproses gambar: " + (err.message || err));
                                                                        }
                                                                    }}
                                                                />
                                                            </label>
                                                        )}
                                                        {settings.testLayoutMode === cv.id ? (
                                                            <button 
                                                                type="button" 
                                                                onClick={async () => {
                                                                    const updated = { testLayoutMode: 'none' };
                                                                    setSettings(prev => ({ ...prev, ...updated }));
                                                                    await saveToFirebase(updated);
                                                                }}
                                                                className="bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded transition shadow-sm"
                                                             >
                                                                 ✕ Matikan Uji
                                                             </button>
                                                         ) : (
                                                             <button 
                                                                 type="button" 
                                                                 onClick={async () => {
                                                                     const updated = { testLayoutMode: cv.id };
                                                                     setSettings(prev => ({ ...prev, ...updated }));
                                                                     await saveToFirebase(updated);
                                                                 }}
                                                                 className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded transition shadow-sm"
                                                             >
                                                                 🧪 Uji Coba TV
                                                             </button>
                                                         )}
                                                         <button 
                                                             type="button" 
                                                             onClick={async () => {
                                                                 if (confirm(`Hapus tampilan kustom "${cv.name}"?`)) {
                                                                     const list = settings.customViews || [];
                                                                     const updatedList = list.filter(item => item.id !== cv.id);
                                                                     
                                                                     const rotList = settings.rotasiTampilan || [];
                                                                     const updatedRotList = rotList.filter(item => item !== cv.id);
                                                                     
                                                                     setSettings(prev => ({ 
                                                                         ...prev, 
                                                                         customViews: updatedList,
                                                                         rotasiTampilan: updatedRotList
                                                                     }));
                                                                     await saveToFirebase({ customViews: updatedList, rotasiTampilan: updatedRotList });
                                                                     alert(`✅ Tampilan kustom "${cv.name}" berhasil dihapus.`);
                                                                 }
                                                             }}
                                                             className="text-red-500 hover:text-red-700 font-bold text-[10px] bg-red-50 border border-red-200 hover:bg-red-100 transition px-2.5 py-1.5 rounded"
                                                         >
                                                             Hapus
                                                         </button>
                                                     </div>
                                                 </div>
                                             ))}
                                         </div>
                                     )}
                                </div>
                            </div>
                        )}

                        {/* ====== TAB 1: PETUGAS JUMAT ====== */}
                        {activeTab === 'petugas' && (
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-2">Tanggal Jumat</label>
                                    <input
                                        type="date"
                                        value={formPetugas.tanggal}
                                        onChange={e => {
                                            const d = new Date(e.target.value + 'T00:00:00');
                                            if (d.getDay() !== 5) { alert('Harap pilih hari Jumat!'); return; }
                                            setFormPetugas({ ...formPetugas, tanggal: e.target.value });
                                        }}
                                        className="w-full p-3 rounded-xl border-2 border-slate-200 outline-none focus:border-emerald-500 transition text-slate-700 font-semibold"
                                    />
                                </div>

                                {[
                                    { key: 'khatib', label: '🎙️ Khatib' },
                                    { key: 'imam', label: '🤲 Imam' },
                                    { key: 'muadzin', label: '📢 Muadzin' },
                                    { key: 'bilal', label: '🔔 Bilal' },
                                ].map(({ key, label }) => (
                                    <div key={key}>
                                        <label className="block text-sm font-bold text-slate-600 mb-2">{label}</label>
                                        <select
                                            value={formPetugas[key]}
                                            onChange={e => setFormPetugas({ ...formPetugas, [key]: e.target.value })}
                                            className="w-full p-3 rounded-xl border-2 border-slate-200 outline-none bg-white focus:border-emerald-500 transition text-slate-700 font-semibold"
                                        >
                                            <option value="">-- Pilih {label.replace(/[^a-zA-Z ]/g, '').trim()} --</option>
                                            {combinedPetugasList.map(n => <option key={n} value={n}>{n}</option>)}
                                        </select>
                                    </div>
                                ))}

                                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 mt-2">
                                    <label className="block text-sm font-bold text-emerald-800 mb-2">➕ Tambah Nama Petugas Baru</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={newPetugasName} 
                                            onChange={e => setNewPetugasName(e.target.value)} 
                                            placeholder="Ketik Nama Lengkap & Gelar..." 
                                            className="flex-1 p-3 rounded-xl border border-emerald-300 outline-none text-slate-700 font-semibold bg-white" 
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                const val = newPetugasName.trim();
                                                if (val && !combinedPetugasList.includes(val)) {
                                                    const updatedExtra = [...(settings.extraPetugas || []), val];
                                                    setSettings(prev => ({ ...prev, extraPetugas: updatedExtra }));
                                                    setNewPetugasName('');
                                                    alert('Nama berhasil ditambahkan ke daftar! Silakan pilih dari dropdown di atas.');
                                                } else if (combinedPetugasList.includes(val)) {
                                                    alert('Nama petugas sudah terdaftar!');
                                                }
                                            }} 
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl shadow transition"
                                        >
                                            Tambah
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mt-2">
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            const txt = generateKhatibText();
                                            const updatedData = { khatibText: txt };
                                            setSettings(prev => ({ ...prev, ...updatedData }));
                                            await saveToFirebase(updatedData);
                                            alert('Teks petugas sholat Jumat berhasil disimpan & dikirim ke TV!');
                                        }}
                                        className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition shadow mb-3"
                                    >
                                        ⚡ Generate Teks Petugas
                                    </button>
                                    <p className="text-xs font-bold text-emerald-800 mb-1">Preview teks saat ini:</p>
                                    <p className="text-sm text-emerald-900 break-words leading-relaxed font-semibold bg-white p-3 rounded-lg border border-emerald-100">
                                        {settings.khatibText || '- Belum di-generate -'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ====== TAB 2: PENGUMUMAN & KEUANGAN ====== */}
                        {activeTab === 'pengumuman' && (
                            <div className="flex flex-col gap-4">
                                {/* Running Text */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-600">🏃 Teks Berjalan Utama (Marquee)</label>
                                    <textarea
                                        value={settings.marqueeText || ''}
                                        onChange={e => setSettings({ ...settings, marqueeText: e.target.value })}
                                        rows={3}
                                        className="w-full p-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500 text-slate-700 leading-relaxed font-semibold"
                                        placeholder="Ketik pengumuman running text..."
                                    />
                                </div>

                                {/* Pengumuman Slide */}
                                <div className="flex flex-col gap-2 border-t pt-4">
                                    <label className="text-sm font-bold text-slate-600">📢 Slide Informasi & Acara</label>
                                    <p className="text-xs text-slate-400">Gunakan tanda "|" untuk memisahkan beberapa acara agar bergantian slide di TV.</p>
                                    <textarea
                                        value={settings.acaraText || ''}
                                        onChange={e => setSettings({ ...settings, acaraText: e.target.value })}
                                        rows={4}
                                        className="w-full p-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500 text-slate-700 leading-relaxed font-semibold"
                                        placeholder="Kajian Ba'da Maghrib Setiap Ahad. | Peringatan Hari Besar Islam Besok."
                                    />
                                </div>

                                 {/* Keuangan Masjid */}
                                 <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-4 border-t mt-4">
                                     <h3 className="text-sm font-black text-slate-700 flex items-center gap-1">💰 Laporan Keuangan Kas Masjid</h3>
                                     
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                         <div>
                                             <label className="text-xs font-bold text-slate-600 block mb-1">Mode Tampilan di TV</label>
                                             <select
                                                 value={settings.keuanganMode || 'visual'}
                                                 onChange={e => setSettings({ ...settings, keuanganMode: e.target.value })}
                                                 className="w-full p-3 rounded-xl border border-slate-200 outline-none text-slate-700 font-semibold bg-white text-xs"
                                             >
                                                 <option value="visual">📊 Infografis Grafik Visual (Rekomendasi)</option>
                                                 <option value="text">📄 Teks Laporan Klasik</option>
                                             </select>
                                         </div>
                                         <div>
                                             <label className="text-xs font-bold text-slate-600 block mb-1">Judul Laporan Keuangan</label>
                                             <input 
                                                 type="text" 
                                                 value={settings.keuanganTitle || 'LAPORAN KAS MINGGUAN MASJID'} 
                                                 onChange={e => setSettings({ ...settings, keuanganTitle: e.target.value })} 
                                                 className="w-full p-3 rounded-xl border border-slate-200 outline-none text-slate-700 font-semibold bg-white text-xs" 
                                                 placeholder="cth: LAPORAN KAS MINGGUAN MASJID" 
                                             />
                                         </div>
                                         <div>
                                             <label className="text-xs font-bold text-slate-600 block mb-1">Pemasukan Kotak Amal (Rp)</label>
                                             <input 
                                                 type="text" 
                                                 value={formKeuangan.pemasukan} 
                                                 onChange={e => setFormKeuangan({ ...formKeuangan, pemasukan: e.target.value })} 
                                                 className="w-full p-3 rounded-xl border border-slate-200 outline-none text-slate-700 font-semibold bg-white text-xs" 
                                                 placeholder="cth: 2.500.000" 
                                             />
                                         </div>
                                         <div>
                                             <label className="text-xs font-bold text-slate-600 block mb-1">Pengeluaran Kas (Rp)</label>
                                             <input 
                                                 type="text" 
                                                 value={formKeuangan.pengeluaran} 
                                                 onChange={e => setFormKeuangan({ ...formKeuangan, pengeluaran: e.target.value })} 
                                                 className="w-full p-3 rounded-xl border border-slate-200 outline-none text-slate-700 font-semibold bg-white text-xs" 
                                                 placeholder="cth: 800.000" 
                                             />
                                         </div>
                                         <div className="md:col-span-2">
                                             <label className="text-xs font-bold text-slate-600 block mb-1">Total Saldo Kas Akhir (Rp)</label>
                                             <input 
                                                 type="text" 
                                                 value={formKeuangan.saldo} 
                                                 onChange={e => setFormKeuangan({ ...formKeuangan, saldo: e.target.value })} 
                                                 className="w-full p-3 rounded-xl border border-slate-200 outline-none text-slate-700 font-semibold bg-white text-xs" 
                                                 placeholder="cth: 15.200.000" 
                                             />
                                         </div>
                                     </div>
                                     <button
                                         type="button"
                                         onClick={async () => {
                                             const txt = `Pemasukan: Rp ${formKeuangan.pemasukan || '0'} | Pengeluaran: Rp ${formKeuangan.pengeluaran || '0'} | Saldo Kas Masjid: Rp ${formKeuangan.saldo || '0'}`;
                                             
                                             // Clean up numbers for structured visual graph
                                             const incNum = Number(formKeuangan.pemasukan.replace(/\D/g, '')) || 0;
                                             const expNum = Number(formKeuangan.pengeluaran.replace(/\D/g, '')) || 0;

                                             const updatedData = { 
                                                 keuanganText: txt,
                                                 keuanganMode: settings.keuanganMode || 'visual',
                                                 keuanganTitle: settings.keuanganTitle || 'LAPORAN KAS MINGGUAN MASJID',
                                                 keuanganIncome: incNum,
                                                 keuanganExpense: expNum
                                             };
                                             setSettings(prev => ({ ...prev, ...updatedData }));
                                             await saveToFirebase(updatedData);
                                             alert('Laporan Keuangan berhasil disimpan & ditampilkan ke TV!');
                                         }}
                                         className="py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition shadow text-sm"
                                     >
                                         ⚡ Simpan Laporan Keuangan Kas
                                     </button>
                                    <div className="bg-white border border-slate-200 rounded-xl p-3">
                                        <span className="text-xs font-bold text-slate-400 block mb-1">Preview teks laporan:</span>
                                        <span className="text-sm font-semibold text-slate-700 break-all">{settings.keuanganText || '-'}</span>
                                    </div>
                                    {settings.keuanganMode === 'visual' && (
                                        <div className="mt-2 flex gap-2">
                                            {settings.testLayoutMode === 'keuangan' ? (
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        const updated = { testLayoutMode: 'none' };
                                                        setSettings(prev => ({ ...prev, ...updated }));
                                                        await saveToFirebase(updated);
                                                    }}
                                                    className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded text-xs transition shadow-sm border border-red-500"
                                                >
                                                    ✕ Matikan Uji Coba Keuangan
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        const updated = { testLayoutMode: 'keuangan' };
                                                        setSettings(prev => ({ ...prev, ...updated }));
                                                        await saveToFirebase(updated);
                                                    }}
                                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded text-xs transition shadow-sm border border-emerald-500"
                                                >
                                                    🧪 Uji Coba Tampilan Grafik Keuangan di TV
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ====== TAB 3: MEDIA & TAYANGAN ====== */}
                        {activeTab === 'media' && (
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-600 mb-2">Mode Tampilan Layar</label>
                                        <select 
                                            value={settings.displayMode || 'both'} 
                                            onChange={e => setSettings({ ...settings, displayMode: e.target.value })}
                                            className="w-full p-3 rounded-xl border-2 border-slate-200 bg-white outline-none font-semibold text-slate-700 focus:border-blue-500"
                                        >
                                            <option value="image">Hanya Slide Gambar Background</option>
                                            <option value="video">Hanya Video Live YouTube</option>
                                            <option value="both">Keduanya Bergantian (Otomatis)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-600 mb-2">Link Video YouTube</label>
                                        <input 
                                            type="text" 
                                            value={settings.youtubeLink || ''} 
                                            onChange={e => setSettings({ ...settings, youtubeLink: e.target.value })}
                                            placeholder="https://youtu.be/a3MeLj37S8w"
                                            className="w-full p-3 rounded-xl border-2 border-slate-200 outline-none font-semibold text-slate-700 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Upload Gambar Lokal */}
                                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col gap-2">
                                    <label className="text-xs font-bold text-blue-800">📁 UNGGAH GAMBAR DARI PENYIMPANAN LOKAL (Maks 1 MB)</label>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleImageUpload} 
                                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition border border-slate-200 rounded-xl p-2 bg-white" 
                                    />
                                    <p className="text-[10px] text-slate-500">
                                        ℹ️ Gambar akan dikompresi otomatis dengan kualitas tinggi (maks 1920x1080) agar hemat penyimpanan.
                                    </p>
                                </div>

                                {/* Image via Web URL */}
                                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-600">Atau Tambahkan Gambar via Link URL Internet:</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newImageUrl}
                                            onChange={e => setNewImageUrl(e.target.value)}
                                            placeholder="Masukkan link gambar (https://...)"
                                            className="flex-1 p-3 border border-slate-300 rounded-xl outline-none font-semibold text-slate-700 bg-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const val = newImageUrl.trim();
                                                if (val) {
                                                    setSettings(prev => ({ ...prev, images: [...(prev.images || []), val] }));
                                                    setNewImageUrl('');
                                                }
                                            }}
                                            className="bg-slate-700 text-white px-5 py-3 rounded-xl font-bold hover:bg-slate-800 shadow text-sm"
                                        >
                                            Tambah
                                        </button>
                                    </div>
                                </div>

                                {/* Thumbnail Slide Images */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Daftar Slide Gambar ({settings.images?.length || 0})</label>
                                    {settings.images?.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                            {settings.images.map((src, i) => (
                                                <div key={i} className="relative rounded-xl overflow-hidden aspect-video bg-slate-200 shadow-md">
                                                    <img src={src} className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSettings(prev => ({
                                                                ...prev,
                                                                images: prev.images.filter((_, idx) => idx !== i)
                                                            }));
                                                        }}
                                                        className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center font-black shadow-lg"
                                                    >
                                                        ✕
                                                    </button>
                                                    <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs rounded px-1.5 py-0.5 font-bold">
                                                        {i + 1}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-slate-400 border rounded-2xl bg-slate-50/50">
                                            <p className="text-4xl mb-1">🖼️</p>
                                            <p className="text-sm font-semibold">Belum ada gambar background.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ====== TAB 4: JADWAL & IQOMAH ====== */}
                        {activeTab === 'jadwal' && (
                            <div className="flex flex-col gap-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Koreksi Kalender Hijriah (Hari)</label>
                                        <input 
                                            type="number" 
                                            value={settings.hijriOffset || 0} 
                                            onChange={e => setSettings({ ...settings, hijriOffset: Number(e.target.value) })}
                                            className="w-full p-3 rounded-lg border border-slate-300 font-bold text-center bg-white text-slate-700" 
                                        />
                                        <span className="text-xs text-slate-400 mt-1 block">Min (-) untuk mundur, Plus (+) untuk maju.</span>
                                    </div>
                                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2">
                                         <label className="block text-sm font-bold text-slate-700">Lama Layar Adzan Tayang (Menit)</label>
                                         <input 
                                             type="number" 
                                             value={settings.adzanDuration || 2} 
                                             onChange={e => setSettings({ ...settings, adzanDuration: Number(e.target.value) })}
                                             className="w-full p-3 rounded-lg border border-slate-300 font-bold text-center bg-white text-slate-700" 
                                         />
                                         <span className="text-xs text-slate-400">Lama hitung mundur layar adzan sebelum iqomah. Kemunculan tiap lafadz adzan & jawaban akan dibagi rata dari durasi ini.</span>
                                         
                                         <div className="mt-2 border-t pt-3 flex justify-between items-center">
                                             <span className="text-xs font-bold text-slate-600">Uji Tampilan Layar TV:</span>
                                             {settings.testLayoutMode === 'adzan' ? (
                                                 <button
                                                     type="button"
                                                     onClick={async () => {
                                                         const updated = { testLayoutMode: 'none' };
                                                         setSettings(prev => ({ ...prev, ...updated }));
                                                         await saveToFirebase(updated);
                                                     }}
                                                     className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition"
                                                 >
                                                     ⏹ Matikan Tes Adzan
                                                 </button>
                                             ) : (
                                                 <button
                                                     type="button"
                                                     onClick={async () => {
                                                         const updated = { testLayoutMode: 'adzan' };
                                                         setSettings(prev => ({ ...prev, ...updated }));
                                                         await saveToFirebase(updated);
                                                     }}
                                                     className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition flex items-center gap-1 shadow"
                                                 >
                                                     🕌 Tes Tampilan Adzan TV
                                                 </button>
                                             )}
                                         </div>
                                     </div>
                                </div>

                                {/* Jadwal Sholat Detail Table */}
                                <div className="mt-2">
                                    <h3 className="text-sm font-bold text-slate-700 mb-3 border-b pb-1">⚙️ Seting Tiap Waktu Sholat:</h3>
                                    <div className="flex flex-col gap-3">
                                        {['Shubuh', 'Syuruq', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'].map(w => (
                                            <div key={w} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
                                                <div className="font-black text-emerald-800 text-lg sm:w-24">{w}</div>
                                                
                                                {/* Toggle Murottal */}
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-bold text-slate-500">Murottal:</span>
                                                    {w !== 'Syuruq' ? (
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={settings.murottalActivePerPrayer ? settings.murottalActivePerPrayer[w] !== false : true} 
                                                                onChange={e => {
                                                                    const obj = settings.murottalActivePerPrayer || { Shubuh: true, Dzuhur: true, Ashar: true, Maghrib: true, Isya: true };
                                                                    setSettings({ ...settings, murottalActivePerPrayer: { ...obj, [w]: e.target.checked } });
                                                                }}
                                                                className="sr-only peer" 
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                                        </label>
                                                    ) : <span className="text-xs text-slate-400 font-bold">-</span>}
                                                </div>

                                                {/* Offset Correction */}
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-500">Koreksi Jam (Mnt):</span>
                                                    <input 
                                                        type="number" 
                                                        value={settings.prayerOffsets?.[w] || 0} 
                                                        onChange={e => {
                                                            const obj = settings.prayerOffsets || { Shubuh: 0, Syuruq: 0, Dzuhur: 0, Ashar: 0, Maghrib: 0, Isya: 0 };
                                                            setSettings({ ...settings, prayerOffsets: { ...obj, [w]: Number(e.target.value) } });
                                                        }}
                                                        className="w-16 p-2 rounded border border-slate-300 text-center font-bold text-slate-700 bg-white" 
                                                    />
                                                </div>

                                                {/* Iqomah duration */}
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-500">Iqomah (Mnt):</span>
                                                    {w !== 'Syuruq' ? (
                                                        <input 
                                                            type="number" 
                                                            min="0"
                                                            value={settings.iqomahDurations?.[w] || 10} 
                                                            onChange={e => {
                                                                const obj = settings.iqomahDurations || { Shubuh: 10, Dzuhur: 10, Ashar: 10, Maghrib: 5, Isya: 10 };
                                                                setSettings({ ...settings, iqomahDurations: { ...obj, [w]: Number(e.target.value) } });
                                                            }}
                                                            className="w-16 p-2 rounded border border-slate-300 text-center font-bold text-slate-700 bg-white" 
                                                        />
                                                    ) : <span className="text-xs text-slate-400 font-bold">-</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ====== TAB 5: TAMPILAN JUMAT ====== */}
                        {activeTab === 'jumat' && (
                            <div className="flex flex-col gap-4">
                                <label className="flex items-center justify-between cursor-pointer p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                                    <div>
                                        <span className="text-base font-black text-emerald-800 block">Aktifkan Layar Jum'at Otomatis</span>
                                        <span className="text-xs text-emerald-600 font-bold">Otomatis aktif jam 10:00 - 13:00 WIB pada hari Jum'at.</span>
                                    </div>
                                    <div className="relative inline-flex items-center">
                                        <input 
                                            type="checkbox" 
                                            checked={settings.jumatMasterActive !== false} 
                                            onChange={e => setSettings({ ...settings, jumatMasterActive: e.target.checked })}
                                            className="sr-only peer" 
                                        />
                                        <div className="w-14 h-7 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
                                    </div>
                                </label>

                                {/* Show Toggles */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
                                    <h3 className="font-bold text-slate-700 uppercase text-xs border-b pb-1">Tampilkan Elemen Layar Jumat:</h3>
                                    {[
                                        { key: 'jumatShowPetugas', label: 'Tampilkan Sesi Petugas (Khatib, Imam, Muadzin, Bilal)' },
                                        { key: 'jumatShowDzuhur', label: 'Tampilkan Countdown Dzuhur / Jumat' },
                                        { key: 'jumatShowAcara', label: 'Tampilkan Slide Acara & Kegiatan' },
                                        { key: 'jumatShowKeuangan', label: 'Tampilkan Laporan Keuangan Kas' },
                                        { key: 'jumatShowTicker', label: 'Tampilkan Teks Hadits Jum\'at di Bawah' }
                                    ].map(({ key, label }) => (
                                        <label key={key} className="flex items-center justify-between cursor-pointer">
                                            <span className="text-sm font-semibold text-slate-600">{label}</span>
                                            <div className="relative inline-flex items-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={settings[key] !== false} 
                                                    onChange={e => setSettings({ ...settings, [key]: e.target.checked })}
                                                    className="sr-only peer" 
                                                />
                                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                {/* Ticker Text Jumat */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Ticker Ayat/Hadits Jumat (Bawah)</label>
                                    <textarea
                                        value={settings.jumatTickerText || ''}
                                        onChange={e => setSettings({ ...settings, jumatTickerText: e.target.value })}
                                        rows={3}
                                        className="w-full p-3 rounded-xl border border-slate-350 outline-none text-slate-700 leading-relaxed font-semibold focus:border-emerald-500"
                                        placeholder="Tulis ticker running text Jum'at..."
                                    />
                                </div>

                                {/* Durasi Prosesi */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <h3 className="font-bold text-slate-700 uppercase text-xs border-b pb-2 mb-3">Durasi Prosesi Hari Jumat (Menit)</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                                        {[
                                            { key: 'muadzin', label: '🎙️ Muadzin' },
                                            { key: 'jedaMB', label: '⏱️ Jeda Adzan-Bilal', isJeda: true },
                                            { key: 'bilal', label: '🔔 Bilal' },
                                            { key: 'jedaBK', label: '⏱️ Jeda Bilal-Khatib', isJeda: true },
                                            { key: 'khatib', label: '🎙️ Khatib/Khutbah' },
                                            { key: 'jedaKI', label: '⏱️ Jeda Khutbah-Imam', isJeda: true },
                                            { key: 'imam', label: '🤲 Imam Sholat' }
                                        ].map(({ key, label, isJeda }) => (
                                            <div key={key} className="flex flex-col gap-1 bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm">
                                                <span className={`text-[10px] font-bold ${isJeda ? 'text-emerald-700' : 'text-slate-500'} uppercase`}>{label}</span>
                                                <input 
                                                    type="number" 
                                                    min="0"
                                                    value={settings.jumatDurations?.[key] ?? (isJeda ? 2 : 10)}
                                                    onChange={e => {
                                                        const obj = settings.jumatDurations || {};
                                                        setSettings({ ...settings, jumatDurations: { ...obj, [key]: Number(e.target.value) } });
                                                    }}
                                                    className="w-full p-1.5 text-center font-bold text-sm border rounded bg-white text-slate-700"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Murottal Jumat */}
                                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex flex-col gap-3">
                                    <h3 className="font-bold text-emerald-800 uppercase text-xs border-b pb-1">Murottal Otomatis Sebelum Jum'atan</h3>
                                    <label className="flex items-center justify-between cursor-pointer">
                                        <span className="text-sm font-semibold text-emerald-700">Putar Murottal Otomatis Hari Jumat</span>
                                        <div className="relative inline-flex items-center">
                                            <input 
                                                type="checkbox" 
                                                checked={settings.jumatMurottalActive !== false} 
                                                onChange={e => setSettings({ ...settings, jumatMurottalActive: e.target.checked })}
                                                className="sr-only peer" 
                                            />
                                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                        </div>
                                    </label>
                                    
                                    <div className="grid grid-cols-2 gap-3 mt-1 bg-white p-3 rounded-lg border border-emerald-100">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Mulai Jam</label>
                                            <input 
                                                type="time" 
                                                value={settings.jumatMurottalStart || '11:00'} 
                                                onChange={e => setSettings({ ...settings, jumatMurottalStart: e.target.value })}
                                                className="w-full p-2 border rounded font-semibold text-slate-700 text-center" 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Selesai Jam</label>
                                            <input 
                                                type="time" 
                                                value={settings.jumatMurottalEnd || '11:45'} 
                                                onChange={e => setSettings({ ...settings, jumatMurottalEnd: e.target.value })}
                                                className="w-full p-2 border rounded font-semibold text-slate-700 text-center" 
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Custom Link Audio MP3 (Opsional)</label>
                                            <input 
                                                type="text" 
                                                value={settings.jumatMurottalLink || ''} 
                                                onChange={e => setSettings({ ...settings, jumatMurottalLink: e.target.value })}
                                                placeholder="https://link-murottal.mp3"
                                                className="w-full p-2 border rounded font-semibold text-slate-700 text-sm" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ====== TAB 6: WARNA & TEMA ====== */}
                        {activeTab === 'warna' && (() => {
                            const colorFields = [
                                { key: 'headerGradientFrom', label: '🌅 Awal Gradient Header' },
                                { key: 'headerGradientTo', label: '🌅 Akhir Gradient Header' },
                                { key: 'headerTextColor', label: '⚪ Teks Header (Nama & Tanggal)' },
                                { key: 'cardBgColor', label: '🟦 Background Kartu Jadwal Sholat' },
                                { key: 'cardTextColor', label: '⚪ Teks Waktu di Kartu Jadwal' },
                                { key: 'cardHighlightColor', label: '⭐ Kartu Jadwal Aktif/Berikutnya' },
                                { key: 'marqueeBgFrom', label: '🏃 Awal Gradient Ticker Bawah' },
                                { key: 'marqueeBgTo', label: '🏃 Akhir Gradient Ticker Bawah' },
                                { key: 'marqueeTextColor', label: '⚪ Teks Ticker Berjalan' },
                                { key: 'countdownBgColor', label: '⏱️ Background Kotak Countdown' },
                                { key: 'countdownTextColor', label: '⚪ Teks Angka Countdown' },
                                { key: 'quoteTextColor', label: '📖 Teks Ayat / Quote Layar' },
                                { key: 'mainBgColor', label: '🎨 Warna Background Utama TV' },
                            ];
                            return (
                                <div className="flex flex-col gap-4">
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <span className="text-xs text-slate-400 font-bold">Tekan tombol reset jika ingin kembali ke warna default.</span>
                                        <button
                                            onClick={() => {
                                                setSettings(prev => ({
                                                    ...prev,
                                                    headerGradientFrom: '#1e3a8a',
                                                    headerGradientTo: '#3b82f6',
                                                    headerTextColor: '#ffffff',
                                                    cardBgColor: '#1d4ed8',
                                                    cardTextColor: '#ffffff',
                                                    cardHighlightColor: '#1e40af',
                                                    marqueeBgFrom: '#1d4ed8',
                                                    marqueeBgTo: '#93c5fd',
                                                    marqueeTextColor: '#ffffff',
                                                    countdownBgColor: '#2563eb',
                                                    countdownTextColor: '#ffffff',
                                                    quoteTextColor: '#1e293b',
                                                    quoteBgColor: 'rgba(255,255,255,0.85)',
                                                    mainBgColor: '#f1f5f9'
                                                }));
                                                alert('Warna berhasil di-reset ke nilai default! Klik SIMPAN DI BAWAH untuk memperbarui TV.');
                                            }}
                                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                                        >
                                            ↺ Reset Warna
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                                        {colorFields.map(({ key, label }) => (
                                            <div key={key} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 gap-2">
                                                <span className="text-xs font-bold text-slate-600 flex-1 truncate">{label}</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded border border-slate-300" style={{ backgroundColor: settings[key] || DEFAULT_SETTINGS[key] }} />
                                                    <input
                                                        type="color"
                                                        value={(() => { const v = settings[key] || DEFAULT_SETTINGS[key]; if (v && v.startsWith('#')) return v; return '#000000'; })()}
                                                        onChange={e => setSettings({ ...settings, [key]: e.target.value })}
                                                        className="w-10 h-10 cursor-pointer border border-slate-300 p-0 bg-white"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mt-1">
                                        <label className="text-xs font-bold text-slate-600 block mb-1">📖 Background Box Ayat/Hadits (Mendukung RGBA transparan)</label>
                                        <input
                                            type="text"
                                            value={settings.quoteBgColor || 'rgba(255,255,255,0.85)'}
                                            onChange={e => setSettings({ ...settings, quoteBgColor: e.target.value })}
                                            className="w-full p-2.5 rounded-lg border font-mono text-slate-700 text-sm font-semibold bg-white"
                                            placeholder="rgba(255,255,255,0.85)"
                                        />
                                    </div>
                                </div>
                            );
                        })()}

                        {/* ====== TAB 7: ROTASI & HARI BESAR ====== */}
                        {activeTab === 'rotasi' && (
                            <div className="flex flex-col gap-4">
                                <label className="flex items-center justify-between cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <div>
                                        <span className="text-sm font-bold text-slate-700 block">Aktifkan Rotasi Layar Otomatis</span>
                                        <span className="text-xs text-slate-400 font-bold">TV akan otomatis berganti panel ke keuangan/petugas secara bergantian.</span>
                                    </div>
                                    <div className="relative inline-flex items-center">
                                        <input 
                                            type="checkbox" 
                                            checked={settings.rotasiAktif !== false} 
                                            onChange={e => setSettings({ ...settings, rotasiAktif: e.target.checked })}
                                            className="sr-only peer" 
                                        />
                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </div>
                                </label>

                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <span className="text-sm font-bold text-slate-700">Durasi setiap pergantian slide (menit)</span>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        value={settings.rotasiDurasi || 10} 
                                        onChange={e => setSettings({ ...settings, rotasiDurasi: Number(e.target.value) })}
                                        className="w-20 p-2 border rounded-lg text-center font-bold text-slate-700 bg-white" 
                                    />
                                </div>

                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <span className="text-xs font-bold text-slate-500 block mb-2">Pilih panel yang akan diikutkan dalam rotasi:</span>
                                    <div className="flex gap-4 flex-wrap">
                                        {[
                                            { val: 'normal', label: 'Normal' },
                                            { val: 'petugas', label: 'Petugas Sholat' },
                                            { val: 'keuangan', label: 'Keuangan Kas' },
                                            { val: 'haribesar', label: 'Hari Besar Islam' },
                                            { val: 'countdown_ramadhan', label: '🌙 Countdown Ramadhan' },
                                            { val: 'wakaf_tarawih', label: '💰 Wakaf Tarawih' },
                                            { val: 'petugas_tarawih', label: '🤲 Petugas Tarawih' },
                                            { val: 'berita_duka', label: '🖤 Berita Duka Warga' },
                                            { val: 'info_yasinan', label: '📖 Jadwal Yasinan' },
                                            ...(settings.customViews || []).map(cv => ({ val: cv.id, label: `🖼️ ${cv.name}` }))
                                        ].map(({ val, label }) => (
                                            <label key={val} className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-600">
                                                <input 
                                                    type="checkbox" 
                                                    checked={(settings.rotasiTampilan || ['normal', 'petugas', 'keuangan', 'haribesar']).includes(val)} 
                                                    onChange={e => {
                                                        const list = settings.rotasiTampilan || ['normal', 'petugas', 'keuangan', 'haribesar'];
                                                        const updatedList = e.target.checked ? [...list, val] : list.filter(item => item !== val);
                                                        setSettings({ ...settings, rotasiTampilan: updatedList });
                                                    }}
                                                    className="w-4 h-4 rounded text-blue-600 animate-pulse" 
                                                />
                                                {label}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Hari Besar Islam */}
                                <div className="border-t pt-4 flex flex-col gap-3">
                                    <label className="text-sm font-bold text-slate-700">🌙 Jadwal & Penanda Hari Besar Islam</label>
                                    <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto pr-1">
                                        {(settings.hariBesar || []).map((h, i) => (
                                            <div key={i} className="flex flex-col sm:flex-row gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                                <input 
                                                    type="text" 
                                                    value={h.emoji || ''} 
                                                    onChange={e => {
                                                        const arr = [...(settings.hariBesar || [])];
                                                        arr[i] = { ...arr[i], emoji: e.target.value };
                                                        setSettings({ ...settings, hariBesar: arr });
                                                    }}
                                                    placeholder="🌙" 
                                                    className="w-12 p-2 border rounded-lg text-center text-lg outline-none font-semibold bg-white" 
                                                />
                                                <input 
                                                    type="text" 
                                                    value={h.nama || ''} 
                                                    onChange={e => {
                                                        const arr = [...(settings.hariBesar || [])];
                                                        arr[i] = { ...arr[i], nama: e.target.value };
                                                        setSettings({ ...settings, hariBesar: arr });
                                                    }}
                                                    placeholder="Nama Hari Besar" 
                                                    className="flex-1 p-2 border rounded-lg text-sm outline-none font-semibold text-slate-700 bg-white" 
                                                />
                                                <input 
                                                    type="date" 
                                                    value={h.tanggal || ''} 
                                                    onChange={e => {
                                                        const arr = [...(settings.hariBesar || [])];
                                                        arr[i] = { ...arr[i], tanggal: e.target.value };
                                                        setSettings({ ...settings, hariBesar: arr });
                                                    }}
                                                    className="p-2 border rounded-lg text-sm outline-none font-semibold text-slate-700 bg-white" 
                                                />
                                                <div className="flex items-center justify-between sm:justify-end gap-2 mt-1 sm:mt-0">
                                                    <input 
                                                        type="color" 
                                                        value={h.warna || '#1a5276'} 
                                                        onChange={e => {
                                                            const arr = [...(settings.hariBesar || [])];
                                                            arr[i] = { ...arr[i], warna: e.target.value };
                                                            setSettings({ ...settings, hariBesar: arr });
                                                        }}
                                                        className="w-10 h-10 cursor-pointer border rounded-md" 
                                                    />
                                                    <button 
                                                        type="button" 
                                                        onClick={() => {
                                                            setSettings(prev => ({
                                                                ...prev,
                                                                hariBesar: prev.hariBesar.filter((_, j) => j !== i)
                                                            }));
                                                        }} 
                                                        className="text-red-500 hover:text-red-700 font-bold px-3 py-1 text-lg"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const nextYear = new Date().getFullYear();
                                            const newItem = { nama: 'Hari Besar Baru', tanggal: `${nextYear}-01-01`, warna: '#1a5276', emoji: '🕌' };
                                            setSettings(prev => ({ ...prev, hariBesar: [...(prev.hariBesar || []), newItem] }));
                                        }}
                                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow text-xs"
                                    >
                                        ➕ Tambah Penanda Hari Besar Baru
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ====== TAB 8: SUARA BEEP ====== */}
                        {activeTab === 'suara' && (
                            <div className="flex flex-col gap-5">
                                <div className="flex flex-col gap-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-slate-600">Volume Beep Notifikasi TV</span>
                                        <span className="text-2xl font-black text-emerald-700 min-w-[4rem] text-right">{Math.round((settings.beepVolume ?? 0.3) * 100)}%</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">🔕</span>
                                        <input
                                            type="range"
                                            min="0" max="100" step="5"
                                            value={Math.round((settings.beepVolume ?? 0.3) * 100)}
                                            onChange={e => setSettings({ ...settings, beepVolume: Number(e.target.value) / 100 })}
                                            className="flex-1 h-4 accent-emerald-600 cursor-pointer"
                                        />
                                        <span className="text-xl">🔔</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 border-t pt-4">
                                    <p className="text-sm font-bold text-slate-700">🎵 Uji Coba Suara Beep Langsung (HP):</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {[
                                            { label: '🔔 Bunyi Pra-Adzan', freq: 880, dur: 1.0, color: 'bg-yellow-500 active:bg-yellow-600' },
                                            { label: '🕌 Bunyi Adzan', freq: 1046, dur: 1.0, color: 'bg-blue-600 active:bg-blue-700' },
                                            { label: '⏱ Bunyi Iqomah', freq: 784, dur: 1.0, color: 'bg-red-600 active:bg-red-700' },
                                            { label: '🕋 Bunyi Saatnya Iqomat (3x)', freq: 987, dur: 1.0, color: 'bg-emerald-600 active:bg-emerald-700', triple: true },
                                            { label: '🕐 Bunyi Ganti Jam', freq: 660, dur: 0.3, color: 'bg-slate-600 active:bg-slate-700' },
                                        ].map(({ label, freq, dur, color, triple }) => (
                                            <button
                                                key={label}
                                                onClick={() => {
                                                    const vol = settings.beepVolume ?? 0.3;
                                                    if (triple) {
                                                        playAdminBeep(freq, 1.0, vol);
                                                        setTimeout(() => playAdminBeep(freq, 1.0, vol), 1500);
                                                        setTimeout(() => playAdminBeep(freq, 3.0, vol), 3000);
                                                    } else {
                                                        playAdminBeep(freq, dur, vol);
                                                    }
                                                }}
                                                className={`w-full py-4 text-white text-base font-black rounded-xl transition active:scale-95 shadow ${color}`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ====== TAB: FITUR RAMADHAN ====== */}
                        {activeTab === 'ramadhan' && (
                            <div className="flex flex-col gap-5">
                                {/* A: Jadwal Dinamis */}
                                <div className="bg-emerald-50 border border-emerald-250 p-4 rounded-xl shadow-inner flex flex-col gap-3">
                                    <h3 className="font-bold text-emerald-800 text-sm border-b pb-1">⏱️ Jadwal Sholat Dinamis</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="flex items-center justify-between cursor-pointer p-2 bg-white rounded-lg border border-slate-200">
                                            <span className="text-xs font-bold text-slate-700">Tampilkan Imsak (-10mnt Subuh)</span>
                                            <div className="relative inline-flex items-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={settings.showImsak === true} 
                                                    onChange={e => setSettings({ ...settings, showImsak: e.target.checked })}
                                                    className="sr-only peer" 
                                                />
                                                <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                                            </div>
                                        </label>
                                        <label className="flex items-center justify-between cursor-pointer p-2 bg-white rounded-lg border border-slate-200">
                                            <span className="text-xs font-bold text-slate-700">Tampilkan Jadwal Syuruq</span>
                                            <div className="relative inline-flex items-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={settings.showSyuruq !== false} 
                                                    onChange={e => setSettings({ ...settings, showSyuruq: e.target.checked })}
                                                    className="sr-only peer" 
                                                />
                                                <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* B: Countdown Ramadhan */}
                                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col gap-3">
                                    <h3 className="font-bold text-slate-700 text-sm border-b pb-1">🌙 Hitung Mundur Ramadhan</h3>
                                    <label className="flex items-center justify-between cursor-pointer p-2 bg-white rounded-lg border border-slate-200">
                                        <div>
                                            <span className="text-xs font-bold text-slate-700 block">Aktifkan Slide Countdown di TV</span>
                                            <span className="text-[10px] text-slate-400">TV akan memutar hitung mundur menuju Ramadhan.</span>
                                        </div>
                                        <div className="relative inline-flex items-center">
                                            <input 
                                                type="checkbox" 
                                                checked={settings.showRamadhanCountdown === true} 
                                                onChange={e => setSettings({ ...settings, showRamadhanCountdown: e.target.checked })}
                                                className="sr-only peer" 
                                            />
                                            <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                        </div>
                                    </label>
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 block mb-1">Tanggal Target Awal Ramadhan</label>
                                        <input 
                                            type="date" 
                                            value={settings.ramadhanTargetDate || '2027-02-08'} 
                                            onChange={e => setSettings({ ...settings, ramadhanTargetDate: e.target.value })}
                                            className="w-full p-2.5 rounded-lg border font-semibold text-slate-700 bg-white" 
                                        />
                                    </div>
                                </div>

                                {/* C: Wakaf Tarawih */}
                                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col gap-4">
                                    <div className="flex justify-between items-center border-b pb-1">
                                        <h3 className="font-bold text-slate-700 text-sm">💰 Laporan Wakaf Sholat Tarawih</h3>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={settings.showWakafTarawih === true} 
                                                onChange={e => setSettings({ ...settings, showWakafTarawih: e.target.checked })}
                                                className="sr-only peer" 
                                            />
                                            <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                                        </label>
                                    </div>
                                    
                                    {/* Input Baru */}
                                    <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col gap-3">
                                        <label className="text-xs font-black text-slate-500 uppercase">Input Pendapatan Malam Baru:</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-600 block mb-1">Malam Tarawih Ke</label>
                                                <input 
                                                    type="number" 
                                                    min="1"
                                                    value={newWakafMalam} 
                                                    onChange={e => setNewWakafMalam(e.target.value)} 
                                                    placeholder="cth: 5" 
                                                    className="w-full p-2 text-sm border rounded outline-none" 
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-600 block mb-1">Jumlah Perolehan Wakaf (Rp)</label>
                                                <input 
                                                    type="number" 
                                                    value={newWakafJumlah} 
                                                    onChange={e => setNewWakafJumlah(e.target.value)} 
                                                    placeholder="cth: 500000" 
                                                    className="w-full p-2 text-sm border rounded outline-none" 
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const mal = parseInt(newWakafMalam);
                                                const jum = parseInt(newWakafJumlah);
                                                if (isNaN(mal) || isNaN(jum)) { alert('Harap isi malam dan jumlah perolehan secara benar!'); return; }
                                                
                                                const existingData = settings.wakafTarawihData || [];
                                                // check if malam ke-X already exists to update, else append
                                                let updated = [];
                                                const exists = existingData.some(d => d.malam === mal);
                                                if (exists) {
                                                    updated = existingData.map(d => d.malam === mal ? { ...d, jumlah: jum } : d);
                                                } else {
                                                    updated = [...existingData, { malam: mal, jumlah: jum }].sort((a, b) => a.malam - b.malam);
                                                }

                                                setSettings(prev => ({ ...prev, wakafTarawihData: updated }));
                                                setNewWakafMalam('');
                                                setNewWakafJumlah('');
                                                alert('Data wakaf malam berhasil dimasukkan! Tekan SIMPAN DI BAWAH untuk update TV.');
                                            }}
                                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition shadow"
                                        >
                                            💾 Masukkan / Update Perolehan Wakaf
                                        </button>
                                    </div>

                                    {/* Kalkulator Akumulasi Total */}
                                    <div className="bg-emerald-900 text-white rounded-xl p-4 text-center border border-emerald-500/20 shadow-inner flex justify-between items-center">
                                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">TOTAL AKUMULASI WAKAF:</span>
                                        <span className="text-xl font-black text-yellow-400">
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(
                                                (settings.wakafTarawihData || []).reduce((acc, curr) => acc + (Number(curr.jumlah) || 0), 0)
                                            )}
                                        </span>
                                    </div>

                                    {/* Table List riwayat */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 block mb-2">Daftar Input Per Malam ({settings.wakafTarawihData?.length || 0}):</label>
                                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden max-h-[160px] overflow-y-auto">
                                            {settings.wakafTarawihData?.length > 0 ? (
                                                <table className="w-full text-left text-xs border-collapse">
                                                    <thead>
                                                        <tr className="bg-slate-100 border-b font-bold text-slate-500">
                                                            <th className="p-2 text-center">Malam</th>
                                                            <th className="p-2">Perolehan Wakaf</th>
                                                            <th className="p-2 text-center">Aksi</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {settings.wakafTarawihData.map((item, idx) => (
                                                            <tr key={idx} className="border-b hover:bg-slate-50 font-semibold text-slate-700">
                                                                <td className="p-2 text-center">Ke-{item.malam}</td>
                                                                <td className="p-2">
                                                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.jumlah)}
                                                                </td>
                                                                <td className="p-2 text-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setSettings(prev => ({
                                                                                ...prev,
                                                                                wakafTarawihData: prev.wakafTarawihData.filter(d => d.malam !== item.malam)
                                                                            }));
                                                                        }}
                                                                        className="text-red-500 hover:text-red-750 font-black text-sm px-2"
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <div className="p-4 text-center italic text-slate-400">Belum ada data diinput.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* D: Petugas Tarawih */}
                                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col gap-3">
                                    <div className="flex justify-between items-center border-b pb-1">
                                        <h3 className="font-bold text-slate-700 text-sm">🤲 Petugas Imam & Bilal Tarawih</h3>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={settings.showPetugasTarawih === true} 
                                                onChange={e => setSettings({ ...settings, showPetugasTarawih: e.target.checked })}
                                                className="sr-only peer" 
                                            />
                                            <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 block mb-1">Malam Ke-</label>
                                            <input 
                                                type="number" 
                                                min="1"
                                                value={settings.petugasTarawihData?.malamKe || 1} 
                                                onChange={e => setSettings({ 
                                                    ...settings, 
                                                    petugasTarawihData: { ...(settings.petugasTarawihData || {}), malamKe: Number(e.target.value) } 
                                                })}
                                                className="w-full p-2 border rounded font-bold text-center text-slate-700 bg-white" 
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-[10px] font-bold text-slate-500 block mb-1">Pilih Imam Tarawih</label>
                                            <select
                                                value={settings.petugasTarawihData?.imam || ''}
                                                onChange={e => setSettings({ 
                                                    ...settings, 
                                                    petugasTarawihData: { ...(settings.petugasTarawihData || {}), imam: e.target.value } 
                                                })}
                                                className="w-full p-2 border rounded font-semibold text-slate-700 bg-white text-xs"
                                            >
                                                <option value="">-- Pilih Imam --</option>
                                                {combinedPetugasList.map(n => <option key={n} value={n}>{n}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-span-3">
                                            <label className="text-[10px] font-bold text-slate-500 block mb-1">Pilih Bilal / Pemandu Shalawat</label>
                                            <select
                                                value={settings.petugasTarawihData?.bilal || ''}
                                                onChange={e => setSettings({ 
                                                    ...settings, 
                                                    petugasTarawihData: { ...(settings.petugasTarawihData || {}), bilal: e.target.value } 
                                                })}
                                                className="w-full p-2 border rounded font-semibold text-slate-700 bg-white text-xs"
                                            >
                                                <option value="">-- Pilih Bilal --</option>
                                                {combinedPetugasList.map(n => <option key={n} value={n}>{n}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ====== TAB: MODE TIDUR TV ====== */}
                        {activeTab === 'sleep' && (
                            <div className="flex flex-col gap-4">
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
                                    <div className="flex items-center justify-between border-b pb-2">
                                        <div>
                                            <h3 className="font-bold text-slate-700 text-sm">💤 Kelola Jadwal Tidur TV</h3>
                                            <p className="text-[10px] text-slate-400">TV akan otomatis menggelapkan layar (layar hitam) untuk menghemat energi & piksel.</p>
                                        </div>
                                    </div>

                                    {/* Form Tambah Jadwal */}
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mt-2 flex flex-col gap-3">
                                        <h4 className="text-xs font-bold text-slate-600">➕ Tambah Jadwal Tidur Baru</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-500 block mb-1">Nama Jadwal</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Contoh: Malam Hari" 
                                                    value={newSleepName} 
                                                    onChange={e => setNewSleepName(e.target.value)} 
                                                    className="w-full p-2 border rounded font-semibold text-slate-700 bg-white text-xs" 
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-500 block mb-1">Jam Mulai</label>
                                                <input 
                                                    type="time" 
                                                    value={newSleepStart} 
                                                    onChange={e => setNewSleepStart(e.target.value)} 
                                                    className="w-full p-2 border rounded font-semibold text-slate-700 bg-white text-xs" 
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-500 block mb-1">Jam Selesai</label>
                                                <input 
                                                    type="time" 
                                                    value={newSleepEnd} 
                                                    onChange={e => setNewSleepEnd(e.target.value)} 
                                                    className="w-full p-2 border rounded font-semibold text-slate-700 bg-white text-xs" 
                                                />
                                            </div>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                if (!newSleepName || !newSleepStart || !newSleepEnd) {
                                                    alert("Lengkapi semua kolom!");
                                                    return;
                                                }
                                                const list = settings.sleepSchedules || [];
                                                const newItem = {
                                                    id: String(Date.now()),
                                                    name: newSleepName,
                                                    start: newSleepStart,
                                                    end: newSleepEnd,
                                                    enabled: true
                                                };
                                                const updatedSchedules = [...list, newItem];
                                                setSettings({ ...settings, sleepSchedules: updatedSchedules });
                                                setNewSleepName('');
                                                alert("Jadwal tidur berhasil ditambahkan! Jangan lupa tekan tombol 'Simpan Semua Pengaturan ke TV' di bawah.");
                                            }}
                                            className="w-full mt-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded text-xs transition"
                                        >
                                            Tambah ke Daftar Jadwal
                                        </button>
                                    </div>

                                    {/* Daftar Jadwal */}
                                    <div className="mt-3 flex flex-col gap-2">
                                        <h4 className="text-xs font-bold text-slate-600">📋 Daftar Jadwal Aktif</h4>
                                        {(settings.sleepSchedules || []).length === 0 ? (
                                            <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 rounded-lg border border-dashed">Belum ada jadwal tidur yang dikonfigurasi.</p>
                                        ) : (
                                            (settings.sleepSchedules || []).map((s) => (
                                                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white shadow-sm hover:border-slate-350 transition">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-700">{s.name}</span>
                                                        <span className="text-[10px] text-slate-400 font-semibold mt-0.5">⏱ {s.start} - {s.end}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {/* Toggle Enabled */}
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={s.enabled === true} 
                                                                onChange={e => {
                                                                    const updatedSchedules = (settings.sleepSchedules || []).map(item => 
                                                                        item.id === s.id ? { ...item, enabled: e.target.checked } : item
                                                                    );
                                                                    setSettings({ ...settings, sleepSchedules: updatedSchedules });
                                                                }}
                                                                className="sr-only peer" 
                                                            />
                                                            <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                                                        </label>
                                                        
                                                        {/* Delete Button */}
                                                        <button 
                                                            type="button"
                                                            onClick={() => {
                                                                if (confirm(`Hapus jadwal tidur "${s.name}"?`)) {
                                                                    const updatedSchedules = (settings.sleepSchedules || []).filter(item => item.id !== s.id);
                                                                    setSettings({ ...settings, sleepSchedules: updatedSchedules });
                                                                }
                                                            }}
                                                            className="text-red-500 hover:text-red-700 font-bold text-[10px] bg-red-50 border border-red-200 hover:bg-red-100 transition px-2.5 py-1 rounded"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Test Tampilan Mode Tidur */}
                                    <div className="bg-violet-50 p-4 rounded-xl border border-violet-200 mt-4 flex flex-col gap-2.5">
                                        <h4 className="text-xs font-black text-violet-850 uppercase">🧪 Uji Coba Tampilan Mode Tidur di TV</h4>
                                        <p className="text-[10px] text-violet-750 font-semibold leading-relaxed">
                                            Tekan tombol di bawah untuk memaksa layar TV utama masuk ke visual Mode Tidur (Layar Hitam digital clock dim) secara instan demi pengetesan tampilan, tanpa harus menunggu jam tidur tiba.
                                        </p>
                                        <div className="flex gap-2">
                                            {settings.testLayoutMode === 'sleep' ? (
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        const updated = { testLayoutMode: 'none' };
                                                        setSettings(prev => ({ ...prev, ...updated }));
                                                        await saveToFirebase(updated);
                                                    }}
                                                    className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded text-xs transition shadow"
                                                >
                                                    ✕ Matikan Uji Coba Mode Tidur
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        const updated = { testLayoutMode: 'sleep' };
                                                        setSettings(prev => ({ ...prev, ...updated }));
                                                        await saveToFirebase(updated);
                                                    }}
                                                    className="flex-1 bg-violet-600 hover:bg-violet-550 text-white font-bold py-2.5 rounded text-xs transition shadow"
                                                >
                                                    ⚡ Mulai Uji Coba Mode Tidur di TV
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ====== TAB: INFO WARGA ====== */}
                        {activeTab === 'warga' && (
                            <div className="flex flex-col gap-4">
                                {/* SUB-TAB: BERITA DUKA */}
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
                                    <div className="flex items-center justify-between border-b pb-2">
                                        <div>
                                            <h3 className="font-bold text-slate-700 text-sm">🖤 Pengumuman Berita Duka</h3>
                                            <p className="text-[10px] text-slate-400">Menampilkan berita lelayu warga setempat dengan huruf besar (ramah lansia).</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={settings.showBeritaDuka === true} 
                                                onChange={e => setSettings({ ...settings, showBeritaDuka: e.target.checked })}
                                                className="sr-only peer" 
                                            />
                                            <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                                        </label>
                                    </div>

                                    {settings.showBeritaDuka && (
                                        <div className="flex flex-col gap-3 mt-1">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Nama Almarhum / Almarhumah</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Contoh: Bapak H. Ahmad Fulan" 
                                                        value={settings.beritaDukaData?.nama || ''} 
                                                        onChange={e => setSettings({ 
                                                            ...settings, 
                                                            beritaDukaData: { ...(settings.beritaDukaData || {}), nama: e.target.value } 
                                                        })} 
                                                        className="w-full p-2 border rounded font-semibold text-slate-700 bg-white text-xs" 
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Usia (Tahun)</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Contoh: 65" 
                                                        value={settings.beritaDukaData?.usia || ''} 
                                                        onChange={e => setSettings({ 
                                                            ...settings, 
                                                            beritaDukaData: { ...(settings.beritaDukaData || {}), usia: e.target.value } 
                                                        })} 
                                                        className="w-full p-2 border rounded font-semibold text-slate-700 bg-white text-xs" 
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Waktu Wafat</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Contoh: Senin Pagi, Pukul 08:30 WIB" 
                                                        value={settings.beritaDukaData?.wafat || ''} 
                                                        onChange={e => setSettings({ 
                                                            ...settings, 
                                                            beritaDukaData: { ...(settings.beritaDukaData || {}), wafat: e.target.value } 
                                                        })} 
                                                        className="w-full p-2 border rounded font-semibold text-slate-700 bg-white text-xs" 
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Rumah Duka</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Contoh: RT 03 RW 01 (Belakang SD)" 
                                                        value={settings.beritaDukaData?.rumahDuka || ''} 
                                                        onChange={e => setSettings({ 
                                                            ...settings, 
                                                            beritaDukaData: { ...(settings.beritaDukaData || {}), rumahDuka: e.target.value } 
                                                        })} 
                                                        className="w-full p-2 border rounded font-semibold text-slate-700 bg-white text-xs" 
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Waktu Pemakaman</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Contoh: Ba'da Ashar di TPU Kamboja" 
                                                        value={settings.beritaDukaData?.makam || ''} 
                                                        onChange={e => setSettings({ 
                                                            ...settings, 
                                                            beritaDukaData: { ...(settings.beritaDukaData || {}), makam: e.target.value } 
                                                        })} 
                                                        className="w-full p-2 border rounded font-semibold text-slate-700 bg-white text-xs" 
                                                    />
                                                </div>
                                            </div>

                                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mt-2 flex flex-col gap-2.5">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="text-xs font-bold text-slate-700">🗣 Suara Pengumuman Otomatis (TTS)</h4>
                                                        <p className="text-[9px] text-slate-400 font-semibold">TV akan membacakan teks berita duka dengan suara asisten robot berbahasa Indonesia.</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={settings.beritaDukaData?.ttsEnabled === true} 
                                                            onChange={e => setSettings({ 
                                                                ...settings, 
                                                                beritaDukaData: { ...(settings.beritaDukaData || {}), ttsEnabled: e.target.checked } 
                                                            })}
                                                            className="sr-only peer" 
                                                        />
                                                        <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                                                    </label>
                                                </div>

                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        const updatedData = {
                                                            ...(settings.beritaDukaData || {}),
                                                            ttsTrigger: Date.now()
                                                        };
                                                        setSettings({ ...settings, beritaDukaData: updatedData });
                                                        saveToFirebase({ beritaDukaData: updatedData });
                                                        alert("Pemicu suara berhasil dikirim ke TV! TV akan segera membacakan pengumuman berita duka.");
                                                    }}
                                                    className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-2.5 px-4 rounded text-xs transition shadow-sm animate-pulse"
                                                >
                                                    📢 Kumandangkan Suara Pengumuman Sekarang
                                                </button>

                                                {settings.testLayoutMode === 'berita_duka' ? (
                                                    <button 
                                                        type="button"
                                                        onClick={async () => {
                                                            const updated = { testLayoutMode: 'none' };
                                                            setSettings(prev => ({ ...prev, ...updated }));
                                                            await saveToFirebase(updated);
                                                        }}
                                                        className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-4 rounded text-xs transition shadow-sm border border-red-500 mt-2"
                                                    >
                                                        ✕ Matikan Uji Coba Tampilan Duka
                                                    </button>
                                                ) : (
                                                    <button 
                                                        type="button"
                                                        onClick={async () => {
                                                            const updated = { testLayoutMode: 'berita_duka' };
                                                            setSettings(prev => ({ ...prev, ...updated }));
                                                            await saveToFirebase(updated);
                                                        }}
                                                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded text-xs transition shadow-sm border border-emerald-500 mt-2"
                                                    >
                                                        🧪 Uji Coba Tampilan Berita Duka di TV
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* SUB-TAB: INFO YASINAN */}
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
                                    <div className="flex items-center justify-between border-b pb-2">
                                        <div>
                                            <h3 className="font-bold text-slate-700 text-sm">📖 Jadwal Acara Yasinan Warga</h3>
                                            <p className="text-[10px] text-slate-400">Menampilkan jadwal pengajian / Yasinan warga setempat dengan teks jumbo.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={settings.showInfoYasinan === true} 
                                                onChange={e => setSettings({ ...settings, showInfoYasinan: e.target.checked })}
                                                className="sr-only peer" 
                                            />
                                            <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                                        </label>
                                    </div>

                                    {settings.showInfoYasinan && (
                                        <div className="flex flex-col gap-3 mt-1">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Malam / Hari Acara</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Contoh: Malam Jumat" 
                                                        value={settings.infoYasinanData?.malam || ''} 
                                                        onChange={e => setSettings({ 
                                                            ...settings, 
                                                            infoYasinanData: { ...(settings.infoYasinanData || {}), malam: e.target.value } 
                                                        })} 
                                                        className="w-full p-2 border rounded font-semibold text-slate-700 bg-white text-xs" 
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Waktu / Pukul</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Contoh: 19:30 WIB (Ba'da Isya)" 
                                                        value={settings.infoYasinanData?.pukul || ''} 
                                                        onChange={e => setSettings({ 
                                                            ...settings, 
                                                            infoYasinanData: { ...(settings.infoYasinanData || {}), pukul: e.target.value } 
                                                        })} 
                                                        className="w-full p-2 border rounded font-semibold text-slate-700 bg-white text-xs" 
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Tuan Rumah / Pengisi Hajat</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Contoh: Bapak H. Ahmad" 
                                                        value={settings.infoYasinanData?.tuanRumah || ''} 
                                                        onChange={e => setSettings({ 
                                                            ...settings, 
                                                            infoYasinanData: { ...(settings.infoYasinanData || {}), tuanRumah: e.target.value } 
                                                        })} 
                                                        className="w-full p-2 border rounded font-semibold text-slate-700 bg-white text-xs" 
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Lokasi Rumah / Tempat</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Contoh: RT 02 RW 03 (Belakang Masjid)" 
                                                        value={settings.infoYasinanData?.lokasi || ''} 
                                                        onChange={e => setSettings({ 
                                                            ...settings, 
                                                            infoYasinanData: { ...(settings.infoYasinanData || {}), lokasi: e.target.value } 
                                                        })} 
                                                        className="w-full p-2 border rounded font-semibold text-slate-700 bg-white text-xs" 
                                                    />
                                                </div>
                                            </div>
                                            <div className="mt-3 border-t pt-3 flex gap-2">
                                                {settings.testLayoutMode === 'info_yasinan' ? (
                                                    <button 
                                                        type="button"
                                                        onClick={async () => {
                                                            const updated = { testLayoutMode: 'none' };
                                                            setSettings(prev => ({ ...prev, ...updated }));
                                                            await saveToFirebase(updated);
                                                        }}
                                                        className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-4 rounded text-xs transition shadow-sm"
                                                    >
                                                        ✕ Matikan Uji Coba Tampilan Yasinan
                                                    </button>
                                                ) : (
                                                    <button 
                                                        type="button"
                                                        onClick={async () => {
                                                            const updated = { testLayoutMode: 'info_yasinan' };
                                                            setSettings(prev => ({ ...prev, ...updated }));
                                                            await saveToFirebase(updated);
                                                        }}
                                                        className="w-full bg-emerald-600 hover:bg-emerald-555 text-white font-bold py-2.5 px-4 rounded text-xs transition shadow-sm"
                                                    >
                                                        🧪 Uji Coba Tampilan Info Yasinan di TV
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ====== TAB 9: PIN KEAMANAN ====== */}
                        {activeTab === 'keamanan' && (
                            <div className="flex flex-col gap-4">
                                <label className="block text-sm font-bold text-slate-600">PIN Baru (4 Angka)</label>
                                <input
                                    type="text"
                                    pattern="\d*"
                                    maxLength={4}
                                    placeholder="Masukkan 4 angka baru..."
                                    value={settings.adminPin || ''}
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        setSettings({ ...settings, adminPin: val });
                                    }}
                                    className="w-full p-4 rounded-xl border-2 border-slate-200 outline-none text-2xl font-bold tracking-widest text-center focus:border-emerald-600 bg-white text-slate-700"
                                />
                                <p className="text-xs text-slate-400 mt-1 text-center font-medium">Harap catat PIN baru Anda agar tidak terkunci keluar dari panel kontrol admin!</p>
                            </div>
                        )}

                    </div>
                )}

            </div>

            {/* Fixed Bottom Save Button - Hidden on Dashboard, Shown only on Active Tab Edit Pages */}
            {activeTab !== 'dashboard' && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-xl z-50 flex flex-col gap-2 max-w-4xl mx-auto w-full">
                    {saveStatus && (
                        <div className={`text-center text-sm font-black rounded-xl py-2 transition-all
                            ${saveStatus === 'ok' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {saveStatus === 'ok' ? '✅ Tersimpan & Sinkron ke TV Masjid!' : '❌ Gagal menyimpan. Coba lagi.'}
                        </div>
                    )}
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setActiveTab('dashboard');
                                playAdminBeep(660, 0.1, 0.1);
                            }}
                            className="w-1/3 py-5 bg-slate-200 hover:bg-slate-300 text-slate-700 active:scale-95 text-base font-black rounded-2xl shadow transition text-center"
                        >
                            ⬅️ Dashboard
                        </button>
                        <button
                            disabled={isSaving}
                            onClick={() => saveToFirebase()}
                            className={`w-2/3 py-5 ${isSaving ? 'bg-emerald-800 opacity-75 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'} text-white text-base font-black rounded-2xl shadow-lg transition flex items-center justify-center gap-2`}
                        >
                            {isSaving ? '⏳ Menyimpan & Menyinkronkan...' : '💾 Simpan Perubahan'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}