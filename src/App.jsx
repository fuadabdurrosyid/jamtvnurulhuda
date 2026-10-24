import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
const AdminPanel = React.lazy(() => import('./AdminPanel'));
import { Volume2, VolumeX, MapPin, X, User, Info, DollarSign, MoreVertical } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, appId } from './firebase.js';
import { compressImageFile } from './constants.js';

// Import Gambar Lokal
import img1 from './assets/Masjid1.jpeg';
import img2 from './assets/Masjid2.jpeg';
import img3 from './assets/Masjid3.jpeg';
import img4 from './assets/Masjid4.jpeg';
import img5 from './assets/NurulHuda.jpeg';


// Daftar link Murottal MP3 — 114 Surah Al-Quran (archive.org, terjemahan Bahasa Indonesia)
const MUROTTAL_LIST = [
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/001%20Al%20Faatihah.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/002%20Al%20Baqarah.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/003%20Ali%20%27Imran.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/004%20An%20Nisaa%27.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/005%20Al%20Maa-idah.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/006%20Al%20An%27aam.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/007%20Al%20A%27raaf.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/008%20Al%20Anfaal.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/009%20At%20Taubah.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/010%20Yunus.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/011%20Huud.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/012%20Yusuf.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/013%20Ar%20Ra%27d.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/014%20Ibrahim.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/015%20Al%20Hijr.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/016%20An-Nahl.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/017%20Al%20Israa%27.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/018%20Al%20Kahfi.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/019%20Maryam.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/020%20Thaahaa.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/021%20Al%20Anbiyaa%27.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/022%20Al%20Hajj.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/023%20Al%20Mu%27minuun.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/024%20An%20Nuur.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/025%20Al%20Furqaan.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/026%20Asy%20Syu%27araa%27.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/027%20An%20Naml.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/028%20Al%20Qashash.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/029%20Al%20%27Ankabuut.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/030%20Ar%20Ruum.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/031%20Luqman.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/032%20As%20Sajdah.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/033%20Al%20Ahzab.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/034%20Saba%27.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/035%20Faathir.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/036%20Yaasiin.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/037%20Ash%20Shaaffaat.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/038%20Shaad.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/039%20Az%20Zumar.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/040%20Al%20Mu%27min.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/041%20Fushshilat.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/042%20Asy%20Syuura.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/043%20Az%20Zukhruf.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/044%20Ad%20Dukhaan.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/045%20Al%20Jaatsiyah.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/046%20Al%20Ahqaaf.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/047%20Muhammad.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/048%20Al%20Fath.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/049%20Al%20Hujuraat.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/050%20Qaaf.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/051%20Adz%20Dzaariyaat.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/052%20Ath%20Thuur.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/053%20An%20Najm.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/054%20Al%20Qamar.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/055%20Ar%20Rahmaan.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/056%20Al%20Waqi%27ah.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/057%20Al%20Hadiid.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/058%20Al%20Mujaadilah.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/059%20Al%20Hasyr.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/060%20Al%20Mumtahanah.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/061%20Ash%20Shaff.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/062%20Al%20Jumu%27ah.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/063%20Al%20Munaafiquun.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/064%20At%20Taghaabun.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/065%20Ath%20Thalaaq.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/066%20At%20Tahrim.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/067%20Al%20Mulk.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/068%20Al%20Qalam.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/069%20Al%20Haaqqah.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/070%20Al%20Ma%C2%B4aarij.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/071%20Nuh.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/072%20Al%20Jin.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/073%20Al%20Muzzammil.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/074%20Al%20Muddatstsir.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/075%20Al%20Qiyaamah.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/076%20Al%20Insaan.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/077%20Al%20Mursalaat.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/078%20An%20Naba%27.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/079%20An%20Naazi%C2%B4aat.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/080%20%C2%B4Abasa.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/081%20At%20Takwiir.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/082%20Al%20Infithaar.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/083%20Al%20Muthaffifin.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/084%20Al%20Insyiqaaq.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/085%20Al%20Buruuj.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/086%20Ath%20Thaariq.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/087%20Al%20A%C2%B4laa.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/088%20Al%20Ghaasyiyah.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/089%20Al%20Fajr.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/090%20Al%20Balad.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/091%20Asy%20Syams.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/092%20Al%20Lail.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/093%20Adh%20Dhuhaa.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/094%20Alam%20Nasyrah.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/095%20At%20Tiin.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/096%20Al%20%27Alaq.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/097%20Al%20Qadr.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/098%20Al%20Bayyinah.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/099%20Al%20Zalzalah.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/100%20Al%20%C2%B4Aadiyaat.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/101%20Al%20Qaari%C2%B4ah.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/102%20At%20Takaatsur.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/103%20Al%20%C2%B4Ashr.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/104%20Al%20Humazah.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/105%20Al%20Fiil.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/106%20Quraisy.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/107%20Al%20Maa%C2%B4uun.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/108%20Al%20Kautsar.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/109%20Al%20Kaafiruun.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/110%20An%20Nashr.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/111%20Al%20Lahab.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/112%20Al%20Ikhlash.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/113%20Al%20Falaq.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/114%20An-Naas.mp3",
];

// Cache Offline 48 Surah (Juz 29 & Juz 30) - 067 Al-Mulk s/d 114 An-Naas
const CACHED_SURAH_LIST = MUROTTAL_LIST.slice(66, 114);

// Default Tarhim URL dari archive.org
const TARHIM_URL = "https://archive.org/download/tarhim-masjid-nurul-huda/TARHIM%20MASJID%20NURUL%20HUDA.mp3";

// Total Audio Offline Otomatis (48 Surah Juz 29 & 30 + 1 Tarhim Subuh)
const ALL_OFFLINE_AUDIO = [...CACHED_SURAH_LIST, TARHIM_URL];

// Daftar Nama Petugas Masjid
const NAMA_PETUGAS = [
    "Acul Hidayat", "Adi Aca", "Airudin", "Al Hajja", "Al Hulid S.Pd.I",
    "Awalludin, S.Hi", "Dian Arianto S.Pd.I", "Duta", "Edo", "Fransisko",
    "Heri Arpanda", "Kecer", "Liberti", "Mang Ian", "Marzuki S.Pd.I",
    "Raju", "Sekter", "Sidi", "Yeyen"
];

const getNextFriday = () => {
    const today = new Date();
    const day = today.getDay(); // 0=Min, 5=Jum
    const diff = day <= 5 ? 5 - day : 7 - day + 5;
    const nextFri = new Date(today);
    nextFri.setDate(today.getDate() + diff);
    return nextFri.toISOString().split('T')[0]; // YYYY-MM-DD
};

const HIJRI_MONTHS = {
    "Muharram": "Muharram", "Safar": "Safar", "Rabi' al-awwal": "Rabiul Awal", "Rabi' al-thani": "Rabiul Akhir",
    "Jumada al-awwal": "Jumadil Awal", "Jumada al-thani": "Jumadil Akhir", "Rajab": "Rajab", "Sha'ban": "Sya'ban",
    "Ramadan": "Ramadhan", "Shawwal": "Syawal", "Dhu al-Qi'dah": "Dzulqa'dah", "Dhu al-Hijjah": "Dzulhijjah"
};

const ISLAMIC_QUOTES = [
    { text: "Peliharalah semua salat(mu), dan salat wusthaa. Berdirilah untuk Allah dengan khusyu.", source: "QS. Al-Baqarah: 238" },
    { text: "Karena sesungguhnya sesudah kesulitan itu ada kemudahan.", source: "QS. Al-Insyirah: 5" },
    { text: "Maka ingatlah kepada-Ku, Aku pun akan ingat kepadamu.", source: "QS. Al-Baqarah: 152" },
    { text: "Allah tidak membebani seseorang melainkan sesuai dengan kesanggupannya.", source: "QS. Al-Baqarah: 286" },
    { text: "Berdoalah kepada-Ku, niscaya akan Kuperkenankan bagimu.", source: "QS. Ghafir: 60" },
    { text: "Sesungguhnya salat itu mencegah dari (perbuatan-perbuatan) keji dan mungkar.", source: "QS. Al-'Ankabut: 45" },
];

const DEFAULT_SETTINGS = {
    mosqueName: "MASJID NURUL HUDA",
    mosqueAddress: "Jl. Raya Desa Ujung Tanjung Kec. Tulung Selapan",
    city: "KAB. OGAN KOMERING ILIR",
    marqueeText: "HARAP HP DINON-AKTIFKAN ATAU DISETTING MODE SILENT SAAT BERADA DI DALAM MASJID. LURUSKAN DAN RAPATKAN SHAF SHOLAT.",
    khatibText: "Khatib: Ust. Usman | Imam: Ust. Abu Bakar | Muadzin: Ust. Ali | Bilal: Ust. Umar | Tanggal: 2026-04-24",
    petugasJumat: "Muadzin: Ust. Ali | Bilal: Ust. Umar | Khatib: Ust. Usman | Imam: Ust. Abu Bakar",
    acaraText: "Kajian Rutin Ba'da Maghrib Setiap Malam Ahad. | Santunan Anak Yatim Tanggal 15 Bulan Ini.",
    keuanganText: "Pemasukan Kotak Amal: Rp 2.500.000 | Pengeluaran: Rp 800.000 | Saldo Kas Masjid: Rp 15.200.000",
    images: [
        img5,
        img1,
        img2,
        img3,
        img4
    ],
    youtubeLink: "https://youtu.be/a3MeLj37S8w",
    displayMode: "both",
    murottalLinks: MUROTTAL_LIST,
    prayerOffsets: { Shubuh: 0, Syuruq: 0, Dzuhur: 0, Ashar: 0, Maghrib: 0, Isya: 0 },
    iqomahDurations: { Shubuh: 10, Dzuhur: 10, Ashar: 10, Maghrib: 5, Isya: 10 },
    hijriOffset: 0,
    adzanDuration: 2,
    beepVolume: 0.3,
    murottalActivePerPrayer: { Shubuh: true, Dzuhur: true, Ashar: true, Maghrib: true, Isya: true },
    jumatMurottalActive: true,
    jumatMurottalStart: "11:00",
    jumatMurottalEnd: "11:45",
    // Pengaturan Khusus Jumat
    jumatShowPetugas: true,
    jumatShowDzuhur: true,
    jumatShowAcara: true,
    jumatShowKeuangan: true,
    jumatShowTicker: true,
    jumatBgFrom: "#064e3b",
    jumatBgTo: "#0f172a",
    jumatTextPrimary: "#ffffff",
    jumatTextSecondary: "#a7f3d0",
    jumatAccent: "#fbbf24",
    jumatDzuhurBg: "#059669",
    jumatDzuhurText: "#ffffff",
    jumatBorder: "#10b981",
    jumatAcaraBg: "#1e3a5f",
    jumatKeuanganBg: "#3b2200",
    jumatTickerText: "HAI ORANG-ORANG BERIMAN, APABILA DISERU UNTUK MENUNAIKAN SHALAT JUM'AT, MAKA BERSEGERALAH KAMU KEPADA MENGINGAT ALLAH DAN TINGGALKANLAH JUAL BELI. (QS. AL-JUMU'AH: 9) | BARANGSIAPA YANG MANDI LALU BERANGKAT SHALAT JUMAT, MAKA DIAMPUNI DOSA-DOSANYA ANTARA JUMAT ITU DENGAN JUMAT BERIKUTNYA. (HR. MUSLIM)",
    // Warna & Tema
    headerGradientFrom: "#1e3a8a",
    headerGradientTo: "#3b82f6",
    headerTextColor: "#ffffff",
    cardBgColor: "#1d4ed8",
    cardTextColor: "#ffffff",
    cardHighlightColor: "#1e40af",
    marqueeBgFrom: "#1d4ed8",
    marqueeBgTo: "#93c5fd",
    marqueeTextColor: "#ffffff",
    countdownBgColor: "#2563eb",
    countdownTextColor: "#ffffff",
    mainBgColor: "#f1f5f9",
    // Rotasi & Hari Besar
    rotasiAktif: true,
    rotasiDurasi: 10,
    rotasiTampilan: ['normal', 'petugas', 'keuangan', 'haribesar'],
    hariBesar: [
        { nama: "Tahun Baru Islam 1 Muharram", tanggal: "2025-07-07", warna: "#1a5276", emoji: "🌙" },
        { nama: "Maulid Nabi Muhammad SAW", tanggal: "2025-09-04", warna: "#145a32", emoji: "☪️" },
        { nama: "Isra Mi'raj", tanggal: "2026-01-27", warna: "#4a235a", emoji: "✨" },
        { nama: "Nuzulul Quran", tanggal: "2026-03-04", warna: "#784212", emoji: "📖" },
        { nama: "Idul Fitri 1447 H", tanggal: "2026-03-20", warna: "#1a5276", emoji: "🎉" },
        { nama: "Idul Adha 1447 H", tanggal: "2026-05-27", warna: "#145a32", emoji: "🐑" },
    ],
    petugasJadwal: [
        { tanggal: "2026-04-25", khatib: "Ust. Ahmad Fulan, Lc., M.A.", imam: "Ust. Budi Haryanto", muadzin: "Ust. Ali Zain", bilal: "Ust. Umar Faruq" }
    ],
};

export default function App() {
    const [currentPage, setCurrentPage] = useState(
        window.location.hash === '#admin' ? 'admin' : 'display'
    );

    useEffect(() => {
        const handleHash = () => {
            setCurrentPage(window.location.hash === '#admin' ? 'admin' : 'display');
        };
        window.addEventListener('hashchange', handleHash);
        return () => window.removeEventListener('hashchange', handleHash);
    }, []);

    const [isStarted, setIsStarted] = useState(false);
    const [time, setTime] = useState(new Date());
    const [prayerTimes, setPrayerTimes] = useState(null);
    const [hijriDate, setHijriDate] = useState("");

    // mode bisa berupa: 'countdown' | 'preadzan' (10 mnt sblm) | 'adzan' (0 s.d +2 mnt) | 'iqomah' (+2 mnt s.d habis iqomah)
    const [nextPrayer, setNextPrayer] = useState({ name: "", time: null, diffStr: "00:00:00", isNear: false, mode: 'countdown', isTarhim: false });

    const [isPlaying, setIsPlaying] = useState(false);
    const [playedForPrayer, setPlayedForPrayer] = useState(null);

    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const [showingYoutube, setShowingYoutube] = useState(false);

    // State Pengaturan
    const [user, setUser] = useState(null);
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('masjid_settings');
        if (saved) {
            try {
                return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
            } catch { /* abaikan error */ }
        }
        return DEFAULT_SETTINGS;
    });
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [tempSettings, setTempSettings] = useState(DEFAULT_SETTINGS);
    const [activeTab, setActiveTab] = useState('umum');

    const [isJumatMode, setIsJumatMode] = useState(false);
    const [isJumatTest, setIsJumatTest] = useState(false);
    const activeJumat = isJumatMode || isJumatTest;
    const [jumatSlideIndex, setJumatSlideIndex] = useState(0);
    const [testProsesiJumat, setTestProsesiJumat] = useState(null);

    useEffect(() => {
        if (testProsesiJumat) {
            playBeep(600, 0.5, 0.5, 0); // Beep testing
        }
    }, [testProsesiJumat]);

    const jumatSlides = React.useMemo(() => {
        if (!activeJumat) return [];
        const slides = [];
        if (settings.jumatShowPetugas !== false) {
            slides.push({ type: 'petugas_single', role: 'Imam', duration: 10 });
            slides.push({ type: 'petugas_single', role: 'Khatib', duration: 10 });
            slides.push({ type: 'petugas_single', role: 'Bilal', duration: 10 });
            slides.push({ type: 'petugas_single', role: 'Muadzin', duration: 10 });
        }
        if (settings.images && settings.images.length > 0) {
            settings.images.forEach(img => {
                slides.push({ type: 'gambar', src: img, duration: 30 });
            });
        }
        if (settings.jumatShowKeuangan !== false) {
            slides.push({ type: 'keuangan', duration: 30 });
        }
        if (settings.jumatShowAcara !== false) {
            slides.push({ type: 'acara', duration: 30 });
        }
        if (settings.jumatShowPetugas !== false) {
            slides.push({ type: 'petugas_all', duration: 30 });
        }
        return slides;
    }, [activeJumat, settings.jumatShowPetugas, settings.jumatShowKeuangan, settings.jumatShowAcara, settings.images]);

    useEffect(() => {
        if (jumatSlides.length > 0) {
            const currentDuration = jumatSlides[jumatSlideIndex % jumatSlides.length]?.duration || 10;
            const timeout = setTimeout(() => {
                setJumatSlideIndex(prev => (prev + 1) % jumatSlides.length);
            }, currentDuration * 1000);
            return () => clearTimeout(timeout);
        }
    }, [jumatSlides, jumatSlideIndex]);

    const getJumatPetugas = () => {
        const lines = (settings.khatibText || "").split('|').map(s => s.trim());
        const data = {
            Khatib: "KHATIB", KhatibName: "-",
            Imam: "IMAM", ImamName: "-",
            Muadzin: "MUADZIN", MuadzinName: "-",
            Bilal: "BILAL", BilalName: "-"
        };
        lines.forEach(line => {
            const [role, ...rest] = line.split(':');
            if (!role) return;
            const name = rest.join(':').trim();
            const r = role.trim().toUpperCase();
            if (r === 'KHATIB') data.KhatibName = name;
            else if (r === 'IMAM') data.ImamName = name;
            else if (r === 'MUADZIN') data.MuadzinName = name;
            else if (r === 'BILAL') data.BilalName = name;
        });
        return [
            { role: data.Khatib, name: data.KhatibName },
            { role: data.Imam, name: data.ImamName },
            { role: data.Muadzin, name: data.MuadzinName },
            { role: data.Bilal, name: data.BilalName },
        ];
    };
    const [imagesList, setImagesList] = useState([]);
    const [audioText, setAudioText] = useState("");
    const [quotesText, setQuotesText] = useState("");

    // State Rotasi & Hari Besar
    const [modeTampilan, setModeTampilan] = useState('normal');
    const [_rotasiIndex, setRotasiIndex] = useState(0);

    const [_hariBesarLive, setHariBesarLive] = useState([]);


    // State Form Petugas Jumat
    const [newPetugasName, setNewPetugasName] = useState("");
    const [formPetugas, setFormPetugas] = useState({
        tanggal: getNextFriday(),
        muadzin: "",
        bilal: "",
        khotib: "",
        imam: ""
    });

    // State Form Keuangan
    const [formKeuangan, setFormKeuangan] = useState({
        pemasukan: "",
        pengeluaran: "",
        saldo: "",
        catatan: ""
    });
    const [keuanganPreview, setKeuanganPreview] = useState("");

    const audioRef = useRef(null);
    const tarhimUrlRef = useRef(null);
    const [tarhimFileName, setTarhimFileName] = useState("");

    // State Koneksi & Status Audio Offline
    const [isOfflineMode, setIsOfflineMode] = useState(false);
    const [cacheProgress, setCacheProgress] = useState({ done: 0, total: ALL_OFFLINE_AUDIO.length });
    const retryCountRef = useRef(0);
    const MAX_RETRY = 3;
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [offlineManualMode, setOfflineManualMode] = useState(false);

    const resetOfflineMode = () => {
        setOfflineManualMode(false);
        setIsOfflineMode(false);
    };

    // Refs untuk tracking mode transisi beep (tidak trigger re-render)
    const prevModeRef = useRef('countdown');
    const beepPlayedRef = useRef(null);

    // Ref untuk status aktif Jumat Murottal — mencegah race condition dengan React state async
    const jumatMurottalActiveRef = useRef(false);

    // === WEB AUDIO API BEEP — tanpa file eksternal ===
    const playBeep = (frekuensi = 880, durasi = 0.5, volume = 1.0, jeda = 0) => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            // Compressor agar tidak clipping di speaker masjid
            const compressor = ctx.createDynamicsCompressor();
            compressor.threshold.value = -20;
            compressor.knee.value = 10;
            compressor.ratio.value = 8;
            compressor.attack.value = 0.003;
            compressor.release.value = 0.1;

            oscillator.connect(gainNode);
            gainNode.connect(compressor);
            compressor.connect(ctx.destination);

            oscillator.frequency.value = frekuensi;
            oscillator.type = 'sine';

            // Volume aman — dikali master volume dari settings (diturunkan 20x agar aman di speaker masjid)
            const masterVolume = (settings.beepVolume ?? 0.3) * 0.05;
            const safeVolume = Math.min(volume * masterVolume, 0.5);

            gainNode.gain.setValueAtTime(0, ctx.currentTime + jeda);
            gainNode.gain.linearRampToValueAtTime(safeVolume, ctx.currentTime + jeda + 0.02);
            gainNode.gain.setValueAtTime(safeVolume, ctx.currentTime + jeda + durasi - 0.08);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + jeda + durasi);

            oscillator.start(ctx.currentTime + jeda);
            oscillator.stop(ctx.currentTime + jeda + durasi + 0.05);
        } catch (e) {
            console.log('Beep error:', e);
        }
    };

    const _playBeepSequence = (jumlah, frekuensi = 880, durasi = 0.5, interval = 0.65) => {
        for (let i = 0; i < jumlah; i++) {
            playBeep(frekuensi, durasi, 1.0, i * interval);
        }
    };

    // IndexedDB untuk menyimpan file Murottal Tarhim Subuh & Cache Murottal
    useEffect(() => {
        const request = indexedDB.open('MasjidDB', 2);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('audioStore')) {
                db.createObjectStore('audioStore');
            }
            if (!db.objectStoreNames.contains('murottalCache')) {
                db.createObjectStore('murottalCache');
            }
        };
        request.onsuccess = (e) => {
            const db = e.target.result;
            if (db.objectStoreNames.contains('audioStore')) {
                const tx = db.transaction('audioStore', 'readonly');
                const store = tx.objectStore('audioStore');
                const getReq = store.get('tarhimAudio');
                getReq.onsuccess = () => {
                    if (getReq.result) {
                        tarhimUrlRef.current = URL.createObjectURL(getReq.result);
                        setTarhimFileName(getReq.result.name || "tarhim_tersimpan.mp3");
                    }
                };
            }
        };
    }, []);

    // initAudioCache
    useEffect(() => {
        const initAudioCache = async () => {
            const request = indexedDB.open('MasjidDB', 2);
            request.onsuccess = async (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('murottalCache')) return;

                let doneCount = 0;
                for (const url of ALL_OFFLINE_AUDIO) {
                    const exists = await new Promise(res => {
                        const tx = db.transaction('murottalCache', 'readonly');
                        const store = tx.objectStore('murottalCache');
                        const req = store.get(url);
                        req.onsuccess = () => res(!!req.result);
                        req.onerror = () => res(false);
                    });
                    if (exists) doneCount++;
                }
                setCacheProgress({ done: doneCount, total: ALL_OFFLINE_AUDIO.length });
                if (doneCount === ALL_OFFLINE_AUDIO.length) return;

                for (const url of ALL_OFFLINE_AUDIO) {
                    const exists = await new Promise(res => {
                        const tx = db.transaction('murottalCache', 'readonly');
                        const store = tx.objectStore('murottalCache');
                        const req = store.get(url);
                        req.onsuccess = () => res(!!req.result);
                        req.onerror = () => res(false);
                    });
                    if (!exists) {
                        try {
                            const response = await fetch(url);
                            const blob = await response.blob();
                            await new Promise((res, rej) => {
                                const tx = db.transaction('murottalCache', 'readwrite');
                                const store = tx.objectStore('murottalCache');
                                const putReq = store.put(blob, url);
                                putReq.onsuccess = () => res();
                                putReq.onerror = () => rej();
                            });
                            doneCount++;
                            setCacheProgress({ done: doneCount, total: ALL_OFFLINE_AUDIO.length });
                            await new Promise(r => setTimeout(r, 800));
                        } catch (err) {
                            console.error("Gagal cache url:", url, err);
                        }
                    }
                }
            };
        };
        initAudioCache();
    }, []);

    const handleTarhimUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const request = indexedDB.open('MasjidDB', 2);
        request.onupgradeneeded = (ev) => {
            const db = ev.target.result;
            if (!db.objectStoreNames.contains('audioStore')) {
                db.createObjectStore('audioStore');
            }
            if (!db.objectStoreNames.contains('murottalCache')) {
                db.createObjectStore('murottalCache');
            }
        };
        request.onsuccess = (ev) => {
            const db = ev.target.result;
            const tx = db.transaction('audioStore', 'readwrite');
            const store = tx.objectStore('audioStore');
            store.put(file, 'tarhimAudio');
            tx.oncomplete = () => {
                tarhimUrlRef.current = URL.createObjectURL(file);
                setTarhimFileName(file.name);
                e.target.value = null; // reset input
            };
        };
    };

    // Firebase Auth — sign-in ditangani oleh shared firebase.js module
    useEffect(() => {
        if (!auth) return;
        const unsubscribe = onAuthStateChanged(auth, setUser);
        return () => unsubscribe();
    }, []);
    useEffect(() => {
        // Jika mode berubah dari preadzan ke mode lain (adzan/iqomah/countdown)
        if (nextPrayer.mode !== 'preadzan') {
            if (offlineManualMode) {
                setOfflineManualMode(false);
                setIsOfflineMode(false);
                stopAudio();
                console.log('🔄 Mode kembali ke normal — offline manual dimatikan');
            }
        }
    }, [nextPrayer.mode, offlineManualMode]);

    useEffect(() => {
        const setOnline = () => setIsOnline(true);
        const setOffline = () => setIsOnline(false);
        window.addEventListener('online', setOnline);
        window.addEventListener('offline', setOffline);
        return () => {
            window.removeEventListener('online', setOnline);
            window.removeEventListener('offline', setOffline);
        };
    }, []);

    useEffect(() => {
        const handleOnlineTrigger = () => {
            if (nextPrayer.mode === 'preadzan' && !isPlaying) {
                playRandomMurottal();
            }
        };
        window.addEventListener('online', handleOnlineTrigger);
        return () => window.removeEventListener('online', handleOnlineTrigger);
    }, [nextPrayer.mode, isPlaying]);

    // Ambil Pengaturan
    useEffect(() => {
        if (!user || !db) return;
        const settingsRef = doc(db, 'artifacts', appId, 'settings', 'global_config');
        const unsub = onSnapshot(settingsRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setSettings({ ...DEFAULT_SETTINGS, ...data });
            }
        }, (error) => console.error("Error fetching settings:", error));
        return () => unsub();
    }, [user]);

    // Text-to-Speech (TTS) Pengumuman Berita Duka
    const lastTtsTriggerRef = useRef(0);
    useEffect(() => {
        const trigger = settings?.beritaDukaData?.ttsTrigger;
        if (!trigger) return;
        
        if (lastTtsTriggerRef.current === 0) {
            lastTtsTriggerRef.current = trigger;
            return;
        }
        
        if (trigger > lastTtsTriggerRef.current) {
            lastTtsTriggerRef.current = trigger;
            if (settings.beritaDukaData?.ttsEnabled !== false && settings.showBeritaDuka) {
                if (window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                    
                    const duka = settings.beritaDukaData;
                    const teksPengumuman = `Innalillahi wa inna ilaihi raji'un. Telah berpulang ke rahmatullah, ${duka.nama || 'seseorang'}. Usia ${duka.usia || ''} tahun. Wafat pada ${duka.wafat || ''}. Rumah duka bertempat di ${duka.rumahDuka || ''}. Rencana pemakaman ${duka.makam || ''}. Semoga almarhum husnul khatimah dan keluarga yang ditinggalkan diberikan ketabahan.`;
                    
                    const utterance = new SpeechSynthesisUtterance(teksPengumuman);
                    utterance.lang = 'id-ID';
                    utterance.rate = 0.85; // Sedikit lambat agar jelas didengar di masjid
                    utterance.pitch = 1.0;
                    
                    const voices = window.speechSynthesis.getVoices();
                    const idVoice = voices.find(v => v.lang.includes('id') || v.lang.includes('ID'));
                    if (idVoice) utterance.voice = idVoice;
                    
                    window.speechSynthesis.speak(utterance);
                }
            }
        }
    }, [settings?.beritaDukaData?.ttsTrigger, settings?.beritaDukaData?.ttsEnabled, settings?.showBeritaDuka]);

    const openSettings = () => {
        setTempSettings(settings);
        setImagesList(settings.images || []);
        setAudioText(settings.murottalLinks.join('\n'));
        setQuotesText((settings.quotesList || ISLAMIC_QUOTES.map(q => `${q.text} | ${q.source}`)).join('\n\n'));
        setActiveTab('umum');
        setIsSettingsOpen(true);
    };

    const saveSettings = async () => {
        const updatedSettings = { ...tempSettings };
        updatedSettings.images = imagesList.filter(Boolean);
        
        // Filter dan sanitasi base64 images agar tidak melebihi batas Firestore 1MB
        if (updatedSettings.images && Array.isArray(updatedSettings.images)) {
            updatedSettings.images = updatedSettings.images.slice(0, 5).filter(img => {
                if (typeof img === 'string' && img.startsWith('data:')) {
                    return img.length < 300000; // di bawah ~200KB
                }
                return true;
            });
        }

        updatedSettings.murottalLinks = audioText.split('\n').map(s => s.trim()).filter(Boolean);
        updatedSettings.quotesList = quotesText.split('\n\n').map(s => s.trim()).filter(Boolean);

        if (user && db) {
            const settingsRef = doc(db, 'artifacts', appId, 'settings', 'global_config');
            await setDoc(settingsRef, updatedSettings);
        }

        setSettings(updatedSettings);
        localStorage.setItem('masjid_settings', JSON.stringify(updatedSettings));
        setIsSettingsOpen(false);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const dataUrl = await compressImageFile(file, 1280, 75);
            setImagesList((prev) => [...prev.slice(0, 4), dataUrl]);
        } catch (err) {
            console.error("Gagal kompres gambar:", err);
            alert("Gagal memproses gambar: " + (err.message || err));
        }

        // Clear input file
        e.target.value = null;
    };

    useEffect(() => {
        if (settings.displayMode === 'video') setShowingYoutube(true);
        else if (settings.displayMode === 'image') setShowingYoutube(false);
    }, [settings.displayMode]);

    const handleVideoEnd = () => {
        if (settings.displayMode === 'both') {
            setShowingYoutube(false);
            setCurrentImgIndex(prev => (prev + 1) % (settings.images.length || 1));
        }
    };

    // Rotasi Gambar
    useEffect(() => {
        let imgInterval;
        let videoTimeout;
        if (!showingYoutube) { // Timer gambar hanya jalan saat youtube tidak tayang
            imgInterval = setInterval(() => {
                if (settings.displayMode === 'both') {
                    setShowingYoutube(true);
                } else if (settings.displayMode === 'image') {
                    setCurrentImgIndex(prev => (prev + 1) % (settings.images.length || 1));
                }
            }, 1 * 60 * 1000); // 1 menit untuk gambar
        } else {
            // Ketika sedang tayang youtube di mode both
            if (settings.displayMode === 'both') {
                videoTimeout = setTimeout(() => {
                    handleVideoEnd(); // ganti video kembali ke gambar setelah 5 menit tayang
                }, 5 * 60 * 1000); // Tampilkan video youtube selama 5 menit
            }
        }

        return () => {
            if (imgInterval) clearInterval(imgInterval);
            if (videoTimeout) clearTimeout(videoTimeout);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settings.images, settings.displayMode, showingYoutube]);

    // === ROTASI TAMPILAN OTOMATIS ===
    useEffect(() => {
        if (!settings.rotasiAktif || !isStarted) return;
        const durasiMs = (settings.rotasiDurasi || 10) * 60 * 1000;
        const rotasiInterval = setInterval(() => {
            const daftar = settings.rotasiTampilan || ['normal', 'petugas', 'keuangan', 'haribesar'];
            const validDaftar = daftar.filter(item => item !== 'normal');
            if (validDaftar.length > 0) {
                const randomView = validDaftar[Math.floor(Math.random() * validDaftar.length)];
                setModeTampilan(randomView);
                
                let viewDurasiMs = 30000; // default 30 detik
                if (randomView.startsWith('custom_')) {
                    const customViews = settings.customViews || [];
                    const cv = customViews.find(c => c.id === randomView);
                    if (cv && cv.duration) {
                        viewDurasiMs = cv.duration * 60 * 1000;
                    }
                }
                
                // Tampilan rotasi muncul sesuai durasi lalu kembali ke normal
                setTimeout(() => {
                    setModeTampilan('normal');
                }, viewDurasiMs);
            }
        }, durasiMs);
        return () => clearInterval(rotasiInterval);
    }, [settings.rotasiAktif, settings.rotasiDurasi, settings.rotasiTampilan, settings.customViews, isStarted]);

    // === HARI BESAR LIVE ===
    useEffect(() => {
        const update = () => {
            const now = new Date();
            const list = [...(settings.hariBesar || [])]
                .map(h => {
                    const target = new Date(h.tanggal);
                    const diff = target - now;
                    return {
                        ...h,
                        hari: Math.floor(diff / (1000 * 60 * 60 * 24)),
                        jam: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                        menit: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                        diff
                    };
                })
                .filter(h => h.diff > 0)
                .sort((a, b) => a.diff - b.diff);
            setHariBesarLive(list);
        };

        update(); // langsung jalankan pertama kali
        const interval = setInterval(update, 60000); // update tiap menit
        return () => clearInterval(interval);
    }, [settings.hariBesar]);

    const adjustTime = (timeStr, offsetMinutes) => {
        if (!timeStr) return "--:--";
        const [h, m] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(h, m + Number(offsetMinutes || 0), 0, 0);
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    // Fetch Jadwal
    useEffect(() => {
        const fetchPrayerTimes = async () => {
            try {
                const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${settings.city}&country=Indonesia&method=20`);
                const data = await response.json();
                if (data && data.data) {
                    const t = data.data.timings;
                    setPrayerTimes({
                        Shubuh: adjustTime(t.Fajr, settings.prayerOffsets?.Shubuh),
                        Syuruq: adjustTime(t.Sunrise, settings.prayerOffsets?.Syuruq),
                        Dzuhur: adjustTime(t.Dhuhr, settings.prayerOffsets?.Dzuhur),
                        Ashar: adjustTime(t.Asr, settings.prayerOffsets?.Ashar),
                        Maghrib: adjustTime(t.Maghrib, settings.prayerOffsets?.Maghrib),
                        Isya: adjustTime(t.Isha, settings.prayerOffsets?.Isya)
                    });
                    const h = data.data.date.hijri;
                    const offset = parseInt(settings.hijriOffset) || 0;
                    let newDay = parseInt(h.day) + offset;
                    let m = h.month.number;
                    let y = parseInt(h.year);
                    if (newDay > 30) { newDay -= 30; m += 1; if (m > 12) { m = 1; y += 1; } }
                    else if (newDay < 1) { newDay += 30; m -= 1; if (m < 1) { m = 12; y -= 1; } }
                    const monthNames = ["Muharram", "Safar", "Rabi' al-awwal", "Rabi' al-thani", "Jumada al-awwal", "Jumada al-thani", "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"];
                    const enMonth = monthNames[m - 1];
                    setHijriDate(`${String(newDay).padStart(2, '0')} ${HIJRI_MONTHS[enMonth] || enMonth} ${y}`);
                }
            } catch (error) {
                console.error("Gagal mengambil jadwal sholat", error);
            }
        };
        fetchPrayerTimes();
    }, [settings.city, settings.prayerOffsets, settings.hijriOffset]);

    // Main Timer Loop
    useEffect(() => {
        let lastSecond = -1;
        const timer = setInterval(() => {
            const now = new Date();
            if (now.getSeconds() !== lastSecond) {
                lastSecond = now.getSeconds();
                setTime(now);

                const isFriday = now.getDay() === 5;
                const hours = now.getHours();
                setIsJumatMode(isFriday && hours >= 10 && hours < 13 && settings.jumatMasterActive !== false);

                // Beep 1x saat jam berganti tepat (setiap jam)
                if (now.getSeconds() === 0 && now.getMinutes() === 0 && isStarted) {
                    playBeep(660, 0.3, 0.5, 0);
                }

                if (prayerTimes) calculateNextPrayer(now, prayerTimes);
            }
        }, 100);
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prayerTimes, playedForPrayer, settings, isStarted]);

    const calculateNextPrayer = (now, times) => {
        // ============================================================
        // JUMAT MUROTTAL — diletakkan di PALING ATAS, dieksekusi di
        // mode APAPUN (countdown, preadzan, dll) tanpa syarat currentMode
        // ============================================================
        const isFridayForMurottal = now.getDay() === 5;
        if (!isFridayForMurottal) {
            // Reset ref saat bukan hari Jumat agar siap untuk minggu berikutnya
            jumatMurottalActiveRef.current = false;
        } else if (settings.jumatMurottalActive !== false) {
            const [jStartH, jStartM] = (settings.jumatMurottalStart || "11:00").split(':').map(Number);
            const [jEndH, jEndM] = (settings.jumatMurottalEnd || "11:45").split(':').map(Number);
            const jCurrentMinutes = now.getHours() * 60 + now.getMinutes();
            const jStartMinutes = jStartH * 60 + jStartM;
            const jEndMinutes = jEndH * 60 + jEndM;

            if (jCurrentMinutes >= jStartMinutes && jCurrentMinutes < jEndMinutes) {
                // START — hanya putar sekali menggunakan ref sebagai guard
                if (!jumatMurottalActiveRef.current && isStarted) {
                    jumatMurottalActiveRef.current = true;
                    setPlayedForPrayer('JumatMurottal');
                    setTimeout(() => {
                        if (settings.jumatMurottalLink && audioRef.current) {
                            audioRef.current.src = settings.jumatMurottalLink;
                        }
                        playRandomMurottal();
                    }, 500);
                }
            } else {
                // STOP — jalankan di mode APAPUN tanpa syarat currentMode
                if (jumatMurottalActiveRef.current) {
                    jumatMurottalActiveRef.current = false;
                    setPlayedForPrayer(null);
                    stopAudio();
                }
            }
        }
        // ============================================================
        const schedule = [
            { name: "Shubuh", timeStr: times.Shubuh },
            { name: "Syuruq", timeStr: times.Syuruq },
            { name: "Dzuhur", timeStr: times.Dzuhur },
            { name: "Ashar", timeStr: times.Ashar },
            { name: "Maghrib", timeStr: times.Maghrib },
            { name: "Isya", timeStr: times.Isya }
        ];

        let upcoming = null;
        let minDiff = Infinity;
        let currentMode = 'countdown';
        let currentName = "";
        let displayDiffStr = "00:00:00";
        let isIqomatDisplay = false;
        let currentElapsedAdzanMs = 0;

        for (let p of schedule) {
            const [h, m] = p.timeStr.split(':');
            const pTime = new Date(now);
            pTime.setHours(parseInt(h), parseInt(m), 0, 0);

            const diff = pTime.getTime() - now.getTime();

            // Logika setelah waktu Adzan tiba (diff <= 0)
            if (p.name !== 'Syuruq' && diff <= 0) {
                const timePassedSinceAdhanMs = -diff;
                const isFriday = now.getDay() === 5;
                
                if (isFriday && p.name === 'Dzuhur') {
                    const durMuadzin = (settings.jumatDurations?.muadzin ?? 7) * 60 * 1000;
                    const durJedaMB = (settings.jumatDurations?.jedaMB ?? 2) * 60 * 1000;
                    const durBilal = (settings.jumatDurations?.bilal ?? 7) * 60 * 1000;
                    const durJedaBK = (settings.jumatDurations?.jedaBK ?? 2) * 60 * 1000;
                    const durKhatib = (settings.jumatDurations?.khatib ?? 15) * 60 * 1000;
                    const durJedaKI = (settings.jumatDurations?.jedaKI ?? 2) * 60 * 1000;
                    const durImam = (settings.jumatDurations?.imam ?? 7) * 60 * 1000;
                    const t1 = durMuadzin;
                    const t2 = t1 + durJedaMB;
                    const t3 = t2 + durBilal;
                    const t4 = t3 + durJedaBK;
                    const t5 = t4 + durKhatib;
                    const t6 = t5 + durJedaKI;
                    const t7 = t6 + durImam;

                    if (timePassedSinceAdhanMs < t1) {
                        currentMode = 'jumat_prosesi'; currentName = 'Muadzin';
                        displayDiffStr = formatDiff(t1 - timePassedSinceAdhanMs);
                        stopAudio(); break;
                    } else if (timePassedSinceAdhanMs < t2) {
                        currentMode = 'jumat_jeda'; currentName = "SHOLAT JUM'AT";
                        displayDiffStr = formatDiff(t2 - timePassedSinceAdhanMs);
                        stopAudio(); break;
                    } else if (timePassedSinceAdhanMs < t3) {
                        currentMode = 'jumat_prosesi'; currentName = 'Bilal';
                        displayDiffStr = formatDiff(t3 - timePassedSinceAdhanMs);
                        stopAudio(); break;
                    } else if (timePassedSinceAdhanMs < t4) {
                        currentMode = 'jumat_jeda'; currentName = "SHOLAT JUM'AT";
                        displayDiffStr = formatDiff(t4 - timePassedSinceAdhanMs);
                        stopAudio(); break;
                    } else if (timePassedSinceAdhanMs < t5) {
                        currentMode = 'jumat_prosesi'; currentName = 'Khatib';
                        displayDiffStr = formatDiffMinutesOnly(t5 - timePassedSinceAdhanMs);
                        stopAudio(); break;
                    } else if (timePassedSinceAdhanMs < t6) {
                        currentMode = 'jumat_jeda'; currentName = "SHOLAT JUM'AT";
                        displayDiffStr = formatDiffMinutesOnly(t6 - timePassedSinceAdhanMs);
                        stopAudio(); break;
                    } else if (timePassedSinceAdhanMs < t7) {
                        currentMode = 'jumat_prosesi'; currentName = 'Imam';
                        displayDiffStr = formatDiffMinutesOnly(t7 - timePassedSinceAdhanMs);
                        stopAudio(); break;
                    } else {
                        // Jika sudah melewati semua prosesi, akan otomatis kembali ke normal (countdown sholat berikutnya)
                    }
                } else {
                    const adzanDurationSettingMs = (settings.adzanDuration || 2) * 60 * 1000;
                    const iqomahDurationSettingMs = (settings.iqomahDurations?.[p.name] || 0) * 60 * 1000;
                    const totalWaitTimeMs = adzanDurationSettingMs + iqomahDurationSettingMs;
                    const iqomatDisplayDurationMs = 30 * 1000; // 30 detik tampilan saatnya iqomat
                    const totalWithDisplayMs = totalWaitTimeMs + iqomatDisplayDurationMs;

                    if (timePassedSinceAdhanMs < adzanDurationSettingMs) {
                        // 1. Sedang dalam Masa Adzan (2 Menit awal)
                        currentMode = 'adzan';
                        currentName = p.name;
                        currentElapsedAdzanMs = timePassedSinceAdhanMs;
                        const timeLeftAdzan = adzanDurationSettingMs - timePassedSinceAdhanMs;
                        displayDiffStr = formatDiff(timeLeftAdzan);
                        stopAudio(); // Pastikan murottal mati saat adzan
                        resetOfflineMode();
                        break;
                    }
                    else if (timePassedSinceAdhanMs >= adzanDurationSettingMs && timePassedSinceAdhanMs < totalWaitTimeMs) {
                        // 2. Sedang dalam Masa Iqomah (setelah 2 menit Adzan berlalu)
                        currentMode = 'iqomah';
                        currentName = p.name;
                        const timeLeftIqomah = totalWaitTimeMs - timePassedSinceAdhanMs;
                        displayDiffStr = formatDiffMinutesOnly(timeLeftIqomah);
                        isIqomatDisplay = false;
                        stopAudio();
                        resetOfflineMode();
                        break;
                    }
                    else if (timePassedSinceAdhanMs < totalWithDisplayMs) {
                        // 3. Fase baru: tampilan SAATNYA IQOMAT selama 30 detik
                        currentMode = 'iqomah';
                        currentName = p.name;
                        displayDiffStr = "00 : 00";
                        isIqomatDisplay = true;
                        stopAudio();
                        resetOfflineMode();
                        break;
                    }
                }
            }

            // Mencari sholat berikutnya jika belum masuk waktunya (diff > 0)
            if (diff > 0 && diff < minDiff) {
                minDiff = diff;
                upcoming = { name: p.name, timeObj: pTime };
            }
        }

        // Pemicu Manual Segerakan Iqomat dari Admin (aktif selama 35 detik sejak ditekan)
        const forceIqomatAgeMs = settings.forceIqomatTimestamp ? (now.getTime() - settings.forceIqomatTimestamp) : Infinity;
        const isForceIqomatActive = forceIqomatAgeMs >= 0 && forceIqomatAgeMs < 35 * 1000;

        if (isForceIqomatActive) {
            currentMode = 'iqomah';
            if (!currentName && upcoming) currentName = upcoming.name;
            if (!currentName) currentName = "Sholat";
            displayDiffStr = "00 : 00";
            isIqomatDisplay = true;
            stopAudio();
            resetOfflineMode();
        }

        let isTarhim = false;

        // Jika tidak sedang Adzan atau Iqomah, jalankan mode hitung mundur (countdown/preadzan)
        if (currentMode === 'countdown') {
            if (!upcoming) {
                const [h, m] = times.Shubuh.split(':');
                const pTime = new Date(now);
                pTime.setDate(pTime.getDate() + 1);
                pTime.setHours(parseInt(h), parseInt(m), 0, 0);
                minDiff = pTime.getTime() - now.getTime();
                upcoming = { name: "Shubuh", timeObj: pTime };
            }

            currentName = upcoming.name;
            displayDiffStr = formatDiff(minDiff);

            // Deteksi persiapan sebelum adzan
            let preadzanDurationOffset = 10;
            if (upcoming.name === 'Shubuh') {
                preadzanDurationOffset = 17;
            }

            if (minDiff <= preadzanDurationOffset * 60 * 1000 && upcoming.name !== 'Syuruq') {
                currentMode = 'preadzan';
                const isFridayDzuhur = now.getDay() === 5 && upcoming.name === 'Dzuhur';

                if (!isFridayDzuhur) {
                    const isShubuhTarhim = upcoming.name === 'Shubuh' && minDiff <= 7 * 60 * 1000;
                    isTarhim = isShubuhTarhim;

                    // Trigger Murottal atau Tarhim
                    const isMurottalEnabled = settings.murottalActivePerPrayer ? settings.murottalActivePerPrayer[upcoming.name] !== false : settings.murottalActive !== false;

                    if (isMurottalEnabled) {
                        if (isShubuhTarhim) {
                            if (playedForPrayer !== 'ShubuhTarhim' && isStarted) {
                                setPlayedForPrayer('ShubuhTarhim');
                                setTimeout(async () => {
                                    stopAudio();
                                    let tarhimSource = tarhimUrlRef.current;
                                    if (!tarhimSource) {
                                        const cachedTarhim = await getAudioSrc(TARHIM_URL);
                                        tarhimSource = cachedTarhim || TARHIM_URL;
                                    }
                                    if (audioRef.current) {
                                        audioRef.current.src = tarhimSource;
                                        audioRef.current.onerror = async () => {
                                            console.warn('Tarhim error streaming, mencoba cache offline...');
                                            const cachedTarhim = await getAudioSrc(TARHIM_URL);
                                            if (cachedTarhim) {
                                                audioRef.current.src = cachedTarhim;
                                                audioRef.current.play().catch(e => console.error("Error play tarhim cache:", e));
                                            }
                                        };
                                        audioRef.current.play()
                                            .then(() => setIsPlaying(true))
                                            .catch(e => console.error("Gagal putar tarhim, mungkin diblokir browser:", e));
                                    } else {
                                        setIsPlaying(true); // Fallback visual
                                    }
                                }, 1500);
                            }
                        } else {
                            if (playedForPrayer !== upcoming.name && isStarted) {
                                setPlayedForPrayer(upcoming.name);
                                setTimeout(() => {
                                    playRandomMurottal();
                                }, 1500);
                            }
                        }
                    }
                }
            }

            // [Jumat Murottal sudah ditangani di blok paling atas — tidak perlu di sini lagi]
        }

        const isNear = minDiff <= 15 * 60 * 1000 && currentMode === 'countdown';

        // === BEEP TRANSISI MODE ===
        if (isStarted) {
            if (currentMode === 'preadzan' && prevModeRef.current !== 'preadzan' && beepPlayedRef.current !== currentName + '_preadzan') {
                playBeep(880, 1.0, 1.0, 0);
                beepPlayedRef.current = currentName + '_preadzan';
            } else if (currentMode === 'adzan' && prevModeRef.current !== 'adzan' && beepPlayedRef.current !== currentName + '_adzan') {
                // Adzan mulai: 1x beep saja
                playBeep(1046, 1.0, 1.0, 0);
                beepPlayedRef.current = currentName + '_adzan';
            } else if (currentMode === 'iqomah' && prevModeRef.current !== 'iqomah' && beepPlayedRef.current !== currentName + '_iqomah') {
                // Transisi adzan → iqomah: 1x beep saja
                playBeep(784, 1.0, 1.0, 0);
                beepPlayedRef.current = currentName + '_iqomah';
            } else if (currentMode === 'iqomah' && isIqomatDisplay) {
                const iqomatBeepKey = currentName + '_saatnyaiqomat_' + (isForceIqomatActive ? settings.forceIqomatTimestamp : 'auto');
                if (beepPlayedRef.current !== iqomatBeepKey) {
                    playBeep(987, 1.0, 1.0, 0);
                    setTimeout(() => playBeep(987, 1.0, 1.0, 0), 1500);
                    setTimeout(() => playBeep(987, 3.0, 1.0, 0), 3000);
                    beepPlayedRef.current = iqomatBeepKey;
                }
            } else if (currentMode === 'jumat_prosesi' && beepPlayedRef.current !== currentName + '_jumat_prosesi') {
                playBeep(600, 0.5, 0.5, 0); // Beep kecil transisi petugas Jumat
                beepPlayedRef.current = currentName + '_jumat_prosesi';
            } else if (currentMode === 'countdown' && prevModeRef.current !== 'countdown') {
                beepPlayedRef.current = null;            // Reset setelah kembali ke countdown
            }
        }
        prevModeRef.current = currentMode;

        setNextPrayer({ name: currentName, diffStr: displayDiffStr, isNear, mode: currentMode, isTarhim, isIqomatDisplay, elapsedAdzanMs: currentElapsedAdzanMs });
    };

    const formatDiff = (ms) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const formatDiffMinutesOnly = (ms) => {
        const minutes = Math.floor(ms / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);
        return `${String(minutes).padStart(2, '0')} : ${String(seconds).padStart(2, '0')}`;
    };

    const getAudioSrc = async (url) => {
        return new Promise((resolve) => {
            const request = indexedDB.open('MasjidDB', 2);
            request.onsuccess = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('murottalCache')) {
                    return resolve(null);
                }
                const tx = db.transaction('murottalCache', 'readonly');
                const store = tx.objectStore('murottalCache');
                const getReq = store.get(url);
                getReq.onsuccess = () => {
                    if (getReq.result) {
                        resolve(URL.createObjectURL(getReq.result));
                    } else {
                        resolve(null);
                    }
                };
                getReq.onerror = () => resolve(null);
            };
            request.onerror = () => resolve(null);
        });
    };

    const playFromCache = async () => {
        if (cacheProgress.done === 0 || CACHED_SURAH_LIST.length === 0) return false;
        
        const tryCache = async (attemptsLeft) => {
            if (attemptsLeft <= 0) return false;
            const randomUrl = CACHED_SURAH_LIST[Math.floor(Math.random() * CACHED_SURAH_LIST.length)];
            const cachedBlobUrl = await getAudioSrc(randomUrl);
            
            if (cachedBlobUrl) {
                setIsOfflineMode(true);
                audioRef.current.src = cachedBlobUrl;
                
                return new Promise((resolve) => {
                    audioRef.current.onerror = () => {
                        resolve(tryCache(attemptsLeft - 1));
                    };
                    audioRef.current.play()
                        .then(() => {
                            setIsPlaying(true);
                            retryCountRef.current = 0;
                            resolve(true);
                        })
                        .catch((e) => {
                            console.error("Autoplay cache diblokir atau gagal:", e);
                            resolve(false);
                        });
                });
            } else {
                return tryCache(attemptsLeft - 1);
            }
        };

        return await tryCache(5);
    };

    const playRandomMurottal = async () => {
        const list = settings.murottalLinks?.length > 0 ? settings.murottalLinks : MUROTTAL_LIST;
        if (!audioRef.current || list.length === 0) return;
        
        // ⭐ Jika mode offline manual aktif, langsung ke cache
        if (offlineManualMode) {
            setIsOfflineMode(true);
            const success = await playFromCache();
            if (!success) {
                setIsPlaying(false);
                setPlayedForPrayer(null);
            }
            return;
        }

        setIsOfflineMode(false);

        if (!navigator.onLine) {
            const success = await playFromCache();
            if (!success) {
                setIsPlaying(false);
                setPlayedForPrayer(null);
            }
            return;
        }

        const randomUrl = list[Math.floor(Math.random() * list.length)];
        audioRef.current.src = randomUrl;

        audioRef.current.onerror = async () => {
            console.warn('Audio error streaming, mencoba cache offline...');
            const success = await playFromCache();
            if (!success) {
                if (retryCountRef.current < MAX_RETRY) {
                    retryCountRef.current += 1;
                    setTimeout(() => playRandomMurottal(), retryCountRef.current * 2000);
                } else {
                    retryCountRef.current = 0;
                    setIsPlaying(false);
                    setPlayedForPrayer(null);
                }
            }
        };

        audioRef.current.play()
            .then(() => {
                setIsPlaying(true);
                retryCountRef.current = 0;
                setIsOfflineMode(false);
            })
            .catch(e => console.log("Audio autoplay diblokir:", e));
    };

    const isJumatMurottalTime = () => {
        if (settings.jumatMurottalActive === false) return false;
        const now = new Date();
        if (now.getDay() !== 5) return false;
        const [startH, startM] = (settings.jumatMurottalStart || "11:00").split(':').map(Number);
        const [endH, endM] = (settings.jumatMurottalEnd || "11:45").split(':').map(Number);
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        return currentMinutes >= startH * 60 + startM && currentMinutes < endH * 60 + endM;
    };

    const handleAudioEnded = () => {
        // Putar lagi jika masih dalam mode persiapan adzan
        const isMurottalEnabled = settings.murottalActivePerPrayer ? settings.murottalActivePerPrayer[nextPrayer.name] !== false : settings.murottalActive !== false;
        if (nextPrayer.mode === 'preadzan' && !nextPrayer.isTarhim && isMurottalEnabled) {
            if (offlineManualMode) {
                playFromCache();
            } else {
                playRandomMurottal();
            }
        } else if (playedForPrayer === 'JumatMurottal') {
            // Cek ref — jika false berarti waktu sudah habis, jangan restart
            if (jumatMurottalActiveRef.current && isJumatMurottalTime()) {
                if (offlineManualMode) {
                    playFromCache();
                } else {
                    playRandomMurottal();
                }
            } else {
                // Waktu Jumat Murottal sudah habis, bersihkan state
                jumatMurottalActiveRef.current = false;
                setIsPlaying(false);
                setPlayedForPrayer(null);
            }
        } else if (nextPrayer.mode === 'preadzan' && nextPrayer.isTarhim) {
            setIsPlaying(false); // Selesai tarhim, diam sampai adzan
        } else {
            setIsPlaying(false);
            setPlayedForPrayer(null);
        }
    };

    const testAudio = () => playRandomMurottal();

    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
        }
        retryCountRef.current = 0;
    };

    const masehiDateStr = time.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const rawTime = time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const displayTime = rawTime.replace(/\./g, ' : ').replace(/:/g, ' : ');
    const activeImage = (settings.images && settings.images.length > 0) ? (settings.images[currentImgIndex] || settings.images[0]) : DEFAULT_SETTINGS.images[0];

    const combinedMarqueeText = [
        settings.marqueeText,
        settings.khatibText ? `♦ JADWAL JUMAT: ${settings.khatibText}` : null,
        settings.acaraText ? `♦ INFO ACARA: ${settings.acaraText}` : null,
        settings.keuanganText ? `♦ LAPORAN KEUANGAN: ${settings.keuanganText}` : null
    ].filter(Boolean).join("                     ");

    // Routing: tampilkan AdminPanel jika hash #admin
    if (currentPage === 'admin') {
        return (
            <React.Suspense fallback={
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0f172a', color:'#fff', fontSize:'1.5rem', fontWeight:'bold' }}>
                    Memuat Admin Panel...
                </div>
            }>
                <AdminPanel />
            </React.Suspense>
        );
    }

    if (!isStarted) {
        return (
            <div className="w-full h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
                <h1 className="text-4xl font-bold mb-4">Sistem Jam Masjid Digital</h1>
                <p className="text-gray-300 mb-8 max-w-lg text-center">
                    Sistem memerlukan izin interaksi awal untuk dapat memutar audio Murottal secara otomatis.
                </p>
                <button onClick={() => setIsStarted(true)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-full shadow-lg transform transition hover:scale-105">
                    Mulai Layar Jam
                </button>
            </div>
        );
    }

    // === Check if Sleep Mode is Active ===
    const checkIfSleeping = () => {
        const schedules = settings.sleepSchedules || [];
        if (schedules.length === 0) return false;
        
        const now = new Date(); // Fix: always use fresh time, avoids Google TV timer freeze
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTotalMinutes = currentHours * 60 + currentMinutes;
        
        for (const s of schedules) {
            if (!s.enabled || !s.start || !s.end) continue;
            
            const [startH, startM] = s.start.split(':').map(Number);
            const [endH, endM] = s.end.split(':').map(Number);
            
            const startTotal = startH * 60 + startM;
            const endTotal = endH * 60 + endM;
            
            if (startTotal <= endTotal) {
                // Same day range (e.g. 13:00 - 15:00)
                // Use strict inequality (< endTotal) so it wakes up exactly when the wake hour/minute is reached
                if (currentTotalMinutes >= startTotal && currentTotalMinutes < endTotal) {
                    return true;
                }
            } else {
                // Overnight range (e.g. 22:00 - 03:00)
                // Use strict inequality (< endTotal) so it wakes up exactly when the wake hour/minute is reached
                if (currentTotalMinutes >= startTotal || currentTotalMinutes < endTotal) {
                    return true;
                }
            }
        }
        return false;
    };
    
    const isSleeping = checkIfSleeping() || settings.testLayoutMode === 'sleep';
    
    if (isSleeping) {
        const hoursStr = String(time.getHours()).padStart(2, '0');
        const minutesStr = String(time.getMinutes()).padStart(2, '0');
        const secondsStr = String(time.getSeconds()).padStart(2, '0');
        
        // Anti-burn-in position shift based on current minutes (slowly moves around the screen)
        const shiftX = (time.getMinutes() % 5) * 4 - 8; // -8px to 8px
        const shiftY = Math.floor(time.getMinutes() / 12) * 6 - 12; // -12px to 12px
        
        return (
            <div className="w-full h-screen bg-black overflow-hidden flex flex-col items-center justify-center relative select-none">
                {/* Secret settings button */}
                <button 
                    onClick={openSettings} 
                    className="absolute top-8 right-8 p-3 bg-zinc-900/10 hover:bg-zinc-800/30 rounded-xl transition border border-zinc-850/10 text-zinc-900 cursor-pointer z-[100]"
                >
                    <MoreVertical size={24} />
                </button>
                {settings.testLayoutMode === 'sleep' && (
                    <div className="absolute top-6 left-6 bg-red-600 text-white px-4 py-1.5 rounded-full font-black text-sm animate-pulse border border-white/20 font-sans z-50">
                        🧪 MODE UJI COBA TAMPILAN
                    </div>
                )}
                <div 
                    className="text-center font-mono transition-all duration-1000 ease-in-out"
                    style={{ transform: `translate(${shiftX}px, ${shiftY}px)` }}
                >
                    {/* Brighter, glowing slow-pulsing clock keeps browser active and visible without consuming power */}
                    <div className="text-7xl xl:text-9xl font-black text-zinc-700 tracking-wider animate-pulse drop-shadow-[0_0_15px_rgba(63,63,70,0.4)]">
                        {hoursStr}:{minutesStr}
                        <span className="text-4xl xl:text-6xl text-zinc-800 ml-2">{secondsStr}</span>
                    </div>
                    <div className="text-xl xl:text-2xl text-zinc-800 font-bold uppercase tracking-widest mt-6 animate-pulse">
                        {masehiDateStr} | {hijriDate}
                    </div>
                    <div className="text-[11px] text-zinc-800 mt-4 tracking-widest font-sans opacity-40">
                        ⚡ MODE TIDUR TV AKTIF — MENGHEMAT ENERGI & MENJAGA LAYAR
                    </div>
                </div>
            </div>
        );
    }

    let effectivePrayer = nextPrayer;
    if (testProsesiJumat) {
        effectivePrayer = { mode: testProsesiJumat === 'Iqomah' ? 'iqomah' : 'jumat_prosesi', name: testProsesiJumat === 'Iqomah' ? "SHOLAT JUM'AT" : testProsesiJumat, diffStr: "00:00:10" };
        if (testProsesiJumat === 'Iqomah') effectivePrayer.isIqomatDisplay = false;
    }

    // Render Tampilan Utama
    const renderMainContent = () => {

        // 1. Layar Adzan (Tampilan 1 per 1 Jawaban Adzan Besar & Tebal Berbobot Proporsional)
        if (nextPrayer.mode === 'adzan' || settings.testLayoutMode === 'adzan') {
            const adzanItems = [
                { 
                    call: "ALLAHU AKBAR, ALLAHU AKBAR", 
                    reply: "ALLAHU AKBAR, ALLAHU AKBAR", 
                    repeatText: "Diucapkan 2x di awal", 
                    weight: 16 
                },
                { 
                    call: "ASH-HADU ALLA ILAHA ILLALLAH", 
                    reply: "ASH-HADU ALLA ILAHA ILLALLAH", 
                    repeatText: "Diucapkan 2x", 
                    weight: 15 
                },
                { 
                    call: "ASH-HADU ANNA MUHAMMADAR RASULULLAH", 
                    reply: "ASH-HADU ANNA MUHAMMADAR RASULULLAH", 
                    repeatText: "Diucapkan 2x", 
                    weight: 18 
                },
                { 
                    call: "HAYYA 'ALAS-SHALAH", 
                    reply: "LA HAULA WALA QUWWATA ILLA BILLAH", 
                    repeatText: "Diucapkan 2x", 
                    weight: 18 
                },
                { 
                    call: "HAYYA 'ALAL-FALAH", 
                    reply: "LA HAULA WALA QUWWATA ILLA BILLAH", 
                    repeatText: "Diucapkan 2x", 
                    weight: 18 
                },
                ...(nextPrayer.name === 'Shubuh' ? [{ 
                    call: "AS-SHALATU KHAIRUM MINAN-NAUM", 
                    reply: "SHADAQTA WA BARARTA", 
                    repeatText: "Khusus Subuh (Diucapkan 2x)", 
                    isGreen: true, 
                    weight: 15 
                }] : []),
                { 
                    call: "ALLAHU AKBAR, ALLAHU AKBAR", 
                    reply: "ALLAHU AKBAR, ALLAHU AKBAR", 
                    repeatText: "Diucapkan 1x saja", 
                    weight: 8 
                },
                { 
                    call: "LA ILAHA ILLALLAH", 
                    reply: "LA ILAHA ILLALLAH", 
                    repeatText: "Diucapkan 1x saja (Penutup)", 
                    weight: 7 
                }
            ];

            const totalDurationMs = (settings.adzanDuration || 2) * 60 * 1000;
            const totalWeight = adzanItems.reduce((sum, item) => sum + (item.weight || 1), 0);

            let activeIndex = 0;
            if (settings.testLayoutMode === 'adzan') {
                // Mode uji coba: ganti slide otomatis setiap 4 detik untuk preview
                activeIndex = Math.floor((time.getTime() / 4000) % adzanItems.length);
            } else {
                const elapsed = nextPrayer.elapsedAdzanMs || 0;
                let cumulativeTime = 0;
                for (let i = 0; i < adzanItems.length; i++) {
                    const itemDuration = (adzanItems[i].weight / totalWeight) * totalDurationMs;
                    cumulativeTime += itemDuration;
                    if (elapsed < cumulativeTime || i === adzanItems.length - 1) {
                        activeIndex = i;
                        break;
                    }
                }
            }

            const currentItem = adzanItems[activeIndex] || adzanItems[0];

            return (
                <div className="flex-1 w-full rounded-2xl overflow-hidden relative shadow-[0_15px_40px_rgba(37,99,235,0.5)] border-4 border-blue-500/50 flex flex-col justify-between p-6 xl:p-8">
                    <img src={activeImage} alt="Masjid Background" className="absolute inset-0 w-full h-full object-cover opacity-60 filter blur-sm" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1565552643981-0814d48d0874?w=1600"; }} />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-black/90"></div>

                    {/* Header Atas: Waktu Adzan & Step Badge */}
                    <div className="relative z-10 flex items-center justify-between w-full border-b border-white/20 pb-4">
                        <div className="flex items-center gap-4">
                            <span className="text-4xl xl:text-5xl animate-bounce">🕌</span>
                            <div className="flex flex-col text-left">
                                <h2 className="text-3xl xl:text-5xl font-black text-white tracking-widest uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
                                    WAKTU ADZAN {nextPrayer.name ? nextPrayer.name.toUpperCase() : "SHOLAT"}
                                </h2>
                                <span className="text-lg xl:text-2xl text-blue-300 font-extrabold tracking-wider">
                                    MOHON DENGARKAN DAN JAWAB ADZAN
                                </span>
                            </div>
                        </div>

                        {/* Step Indicator & Timer */}
                        <div className="flex flex-col items-end gap-1.5">
                            <div className="bg-blue-600/90 border-2 border-blue-300 backdrop-blur-md px-6 py-2 rounded-xl shadow-xl">
                                <span className="text-xl xl:text-3xl font-black text-white tracking-wider">
                                    Lafadz {activeIndex + 1} dari {adzanItems.length}
                                </span>
                            </div>
                            <span className="text-base xl:text-xl text-slate-200 font-bold">
                                Menuju Iqomah dalam: <strong className="text-yellow-300 font-black text-xl xl:text-2xl">{nextPrayer.diffStr || "00:00"}</strong>
                            </span>
                        </div>
                    </div>

                    {/* Konten Utama: 1 Lafadz Muadzin & 1 Jawaban Kita (HURUF SANGAT BESAR & TEBAL) */}
                    <div key={activeIndex} className="relative z-10 flex-1 flex flex-col justify-center items-center gap-6 py-6 px-4 animate-fadeIn">
                        
                        {/* Panggilan Adzan (Muadzin) */}
                        <div className="w-full max-w-7xl bg-blue-950/80 backdrop-blur-md border-2 border-cyan-400/50 rounded-3xl p-6 xl:p-8 flex flex-col items-center shadow-[0_10px_35px_rgba(6,182,212,0.25)]">
                            <span className="text-base xl:text-xl uppercase tracking-widest font-black text-cyan-300 mb-2 bg-cyan-950/80 px-6 py-1.5 rounded-full border border-cyan-400/40 shadow flex items-center gap-2">
                                <span>📢 LAFADZ ADZAN MUADZIN:</span>
                                <span className="text-yellow-300 font-extrabold underline">({currentItem.repeatText.toUpperCase()})</span>
                            </span>
                            <h3 className="text-4xl xl:text-6xl font-black text-white text-center tracking-wide leading-tight drop-shadow-[0_4px_15px_rgba(0,0,0,0.9)]">
                                "{currentItem.call}"
                            </h3>
                        </div>

                        {/* Petunjuk Panah */}
                        <div className="text-yellow-400 text-3xl xl:text-4xl font-black animate-bounce tracking-widest flex items-center gap-3 drop-shadow">
                            <span>▼</span> <span>JAWABAN KITA</span> <span>▼</span>
                        </div>

                        {/* Jawaban Adzan (Jamaah) — EXTRA BESAR & TEBAL */}
                        <div className={`w-full max-w-7xl backdrop-blur-md border-4 rounded-3xl p-8 xl:p-10 flex flex-col items-center shadow-2xl transition-all duration-500 ${currentItem.isGreen ? 'bg-emerald-950/90 border-emerald-400 shadow-[0_15px_50px_rgba(16,185,129,0.5)]' : 'bg-amber-950/90 border-yellow-400 shadow-[0_15px_50px_rgba(250,204,21,0.5)]'}`}>
                            <span className={`text-lg xl:text-2xl uppercase tracking-widest font-black mb-3 px-6 py-2 rounded-full border shadow ${currentItem.isGreen ? 'text-emerald-200 bg-emerald-900/90 border-emerald-400/60' : 'text-yellow-100 bg-amber-900/90 border-yellow-400/60'}`}>
                                ✅ UCAPKAN DENGAN BERSUARA / DALAM HATI:
                            </span>
                            <h1 className={`text-5xl xl:text-7xl font-black text-center tracking-wide leading-tight drop-shadow-[0_0_30px_rgba(250,204,21,0.9)] ${currentItem.isGreen ? 'text-emerald-300' : 'text-yellow-300'}`}>
                                "{currentItem.reply}"
                            </h1>
                        </div>

                    </div>

                    {/* Progress Dots Navigasi Slide */}
                    <div className="relative z-10 flex justify-center items-center gap-3 pt-2">
                        {adzanItems.map((item, idx) => (
                            <div
                                key={idx}
                                className={`h-4 rounded-full transition-all duration-500 ${idx === activeIndex ? 'w-12 bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.9)]' : 'w-4 bg-white/30'}`}
                            />
                        ))}
                    </div>
                </div>
            );
        }

        // 2. Layar Iqomah
        if (nextPrayer.mode === 'iqomah') {
            // Tampilan SAATNYA IQOMAT (30 detik terakhir)
            if (nextPrayer.isIqomatDisplay) {
                return (
                    <div className="flex-1 w-full rounded-2xl overflow-hidden relative shadow-[0_15px_40px_rgba(0,0,0,0.5)] border-4 border-yellow-400/50 flex flex-col items-center justify-center pointer-events-none">
                        <img src={activeImage} alt="Masjid Background" className="absolute inset-0 w-full h-full object-cover opacity-60 filter blur-sm" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1565552643981-0814d48d0874?w=1600"; }} />
                        <div className="absolute inset-0 bg-black/60"></div>
                        <div className="relative z-10 flex flex-col items-center text-center px-10">
                            <h2 className="text-7xl xl:text-9xl font-black text-yellow-400 mb-6 tracking-widest drop-shadow-[0_0_30px_rgba(250,204,21,0.9)] animate-pulse">
                                SAATNYA IQOMAT
                            </h2>
                            <div className="bg-yellow-400/20 backdrop-blur-md px-12 py-6 rounded-2xl border-2 border-yellow-400 shadow-2xl">
                                <h3 className="text-4xl xl:text-5xl text-white font-black tracking-wider drop-shadow-lg">
                                    LURUSKAN DAN RAPATKAN SHAF
                                </h3>
                            </div>
                        </div>
                    </div>
                );
            }
            return (
                <div className="flex-1 w-full rounded-2xl overflow-hidden relative shadow-[0_15px_40px_rgba(239,68,68,0.5)] border-4 border-red-500/50 flex flex-col items-center justify-center">
                    <img src={activeImage} alt="Masjid Background" className="absolute inset-0 w-full h-full object-cover opacity-60 filter blur-sm" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1565552643981-0814d48d0874?w=1600"; }} />
                    <div className="absolute inset-0 bg-black/60"></div>
                    <div className="relative z-10 flex flex-col items-center text-center px-10">
                        <h2 className="text-6xl xl:text-7xl font-black text-white mb-4 tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse">
                            WAKTU IQOMAH {nextPrayer.name.toUpperCase()}
                        </h2>
                        <div className="text-[10rem] xl:text-[13rem] font-black text-yellow-400 tabular-nums tracking-tighter drop-shadow-2xl leading-none mb-8">
                            {nextPrayer.diffStr}
                        </div>
                        <div className="flex flex-col gap-4 w-full max-w-[90vw] xl:max-w-7xl mt-4">
                            {nextPrayer.name === 'Shubuh' && (
                                <div className="bg-blue-800/90 backdrop-blur-md px-8 py-6 rounded-2xl border-4 border-blue-400 shadow-xl w-full text-center">
                                    <h3 className="text-3xl xl:text-4xl text-yellow-300 font-black tracking-wide uppercase leading-snug drop-shadow-md">
                                        HADIST TENTANG QOBLIYAH SUBUH RASULULLAH ﷺ BERSABDA: "DUA RAKAAT FAJAR (SEBELUM SUBUH) LEBIH BAIK DARIPADA DUNIA DAN SEISINYA." (HR. MUSLIM, TIRMIDZI)
                                    </h3>
                                </div>
                            )}
                            {nextPrayer.name === 'Dzuhur' && (
                                <div className="bg-blue-800/90 backdrop-blur-md px-8 py-6 rounded-2xl border-4 border-blue-400 shadow-xl w-full text-center">
                                    <h3 className="text-3xl xl:text-4xl text-yellow-300 font-black tracking-wide uppercase leading-snug drop-shadow-md">
                                        HADIST TENTANG ZHUHUR RASULULLAH ﷺ BERSABDA: "BARANGSIAPA MENJAGA EMPAT RAKAAT SEBELUM ZHUHUR DAN EMPAT RAKAAT SESUDAHNYA, ALLAH MENGHARAMKANNYA DARI API NERAKA." (HR. AHMAD, ABU DAWUD, TIRMIDZI)
                                    </h3>
                                </div>
                            )}
                            {nextPrayer.name === 'Ashar' && (
                                <div className="bg-blue-800/90 backdrop-blur-md px-8 py-6 rounded-2xl border-4 border-blue-400 shadow-xl w-full text-center">
                                    <h3 className="text-3xl xl:text-4xl text-yellow-300 font-black tracking-wide uppercase leading-snug drop-shadow-md">
                                        HADIST TENTANG ASHAR RASULULLAH ﷺ BERSABDA: "SEMOGA ALLAH MERAHMATI ORANG YANG SHOLAT EMPAT RAKAAT SEBELUM ASHAR." (HR. AHMAD, ABU DAWUD, TIRMIDZI)
                                    </h3>
                                </div>
                            )}

                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full bg-red-800/95 border-t-4 border-red-500 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-20 py-5 flex flex-col justify-center overflow-hidden">
                        <marquee className="text-[4rem] xl:text-[5rem] font-black tracking-widest drop-shadow-lg text-white uppercase leading-tight" scrollamount="15">
                            HADIST UMMU HABIBAH RA RASULULLAH ﷺ BERSABDA: "BARANGSIAPA SHOLAT SUNNAH DALAM SEHARI SEMALAM DUA BELAS RAKAAT, MAKA ALLAH AKAN MEMBANGUNKAN BAGINYA RUMAH DI SURGA." (HR. MUSLIM, TIRMIDZI, AHMAD) - 2 RAKAAT SEBELUM SUBUH, 4 RAKAAT SEBELUM ZHUHUR, 2 RAKAAT SETELAH ZHUHUR, 2 RAKAAT SETELAH MAGHRIB, 2 RAKAAT SETELAH ISYA.
                        </marquee>
                    </div>
                </div>
            );
        }

        // 3.5 Layar Jumat Prosesi (Bilal/Muadzin/Khatib)
        if (effectivePrayer.mode === 'jumat_prosesi') {
            const role = effectivePrayer.name; // Bilal, Muadzin, Khatib, Imam
            const petugasList = getJumatPetugas();
            const person = petugasList.find(p => p.role.includes(role.toUpperCase())) || { name: "-" };
            
            return (
                <div className="flex-1 w-full rounded-2xl overflow-hidden relative shadow-[0_15px_40px_rgba(0,0,0,0.5)] border-4 border-emerald-400/50 flex flex-col items-center justify-center">
                    <img src={activeImage} alt="Masjid Background" className="absolute inset-0 w-full h-full object-cover opacity-60 filter blur-sm" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1565552643981-0814d48d0874?w=1600"; }} />
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 to-slate-900/90"></div>
                    <div className="relative z-10 flex flex-col items-center text-center px-10 w-full mb-20">
                        <div className="flex flex-col items-center justify-center gap-6">
                            <span className="text-[7rem] xl:text-[9rem] font-black text-emerald-400 drop-shadow-[0_10px_30px_rgba(16,185,129,0.4)] uppercase leading-none">
                                {role}
                            </span>
                            <span className="text-[7rem] xl:text-[9rem] font-black text-white uppercase drop-shadow-[0_10px_30px_rgba(255,255,255,0.4)] leading-none text-center mt-2">
                                {person.name}
                            </span>
                        </div>
                    </div>
                    
                    {(role === 'Bilal' || role === 'Khatib') && (
                        <div className="absolute bottom-0 left-0 w-full bg-red-800/95 border-t-4 border-red-500 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-20 py-5 flex flex-col justify-center overflow-hidden">
                            <marquee className="text-[4rem] xl:text-[5rem] font-black tracking-widest drop-shadow-lg text-white uppercase leading-tight" scrollamount="15">
                                "JIKA ENGKAU BERKATA KEPADA TEMANMU PADA HARI JUMAT, 'DIAMLAH!', SEMENTARA IMAM SEDANG BERKHUTBAH, MAKA SUNGGUH ENGKAU TELAH BERBUAT SIA-SIA." <span className="text-yellow-300 ml-4">(HR. BUKHARI & MUSLIM)</span>
                            </marquee>
                        </div>
                    )}
                </div>
            );
        }

        // 3. Layar Persiapan (10-17 Menit)
        if (nextPrayer.mode === 'preadzan') {
            const isFridayPreadzan = new Date().getDay() === 5 &&
                                     (nextPrayer.name === 'Dzuhur' || nextPrayer.name === "JUM'AT");
            const displayName = isFridayPreadzan ? "JUM'AT" : nextPrayer.name.toUpperCase();

            return (
                <div className="flex-1 w-full rounded-2xl overflow-hidden relative shadow-[0_15px_40px_rgba(0,0,0,0.5)] border-4 border-yellow-400/50 flex flex-col items-center justify-center pointer-events-auto">
                    <img src={activeImage} alt="Masjid Background" className="absolute inset-0 w-full h-full object-cover opacity-60 filter blur-sm" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1565552643981-0814d48d0874?w=1600"; }} />
                    <div className="absolute inset-0 bg-black/60"></div>
                    <div className="relative z-10 flex flex-col items-center text-center px-10">
                        <h2 className="text-6xl xl:text-7xl font-black text-white mb-4 tracking-widest drop-shadow-lg">
                            {nextPrayer.isTarhim ? "TARHIM SHUBUH" : "PERSIAPAN SHOLAT"}
                        </h2>
                        <h1 className="text-9xl xl:text-[10rem] font-black text-yellow-400 mb-4 drop-shadow-[0_0_30px_rgba(250,204,21,0.8)]">
                            {displayName}
                        </h1>
                        {isFridayPreadzan && (
                            <h3 className="text-5xl xl:text-6xl font-black text-white mb-6 tracking-widest drop-shadow-lg uppercase">
                                INFO PENGUMUMAN
                            </h3>
                        )}
                        <div className="text-[10rem] xl:text-[13rem] font-black text-white tabular-nums tracking-tighter drop-shadow-2xl leading-none mb-8">
                            {nextPrayer.diffStr}
                        </div>
                        {/* Kondisi: Murottal tidak sedang play */}
                        {!isPlaying && nextPrayer.mode === 'preadzan' && !nextPrayer.isTarhim && (
                            <div className="flex flex-col items-center gap-3 mt-6">
                                <button
                                    onClick={async () => {
                                        setOfflineManualMode(true);
                                        setIsOfflineMode(true);
                                        setPlayedForPrayer(nextPrayer.name + '_offline');
                                        await playFromCache();
                                    }}
                                    className="flex items-center gap-4 bg-orange-500 hover:bg-orange-400 active:scale-95 text-white px-10 py-5 rounded-full font-black text-3xl tracking-widest shadow-2xl border-4 border-orange-300 transition-all duration-200 animate-pulse pointer-events-auto"
                                >
                                    <span className="text-4xl">📵</span>
                                    PUTAR OFFLINE
                                </button>
                                <span className="text-white/70 text-xl font-semibold">
                                    Tap jika Murottal tidak terdengar (Sinyal Lemah)
                                </span>
                            </div>
                        )}

                        {/* Kondisi: Sedang play NORMAL (dari internet) */}
                        {isPlaying && !isOfflineMode && nextPrayer.mode === 'preadzan' && (
                            <div className="flex flex-col items-center gap-3 mt-4">
                                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-lg px-10 py-5 rounded-full border border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                    <Volume2 size={40} className="text-green-400 animate-pulse" />
                                    <span className="text-2xl text-white font-semibold tracking-wide">
                                        {nextPrayer.isTarhim ? "Tarhim Sedang Berkumandang" : "Murottal Sedang Berkumandang"}
                                    </span>
                                </div>
                                <button
                                    onClick={async () => {
                                        stopAudio();
                                        setOfflineManualMode(true);
                                        setIsOfflineMode(true);
                                        await playFromCache();
                                    }}
                                    className="flex items-center gap-2 bg-white/10 hover:bg-orange-500/70 text-white/60 hover:text-white px-6 py-2 rounded-full font-bold text-lg tracking-wider border border-white/20 hover:border-orange-400 transition-all duration-200 pointer-events-auto"
                                >
                                    <span>📵</span> Ganti ke Mode Offline
                                </button>
                            </div>
                        )}

                        {/* Kondisi: Sedang play dari CACHE (mode offline) */}
                        {isPlaying && isOfflineMode && nextPrayer.mode === 'preadzan' && (
                            <div className="flex flex-col items-center gap-3 mt-4">
                                <div className="flex items-center gap-4 bg-orange-500/80 backdrop-blur-lg px-10 py-5 rounded-full border-2 border-orange-300 shadow-[0_0_20px_rgba(249,115,22,0.5)] animate-pulse">
                                    <span className="text-4xl">📵</span>
                                    <span className="text-2xl text-white font-black tracking-wide">
                                        MODE OFFLINE — Murottal Cache
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 bg-red-600/80 px-6 py-2 rounded-full border border-red-400">
                                    <span className="text-white font-black text-lg">
                                        🔄 Akan kembali ke Online otomatis setelah Adzan
                                    </span>
                                </div>
                                <button
                                    onClick={async () => {
                                        stopAudio();
                                        setOfflineManualMode(false);
                                        setIsOfflineMode(false);
                                        setTimeout(() => playRandomMurottal(), 500);
                                    }}
                                    className="flex items-center gap-2 bg-white/10 hover:bg-green-500/70 text-white/60 hover:text-white px-6 py-2 rounded-full font-bold text-lg tracking-wider border border-white/20 hover:border-green-400 transition-all duration-200 pointer-events-auto"
                                >
                                    <Volume2 size={20} /> Coba Kembali ke Internet
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            );
        }



        // 4. Layar Sholat Jumat (Dihapus karena sekarang terintegrasi dengan Layout Normal)

        // Helper: Petugas aktif paling dekat
        const getPetugasAktif = () => {
            const now = new Date();
            const list = settings.petugasJadwal || [];
            return list.filter(p => new Date(p.tanggal) >= now)
                .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal))[0]
                || list[list.length - 1];
        };

        // Helper: Hari besar terdekat dengan countdown
        const getHariBesarTerdekat = () => {
            const now = new Date();
            return [...(settings.hariBesar || [])]
                .map(h => {
                    const target = new Date(h.tanggal);
                    let diff = target - now;
                    if (diff < 0) diff = 0;
                    const hari = Math.floor(diff / (1000 * 60 * 60 * 24));
                    const jam = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const menit = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    return { ...h, hari, jam, menit, diff };
                })
                .sort((a, b) => a.diff - b.diff);
        };

        let overlayContent = null;
        const isFridayActive = activeJumat || !!testProsesiJumat;

        // 5A. Tampilan Petugas Jumat
        if (nextPrayer.mode === 'countdown' && !nextPrayer.isNear && !isFridayActive && modeTampilan === 'petugas') {
            const petugasLines = (settings.khatibText || '').split('|').map(s => s.trim()).filter(Boolean);
            let tanggalStr = "-";
            const filteredLines = [];
            petugasLines.forEach(line => {
                if (line.toLowerCase().startsWith('tanggal:')) {
                    tanggalStr = line.substring(8).trim();
                } else {
                    filteredLines.push(line);
                }
            });

            if (filteredLines.length > 0 && !filteredLines.some(l => l.toLowerCase().startsWith('imam:'))) {
                filteredLines.splice(1, 0, "Imam: -");
            }

            const displayTanggal = tanggalStr !== "-" ? tanggalStr : new Date(getNextFriday() + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();

            overlayContent = (
                <div className="absolute inset-0 z-50 w-full h-full bg-black overflow-hidden flex flex-col items-center justify-center">
                    <img src={activeImage} alt="Masjid Background" className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1565552643981-0814d48d0874?w=1600"; }} />
                    <div className="absolute inset-0 bg-emerald-900/30"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="relative z-10 flex flex-col items-center text-center px-10 w-full">
                        <h2 className="text-5xl xl:text-6xl font-black text-white mb-4 tracking-widest drop-shadow-lg uppercase">
                            PETUGAS SHOLAT JUMAT
                        </h2>
                        <p className="text-3xl text-emerald-300 font-black uppercase mb-10 tracking-widest">{displayTanggal}</p>
                        
                        <div className="grid grid-cols-2 gap-10 w-full max-w-7xl px-8">
                            {filteredLines.map((line, i) => {
                                const parts = line.split(':');
                                const jabatan = parts[0].trim();
                                const nama = parts.slice(1).join(':').trim() || '-';
                                return (
                                    <div key={i} className="bg-gradient-to-br from-emerald-900/80 to-black/80 backdrop-blur-md rounded-[2.5rem] py-14 px-10 border border-emerald-500/40 shadow-[0_15px_40px_rgba(16,185,129,0.3)] flex flex-col items-center gap-6">
                                        <span className="text-4xl xl:text-5xl font-black text-emerald-400 tracking-widest uppercase drop-shadow-md">{jabatan}</span>
                                        <span className="text-5xl xl:text-6xl font-black text-white text-center leading-tight uppercase drop-shadow-lg">{nama}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            );
        }

        // 5B. Tampilan Keuangan
        if (nextPrayer.mode === 'countdown' && !nextPrayer.isNear && !isFridayActive && modeTampilan === 'keuangan') {
            const isVisualMode = settings.keuanganMode === 'visual';
            
            if (isVisualMode) {
                const inc = settings.keuanganIncome || 0;
                const exp = settings.keuanganExpense || 0;
                const balance = inc - exp;
                const formatRp = (num) => "Rp " + new Intl.NumberFormat('id-ID').format(num);
                const pct = inc > 0 ? Math.min(Math.round((exp / inc) * 100), 100) : 0;
                
                // SVG Progress Circle math (Larger, bolder circle!)
                const radius = 110;
                const strokeWidth = 22;
                const circumference = 2 * Math.PI * radius;
                const strokeDashoffset = circumference - (pct / 100) * circumference;
                
                overlayContent = (
                    <div className="absolute inset-0 z-50 w-full h-full bg-black overflow-hidden flex flex-col items-center justify-center">
                        <img src={activeImage} alt="Masjid Background" className="absolute inset-0 w-full h-full object-cover opacity-30 blur-lg" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1565552643981-0814d48d0874?w=1600"; }} />
                        <div className="absolute inset-0 bg-emerald-950/20"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
                        
                        <div className="relative z-10 flex flex-col items-center text-center px-10 w-full">
                            <h2 className="text-5xl xl:text-6.5xl font-black text-yellow-400 mb-2 tracking-widest drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] uppercase">
                                {settings.keuanganTitle || 'LAPORAN KAS MINGGUAN MASJID'}
                            </h2>
                            <p className="text-2xl xl:text-3xl text-emerald-300 font-extrabold uppercase mb-10 tracking-widest">{masehiDateStr}</p>
                            
                            <div className="flex flex-col xl:flex-row items-center justify-center gap-14 w-full max-w-7xl px-4">
                                {/* Left Side: Giant Cards */}
                                <div className="flex-1 flex flex-col gap-6 w-full">
                                    {/* Pemasukan Card */}
                                    <div className="flex items-center justify-between px-10 py-7 rounded-[2rem] border-4 backdrop-blur-md bg-black/75 border-green-500 shadow-2xl shadow-green-950/20">
                                        <span className="text-3xl xl:text-4xl font-black text-white flex items-center gap-3">🟢 Pemasukan</span>
                                        <span className="text-5xl xl:text-6.5xl font-black text-green-400 drop-shadow-[0_0_12px_rgba(74,222,128,0.4)]">
                                            {formatRp(inc)}
                                        </span>
                                    </div>
                                    
                                    {/* Pengeluaran Card */}
                                    <div className="flex items-center justify-between px-10 py-7 rounded-[2rem] border-4 backdrop-blur-md bg-black/75 border-red-500 shadow-2xl shadow-red-950/20">
                                        <span className="text-3xl xl:text-4xl font-black text-white flex items-center gap-3">🔴 Pengeluaran</span>
                                        <span className="text-5xl xl:text-6.5xl font-black text-red-400 drop-shadow-[0_0_12px_rgba(248,113,113,0.4)]">
                                            {formatRp(exp)}
                                        </span>
                                    </div>
                                    
                                    {/* Saldo Kas Card */}
                                    <div className="flex items-center justify-between px-10 py-7 rounded-[2rem] border-4 backdrop-blur-md bg-black/75 border-yellow-500 shadow-2xl shadow-yellow-950/20">
                                        <span className="text-3xl xl:text-4xl font-black text-white flex items-center gap-3">🪙 Saldo Kas Bersih</span>
                                        <span className="text-5xl xl:text-6.5xl font-black text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.4)]">
                                            {formatRp(balance)}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Right Side: Giant Visual Ring Progress Chart */}
                                <div className="w-96 flex flex-col items-center justify-center p-8 rounded-[2.5rem] border-4 backdrop-blur-md bg-black/70 border-white/20 shadow-2xl">
                                    <div className="relative flex items-center justify-center w-64 h-64">
                                        <svg className="w-full h-full transform -rotate-90">
                                            {/* Track Ring */}
                                            <circle 
                                                cx="128" cy="128" r={radius} 
                                                strokeWidth={strokeWidth} stroke="#1e293b" fill="transparent"
                                            />
                                            {/* Progress Ring */}
                                            <circle 
                                                cx="128" cy="128" r={radius} 
                                                strokeWidth={strokeWidth} 
                                                stroke={pct > 75 ? "#ef4444" : pct > 40 ? "#eab308" : "#22c55e"} 
                                                fill="transparent"
                                                strokeDasharray={circumference}
                                                strokeDashoffset={strokeDashoffset}
                                                strokeLinecap="round"
                                                className="transition-all duration-1000 ease-out"
                                            />
                                        </svg>
                                        <div className="absolute flex flex-col items-center justify-center">
                                            <span className="text-6xl xl:text-7xl font-black text-white leading-none">{pct}%</span>
                                            <span className="text-sm font-black text-slate-400 uppercase tracking-widest mt-2">Terpakai</span>
                                        </div>
                                    </div>
                                    <span className="text-lg font-black text-slate-200 mt-6 uppercase tracking-widest text-center leading-relaxed">
                                        Rasio Pengeluaran Kas
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            } else {
                // Classic Text Mode Fallback (Giant Size!)
                const keuanganLines = (settings.keuanganText || '').split('|').map(s => s.trim()).filter(Boolean);
                overlayContent = (
                    <div className="absolute inset-0 z-50 w-full h-full bg-black overflow-hidden flex flex-col items-center justify-center">
                        <img src={activeImage} alt="Masjid Background" className="absolute inset-0 w-full h-full object-cover opacity-35 blur-md" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1565552643981-0814d48d0874?w=1600"; }} />
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/70 to-slate-950/80"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
                        <div className="relative z-10 flex flex-col items-center text-center px-10 w-full">
                            <h2 className="text-5xl xl:text-6.5xl font-black text-yellow-400 mb-2 tracking-widest drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] uppercase">
                                LAPORAN KEUANGAN MASJID
                            </h2>
                            <p className="text-2xl xl:text-3xl text-emerald-300 font-extrabold uppercase mb-12 tracking-widest">{masehiDateStr}</p>
                            <div className="flex flex-col gap-8 w-full max-w-6xl px-4">
                                {keuanganLines.map((line, i) => {
                                    const parts = line.split(':');
                                    const label = parts[0];
                                    const value = parts.slice(1).join(':').trim();
                                    const isIn = label.toLowerCase().includes('masuk') || label.toLowerCase().includes('pemasukan');
                                    const isOut = label.toLowerCase().includes('keluar') || label.toLowerCase().includes('pengeluaran');
                                    const isSaldo = label.toLowerCase().includes('saldo') || label.toLowerCase().includes('kas');
                                    const colorClass = isIn ? 'text-green-400 drop-shadow-[0_0_12px_rgba(74,222,128,0.4)]' : isOut ? 'text-red-400 drop-shadow-[0_0_12px_rgba(248,113,113,0.4)]' : isSaldo ? 'text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.4)]' : 'text-white';
                                    
                                    return (
                                        <div key={i} className={`flex items-center justify-between px-12 py-8 rounded-[2.5rem] border-4 backdrop-blur-md bg-black/75 border-white/20 shadow-2xl`}>
                                            <span className="text-4xl xl:text-5xl font-black text-white uppercase tracking-wider">{label}</span>
                                            <span className={`text-5xl xl:text-6.5xl font-black ${colorClass}`}>
                                                {value}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            }
        }

        // 5D. Tampilan Custom (Gambar Pamflet / Teks Offline)
        if (nextPrayer.mode === 'countdown' && !nextPrayer.isNear && !isFridayActive && modeTampilan.startsWith('custom_')) {
            const customViews = settings.customViews || [];
            const cv = customViews.find(c => c.id === modeTampilan);
            if (cv) {
                if (cv.type === 'image') {
                    overlayContent = (
                        <div className="absolute inset-0 z-50 w-full h-full bg-black overflow-hidden flex flex-col items-center justify-center">
                            {/* Backdrop Blur */}
                            <img 
                                src={cv.src} 
                                alt="Custom Backdrop" 
                                className="absolute inset-0 w-full h-full object-cover opacity-40 blur-lg filter" 
                                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1565552643981-0814d48d0874?w=1600"; }} 
                            />
                            <div className="absolute inset-0 bg-black/40"></div>
                            
                            {/* Poster Utama (Uncropped & Centered) */}
                            <img 
                                src={cv.src} 
                                alt="Custom Pamflet" 
                                className="relative z-10 max-w-full max-h-full object-contain drop-shadow-[0_15px_40px_rgba(0,0,0,0.8)] rounded-xl" 
                                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1565552643981-0814d48d0874?w=1600"; }} 
                            />
                        </div>
                    );
                } else if (cv.type === 'text') {
                    overlayContent = (
                        <div className="absolute inset-0 z-50 w-full h-full bg-black overflow-hidden flex flex-col items-center justify-center">
                            <img src={activeImage} alt="Masjid Background" className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1565552643981-0814d48d0874?w=1600"; }} />
                            <div className="absolute inset-0 bg-purple-900/30"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                            <div className="relative z-10 flex flex-col items-center text-center px-10 w-full h-full justify-center">
                                <h2 className="text-5xl xl:text-6xl font-black text-white mb-8 tracking-widest drop-shadow-lg uppercase">
                                    {cv.title || 'PENGUMUMAN'}
                                </h2>
                                <div className="bg-gradient-to-br from-purple-900/80 to-black/80 backdrop-blur-md rounded-[2.5rem] p-10 border border-purple-500/40 shadow-[0_15px_40px_rgba(168,85,247,0.3)] w-full max-w-6xl">
                                    <p className="text-3xl xl:text-4xl text-white font-semibold leading-relaxed drop-shadow-md whitespace-pre-wrap">
                                        {cv.content || '-'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                }
            }
        }

        // 5C. Tampilan Hari Besar Islam
        if (nextPrayer.mode === 'countdown' && !nextPrayer.isNear && !isFridayActive && modeTampilan === 'haribesar') {
            const hbList = getHariBesarTerdekat();
            overlayContent = (
                <div className="absolute inset-0 z-50 w-full h-full bg-black overflow-hidden flex flex-col items-center justify-center">
                    <img src={activeImage} alt="Masjid Background" className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1565552643981-0814d48d0874?w=1600"; }} />
                    <div className="absolute inset-0 bg-blue-900/30"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="relative z-10 flex flex-col items-center text-center px-10 w-full h-full justify-center">
                        <h2 className="text-5xl xl:text-6xl font-black text-white mb-8 tracking-widest drop-shadow-lg uppercase">
                            HARI BESAR ISLAM
                        </h2>
                        <div className="grid grid-cols-3 gap-6 w-full max-w-7xl px-6 max-h-[75vh] overflow-hidden">
                            {hbList.map((h, i) => (
                                <div key={i} className="flex flex-col items-center bg-gradient-to-br from-blue-900/80 to-black/80 backdrop-blur-md rounded-3xl p-6 border border-blue-400/50 shadow-[0_10px_30px_rgba(59,130,246,0.3)]">
                                    <h3 className="text-2xl lg:text-3xl font-black text-yellow-400 mb-2 drop-shadow-md leading-tight text-center line-clamp-2 uppercase">{h.nama}</h3>
                                    <p className="text-xl text-white font-black mb-6 uppercase tracking-wider">
                                        {new Date(h.tanggal + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
                                    </p>
                                    <div className="flex justify-center gap-4 w-full">
                                        {[{ nilai: h.hari, label: 'HARI' }, { nilai: h.jam, label: 'JAM' }, { nilai: h.menit, label: 'MNT' }].map(({ nilai, label }) => (
                                            <div key={label} className="bg-black/60 rounded-2xl px-5 py-4 border border-blue-500/30 flex-1 flex flex-col items-center shadow-inner">
                                                <div className="text-5xl font-black text-yellow-400 tabular-nums leading-none drop-shadow-md">{String(nilai).padStart(2, '0')}</div>
                                                <div className="text-sm font-black text-white/80 mt-2 uppercase tracking-widest">{label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        // 5E. Tampilan Countdown Ramadhan
        if (nextPrayer.mode === 'countdown' && !nextPrayer.isNear && !isFridayActive && modeTampilan === 'countdown_ramadhan' && settings.showRamadhanCountdown) {
            const now = new Date();
            const target = new Date(settings.ramadhanTargetDate || "2027-02-08T00:00:00");
            const diff = target - now;
            const isFinished = diff <= 0;
            
            const hari = Math.floor(diff / (1000 * 60 * 60 * 24));
            const jam = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const menit = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            overlayContent = (
                <div className="absolute inset-0 z-50 w-full h-full bg-black overflow-hidden flex flex-col items-center justify-center">
                    <img src={activeImage} alt="Masjid Background" className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1565552643981-0814d48d0874?w=1600"; }} />
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/90 to-slate-900/90"></div>
                    <div className="relative z-10 flex flex-col items-center text-center px-10 w-full h-full justify-center">
                        {isFinished ? (
                            <div className="flex flex-col items-center gap-6 animate-fadeIn">
                                <span className="text-7xl xl:text-8xl font-black text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.6)] uppercase tracking-widest leading-none">
                                    Marhaban Yaa Ramadhan!
                                </span>
                                <span className="text-3xl xl:text-4xl font-bold text-white uppercase drop-shadow-md">
                                    Selamat Menunaikan Ibadah Puasa Ramadhan
                                </span>
                                <span className="text-5xl font-black text-emerald-400 mt-2">🕌🌙🕋</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-6 w-full max-w-5xl">
                                <h2 className="text-5xl xl:text-6xl font-black text-white mb-2 tracking-widest drop-shadow-lg uppercase">
                                    MENYAMBUT BULAN SUCI
                                </h2>
                                <h1 className="text-6xl xl:text-7xl font-black text-yellow-400 mb-6 drop-shadow-[0_0_20px_rgba(250,204,21,0.6)] uppercase tracking-wider">
                                    RAMADHAN
                                </h1>
                                <div className="flex justify-center gap-6 w-full max-w-3xl">
                                    {[{ nilai: hari, label: 'HARI' }, { nilai: jam, label: 'JAM' }, { nilai: menit, label: 'MENIT' }].map(({ nilai, label }) => (
                                        <div key={label} className="bg-gradient-to-br from-emerald-900/80 to-black/80 rounded-3xl p-6 border border-emerald-500/40 flex-1 flex flex-col items-center shadow-lg">
                                            <div className="text-7xl xl:text-8xl font-black text-yellow-400 tabular-nums leading-none drop-shadow-md">{String(nilai).padStart(2, '0')}</div>
                                            <div className="text-sm font-black text-white/80 mt-3 uppercase tracking-widest">{label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // 5F. Tampilan Laporan Wakaf Tarawih
        if (nextPrayer.mode === 'countdown' && !nextPrayer.isNear && !isFridayActive && modeTampilan === 'wakaf_tarawih' && settings.showWakafTarawih) {
            const dataWakaf = settings.wakafTarawihData || [];
            const totalWakaf = dataWakaf.reduce((acc, curr) => acc + (Number(curr.jumlah) || 0), 0);
            const riwayat5Malam = [...dataWakaf].sort((a, b) => b.malam - a.malam).slice(0, 5).reverse();

            const formatRupiah = (val) => {
                return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
            };

            overlayContent = (
                <div className="absolute inset-0 z-50 w-full h-full bg-black overflow-hidden flex flex-col items-center justify-center">
                    <img src={activeImage} alt="Masjid Background" className="absolute inset-0 w-full h-full object-cover opacity-35 blur-md" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1565552643981-0814d48d0874?w=1600"; }} />
                    <div className="absolute inset-0 bg-emerald-950/20"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                    <div className="relative z-10 flex flex-col items-center text-center px-10 w-full h-full justify-center">
                        <h2 className="text-5xl xl:text-6.5xl font-black text-white mb-2 tracking-widest drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] uppercase">
                            LAPORAN PEROLEHAN WAKAF TARAWIH
                        </h2>
                        <p className="text-2xl xl:text-3xl text-emerald-300 font-extrabold uppercase mb-10 tracking-widest">NURUL HUDA — REAL-TIME</p>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 w-full max-w-7xl items-stretch px-4">
                            <div className="md:col-span-2 bg-gradient-to-br from-emerald-950/90 to-black/90 backdrop-blur-md rounded-[2.5rem] p-10 border-4 border-emerald-500 shadow-2xl flex flex-col justify-center items-center gap-6">
                                <span className="text-3xl xl:text-4xl font-black text-white uppercase tracking-wider">TOTAL TERKUMPUL</span>
                                <span className="text-5xl xl:text-7.5xl font-black text-yellow-400 drop-shadow-[0_0_25px_rgba(250,204,21,0.6)] animate-pulse">
                                    {formatRupiah(totalWakaf)}
                                </span>
                                <span className="text-base text-emerald-300 font-bold leading-relaxed text-center mt-4 bg-emerald-950/80 p-5 rounded-2xl border-2 border-emerald-500/30 shadow-inner">
                                    Semoga menjadi amal jariyah yang terus mengalir bagi para muwakif. Aamiin Yaa Rabbal 'Aalamiin.
                                </span>
                            </div>

                            <div className="md:col-span-3 bg-black/80 backdrop-blur-md rounded-[2.5rem] p-8 border-4 border-white/20 flex flex-col justify-center shadow-2xl">
                                <h3 className="text-2xl xl:text-3xl font-black text-white mb-6 border-b-2 border-white/20 pb-3 uppercase tracking-widest text-left">Riwayat 5 Malam Terakhir</h3>
                                <div className="flex flex-col gap-4 flex-1 justify-center">
                                    {riwayat5Malam.length > 0 ? riwayat5Malam.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center py-4 px-6 rounded-2xl bg-white/10 border-2 border-white/10 shadow-inner">
                                            <span className="text-2xl xl:text-3xl font-black text-white uppercase">Malam Tarawih Ke-{item.malam}</span>
                                            <span className="text-2xl xl:text-3xl font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">{formatRupiah(item.jumlah)}</span>
                                        </div>
                                    )) : (
                                        <div className="text-center text-slate-400 text-xl italic py-12">Belum ada riwayat perolehan.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }






        // 5G. Tampilan Petugas Tarawih
        if (nextPrayer.mode === 'countdown' && !nextPrayer.isNear && !isFridayActive && modeTampilan === 'petugas_tarawih' && settings.showPetugasTarawih) {
            const dataPetugas = settings.petugasTarawihData || { malamKe: 1, imam: "", bilal: "" };
            
            overlayContent = (
                <div className="absolute inset-0 z-50 w-full h-full bg-black overflow-hidden flex flex-col items-center justify-center">
                    <img src={activeImage} alt="Masjid Background" className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1565552643981-0814d48d0874?w=1600"; }} />
                    <div className="absolute inset-0 bg-emerald-950/30"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent"></div>
                    <div className="relative z-10 flex flex-col items-center text-center px-10 w-full h-full justify-center">
                        <h2 className="text-4xl xl:text-5xl font-black text-white mb-2 tracking-widest drop-shadow-lg uppercase">
                            PETUGAS SHOLAT TARAWIH & WITIR
                        </h2>
                        <p className="text-xl text-emerald-300 font-bold uppercase mb-10">MALAM TARAWIH KE-{dataPetugas.malamKe || 1}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-6xl px-4">
                            <div className="bg-gradient-to-br from-emerald-900/80 to-black/80 backdrop-blur-md rounded-[2.5rem] py-12 px-8 border border-emerald-500/40 shadow-xl flex flex-col items-center gap-4">
                                <span className="text-3xl xl:text-4xl font-black text-emerald-400 tracking-widest uppercase drop-shadow-md">IMAM SHOLAT</span>
                                <span className="text-4xl xl:text-5xl font-black text-white text-center leading-tight uppercase drop-shadow-lg">
                                    {dataPetugas.imam || '-'}
                                </span>
                            </div>

                                                        <div className="bg-gradient-to-br from-emerald-900/80 to-black/80 backdrop-blur-md rounded-[2.5rem] py-12 px-8 border border-emerald-500/40 shadow-xl flex flex-col items-center gap-4">
                                <span className="text-3xl xl:text-4xl font-black text-emerald-400 tracking-widest uppercase drop-shadow-md">BILAL & WITIR</span>
                                <span className="text-4xl xl:text-5xl font-black text-white text-center leading-tight uppercase drop-shadow-lg">
                                    {dataPetugas.bilal || '-'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // 5H. Tampilan Berita Duka
        if (nextPrayer.mode === 'countdown' && !nextPrayer.isNear && !isFridayActive && modeTampilan === 'berita_duka' && settings.showBeritaDuka) {
            const dataDuka = settings.beritaDukaData || {};
            overlayContent = (
                <div className="absolute inset-0 z-50 w-full h-full bg-black overflow-hidden flex flex-col items-center justify-center pointer-events-auto">
                    <img src={activeImage} alt="Masjid Background" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-md" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1565552643981-0814d48d0874?w=1600"; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-950/95 to-black"></div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center px-10 w-full max-w-6xl">
                        <h2 className="text-5xl xl:text-6xl font-black text-red-500 mb-6 tracking-widest drop-shadow-[0_0_15px_rgba(239,68,68,0.4)] uppercase">
                            INNALILLAHI WA INNA ILAIHI RAJI'UN
                        </h2>
                        <p className="text-2xl xl:text-3xl text-slate-350 font-bold mb-8 uppercase tracking-wide">Telah berpulang ke Rahmatullah:</p>
                        
                        <div className="bg-gradient-to-br from-zinc-900/90 to-black/95 border border-zinc-800 rounded-[2.5rem] p-10 w-full shadow-2xl flex flex-col items-center gap-6">
                            <span className="text-6xl xl:text-7.5xl font-black text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.3)] tracking-wide uppercase leading-tight text-center animate-fadeIn">
                                {dataDuka.nama || '-'}
                            </span>
                            <span className="text-3xl xl:text-4xl font-extrabold text-white">
                                Usia: {dataDuka.usia ? `${dataDuka.usia} Tahun` : '-'}
                            </span>
                            
                            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 border-t border-zinc-800 pt-8 text-left">
                                <div className="bg-black/40 p-5 rounded-2xl border border-zinc-850">
                                    <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block mb-2">Waktu Wafat</span>
                                    <span className="text-xl font-bold text-slate-200 leading-snug block">{dataDuka.wafat || '-'}</span>
                                </div>
                                <div className="bg-black/40 p-5 rounded-2xl border border-zinc-850">
                                    <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block mb-2">Rumah Duka</span>
                                    <span className="text-xl font-bold text-slate-200 leading-snug block">{dataDuka.rumahDuka || '-'}</span>
                                </div>
                                <div className="bg-black/40 p-5 rounded-2xl border border-zinc-850">
                                    <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block mb-2">Pemakaman</span>
                                    <span className="text-xl font-bold text-slate-200 leading-snug block">{dataDuka.makam || "-"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // 5I. Tampilan Info Yasinan
        if (nextPrayer.mode === 'countdown' && !nextPrayer.isNear && !isFridayActive && modeTampilan === 'info_yasinan' && settings.showInfoYasinan) {
            const dataYasinan = settings.infoYasinanData || {};
            overlayContent = (
                <div className="absolute inset-0 z-50 w-full h-full bg-black overflow-hidden flex flex-col items-center justify-center pointer-events-auto">
                    <img src={activeImage} alt="Masjid Background" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-md" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1565552643981-0814d48d0874?w=1600"; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-emerald-950/70 to-black"></div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center px-10 w-full max-w-6xl">
                        <h2 className="text-5xl xl:text-6xl font-black text-emerald-400 mb-6 tracking-widest drop-shadow-[0_0_15px_rgba(52,211,153,0.4)] uppercase">
                            JADWAL YASINAN WARGA
                        </h2>
                        <p className="text-2xl xl:text-3xl text-slate-350 font-bold mb-8 uppercase tracking-wide">Mari Hadiri & Syiarkan Pengajian Yasinan:</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                            <div className="bg-gradient-to-br from-emerald-950/80 to-black/90 border border-emerald-800/40 rounded-[2.5rem] py-10 px-8 shadow-xl flex flex-col items-center gap-4">
                                <span className="text-2xl xl:text-3xl font-bold text-emerald-400 uppercase tracking-widest drop-shadow-md">Waktu Pelaksanaan</span>
                                <span className="text-4xl xl:text-5xl font-black text-white text-center leading-tight uppercase drop-shadow-lg">
                                    {dataYasinan.malam || '-'}
                                </span>
                                <span className="text-2xl font-extrabold text-yellow-400 mt-2">
                                    Pukul {dataYasinan.pukul || '-'}
                                </span>
                            </div>
                            
                            <div className="bg-gradient-to-br from-emerald-950/80 to-black/90 border border-emerald-800/40 rounded-[2.5rem] py-10 px-8 shadow-xl flex flex-col items-center gap-4">
                                <span className="text-2xl xl:text-3xl font-bold text-emerald-400 uppercase tracking-widest drop-shadow-md">Tuan Rumah & Lokasi</span>
                                <span className="text-4xl xl:text-5xl font-black text-white text-center leading-tight uppercase drop-shadow-lg">
                                    {dataYasinan.tuanRumah || '-'}
                                </span>
                                <span className="text-2xl font-extrabold text-yellow-400 mt-2 flex items-center justify-center gap-2">
                                    📍 {dataYasinan.lokasi || '-'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // 5J. Uji Coba Tampilan TV Override
        if (settings.testLayoutMode === 'berita_duka') {
            const dataDuka = settings.beritaDukaData || {};
            overlayContent = (
                <div className="absolute inset-0 z-50 w-full h-full bg-black overflow-hidden flex flex-col items-center justify-center pointer-events-auto">
                    <img src={activeImage} alt="Masjid Background" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-md" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1565552643981-0814d48d0874?w=1600"; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-950/95 to-black"></div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center px-10 w-full max-w-6xl">
                        <div className="absolute top-6 left-6 bg-red-600 text-white px-4 py-1.5 rounded-full font-black text-sm animate-pulse border border-white/20">🧪 MODE UJI COBA TAMPILAN</div>
                        <h2 className="text-5xl xl:text-6xl font-black text-red-500 mb-6 tracking-widest drop-shadow-[0_0_15px_rgba(239,68,68,0.4)] uppercase">
                            INNALILLAHI WA INNA ILAIHI RAJI'UN
                        </h2>
                        <p className="text-2xl xl:text-3xl text-slate-350 font-bold mb-8 uppercase tracking-wide">Telah berpulang ke Rahmatullah:</p>
                        
                        <div className="bg-gradient-to-br from-zinc-900/90 to-black/95 border border-zinc-800 rounded-[2.5rem] p-10 w-full shadow-2xl flex flex-col items-center gap-6">
                            <span className="text-6xl xl:text-7xl font-black text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.3)] tracking-wide uppercase leading-tight text-center">
                                {dataDuka.nama || 'Bapak H. Ahmad Fulan'}
                            </span>
                            <span className="text-3xl xl:text-4xl font-extrabold text-white">
                                Usia: {dataDuka.usia ? `${dataDuka.usia} Tahun` : '65 Tahun'}
                            </span>
                            
                            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 border-t border-zinc-800 pt-8 text-left">
                                <div className="bg-black/40 p-5 rounded-2xl border border-zinc-850">
                                    <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block mb-2">Waktu Wafat</span>
                                    <span className="text-xl font-bold text-slate-200 leading-snug block">{dataDuka.wafat || 'Senin Pagi, Pukul 08:30 WIB'}</span>
                                </div>
                                <div className="bg-black/40 p-5 rounded-2xl border border-zinc-850">
                                    <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block mb-2">Rumah Duka</span>
                                    <span className="text-xl font-bold text-slate-200 leading-snug block">{dataDuka.rumahDuka || 'RT 03 RW 01 (Belakang SD)'}</span>
                                </div>
                                <div className="bg-black/40 p-5 rounded-2xl border border-zinc-850">
                                    <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block mb-2">Pemakaman</span>
                                    <span className="text-xl font-bold text-slate-200 leading-snug block">{dataDuka.makam || "Ba'da Ashar di TPU Kamboja"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (settings.testLayoutMode === 'info_yasinan') {
            const dataYasinan = settings.infoYasinanData || {};
            overlayContent = (
                <div className="absolute inset-0 z-50 w-full h-full bg-black overflow-hidden flex flex-col items-center justify-center pointer-events-auto">
                    <img src={activeImage} alt="Masjid Background" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-md" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1565552643981-0814d48d0874?w=1600"; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-emerald-950/70 to-black"></div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center px-10 w-full max-w-6xl">
                        <div className="absolute top-6 left-6 bg-red-600 text-white px-4 py-1.5 rounded-full font-black text-sm animate-pulse border border-white/20">🧪 MODE UJI COBA TAMPILAN</div>
                        <h2 className="text-5xl xl:text-6xl font-black text-emerald-400 mb-6 tracking-widest drop-shadow-[0_0_15px_rgba(52,211,153,0.4)] uppercase">
                            JADWAL YASINAN WARGA
                        </h2>
                        <p className="text-2xl xl:text-3xl text-slate-350 font-bold mb-8 uppercase tracking-wide">Mari Hadiri & Syiarkan Pengajian Yasinan:</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                            <div className="bg-gradient-to-br from-emerald-950/80 to-black/90 border border-emerald-800/40 rounded-[2.5rem] py-10 px-8 shadow-xl flex flex-col items-center gap-4">
                                <span className="text-2xl xl:text-3xl font-bold text-emerald-400 uppercase tracking-widest drop-shadow-md">Waktu Pelaksanaan</span>
                                <span className="text-4xl xl:text-5xl font-black text-white text-center leading-tight uppercase drop-shadow-lg">
                                    {dataYasinan.malam || 'Malam Jumat'}
                                </span>
                                <span className="text-2xl font-extrabold text-yellow-400 mt-2">
                                    Pukul {dataYasinan.pukul || '19:30 WIB'}
                                </span>
                            </div>
                            
                            <div className="bg-gradient-to-br from-emerald-950/80 to-black/90 border border-emerald-800/40 rounded-[2.5rem] py-10 px-8 shadow-xl flex flex-col items-center gap-4">
                                <span className="text-2xl xl:text-3xl font-bold text-emerald-400 uppercase tracking-widest drop-shadow-md">Tuan Rumah & Lokasi</span>
                                <span className="text-4xl xl:text-5xl font-black text-white text-center leading-tight uppercase drop-shadow-lg">
                                    {dataYasinan.tuanRumah || 'Bapak H. Ahmad'}
                                </span>
                                <span className="text-2xl font-extrabold text-yellow-400 mt-2 flex items-center justify-center gap-2">
                                    📍 {dataYasinan.lokasi || 'RT 02 RW 03 (Belakang Masjid)'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (settings.testLayoutMode === 'keuangan') {
            const inc = settings.keuanganIncome || 2500000;
            const exp = settings.keuanganExpense || 800000;
            const balance = inc - exp;
            const formatRp = (num) => "Rp " + new Intl.NumberFormat('id-ID').format(num);
            const pct = inc > 0 ? Math.min(Math.round((exp / inc) * 100), 100) : 0;
            
            // SVG Progress Circle math (Larger, bolder circle!)
            const radius = 110;
            const strokeWidth = 22;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference - (pct / 100) * circumference;
            overlayContent = (
                <div className="absolute inset-0 z-50 w-full h-full bg-black overflow-hidden flex flex-col items-center justify-center pointer-events-auto">
                    <img src={activeImage} alt="Masjid Background" className="absolute inset-0 w-full h-full object-cover opacity-30 blur-lg" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1565552643981-0814d48d0874?w=1600"; }} />
                    <div className="absolute inset-0 bg-emerald-950/20"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center px-10 w-full">
                        <div className="absolute top-6 left-6 bg-red-650/80 text-white px-4 py-1.5 rounded-full font-black text-sm animate-pulse border border-white/20">🧪 MODE UJI COBA TAMPILAN</div>
                        <h2 className="text-5xl xl:text-6.5xl font-black text-yellow-400 mb-2 tracking-widest drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] uppercase">
                            {settings.keuanganTitle || 'LAPORAN KAS MINGGUAN MASJID'}
                        </h2>
                        <p className="text-2xl xl:text-3xl text-emerald-300 font-extrabold uppercase mb-10 tracking-widest">{masehiDateStr}</p>
                        
                        <div className="flex flex-col xl:flex-row items-center justify-center gap-14 w-full max-w-7xl px-4">
                            {/* Left Side: Giant Cards */}
                            <div className="flex-1 flex flex-col gap-6 w-full">
                                {/* Pemasukan Card */}
                                <div className="flex items-center justify-between px-10 py-7 rounded-[2rem] border-4 backdrop-blur-md bg-black/75 border-green-500 shadow-2xl shadow-green-950/20">
                                    <span className="text-3xl xl:text-4xl font-black text-white flex items-center gap-3">🟢 Pemasukan</span>
                                    <span className="text-5xl xl:text-6.5xl font-black text-green-400 drop-shadow-[0_0_12px_rgba(74,222,128,0.4)]">
                                        {formatRp(inc)}
                                    </span>
                                </div>
                                
                                {/* Pengeluaran Card */}
                                <div className="flex items-center justify-between px-10 py-7 rounded-[2rem] border-4 backdrop-blur-md bg-black/75 border-red-500 shadow-2xl shadow-red-950/20">
                                    <span className="text-3xl xl:text-4xl font-black text-white flex items-center gap-3">🔴 Pengeluaran</span>
                                    <span className="text-5xl xl:text-6.5xl font-black text-red-400 drop-shadow-[0_0_12px_rgba(248,113,113,0.4)]">
                                        {formatRp(exp)}
                                    </span>
                                </div>
                                
                                {/* Saldo Kas Card */}
                                <div className="flex items-center justify-between px-10 py-7 rounded-[2rem] border-4 backdrop-blur-md bg-black/75 border-yellow-500 shadow-2xl shadow-yellow-950/20">
                                    <span className="text-3xl xl:text-4xl font-black text-white flex items-center gap-3">🪙 Saldo Kas Bersih</span>
                                    <span className="text-5xl xl:text-6.5xl font-black text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.4)]">
                                        {formatRp(balance)}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Right Side: Giant Visual Ring Progress Chart */}
                            <div className="w-96 flex flex-col items-center justify-center p-8 rounded-[2.5rem] border-4 backdrop-blur-md bg-black/70 border-white/20 shadow-2xl">
                                <div className="relative flex items-center justify-center w-64 h-64">
                                    <svg className="w-full h-full transform -rotate-90">
                                        {/* Track Ring */}
                                        <circle 
                                            cx="128" cy="128" r={radius} 
                                            strokeWidth={strokeWidth} stroke="#1e293b" fill="transparent"
                                        />
                                        {/* Progress Ring */}
                                        <circle 
                                            cx="128" cy="128" r={radius} 
                                            strokeWidth={strokeWidth} 
                                            stroke={pct > 75 ? "#ef4444" : pct > 40 ? "#eab308" : "#22c55e"} 
                                            fill="transparent"
                                            strokeDasharray={circumference}
                                            strokeDashoffset={strokeDashoffset}
                                            strokeLinecap="round"
                                            className="transition-all duration-1000 ease-out"
                                        />
                                    </svg>
                                    <div className="absolute flex flex-col items-center justify-center">
                                        <span className="text-6xl xl:text-7xl font-black text-white leading-none">{pct}%</span>
                                        <span className="text-sm font-black text-slate-400 uppercase tracking-widest mt-2">Terpakai</span>
                                    </div>
                                </div>
                                <span className="text-lg font-black text-slate-200 mt-6 uppercase tracking-widest text-center leading-relaxed">
                                    Rasio Pengeluaran Kas
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // 5. Default: Tampilan Normal 2 Kolom
        return (
            <>
                <div className="w-1/3 flex flex-col gap-2 justify-between h-full relative">
                    <div className="bg-white/90 backdrop-blur-sm flex items-center justify-center py-4 flex-shrink-0">
                        <span className="text-6xl xl:text-7xl font-black text-blue-700 tracking-tighter drop-shadow-md" style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {displayTime}
                        </span>
                    </div>

                    <div className={`flex-none flex items-center justify-center py-3 px-2 transition-colors duration-500 ${nextPrayer.isNear || nextPrayer.mode === 'preadzan' ? 'bg-red-500 animate-pulse shadow-[0_10px_30px_rgba(239,68,68,0.8)]' : 'backdrop-blur-sm shadow-[0_10px_30px_rgba(37,99,235,0.6)]'}`}
                        style={!(nextPrayer.isNear || nextPrayer.mode === 'preadzan') ? { backgroundColor: settings.countdownBgColor || '#2563eb' } : {}}>
                        {activeJumat ? (
                            <div className="flex flex-col items-center justify-center leading-none py-1 overflow-hidden">
                                <span className="text-3xl xl:text-4xl font-black drop-shadow-md text-center w-full whitespace-nowrap tracking-tighter scale-y-110 mb-2" style={{ color: settings.countdownTextColor || '#ffffff' }}>SHOLAT JUM'AT</span>
                                <span className="text-4xl xl:text-5xl font-black drop-shadow-md text-center w-full mt-3" style={{ color: settings.countdownTextColor || '#ffffff' }}>{nextPrayer.diffStr}</span>
                            </div>
                        ) : (
                            <span className="text-3xl xl:text-4xl font-black drop-shadow-md text-center" style={{ color: settings.countdownTextColor || '#ffffff' }}>
                                {`${(nextPrayer.name || '').toUpperCase()} - ${nextPrayer.diffStr}`}
                            </span>
                        )}
                    </div>

                    <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center overflow-hidden bg-white px-4 py-3 relative shadow-inner">
                        {(() => {
                            const hbList = getHariBesarTerdekat();
                            if (!hbList || hbList.length === 0) return null;
                            const currentIndex = Math.floor(Date.now() / 120000) % hbList.length;
                            const hb = hbList[currentIndex];
                            return (
                                <div className="flex flex-col items-center justify-center w-full h-full gap-3 animate-fadeIn" key={currentIndex}>
                                    <h2 className="text-[2.5rem] xl:text-[3rem] font-black text-slate-900 leading-none uppercase text-center line-clamp-2 px-1 drop-shadow-sm">
                                        {hb.nama || 'Peringatan Hari Besar'}
                                    </h2>
                                    <p className="text-2xl xl:text-3xl text-slate-700 font-black uppercase tracking-wider bg-slate-100 px-4 py-1 rounded-lg border border-slate-200 shadow-sm">
                                        {new Date(hb.tanggal + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
                                    </p>
                                    <div className="flex flex-row items-baseline justify-center gap-3 bg-blue-700 rounded-2xl px-4 py-4 shadow-lg w-full">
                                        <span className="text-5xl xl:text-6xl font-black text-white tabular-nums tracking-tighter leading-none">{hb.hari}</span>
                                        <span className="text-5xl xl:text-6xl font-black text-blue-200 uppercase tracking-tighter leading-none">HARI LAGI</span>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>

                <div className="w-2/3 overflow-hidden relative bg-black transition-opacity duration-1000 min-h-0">
                    {offlineManualMode && isPlaying && (
                        <div className="absolute top-4 right-4 bg-orange-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full flex items-center gap-2 border border-orange-300 shadow-lg z-20">
                            <span className="text-lg">📵</span>
                            <span className="text-sm font-black tracking-wider">OFFLINE MODE</span>
                        </div>
                    )}
                    {!activeJumat ? (
                        <>
                            {(!showingYoutube || !settings.youtubeLink) && (
                                <img src={activeImage} alt="Masjid Background" className="absolute inset-0 w-full h-full object-cover opacity-90 transition-opacity duration-1000" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1565552643981-0814d48d0874?w=1600"; }} />
                            )}
                            {showingYoutube && settings.youtubeLink && (() => {
                                const match = (settings.youtubeLink || '').match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
                                const videoId = match ? match[1] : null;

                                if (!videoId) return null;

                                return (
                                    <div className="absolute inset-0 w-full h-full bg-black z-0 pointer-events-none">
                                        <iframe
                                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0`}
                                            allow="autoplay; encrypted-media"
                                            allowFullScreen
                                            style={{ width: '100%', height: '100%', border: 'none' }}
                                        />
                                    </div>
                                );
                            })()}
                            {isPlaying && (
                                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full flex items-center gap-2 animate-pulse border border-white/20">
                                    <Volume2 size={20} className="text-green-400" />
                                    <span className="text-sm font-semibold">Murottal Berkumandang...</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-8 bg-slate-900 text-white" style={{ background: `linear-gradient(to bottom right, ${settings.jumatBgFrom || '#064e3b'}, ${settings.jumatBgTo || '#0f172a'})` }}>
                            {/* Texture */}
                            <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/arabesque.png')` }}></div>

                            {isJumatTest && (
                                <>
                                    <div className="absolute top-6 left-6 bg-red-600 text-white px-6 py-2 rounded-full font-black text-xl animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.8)] z-[100] tracking-widest border-2 border-white">
                                        🧪 MODE TEST AKTIF
                                    </div>
                                    <button onClick={() => setIsJumatTest(false)} className="absolute top-6 right-6 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-2xl font-black text-2xl shadow-[0_0_20px_rgba(220,38,38,0.8)] z-[100] tracking-widest border-4 border-red-300 transition-transform hover:scale-105 cursor-pointer z-[100]">
                                        ✕ SELESAI TEST
                                    </button>
                                </>
                            )}
                            
                            {/* Slides Content */}
                            {(() => {
                                const slideObj = jumatSlides[jumatSlideIndex % jumatSlides.length] || { type: 'petugas_all' };
                                const currentSlide = slideObj.type;

                                if (currentSlide === 'petugas_single') {
                                    const petugasList = getJumatPetugas();
                                    const p = petugasList.find(x => x.role.includes(slideObj.role.toUpperCase())) || { name: '-', role: slideObj.role };
                                    return (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-center animate-fadeIn relative z-10 p-10 overflow-hidden rounded-[3rem] border-4" style={{ borderColor: settings.jumatBorder || '#10b981' }}>
                                            <img src={activeImage} alt="Masjid Background" className="absolute inset-0 w-full h-full object-cover opacity-70 filter blur-sm" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1565552643981-0814d48d0874?w=1600"; }} />
                                            <div className="absolute inset-0 bg-black/60 z-0"></div>
                                            <div className="relative z-10 flex flex-col items-center justify-center w-full">
                                                <span className="text-5xl px-12 py-5 font-black rounded-3xl border-4 drop-shadow-lg mb-10 tracking-widest uppercase shadow-[0_10px_20px_rgba(0,0,0,0.5)]" style={{ background: settings.jumatAccent || '#fbbf24', color: '#000', borderColor: settings.jumatBorder || '#10b981' }}>
                                                    {p.role}
                                                </span>
                                                <span className="text-[5rem] xl:text-[6.5rem] font-black text-center leading-tight drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)] text-white tracking-widest uppercase whitespace-nowrap overflow-hidden text-ellipsis max-w-[95%]" style={{ textShadow: '0 5px 15px rgba(0,0,0,1)' }}>
                                                    {p.name}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                } else if (currentSlide === 'gambar') {
                                    return (
                                        <div className="absolute inset-0 w-full h-full animate-fadeIn flex items-center justify-center">
                                            <img src={slideObj.src} alt="Slide" className="w-full h-full object-cover shadow-2xl rounded-[3rem] border-4" style={{ borderColor: settings.jumatBorder || '#10b981' }} />
                                        </div>
                                    );
                                } else if (currentSlide === 'petugas_all') {
                                    const petugasList = getJumatPetugas();
                                    return (
                                        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-center animate-fadeIn z-10 p-10" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/arabesque.png')` }}>
                                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/60 to-slate-900/60 z-0 mix-blend-multiply"></div>
                                            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                                                <h2 className="text-4xl xl:text-5xl font-black text-white mb-8 tracking-widest drop-shadow-lg uppercase border-b-4 border-emerald-500/50 pb-4">
                                                    PETUGAS SHOLAT JUMAT
                                                </h2>
                                                <div className="grid grid-cols-2 gap-8 w-full max-w-5xl">
                                                    {petugasList.map((p, i) => (
                                                        <div key={i} className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-xl flex flex-col items-center justify-center gap-2" style={{ background: 'rgba(0,0,0,0.4)' }}>
                                                            <span className="text-2xl xl:text-3xl font-bold uppercase tracking-widest" style={{ color: settings.jumatAccent || '#fbbf24' }}>{p.role}</span>
                                                            <span className="text-3xl xl:text-4xl font-black text-white uppercase break-words text-center">{p.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                } else if (currentSlide === 'keuangan') {
                                    const keuanganLines = (settings.keuanganText || '').split('|').map(s => s.trim()).filter(Boolean);
                                    return (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-center animate-fadeIn relative z-10 p-10">
                                            <h2 className="text-4xl xl:text-5xl font-black text-white mb-8 tracking-widest drop-shadow-lg uppercase border-b-4 border-emerald-500/50 pb-4">
                                                LAPORAN KEUANGAN
                                            </h2>
                                            <div className="flex flex-col gap-4 w-full max-w-4xl">
                                                {keuanganLines.map((line, i) => {
                                                    const parts = line.split(':');
                                                    if(parts.length < 2) return null;
                                                    const label = parts[0].trim();
                                                    const val = parts.slice(1).join(':').trim();
                                                    let colorClass = settings.jumatTextSecondary || '#a7f3d0';
                                                    if(label.toLowerCase().includes('masuk') || label.toLowerCase().includes('pemasukan')) colorClass = '#4ade80';
                                                    else if(label.toLowerCase().includes('keluar') || label.toLowerCase().includes('pengeluaran')) colorClass = '#f87171';
                                                    else if(label.toLowerCase().includes('saldo') || label.toLowerCase().includes('kas')) colorClass = settings.jumatAccent || '#fbbf24';
                                                    return (
                                                        <div key={i} className="flex justify-between items-center bg-black/40 px-8 py-5 rounded-2xl border border-white/10 shadow-inner">
                                                            <span className="text-2xl xl:text-3xl font-bold text-white/90 uppercase">{label}</span>
                                                            <span style={{ color: colorClass }} className="font-black drop-shadow-md tracking-wider text-3xl xl:text-4xl">{val}</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    );
                                } else if (currentSlide === 'acara') {
                                    return (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-center animate-fadeIn relative z-10 p-10">
                                            <h2 className="text-4xl xl:text-5xl font-black text-white mb-8 tracking-widest drop-shadow-lg uppercase border-b-4 border-emerald-500/50 pb-4">
                                                PENGUMUMAN MASJID
                                            </h2>
                                            <div className="text-2xl xl:text-3xl font-semibold leading-relaxed whitespace-pre-wrap max-w-5xl" style={{ color: settings.jumatTextSecondary || '#a7f3d0' }}>
                                                {(settings.acaraText || '').split('|').join('\n\n').toUpperCase()}
                                            </div>
                                        </div>
                                    );
                                }
                            })()}
                        </div>
                    )}
                </div>
                
                {overlayContent}
            </>
        );
    };

    return (
        <div className="w-full h-screen overflow-hidden flex flex-col font-sans p-0 relative">
            {!isOnline && (
                <div className="absolute top-4 left-4 z-[100] bg-red-600 text-white px-3 py-1 rounded font-bold text-sm shadow-lg border border-red-400 animate-pulse">
                    ⚠ OFFLINE
                </div>
            )}
            <style>{`
        @keyframes shine {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .animate-shine {
          animation: shine 8s linear infinite;
        }
      `}</style>

            <audio ref={audioRef} onEnded={handleAudioEnded} className="hidden" />

            {/* Tombol Settings Melayang Khusus Mode Fullscreen */}
            {effectivePrayer.mode !== 'countdown' && effectivePrayer.mode !== 'jumat_jeda' && (
                <button onClick={openSettings} className="absolute top-8 right-8 p-4 bg-black/40 hover:bg-black/60 rounded-xl backdrop-blur-md transition shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-white/20 text-white cursor-pointer z-[60]">
                    <MoreVertical size={28} />
                </button>
            )}

            {/* Kontainer Utama */}
            <div className="w-full h-full rounded-none flex flex-col overflow-hidden border-0 relative" style={{ backgroundColor: settings.mainBgColor || '#f1f5f9', backgroundImage: `url('https://www.transparenttextures.com/patterns/arabesque.png')`, backgroundSize: '300px' }}>

                {/* === HEADER === */}
                {(effectivePrayer.mode === 'countdown' || effectivePrayer.mode === 'jumat_jeda') && (activeJumat || modeTampilan === 'normal') && (
                    <div className="flex items-stretch bg-[length:200%_auto] animate-shine border-b border-white/20 shadow-[0_5px_25px_rgba(0,0,0,0.3)] z-10 relative" style={{ background: `linear-gradient(to right, ${settings.headerGradientFrom || '#1e3a8a'}, ${settings.headerGradientTo || '#3b82f6'}, ${settings.headerGradientFrom || '#1e3a8a'})`, backgroundSize: '200% auto' }}>
                        
                        {/* Kiri: Tanggal Atas Bawah (w-1/3 sejajar dengan jam) */}
                        <div className="w-1/3 flex flex-col justify-center items-center text-center py-4 border-r border-white/20" style={{ color: settings.headerTextColor || '#ffffff' }}>
                            <span className="text-2xl xl:text-3xl font-black uppercase drop-shadow-md leading-tight">{masehiDateStr}</span>
                            <span className="text-xl xl:text-2xl font-black uppercase drop-shadow-md leading-tight text-yellow-300">{hijriDate}</span>
                        </div>

                        {/* Kanan: Nama Masjid (w-2/3 tepat di atas video) */}
                        <div className="w-2/3 flex items-center justify-center relative py-4">
                            <div className="flex flex-col items-center justify-center text-center">
                                <span className="text-5xl xl:text-6xl font-black tracking-widest drop-shadow-lg uppercase" style={{ color: settings.headerTextColor || '#ffffff' }}>{settings.mosqueName}</span>
                                <span className="text-lg font-semibold tracking-wide mt-1 drop-shadow-md flex items-center justify-center gap-1 opacity-90" style={{ color: settings.headerTextColor || '#ffffff' }}><MapPin size={18} /> {settings.mosqueAddress}</span>
                            </div>
                            
                            {/* Tombol Settings */}
                            <button onClick={openSettings} className="absolute right-6 p-3 bg-white/20 hover:bg-white/40 rounded-xl backdrop-blur-md transition shadow-[0_0_10px_rgba(255,255,255,0.2)] border border-white/30 text-white cursor-pointer z-50">
                                <MoreVertical size={24} />
                            </button>
                        </div>
                    </div>
                )}

                {/* === KONTEN TENGAH === */}
                <div className={`flex-1 flex gap-0 z-10 relative min-h-0 ${(effectivePrayer.mode === 'countdown' || effectivePrayer.mode === 'jumat_jeda') ? 'px-0 mb-0 mt-0' : 'p-0 m-0'}`}>
                    {renderMainContent()}
                </div>

                {/* === JADWAL BAWAH (Dengan warna berubah jika mendekati waktu/saat persiapan adzan) === */}
                {(effectivePrayer.mode === 'countdown' || effectivePrayer.mode === 'jumat_jeda') && (activeJumat || modeTampilan === 'normal') && (
                    <div className="flex gap-0 z-10 w-full">
                        {activeJumat ? (
                            <div className="flex-1 rounded-none overflow-hidden flex items-center justify-center px-10 transition-all duration-300 gap-10 py-2" style={{ backgroundColor: settings.jumatDzuhurBg || '#059669', color: settings.jumatDzuhurText || '#ffffff' }}>
                                <span className="font-black text-4xl xl:text-5xl uppercase tracking-widest drop-shadow-md">SHOLAT JUM'AT</span>
                                <span className="font-black text-5xl xl:text-6xl tracking-widest drop-shadow-md">-</span>
                                <span className="font-black text-6xl xl:text-7xl tracking-widest drop-shadow-lg tabular-nums animate-pulse">{prayerTimes ? prayerTimes['Dzuhur'] : "--:--"}</span>
                            </div>
                        ) : (
                            (() => {
                                const list = [];
                                if (settings.showImsak) {
                                    const shubuhTime = prayerTimes ? prayerTimes['Shubuh'] : null;
                                    let imsakTime = '--:--';
                                    if (shubuhTime) {
                                        const [h, m] = shubuhTime.split(':').map(Number);
                                        let tm = h * 60 + m - 10;
                                        if (tm < 0) tm += 24 * 60;
                                        imsakTime = `${String(Math.floor(tm / 60)).padStart(2, '0')}:${String(tm % 60).padStart(2, '0')}`;
                                    }
                                    list.push({ name: 'Imsak', timeStr: imsakTime });
                                }
                                list.push({ name: 'Shubuh', timeStr: prayerTimes ? prayerTimes['Shubuh'] : '--:--' });
                                if (settings.showSyuruq !== false) {
                                    list.push({ name: 'Syuruq', timeStr: prayerTimes ? prayerTimes['Syuruq'] : '--:--' });
                                }
                                list.push({ name: 'Dzuhur', timeStr: prayerTimes ? prayerTimes['Dzuhur'] : '--:--' });
                                list.push({ name: 'Ashar', timeStr: prayerTimes ? prayerTimes['Ashar'] : '--:--' });
                                list.push({ name: 'Maghrib', timeStr: prayerTimes ? prayerTimes['Maghrib'] : '--:--' });
                                list.push({ name: 'Isya', timeStr: prayerTimes ? prayerTimes['Isya'] : '--:--' });

                                return list.map(({ name, timeStr }) => {
                                    const isNext = nextPrayer.name === name;
                                    const isWarning = isNext && (nextPrayer.isNear || nextPrayer.mode === 'preadzan');
                                    const cardBg = isWarning ? '#b91c1c' : isNext ? (settings.cardHighlightColor || '#1e40af') : (settings.cardBgColor || '#1d4ed8');
                                    const headerBg = isWarning ? 'rgba(239,68,68,0.8)' : isNext ? 'rgba(96,165,250,0.3)' : 'rgba(0,0,0,0.2)';

                                    return (
                                        <div key={name}
                                            className={`flex-1 rounded-none overflow-hidden flex flex-col transition-all duration-300 ${isNext ? 'z-10 shadow-[0_-8px_20px_rgba(0,0,0,0.4)]' : ''}`}
                                            style={{ backgroundColor: cardBg }}>

                                            <div className="py-1 text-center transition-colors" style={{ backgroundColor: headerBg }}>
                                                <span className="font-black text-2xl uppercase tracking-widest drop-shadow-md" style={{ color: settings.cardTextColor || '#ffffff' }}>{name}</span>
                                            </div>

                                            <div className="py-3 text-center">
                                                <span className={`text-5xl xl:text-6xl font-black tracking-widest drop-shadow-lg ${isNext && nextPrayer.mode === 'countdown' ? 'animate-pulse' : ''}`} style={{ color: settings.cardTextColor || '#ffffff' }}>{timeStr}</span>
                                            </div>
                                        </div>
                                    );
                                });
                            })()
                        )}
                    </div>
                )}

                {/* === MARQUEE GRADASI BIRU BERKILAU === */}
                {(effectivePrayer.mode === 'countdown' || effectivePrayer.mode === 'jumat_jeda') && (activeJumat || modeTampilan === 'normal') && (
                    <div className="py-4 px-0 z-10 animate-shine bg-[length:200%_auto]" style={activeJumat ? { background: `linear-gradient(to right, ${settings.jumatBgFrom || '#064e3b'}, ${settings.jumatBgTo || '#0f172a'})` } : { background: `linear-gradient(to right, ${settings.marqueeBgFrom || '#1d4ed8'}, ${settings.marqueeBgTo || '#93c5fd'}, ${settings.marqueeBgFrom || '#1d4ed8'})`, backgroundSize: '200% auto' }}>
                        <marquee className="text-4xl xl:text-5xl font-black tracking-wider drop-shadow-md flex items-center uppercase" style={{ color: activeJumat ? (settings.jumatAccent || '#fbbf24') : (settings.marqueeTextColor || '#ffffff') }} scrollamount="12">
                            {activeJumat ? (settings.jumatTickerText || "KEUTAMAAN HARI JUMAT: PERBANYAKLAH SHALAWAT, BACA SURAT AL-KAHFI, DAN BERSEGERALAH MENUJU MASJID UNTUK SHALAT JUMAT.") : combinedMarqueeText}
                        </marquee>
                    </div>
                )}
            </div>



            {/* MODAL PENGATURAN SUPER LENGKAP */}
            {isSettingsOpen && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50">
                            <h2 className="text-2xl font-bold text-slate-800">Sistem Pengaturan Masjid</h2>
                            <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-red-500 bg-slate-200 hover:bg-red-100 p-2 rounded-full transition"><X size={24} /></button>
                        </div>

                        <div className="flex flex-wrap bg-slate-100 border-b border-slate-200">
                            {['umum', 'media', 'jadwal', 'jumat', 'warna', 'rotasi', 'qrcode'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition whitespace-nowrap px-3 ${activeTab === tab ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    {tab === 'umum' ? 'Informasi & Teks' : tab === 'media' ? 'Media & Tampilan' : tab === 'jadwal' ? 'Jadwal & Iqomah' : tab === 'jumat' ? '🕌 Tampilan Jum\'at' : tab === 'warna' ? '🎨 Warna & Tema' : tab === 'rotasi' ? '🔄 Rotasi & Hari Besar' : '📱 QR Admin'}
                                </button>
                            ))}
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">

                            {/* TAB UMUM & TEKS */}
                            {activeTab === 'umum' && (
                                <div className="grid grid-cols-2 gap-6 animate-fadeIn">
                                    <div className="flex flex-col gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Daftar Quote / Ayat / Hadits (Max 20)</label>
                                            <textarea value={quotesText} onChange={(e) => setQuotesText(e.target.value)} className="w-full p-3 rounded-lg border border-slate-300 outline-none resize-none h-32 text-sm" placeholder="Isi Quote | Sumber" />
                                            <p className="text-xs text-slate-500 mt-1">Pisahkan tiap quote dengan 2x Enter (Baris Kosong). Gunakan karakter "|" di ujung untuk penamaan sumber referensi.</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Masjid</label>
                                            <input type="text" value={tempSettings.mosqueName} onChange={(e) => setTempSettings({ ...tempSettings, mosqueName: e.target.value })} className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Alamat / Lokasi</label>
                                            <input type="text" value={tempSettings.mosqueAddress} onChange={(e) => setTempSettings({ ...tempSettings, mosqueAddress: e.target.value })} className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Kota (Akurasi Jadwal API)</label>
                                            <input type="text" value={tempSettings.city} onChange={(e) => setTempSettings({ ...tempSettings, city: e.target.value })} className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                            <h4 className="text-sm font-bold text-yellow-800 mb-3 flex items-center gap-2">💰 Form Laporan Keuangan Masjid</h4>
                                            <div className="grid grid-cols-2 gap-2 mb-2">
                                                <div>
                                                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Pemasukan (Rp)</label>
                                                    <input type="text" value={formKeuangan.pemasukan} onChange={e => setFormKeuangan({ ...formKeuangan, pemasukan: e.target.value })} className="w-full p-2 text-sm rounded-lg border border-slate-300 outline-none" placeholder="cth: 2.500.000" />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Pengeluaran (Rp)</label>
                                                    <input type="text" value={formKeuangan.pengeluaran} onChange={e => setFormKeuangan({ ...formKeuangan, pengeluaran: e.target.value })} className="w-full p-2 text-sm rounded-lg border border-slate-300 outline-none" placeholder="cth: 800.000" />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Saldo Kas Masjid (Rp)</label>
                                                    <input type="text" value={formKeuangan.saldo} onChange={e => setFormKeuangan({ ...formKeuangan, saldo: e.target.value })} className="w-full p-2 text-sm rounded-lg border border-slate-300 outline-none" placeholder="cth: 15.200.000" />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Catatan (opsional)</label>
                                                    <input type="text" value={formKeuangan.catatan} onChange={e => setFormKeuangan({ ...formKeuangan, catatan: e.target.value })} className="w-full p-2 text-sm rounded-lg border border-slate-300 outline-none" placeholder="cth: Infaq Jumat" />
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => {
                                                const tgl = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                                                const lines = [
                                                    'LAPORAN KEUANGAN MASJID NURUL HUDA',
                                                    'Tanggal: ' + tgl,
                                                    '',
                                                    'Pemasukan  : Rp ' + (formKeuangan.pemasukan || '0'),
                                                    'Pengeluaran: Rp ' + (formKeuangan.pengeluaran || '0'),
                                                    'Saldo Kas  : Rp ' + (formKeuangan.saldo || '0'),
                                                    formKeuangan.catatan ? 'Catatan    : ' + formKeuangan.catatan : null,
                                                    '',
                                                    'Demikian laporan keuangan ini disampaikan. Semoga Allah SWT memberkahi harta yang diinfaqkan di jalan-Nya. Aamiin.'
                                                ].filter(l => l !== null).join('\n');
                                                setKeuanganPreview(lines);
                                                setTempSettings({ ...tempSettings, keuanganText: 'Pemasukan: Rp ' + formKeuangan.pemasukan + ' | Pengeluaran: Rp ' + formKeuangan.pengeluaran + ' | Saldo Kas Masjid: Rp ' + formKeuangan.saldo });
                                            }} className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-bold rounded-lg transition">⚡ Generate Laporan</button>
                                            {keuanganPreview && (
                                                <div className="mt-3">
                                                    <label className="text-xs font-bold text-green-700 block mb-1">✅ Preview Teks Laporan:</label>
                                                    <textarea readOnly value={keuanganPreview} className="w-full p-2 text-xs rounded-lg border border-green-300 bg-green-50 resize-none h-28 font-mono" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Teks Berjalan Utama (Marquee)</label>
                                            <textarea value={tempSettings.marqueeText} onChange={(e) => setTempSettings({ ...tempSettings, marqueeText: e.target.value })} className="w-full p-3 rounded-lg border border-slate-300 outline-none resize-none h-16" />
                                        </div>
                                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                                            <h4 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">🕌 Form Petugas Khutbah Jumat</h4>
                                            <div className="flex flex-col gap-2">
                                                <div>
                                                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Tanggal Jumat</label>
                                                    <input type="date" value={formPetugas.tanggal} onChange={e => {
                                                        const d = new Date(e.target.value);
                                                        if (d.getDay() !== 5) { alert('Harap pilih hari Jumat!'); return; }
                                                        setFormPetugas({ ...formPetugas, tanggal: e.target.value });
                                                    }} className="w-full p-2 text-sm rounded-lg border border-slate-300 outline-none" />
                                                </div>
                                                {[{ key: 'muadzin', label: 'Muadzin' }, { key: 'bilal', label: 'Bilal' }, { key: 'khotib', label: 'Khotib' }, { key: 'imam', label: 'Imam' }].map(({ key, label }) => {
                                                    const combinedPetugas = [...new Set([...NAMA_PETUGAS, ...(tempSettings.extraPetugas || [])])].sort();
                                                    return (
                                                        <div key={key}>
                                                            <label className="text-xs font-semibold text-slate-600 mb-1 block">{label}</label>
                                                            <select value={formPetugas[key]} onChange={e => setFormPetugas({ ...formPetugas, [key]: e.target.value })} className="w-full p-2 text-sm rounded-lg border border-slate-300 outline-none bg-white">
                                                                <option value="">-- Pilih {label} --</option>
                                                                {combinedPetugas.map(n => <option key={n} value={n}>{n}</option>)}
                                                            </select>
                                                        </div>
                                                    );
                                                })}
                                                
                                                <div className="mt-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                                    <label className="text-xs font-semibold text-emerald-800 mb-2 block">Tambah Nama Petugas Baru</label>
                                                    <div className="flex gap-2">
                                                        <input type="text" value={newPetugasName} onChange={e => setNewPetugasName(e.target.value)} placeholder="Nama Lengkap & Gelar" className="flex-1 p-2 text-sm rounded-lg border border-emerald-300 outline-none focus:border-emerald-500" />
                                                        <button type="button" onClick={() => {
                                                            const val = newPetugasName.trim();
                                                            const combinedPetugas = [...new Set([...NAMA_PETUGAS, ...(tempSettings.extraPetugas || [])])];
                                                            if (val && !combinedPetugas.includes(val)) {
                                                                setTempSettings({ ...tempSettings, extraPetugas: [...(tempSettings.extraPetugas || []), val] });
                                                                setNewPetugasName('');
                                                            } else if (combinedPetugas.includes(val)) {
                                                                alert('Nama petugas sudah ada di daftar!');
                                                            }
                                                        }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors">+</button>
                                                    </div>
                                                </div>

                                                <button type="button" onClick={() => {
                                                    const tglObj = new Date(formPetugas.tanggal + 'T00:00:00');
                                                    const tglStr = tglObj.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                                                    const txt = `Khatib: ${formPetugas.khotib || '-'} | Imam: ${formPetugas.imam || '-'} | Muadzin: ${formPetugas.muadzin || '-'} | Bilal: ${formPetugas.bilal || '-'} | Tanggal: ${tglStr}`;
                                                    setTempSettings({ ...tempSettings, khatibText: txt });
                                                }} className="w-full py-2 mt-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition">✅ Terapkan ke Tampilan Jumat</button>
                                                {tempSettings.khatibText && (
                                                    <p className="text-xs text-emerald-700 bg-emerald-100 p-2 rounded-lg border border-emerald-200 break-words">{tempSettings.khatibText}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Informasi Acara & Kegiatan Masjid</label>
                                            <textarea value={tempSettings.acaraText} onChange={(e) => setTempSettings({ ...tempSettings, acaraText: e.target.value })} className="w-full p-3 rounded-lg border border-slate-300 outline-none resize-none h-24" placeholder="Misal: Kajian Ba'da Maghrib Rutin | Rapat Takmir" />
                                            <p className="text-xs text-slate-500 mt-1">Gunakan karakter "|" untuk pindah baris.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB MEDIA */}
                            {activeTab === 'media' && (
                                <div className="flex flex-col gap-6 animate-fadeIn">
                                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl shadow-sm">
                                        <h3 className="text-lg font-bold text-blue-800 mb-3 border-b border-blue-200 pb-2">Pengaturan Audio & Murottal</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1 bg-white p-3 rounded-lg border border-slate-200 shadow-sm col-span-2">
                                                <div className="flex justify-between items-center mb-1">
                                                    <label className="text-sm font-semibold text-slate-700">Upload File MP3 Tarhim Subuh Lokal (Opsional)</label>
                                                    {tarhimFileName && <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded border border-green-200 select-none">✓ {tarhimFileName}</span>}
                                                </div>
                                                <input type="file" accept="audio/mp3,audio/mpeg,audio/*" onChange={handleTarhimUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition border border-slate-300 rounded p-1 cursor-pointer" />
                                                <span className="text-xs text-slate-500 italic mt-1">*Sistem secara bawaan akan memutar Tarhim Nurul Huda secara online. Anda bisa upload MP3 lokal jika ingin menggunakan file sendiri.</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Mode Tampilan Layar Utama</label>
                                            <select value={tempSettings.displayMode} onChange={(e) => setTempSettings({ ...tempSettings, displayMode: e.target.value })} className="w-full p-3 rounded-lg border border-slate-300 outline-none">
                                                <option value="image">Hanya Gambar Background</option>
                                                <option value="video">Hanya Video YouTube</option>
                                                <option value="both">Keduanya (Bergantian / 1 Menit)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Link Video YouTube</label>
                                            <input type="text" value={tempSettings.youtubeLink} onChange={(e) => setTempSettings({ ...tempSettings, youtubeLink: e.target.value })} className="w-full p-3 rounded-lg border border-slate-300 outline-none" placeholder="Contoh: https://youtu.be/a3MeLj37S8w" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-4 border border-slate-200 p-4 rounded-xl bg-white/50">
                                        <div className="flex flex-col gap-2">
                                            <label className="block text-sm font-bold text-slate-700">A. Upload Gambar dari Komputer</label>
                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition border border-slate-200 rounded-lg p-2" />
                                        </div>
                                        <div className="flex flex-col gap-2 relative">
                                            <label className="block text-sm font-bold text-slate-700 mt-2 border-t pt-4">B. Atau via Link Internet</label>
                                            <div className="flex gap-2">
                                                <input type="text" id="imgUrlInput" placeholder="Masukkan Link (http://...)" className="w-full p-3 rounded-lg border border-slate-300 outline-none focus:border-blue-500 text-sm" />
                                                <button type="button" onClick={() => {
                                                    const val = document.getElementById('imgUrlInput').value;
                                                    if (val) { setImagesList([...imagesList, val]); document.getElementById('imgUrlInput').value = ''; }
                                                }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition text-sm whitespace-nowrap">Tambah Link</button>
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Daftar Tayangan Gambar Akhir ({imagesList.length}/10)</label>
                                            <div className="flex flex-wrap gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 min-h-[100px] items-center justify-center">
                                                {imagesList.map((src, i) => (
                                                    <div key={i} className="relative group w-24 h-16 bg-slate-200 rounded-md overflow-hidden border border-slate-300 shadow-sm cursor-pointer hover:ring-2 ring-red-400">
                                                        <img src={src} className="w-full h-full object-cover" />
                                                        <button type="button" onClick={() => setImagesList(imagesList.filter((_, idx) => idx !== i))} className="absolute right-1 top-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-md" title="Hapus Gambar">
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                                {imagesList.length === 0 && <span className="text-slate-400 text-sm italic m-auto">Belum ada gambar yang dimasukkan.</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Link MP3 Murottal</label>
                                        <textarea value={audioText} onChange={(e) => setAudioText(e.target.value)} className="w-full p-3 rounded-lg border border-slate-300 outline-none whitespace-nowrap overflow-x-auto h-32 text-sm" />
                                    </div>
                                </div>
                            )}

                            {/* TAB JADWAL & IQOMAH */}
                            {activeTab === 'jadwal' && (
                                <div className="animate-fadeIn">
                                    <div className="grid grid-cols-2 gap-6 mb-6">
                                        <div className="p-4 bg-white/80 border border-slate-200 rounded-xl shadow-sm">
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Koreksi Tanggal Hijriah (Hari)</label>
                                            <div className="flex items-center gap-4">
                                                <input type="number" value={tempSettings.hijriOffset || 0} onChange={(e) => setTempSettings({ ...tempSettings, hijriOffset: Number(e.target.value) })} className="w-24 p-3 text-center rounded-lg border border-slate-300 outline-none" />
                                            </div>
                                            <span className="text-xs text-slate-500 mt-2 block">Angka minus (-) untuk mundur, plus (+) untuk maju.</span>
                                        </div>
                                        <div className="p-4 bg-white/80 border border-slate-200 rounded-xl shadow-sm">
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Durasi Tampilan Adzan (Menit)</label>
                                            <div className="flex items-center gap-4">
                                                <input type="number" value={tempSettings.adzanDuration || 2} onChange={(e) => setTempSettings({ ...tempSettings, adzanDuration: Number(e.target.value) })} className="w-24 p-3 text-center rounded-lg border border-slate-300 outline-none" />
                                            </div>
                                            <span className="text-xs text-slate-500 mt-2 block">Berapa lama layar Adzan tayang sebelum hitung mundur Iqomah.</span>
                                        </div>
                                    </div>

                                    {/* Card Volume Beep */}
                                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 shadow-sm mb-6">
                                        <h3 className="text-base font-bold text-orange-800 mb-4 flex items-center gap-2">
                                            🔔 Pengaturan Volume Beep Notifikasi
                                        </h3>
                                        <p className="text-xs text-orange-700 mb-4 font-semibold">
                                            Beep adalah suara notifikasi saat transisi adzan, iqomah, dan pergantian jam. 
                                            Atur volume-nya terpisah dari MP3 murottal agar tidak mengagetkan jamaah 
                                            saat volume speaker dikeraskan.
                                        </p>

                                        {/* Slider Volume */}
                                        <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-orange-200 shadow-inner mb-4">
                                            <span className="text-2xl">🔕</span>
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.05"
                                                value={tempSettings.beepVolume ?? 0.3}
                                                onChange={e => setTempSettings({
                                                    ...tempSettings,
                                                    beepVolume: parseFloat(e.target.value)
                                                })}
                                                className="flex-1 accent-orange-500 cursor-pointer"
                                            />
                                            <span className="text-2xl">🔔</span>
                                            <div className="bg-orange-100 border border-orange-300 rounded-lg px-4 py-2 min-w-[64px] text-center">
                                                <span className="text-lg font-black text-orange-700">
                                                    {Math.round((tempSettings.beepVolume ?? 0.3) * 100)}%
                                                </span>
                                            </div>
                                        </div>

                                        {/* Tombol Test Beep */}
                                        <div className="flex flex-wrap gap-3">
                                            <span className="text-sm font-bold text-orange-800 self-center mr-2">
                                                Test Suara:
                                            </span>

                                            {/* Test Preadzan */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const vol = tempSettings.beepVolume ?? 0.3;
                                                    const ctx = new (window.AudioContext || window.webkitAudioContext)();
                                                    const osc = ctx.createOscillator();
                                                    const gain = ctx.createGain();
                                                    const comp = ctx.createDynamicsCompressor();
                                                    comp.threshold.value = -20; comp.knee.value = 10;
                                                    comp.ratio.value = 8; comp.attack.value = 0.003; comp.release.value = 0.1;
                                                    osc.connect(gain); gain.connect(comp); comp.connect(ctx.destination);
                                                    osc.frequency.value = 880; osc.type = 'sine';
                                                    const sv = Math.min(1.0 * vol * 0.05, 0.5);
                                                    gain.gain.setValueAtTime(0, ctx.currentTime);
                                                    gain.gain.linearRampToValueAtTime(sv, ctx.currentTime + 0.02);
                                                    gain.gain.setValueAtTime(sv, ctx.currentTime + 0.92);
                                                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
                                                    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 1.05);
                                                }}
                                                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-black rounded-lg shadow transition flex items-center gap-2"
                                            >
                                                🔔 Pra-Adzan
                                            </button>

                                            {/* Test Adzan */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const vol = tempSettings.beepVolume ?? 0.3;
                                                    const ctx = new (window.AudioContext || window.webkitAudioContext)();
                                                    const osc = ctx.createOscillator();
                                                    const gain = ctx.createGain();
                                                    const comp = ctx.createDynamicsCompressor();
                                                    comp.threshold.value = -20; comp.knee.value = 10;
                                                    comp.ratio.value = 8; comp.attack.value = 0.003; comp.release.value = 0.1;
                                                    osc.connect(gain); gain.connect(comp); comp.connect(ctx.destination);
                                                    osc.frequency.value = 1046; osc.type = 'sine';
                                                    const sv = Math.min(1.0 * vol * 0.05, 0.5);
                                                    gain.gain.setValueAtTime(0, ctx.currentTime);
                                                    gain.gain.linearRampToValueAtTime(sv, ctx.currentTime + 0.02);
                                                    gain.gain.setValueAtTime(sv, ctx.currentTime + 0.92);
                                                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
                                                    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 1.05);
                                                }}
                                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-black rounded-lg shadow transition flex items-center gap-2"
                                            >
                                                🕌 Adzan
                                            </button>

                                            {/* Test Iqomah */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const vol = tempSettings.beepVolume ?? 0.3;
                                                    const ctx = new (window.AudioContext || window.webkitAudioContext)();
                                                    const osc = ctx.createOscillator();
                                                    const gain = ctx.createGain();
                                                    const comp = ctx.createDynamicsCompressor();
                                                    comp.threshold.value = -20; comp.knee.value = 10;
                                                    comp.ratio.value = 8; comp.attack.value = 0.003; comp.release.value = 0.1;
                                                    osc.connect(gain); gain.connect(comp); comp.connect(ctx.destination);
                                                    osc.frequency.value = 784; osc.type = 'sine';
                                                    const sv = Math.min(1.0 * vol * 0.05, 0.5);
                                                    gain.gain.setValueAtTime(0, ctx.currentTime);
                                                    gain.gain.linearRampToValueAtTime(sv, ctx.currentTime + 0.02);
                                                    gain.gain.setValueAtTime(sv, ctx.currentTime + 0.92);
                                                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
                                                    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 1.05);
                                                }}
                                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-black rounded-lg shadow transition flex items-center gap-2"
                                            >
                                                ⏱ Iqomah
                                            </button>

                                            {/* Test Saatnya Iqomat */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const vol = tempSettings.beepVolume ?? 0.3;
                                                    [0, 1.5, 3.0].forEach(jeda => {
                                                        setTimeout(() => {
                                                            const ctx = new (window.AudioContext || window.webkitAudioContext)();
                                                            const osc = ctx.createOscillator();
                                                            const gain = ctx.createGain();
                                                            const comp = ctx.createDynamicsCompressor();
                                                            comp.threshold.value = -20; comp.knee.value = 10;
                                                            comp.ratio.value = 8; comp.attack.value = 0.003; comp.release.value = 0.1;
                                                            osc.connect(gain); gain.connect(comp); comp.connect(ctx.destination);
                                                            osc.frequency.value = 987; osc.type = 'sine';
                                                            const dur = jeda === 3.0 ? 3.0 : 1.0;
                                                            const sv = Math.min(1.0 * vol * 0.05, 0.5);
                                                            gain.gain.setValueAtTime(0, ctx.currentTime);
                                                            gain.gain.linearRampToValueAtTime(sv, ctx.currentTime + 0.02);
                                                            gain.gain.setValueAtTime(sv, ctx.currentTime + dur - 0.08);
                                                            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
                                                            osc.start(ctx.currentTime); osc.stop(ctx.currentTime + dur + 0.05);
                                                        }, jeda * 1000);
                                                    });
                                                }}
                                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-black rounded-lg shadow transition flex items-center gap-2"
                                            >
                                                🕋 Saatnya Iqomat (3x)
                                            </button>

                                            {/* Test Pergantian Jam */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const vol = tempSettings.beepVolume ?? 0.3;
                                                    const ctx = new (window.AudioContext || window.webkitAudioContext)();
                                                    const osc = ctx.createOscillator();
                                                    const gain = ctx.createGain();
                                                    const comp = ctx.createDynamicsCompressor();
                                                    comp.threshold.value = -20; comp.knee.value = 10;
                                                    comp.ratio.value = 8; comp.attack.value = 0.003; comp.release.value = 0.1;
                                                    osc.connect(gain); gain.connect(comp); comp.connect(ctx.destination);
                                                    osc.frequency.value = 660; osc.type = 'sine';
                                                    const sv = Math.min(0.5 * vol * 0.05, 0.5);
                                                    gain.gain.setValueAtTime(0, ctx.currentTime);
                                                    gain.gain.linearRampToValueAtTime(sv, ctx.currentTime + 0.02);
                                                    gain.gain.setValueAtTime(sv, ctx.currentTime + 0.22);
                                                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                                                    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.35);
                                                }}
                                                className="px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white text-sm font-black rounded-lg shadow transition flex items-center gap-2"
                                            >
                                                🕐 Ganti Jam
                                            </button>
                                        </div>

                                        {/* Keterangan warna tombol */}
                                        <div className="mt-3 grid grid-cols-2 gap-2">
                                            {[
                                                { color: 'bg-yellow-100 border-yellow-300 text-yellow-800', label: '🔔 Pra-Adzan', desc: '10-17 menit sebelum adzan — frekuensi 880Hz' },
                                                { color: 'bg-blue-100 border-blue-300 text-blue-800', label: '🕌 Adzan', desc: 'Tepat waktu adzan tiba — frekuensi 1046Hz' },
                                                { color: 'bg-red-100 border-red-300 text-red-800', label: '⏱ Iqomah', desc: 'Transisi adzan ke iqomah — frekuensi 784Hz' },
                                                { color: 'bg-emerald-100 border-emerald-300 text-emerald-800', label: '🕋 Saatnya Iqomat', desc: '30 detik terakhir iqomah — 3x beep 987Hz' },
                                                { color: 'bg-slate-100 border-slate-300 text-slate-800', label: '🕐 Ganti Jam', desc: 'Setiap pergantian jam — frekuensi 660Hz pendek' },
                                            ].map(({ color, label, desc }) => (
                                                <div key={label} className={`text-xs p-2 rounded-lg border ${color} font-semibold`}>
                                                    {label} — {desc}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-5 gap-4 font-bold text-slate-600 mb-3 text-center text-sm border-b pb-2">
                                        <div className="text-left">Waktu</div>
                                        <div>Jam Pusat</div>
                                        <div>Murottal Aktif</div>
                                        <div>Offset (+/-)</div>
                                        <div>Iqomah (mnt)</div>
                                    </div>
                                    {['Shubuh', 'Syuruq', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'].map(waktu => (
                                        <div key={waktu} className="grid grid-cols-5 gap-4 items-center mb-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                            <div className="font-semibold text-slate-800">{waktu}</div>
                                            <div className="text-center font-mono text-slate-500 text-sm">{prayerTimes ? prayerTimes[waktu] : '--:--'}</div>
                                            <div className="flex items-center justify-center">
                                                {waktu !== 'Syuruq' ? (
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" checked={tempSettings.murottalActivePerPrayer ? tempSettings.murottalActivePerPrayer[waktu] !== false : tempSettings.murottalActive !== false} onChange={(e) => setTempSettings({ ...tempSettings, murottalActivePerPrayer: { ...(tempSettings.murottalActivePerPrayer || { Shubuh: true, Dzuhur: true, Ashar: true, Maghrib: true, Isya: true }), [waktu]: e.target.checked } })} className="sr-only peer" />
                                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                                    </label>
                                                ) : <span>-</span>}
                                            </div>
                                            <div className="flex items-center justify-center">
                                                <input type="number" value={tempSettings.prayerOffsets?.[waktu] || 0} onChange={e => setTempSettings({ ...tempSettings, prayerOffsets: { ...tempSettings.prayerOffsets, [waktu]: Number(e.target.value) } })} className="w-16 p-1 text-center rounded border border-slate-300 text-sm" />
                                            </div>
                                            <div className="flex items-center justify-center">
                                                {waktu !== 'Syuruq' ? (
                                                    <input type="number" min="0" value={tempSettings.iqomahDurations?.[waktu] || 0} onChange={e => setTempSettings({ ...tempSettings, iqomahDurations: { ...tempSettings.iqomahDurations, [waktu]: Number(e.target.value) } })} className="w-16 p-1 text-center rounded border border-slate-300 text-sm" />
                                                ) : <span>-</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* TAB JUMAT */}
                            {activeTab === 'jumat' && (
                                <div className="flex flex-col gap-6 animate-fadeIn">
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-xl font-black text-emerald-800 tracking-wider">PENGATURAN TAMPILAN KHUSUS JUM'AT</h3>
                                            <button onClick={() => {
                                                setIsJumatTest(!isJumatTest);
                                                setIsSettingsOpen(false);
                                            }} className={`px-6 py-3 rounded-xl font-black text-white shadow-lg transition-transform hover:scale-105 uppercase tracking-widest ${isJumatTest ? 'bg-red-600' : 'bg-emerald-600'}`}>
                                                {isJumatTest ? '✕ SELESAI TEST' : '▶ TEST TAMPILAN JUM\'AT'}
                                            </button>
                                        </div>
                                        <p className="text-sm text-emerald-700 mb-6 font-semibold">Tampilan ini otomatis aktif setiap hari Jum'at pukul 10:00 - 13:00 WIB. Klik "Test Tampilan" untuk mempratinjaunya kapan saja.</p>

                                        <label className="flex items-center justify-between cursor-pointer group p-4 bg-white rounded-xl border border-emerald-200 shadow-sm mb-6">
                                            <div className="flex flex-col">
                                                <span className="text-base font-black text-emerald-800">Aktifkan Tampilan Khusus Jum'at (Otomatis)</span>
                                                <span className="text-xs text-emerald-600 font-semibold">Matikan ini jika ada kesalahan agar layar kembali ke tampilan normal (Tes tetap bisa jalan).</span>
                                            </div>
                                            <div className="relative inline-flex items-center">
                                                <input type="checkbox" checked={tempSettings.jumatMasterActive !== false} onChange={e => setTempSettings({ ...tempSettings, jumatMasterActive: e.target.checked })} className="sr-only peer" />
                                                <div className="w-14 h-7 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
                                            </div>
                                        </label>

                                        <div className="grid grid-cols-2 gap-6">
                                            {/* Toggle Elements */}
                                            <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-inner flex flex-col gap-4">
                                                <h4 className="font-bold text-slate-800 uppercase text-sm border-b pb-2">Elemen Tampilan</h4>
                                                {[
                                                    { key: 'jumatShowPetugas', label: 'Tampilkan Bagian Petugas (Khatib, Imam, dll)' },
                                                    { key: 'jumatShowDzuhur', label: 'Tampilkan Countdown Waktu Dzuhur' },
                                                    { key: 'jumatShowAcara', label: 'Tampilkan Pengumuman & Acara' },
                                                    { key: 'jumatShowKeuangan', label: 'Tampilkan Laporan Keuangan' },
                                                    { key: 'jumatShowTicker', label: 'Tampilkan Ticker Ayat/Hadits Bawah' }
                                                ].map(({ key, label }) => (
                                                    <label key={key} className="flex items-center justify-between cursor-pointer group">
                                                        <span className="text-sm font-semibold text-slate-600 group-hover:text-emerald-700 transition">{label}</span>
                                                        <div className="relative inline-flex items-center">
                                                            <input type="checkbox" checked={tempSettings[key] !== false} onChange={e => setTempSettings({ ...tempSettings, [key]: e.target.checked })} className="sr-only peer" />
                                                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                                        </div>
                                                    </label>
                                                ))}
                                                <div className="mt-2 pt-4 border-t border-slate-100">
                                                    <label className="text-sm font-bold text-slate-700 mb-2 block">Ticker Ayat / Hadits Jum'at</label>
                                                    <textarea value={tempSettings.jumatTickerText || "KEUTAMAAN HARI JUMAT..."} onChange={e => setTempSettings({ ...tempSettings, jumatTickerText: e.target.value })} className="w-full p-3 rounded-lg border border-slate-300 outline-none resize-none h-24 text-sm focus:ring-2 focus:ring-emerald-500" />
                                                </div>
                                            </div>

                                            {/* Color Settings */}
                                            <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-inner flex flex-col gap-4">
                                                <div className="flex justify-between items-center border-b pb-2">
                                                    <h4 className="font-bold text-slate-800 uppercase text-sm">Warna Kustomisasi</h4>
                                                    <button onClick={() => setTempSettings({ ...tempSettings, jumatBgFrom: "#064e3b", jumatBgTo: "#0f172a", jumatTextPrimary: "#ffffff", jumatTextSecondary: "#a7f3d0", jumatAccent: "#fbbf24", jumatDzuhurBg: "#059669", jumatDzuhurText: "#ffffff", jumatBorder: "#10b981", jumatAcaraBg: "#1e3a5f", jumatKeuanganBg: "#3b2200" })} className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded font-bold text-slate-600 transition">↺ Reset Default</button>
                                                </div>
                                                <div className="flex flex-col gap-3 overflow-y-auto max-h-64 pr-2">
                                                    {[
                                                        { key: 'jumatBgFrom', label: 'Background Utama Awal' },
                                                        { key: 'jumatBgTo', label: 'Background Utama Akhir' },
                                                        { key: 'jumatTextPrimary', label: 'Teks Utama (Nama, Angka)' },
                                                        { key: 'jumatTextSecondary', label: 'Teks Sekunder (Label)' },
                                                        { key: 'jumatAccent', label: 'Aksen & Highlight' },
                                                        { key: 'jumatDzuhurBg', label: 'Background Waktu Dzuhur' },
                                                        { key: 'jumatDzuhurText', label: 'Teks Waktu Dzuhur' },
                                                        { key: 'jumatBorder', label: 'Border / Garis Kartu' },
                                                        { key: 'jumatAcaraBg', label: 'Background Panel Acara' },
                                                        { key: 'jumatKeuanganBg', label: 'Background Panel Keuangan' }
                                                    ].map(({ key, label }) => (
                                                        <div key={key} className="flex items-center justify-between gap-3">
                                                            <span className="text-xs font-semibold text-slate-600 truncate">{label}</span>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded border border-slate-300 shadow-inner" style={{ backgroundColor: tempSettings[key] || '#000' }} />
                                                                <input type="color" value={tempSettings[key] || '#000000'} onChange={e => setTempSettings({ ...tempSettings, [key]: e.target.value })} className="w-8 h-8 cursor-pointer rounded border border-slate-300 p-0 bg-white" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Durasi Prosesi Jumat */}
                                        <div className="mt-6 bg-white p-5 rounded-xl border border-emerald-200 shadow-inner flex flex-col gap-4">
                                            <h4 className="font-bold text-slate-800 uppercase text-sm border-b pb-2">Durasi Tampilan Prosesi Jumat (Menit)</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-xs font-bold text-slate-700 uppercase">Muadzin</label>
                                                    <input type="number" min="0" value={tempSettings.jumatDurations?.muadzin ?? 7} onChange={e => setTempSettings({ ...tempSettings, jumatDurations: { ...tempSettings.jumatDurations, muadzin: Number(e.target.value) } })} className="w-full p-2 text-center rounded border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-xs font-bold text-emerald-700 uppercase">Jeda</label>
                                                    <input type="number" min="0" value={tempSettings.jumatDurations?.jedaMB ?? 2} onChange={e => setTempSettings({ ...tempSettings, jumatDurations: { ...tempSettings.jumatDurations, jedaMB: Number(e.target.value) } })} className="w-full p-2 text-center rounded border border-emerald-300 bg-emerald-50 text-sm focus:ring-2 focus:ring-emerald-500" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-xs font-bold text-slate-700 uppercase">Bilal</label>
                                                    <input type="number" min="0" value={tempSettings.jumatDurations?.bilal ?? 7} onChange={e => setTempSettings({ ...tempSettings, jumatDurations: { ...tempSettings.jumatDurations, bilal: Number(e.target.value) } })} className="w-full p-2 text-center rounded border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-xs font-bold text-emerald-700 uppercase">Jeda</label>
                                                    <input type="number" min="0" value={tempSettings.jumatDurations?.jedaBK ?? 2} onChange={e => setTempSettings({ ...tempSettings, jumatDurations: { ...tempSettings.jumatDurations, jedaBK: Number(e.target.value) } })} className="w-full p-2 text-center rounded border border-emerald-300 bg-emerald-50 text-sm focus:ring-2 focus:ring-emerald-500" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-xs font-bold text-slate-700 uppercase">Khatib</label>
                                                    <input type="number" min="0" value={tempSettings.jumatDurations?.khatib ?? 15} onChange={e => setTempSettings({ ...tempSettings, jumatDurations: { ...tempSettings.jumatDurations, khatib: Number(e.target.value) } })} className="w-full p-2 text-center rounded border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-xs font-bold text-emerald-700 uppercase">Jeda</label>
                                                    <input type="number" min="0" value={tempSettings.jumatDurations?.jedaKI ?? 2} onChange={e => setTempSettings({ ...tempSettings, jumatDurations: { ...tempSettings.jumatDurations, jedaKI: Number(e.target.value) } })} className="w-full p-2 text-center rounded border border-emerald-300 bg-emerald-50 text-sm focus:ring-2 focus:ring-emerald-500" />
                                                </div>
                                                <div className="flex flex-col gap-1 col-span-2 md:col-span-1">
                                                    <label className="text-xs font-bold text-slate-700 uppercase">Imam</label>
                                                    <input type="number" min="0" value={tempSettings.jumatDurations?.imam ?? 7} onChange={e => setTempSettings({ ...tempSettings, jumatDurations: { ...tempSettings.jumatDurations, imam: Number(e.target.value) } })} className="w-full p-2 text-center rounded border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Murottal Khusus Jumat */}
                                        <div className="mt-6 bg-white p-5 rounded-xl border border-emerald-200 shadow-inner">
                                            <h4 className="font-bold text-slate-800 uppercase text-sm border-b pb-2 mb-4">Pengaturan Murottal Jum'at</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <label className="flex items-center justify-between cursor-pointer group p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                    <span className="text-sm font-semibold text-slate-700">Aktifkan Murottal Otomatis Jum'at</span>
                                                    <div className="relative inline-flex items-center">
                                                        <input type="checkbox" checked={tempSettings.jumatMurottalActive !== false} onChange={e => setTempSettings({ ...tempSettings, jumatMurottalActive: e.target.checked })} className="sr-only peer" />
                                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                                    </div>
                                                </label>
                                                {tempSettings.jumatMurottalActive !== false && (
                                                    <div className="flex flex-col gap-3">
                                                        <div className="flex items-center justify-around bg-slate-50 p-3 rounded-lg border border-slate-200">
                                                            <div className="flex flex-col gap-1">
                                                                <label className="text-xs font-bold text-slate-500 uppercase">Waktu Mulai</label>
                                                                <input type="time" value={tempSettings.jumatMurottalStart || "11:00"} onChange={e => setTempSettings({ ...tempSettings, jumatMurottalStart: e.target.value })} className="p-1 border border-slate-300 rounded outline-none text-sm font-semibold text-slate-700" />
                                                            </div>
                                                            <span className="text-slate-400 font-bold">-</span>
                                                            <div className="flex flex-col gap-1">
                                                                <label className="text-xs font-bold text-slate-500 uppercase">Waktu Berakhir</label>
                                                                <input type="time" value={tempSettings.jumatMurottalEnd || "11:45"} onChange={e => setTempSettings({ ...tempSettings, jumatMurottalEnd: e.target.value })} className="p-1 border border-slate-300 rounded outline-none text-sm font-semibold text-slate-700" />
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                                            <label className="text-xs font-bold text-slate-500 uppercase">Custom Link MP3 (Opsional)</label>
                                                            <input type="text" placeholder="https://link-murottal.mp3" value={tempSettings.jumatMurottalLink || ""} onChange={e => setTempSettings({ ...tempSettings, jumatMurottalLink: e.target.value })} className="w-full p-2 border border-slate-300 rounded outline-none text-sm font-semibold text-slate-700" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Testing Tombol Khusus Jumat */}
                                        <div className="mt-6 bg-white p-5 rounded-xl border border-emerald-200 shadow-inner">
                                            <h4 className="font-bold text-slate-800 uppercase text-sm border-b pb-2 mb-4">Pengujian Fitur Jum'at</h4>
                                            <div className="flex flex-wrap gap-3">
                                                <button onClick={() => {
                                                    if (audioRef.current) {
                                                        if (settings.jumatMurottalLink) audioRef.current.src = settings.jumatMurottalLink;
                                                        else playRandomMurottal();
                                                        audioRef.current.play().then(() => setIsPlaying(true));
                                                    }
                                                }} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-xs font-black shadow hover:bg-blue-600 transition tracking-widest uppercase">▶ Putar Murottal</button>
                                                <button onClick={() => { stopAudio(); }} className="px-4 py-2 bg-slate-500 text-white rounded-lg text-xs font-black shadow hover:bg-slate-600 transition tracking-widest uppercase">⏹ Stop Audio</button>
                                                
                                                <div className="w-[1px] h-8 bg-slate-300 mx-2 hidden sm:block"></div>
                                                
                                                {['Bilal', 'Muadzin', 'Khatib', 'Imam'].map(role => (
                                                    <button key={role} onClick={() => {
                                                        setTestProsesiJumat(role);
                                                        setTimeout(() => setTestProsesiJumat(null), 10000);
                                                        setIsSettingsOpen(false);
                                                    }} className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs font-black shadow hover:bg-emerald-600 transition tracking-widest uppercase flex items-center gap-1">
                                                        Test {role}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB WARNA & TEMA */}
                            {activeTab === 'warna' && (() => {
                                const colorFields = [
                                    { key: 'headerGradientFrom', label: 'Warna Awal Gradient Header' },
                                    { key: 'headerGradientTo', label: 'Warna Tengah Gradient Header' },
                                    { key: 'headerTextColor', label: 'Warna Teks Header (Nama Masjid & Tanggal)' },
                                    { key: 'cardBgColor', label: 'Warna Background Kartu Jadwal Sholat' },
                                    { key: 'cardTextColor', label: 'Warna Teks Waktu di Kartu Jadwal' },
                                    { key: 'cardHighlightColor', label: 'Warna Kartu Jadwal Aktif/Berikutnya' },
                                    { key: 'marqueeBgFrom', label: 'Warna Awal Gradient Marquee' },
                                    { key: 'marqueeBgTo', label: 'Warna Tengah Gradient Marquee' },
                                    { key: 'marqueeTextColor', label: 'Warna Teks Marquee' },
                                    { key: 'countdownBgColor', label: 'Warna Background Kotak Countdown' },
                                    { key: 'countdownTextColor', label: 'Warna Teks Countdown' },
                                    { key: 'quoteTextColor', label: 'Warna Teks Ayat / Quote' },
                                    { key: 'mainBgColor', label: 'Warna Background Utama Layar' },
                                ];
                                return (
                                    <div className="animate-fadeIn">
                                        <p className="text-xs text-slate-500 mb-4 italic">Warna diterapkan setelah klik <b>Simpan Pengaturan</b>. Kolom Quote Background mendukung format <code>rgba()</code>.</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {colorFields.map(({ key, label }) => (
                                                <div key={key} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3 shadow-sm gap-3">
                                                    <label className="text-sm font-semibold text-slate-700 flex-1">{label}</label>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-md border border-slate-300 shadow-inner" style={{ backgroundColor: tempSettings[key] || DEFAULT_SETTINGS[key] }} />
                                                        <input
                                                            type="color"
                                                            value={(() => { const v = tempSettings[key] || DEFAULT_SETTINGS[key]; if (v && v.startsWith('#')) return v; return '#ffffff'; })()}
                                                            onChange={e => setTempSettings({ ...tempSettings, [key]: e.target.value })}
                                                            className="w-10 h-9 cursor-pointer rounded border border-slate-300 p-0.5 bg-white"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            {/* quoteBgColor — text input karena mendukung rgba */}
                                            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3 shadow-sm gap-3 col-span-2">
                                                <label className="text-sm font-semibold text-slate-700 flex-1">Warna Background Kotak Quote (mendukung rgba)</label>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-md border border-slate-300 shadow-inner" style={{ backgroundColor: tempSettings.quoteBgColor || DEFAULT_SETTINGS.quoteBgColor }} />
                                                    <input
                                                        type="text"
                                                        value={tempSettings.quoteBgColor || DEFAULT_SETTINGS.quoteBgColor}
                                                        onChange={e => setTempSettings({ ...tempSettings, quoteBgColor: e.target.value })}
                                                        className="w-52 p-2 text-sm rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="cth: rgba(255,255,255,0.85)"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setTempSettings({ ...tempSettings, headerGradientFrom: '#1e3a8a', headerGradientTo: '#3b82f6', headerTextColor: '#ffffff', cardBgColor: '#1d4ed8', cardTextColor: '#ffffff', cardHighlightColor: '#1e40af', marqueeBgFrom: '#1d4ed8', marqueeBgTo: '#93c5fd', marqueeTextColor: '#ffffff', countdownBgColor: '#2563eb', countdownTextColor: '#ffffff', quoteTextColor: '#1e293b', quoteBgColor: 'rgba(255,255,255,0.85)', mainBgColor: '#f1f5f9' })}
                                            className="mt-4 px-4 py-2 text-sm rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition"
                                        >↺ Reset Warna ke Default</button>
                                    </div>
                                );
                            })()}

                            {/* TAB ROTASI & HARI BESAR */}
                            {activeTab === 'rotasi' && (
                                <div className="flex flex-col gap-6 animate-fadeIn">

                                    {/* A: Pengaturan Rotasi */}
                                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                                        <h3 className="text-base font-bold text-indigo-800 mb-3">🔄 Pengaturan Rotasi Tampilan</h3>
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                                                <span className="text-sm font-semibold text-slate-700">Aktifkan Rotasi Otomatis</span>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" checked={tempSettings.rotasiAktif !== false} onChange={e => setTempSettings({ ...tempSettings, rotasiAktif: e.target.checked })} className="sr-only peer" />
                                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                                </label>
                                            </div>
                                            <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200">
                                                <label className="text-sm font-semibold text-slate-700 flex-1">Durasi setiap tampilan (menit)</label>
                                                <input type="number" min="1" value={tempSettings.rotasiDurasi || 10} onChange={e => setTempSettings({ ...tempSettings, rotasiDurasi: Number(e.target.value) })} className="w-20 p-2 text-center rounded-lg border border-slate-300 outline-none text-sm" />
                                            </div>
                                            <div className="bg-white p-3 rounded-lg border border-slate-200">
                                                <label className="text-sm font-semibold text-slate-700 block mb-2">Tampilan yang dirotasi:</label>
                                                <div className="flex gap-4 flex-wrap">
                                                    {[
                                                        { val: 'normal', label: 'Normal' }, 
                                                        { val: 'petugas', label: 'Petugas Jumat' }, 
                                                        { val: 'keuangan', label: 'Keuangan' }, 
                                                        { val: 'haribesar', label: 'Hari Besar' },
                                                        ...(tempSettings.customViews || []).map((cv, idx) => ({ val: cv.id, label: `Custom ${idx + 1} (${cv.type === 'image' ? 'Gambar' : 'Teks'})` }))
                                                    ].map(({ val, label }) => (
                                                        <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
                                                            <input type="checkbox"
                                                                checked={(tempSettings.rotasiTampilan || ['normal', 'petugas', 'keuangan', 'haribesar']).includes(val)}
                                                                onChange={e => {
                                                                    const cur = tempSettings.rotasiTampilan || ['normal', 'petugas', 'keuangan', 'haribesar'];
                                                                    setTempSettings({ ...tempSettings, rotasiTampilan: e.target.checked ? [...cur, val] : cur.filter(x => x !== val) });
                                                                }}
                                                                className="w-4 h-4 rounded" />
                                                            {label}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>


                                    {/* Data Petugas dipindah sepenuhnya ke tab Umum */}

                                    {/* D: Data Hari Besar */}
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                        <h3 className="text-base font-bold text-amber-800 mb-3">🌙 Data Hari Besar Islam</h3>
                                        <div className="flex flex-col gap-2">
                                            {(tempSettings.hariBesar || []).map((h, i) => (
                                                <div key={i} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                                                    <input type="text" value={h.emoji || ''} onChange={e => { const arr = [...(tempSettings.hariBesar || [])]; arr[i] = { ...arr[i], emoji: e.target.value }; setTempSettings({ ...tempSettings, hariBesar: arr }); }} className="w-12 p-1 border border-slate-200 rounded text-center text-lg outline-none" placeholder="🌙" />
                                                    <input type="text" value={h.nama || ''} onChange={e => { const arr = [...(tempSettings.hariBesar || [])]; arr[i] = { ...arr[i], nama: e.target.value }; setTempSettings({ ...tempSettings, hariBesar: arr }); }} className="flex-1 p-1 border border-slate-200 rounded text-xs outline-none" placeholder="Nama Hari Besar" />
                                                    <input type="date" value={h.tanggal || ''} onChange={e => { const arr = [...(tempSettings.hariBesar || [])]; arr[i] = { ...arr[i], tanggal: e.target.value }; setTempSettings({ ...tempSettings, hariBesar: arr }); }} className="p-1 border border-slate-200 rounded text-xs outline-none" />
                                                    <input type="color" value={h.warna || '#1a5276'} onChange={e => { const arr = [...(tempSettings.hariBesar || [])]; arr[i] = { ...arr[i], warna: e.target.value }; setTempSettings({ ...tempSettings, hariBesar: arr }); }} className="w-10 h-8 cursor-pointer rounded border border-slate-300 p-0.5" />
                                                    <button type="button" onClick={() => setTempSettings({ ...tempSettings, hariBesar: (tempSettings.hariBesar || []).filter((_, j) => j !== i) })} className="text-red-500 hover:text-red-700 font-bold text-lg">✕</button>
                                                </div>
                                            ))}
                                        </div>
                                        <button type="button" onClick={() => setTempSettings({ ...tempSettings, hariBesar: [...(tempSettings.hariBesar || []), { emoji: '🌙', nama: '', tanggal: '', warna: '#1a5276' }] })} className="mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition">+ Tambah Hari Besar</button>
                                    </div>

                                    {/* E: Data Tampilan Custom */}
                                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                                        <h3 className="text-base font-bold text-purple-800 mb-3">✨ Tampilan Custom (Maks. 5)</h3>
                                        <div className="flex flex-col gap-3">
                                            {(tempSettings.customViews || []).map((cv, i) => (
                                                <div key={cv.id} className="flex flex-col gap-2 bg-white p-3 rounded-lg border border-purple-200 shadow-sm relative">
                                                    <button type="button" onClick={() => {
                                                        const newCustomViews = tempSettings.customViews.filter((_, j) => j !== i);
                                                        const newRotasiTampilan = (tempSettings.rotasiTampilan || []).filter(val => val !== cv.id);
                                                        setTempSettings({ ...tempSettings, customViews: newCustomViews, rotasiTampilan: newRotasiTampilan });
                                                    }} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-lg">✕</button>
                                                    <div className="flex gap-2 items-center w-full pr-8">
                                                        <select value={cv.type} onChange={e => { const arr = [...tempSettings.customViews]; arr[i] = { ...arr[i], type: e.target.value }; setTempSettings({ ...tempSettings, customViews: arr }); }} className="p-2 border border-slate-200 rounded text-sm outline-none font-bold text-purple-700 bg-purple-50">
                                                            <option value="image">Gambar Full</option>
                                                            <option value="text">Teks Custom</option>
                                                        </select>
                                                        <div className="flex items-center gap-1 flex-1">
                                                            <span className="text-xs text-slate-500 font-bold">Durasi(Mnt):</span>
                                                            <input type="number" min="1" value={cv.duration || 1} onChange={e => { const arr = [...tempSettings.customViews]; arr[i] = { ...arr[i], duration: Number(e.target.value) }; setTempSettings({ ...tempSettings, customViews: arr }); }} className="w-16 p-2 border border-slate-200 rounded text-center text-sm outline-none" />
                                                        </div>
                                                    </div>
                                                    {cv.type === 'image' ? (
                                                        <div className="flex flex-col gap-2">
                                                            <input type="text" value={cv.src || ''} onChange={e => { const arr = [...tempSettings.customViews]; arr[i] = { ...arr[i], src: e.target.value }; setTempSettings({ ...tempSettings, customViews: arr }); }} className="w-full p-2 border border-slate-200 rounded text-sm outline-none" placeholder="URL Gambar / Base64" />
                                                            <div className="flex gap-2">
                                                                <label className="text-xs bg-purple-100 text-purple-700 px-3 py-2 rounded font-bold cursor-pointer hover:bg-purple-200 transition">
                                                                    Upload File
                                                                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                                                        const file = e.target.files[0];
                                                                        if (file) {
                                                                            try {
                                                                                const dataUrl = await compressImageFile(file, 1280, 75);
                                                                                const arr = [...tempSettings.customViews];
                                                                                arr[i] = { ...arr[i], src: dataUrl };
                                                                                setTempSettings({ ...tempSettings, customViews: arr });
                                                                            } catch (err) {
                                                                                alert("Gagal memproses gambar: " + (err.message || err));
                                                                            }
                                                                        }
                                                                    }} />
                                                                </label>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col gap-2">
                                                            <input type="text" value={cv.title || ''} onChange={e => { const arr = [...tempSettings.customViews]; arr[i] = { ...arr[i], title: e.target.value }; setTempSettings({ ...tempSettings, customViews: arr }); }} className="w-full p-2 border border-slate-200 rounded text-sm outline-none font-bold" placeholder="Judul Pengumuman" />
                                                            <textarea value={cv.content || ''} onChange={e => { const arr = [...tempSettings.customViews]; arr[i] = { ...arr[i], content: e.target.value }; setTempSettings({ ...tempSettings, customViews: arr }); }} className="w-full p-2 border border-slate-200 rounded text-sm outline-none resize-none" rows="3" placeholder="Isi teks custom..."></textarea>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        {(tempSettings.customViews || []).length < 5 && (
                                            <button type="button" onClick={() => setTempSettings({ ...tempSettings, customViews: [...(tempSettings.customViews || []), { id: `custom_${Date.now()}`, type: 'image', duration: 1, src: '', title: '', content: '' }] })} className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition">+ Tambah Tampilan Custom</button>
                                        )}
                                    </div>

                                </div>
                            )}

                            {/* TAB QR CODE */}
                            {activeTab === 'qrcode' && (
                                <div className="flex flex-col items-center justify-center gap-6 py-8 animate-fadeIn">
                                    <h3 className="text-xl font-bold text-slate-800">
                                        Scan untuk Buka Halaman Admin di HP
                                    </h3>
                                    <p className="text-sm text-slate-500 text-center max-w-sm">
                                        Buka kamera HP → scan QR Code ini → halaman pengaturan terbuka otomatis di browser HP
                                    </p>
                                    <div className="bg-white p-6 rounded-2xl shadow-xl border-4 border-emerald-400">
                                        <QRCodeSVG
                                            value={window.location.origin + window.location.pathname + '#admin'}
                                            size={220}
                                            level="M"
                                            includeMargin={true}
                                        />
                                    </div>
                                    <div className="bg-slate-100 border border-slate-300 rounded-xl px-6 py-3 text-center max-w-sm w-full">
                                        <p className="text-xs text-slate-500 mb-1 font-semibold uppercase">Atau ketik manual di browser HP:</p>
                                        <p className="text-sm font-bold text-slate-800 break-all select-all">
                                            {window.location.origin + window.location.pathname + '#admin'}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 max-w-md w-full mt-2">
                                        {[
                                            { step: '1', icon: '📷', text: 'Buka kamera HP' },
                                            { step: '2', icon: '🔍', text: 'Arahkan ke QR Code' },
                                            { step: '3', icon: '✅', text: 'Tap link yang muncul' },
                                        ].map(({ step, icon, text }) => (
                                            <div key={step} className="flex flex-col items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                                                <span className="text-2xl">{icon}</span>
                                                <span className="text-xs font-bold text-emerald-800">{text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>

                        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                            <button onClick={() => setIsSettingsOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 transition shadow-sm">Batal</button>
                            <button onClick={saveSettings} className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition transform hover:scale-105">Simpan Pengaturan</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tombol Debug */}
            <div className="absolute bottom-2 right-2 flex items-center gap-2 z-50 opacity-50 hover:opacity-100 transition">
                {cacheProgress.done < cacheProgress.total && (
                    <div className="text-xs text-white bg-black/50 px-3 py-1 rounded-full whitespace-nowrap">
                        Cache: {cacheProgress.done}/{cacheProgress.total} audio
                    </div>
                )}
                <button onClick={testAudio} className="bg-white text-slate-800 p-2 rounded-full shadow-lg transition flex items-center gap-2 text-xs font-bold"><Volume2 size={16} /></button>
                {isPlaying && <button onClick={stopAudio} className="bg-red-500 text-white p-2 rounded-full shadow-lg transition flex items-center gap-2 text-xs font-bold"><VolumeX size={16} /></button>}
            </div>

        </div>
    );
}