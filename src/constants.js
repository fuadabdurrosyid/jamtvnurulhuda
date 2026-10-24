// =====================================================
// constants.js — Shared antara App.jsx dan AdminPanel.jsx
// =====================================================

export const NAMA_PETUGAS = [
    "Acul Hidayat", "Adi Aca", "Airudin", "Al Hajja", "Al Hulid S.Pd.I",
    "Awalludin, S.Hi", "Dian Arianto S.Pd.I", "Duta", "Edo", "Fransisko",
    "Heri Arpanda", "Kecer", "Liberti", "Mang Ian", "Marzuki S.Pd.I",
    "Raju", "Sekter", "Sidi", "Yeyen"
];

export const MUROTTAL_LIST = [
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/001%20Al%20Faatihah.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/002%20Al%20Baqarah.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/003%20Ali%20'Imran.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/004%20An%20Nisaa'.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/005%20Al%20Maa-idah.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/018%20Al%20Kahfi.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/036%20Yaa%20siin.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/055%20Ar%20Rahmaan.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/067%20Al%20Mulk.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/112%20Al%20Ikhlash.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/113%20Al%20Falaq.mp3",
    "https://archive.org/download/AlQuranTerjemahanBahasaIndonesiaArabic/114%20An%20Naas.mp3",
];

export const DEFAULT_SETTINGS = {
    mosqueName: "MASJID NURUL HUDA",
    mosqueAddress: "Jl. Raya Desa Ujung Tanjung Kec. Tulung Selapan",
    city: "KAB. OGAN KOMERING ILIR",
    marqueeText: "HARAP HP DINON-AKTIFKAN ATAU DISETTING MODE SILENT SAAT BERADA DI DALAM MASJID. LURUSKAN DAN RAPATKAN SHAF SHOLAT.",
    khatibText: "Khatib: Ust. Usman | Imam: Ust. Abu Bakar | Muadzin: Ust. Ali | Bilal: Ust. Umar | Tanggal: 2026-04-24",
    acaraText: "Kajian Rutin Ba'da Maghrib Setiap Malam Ahad. | Santunan Anak Yatim Tanggal 15 Bulan Ini.",
    keuanganText: "Pemasukan Kotak Amal: Rp 2.500.000 | Pengeluaran: Rp 800.000 | Saldo Kas Masjid: Rp 15.200.000",
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
    jumatShowPetugas: true,
    jumatShowDzuhur: true,
    jumatShowAcara: true,
    jumatShowKeuangan: true,
    jumatShowTicker: true,
    jumatTickerText: "HAI ORANG-ORANG BERIMAN, APABILA DISERU UNTUK MENUNAIKAN SHALAT JUM'AT, MAKA BERSEGERALAH KAMU KEPADA MENGINGAT ALLAH DAN TINGGALKANLAH JUAL BELI. (QS. AL-JUMU'AH: 9)",
    jumatDurations: { bilal: 7, muadzin: 7, khatib: 15, imam: 10 },
    adminPin: "1234",
    showImsak: false,
    showSyuruq: true,
    showRamadhanCountdown: false,
    ramadhanTargetDate: "2027-02-08",
    showWakafTarawih: false,
    wakafTarawihData: [],
    showPetugasTarawih: false,
    petugasTarawihData: { malamKe: 1, imam: "", bilal: "" },
    
    // Feature 2: Sleep schedules
    sleepSchedules: [
        { id: "1", name: "Tidur Malam", start: "22:00", end: "03:00", enabled: true }
    ],
    
    // Feature 5: Visual Financial
    keuanganMode: "visual", // "text" | "visual"
    keuanganIncome: 2500000,
    keuanganExpense: 800000,
    keuanganTitle: "LAPORAN KAS MINGGUAN MASJID",
    
    // Feature 6: Berita Duka & Yasinan
    showBeritaDuka: false,
    beritaDukaData: {
        nama: "",
        usia: "",
        wafat: "",
        makam: "",
        rumahDuka: "",
        ttsEnabled: true,
        ttsTrigger: 0
    },
    showInfoYasinan: false,
    infoYasinanData: {
        malam: "Malam Jumat",
        pukul: "19:30",
        tuanRumah: "Bapak H. Ahmad",
        lokasi: "RT 02 RW 03 (Belakang Masjid)"
    },
};

/**
 * Kompresi gambar cerdas adaptif ke Base64 (JPEG)
 * Menghasilkan dataUrl sangat ringan (~40KB - 80KB) tapi tetap tajam di layar TV 1080p/4K.
 * Mencegah Firestore melebihi batas 1MB per dokumen.
 */
export const compressImageFile = (file, maxDimension = 1280, targetMaxKB = 75) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            return reject(new Error("File tidak ditemukan"));
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                let w = img.width;
                let h = img.height;
                if (w > h) {
                    if (w > maxDimension) {
                        h = Math.round((h * maxDimension) / w);
                        w = maxDimension;
                    }
                } else {
                    if (h > maxDimension) {
                        w = Math.round((w * maxDimension) / h);
                        h = maxDimension;
                    }
                }

                const canvas = document.createElement("canvas");
                canvas.width = Math.max(1, w);
                canvas.height = Math.max(1, h);
                const ctx = canvas.getContext("2d");
                
                // Background putih untuk transparansi PNG agar tidak hitam saat jadi JPEG
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                let quality = 0.75;
                let dataUrl = canvas.toDataURL("image/jpeg", quality);

                // Jika ukuran masih di atas targetMaxKB, kurangi quality secara adaptif
                const maxCharLength = targetMaxKB * 1024 * 1.37;
                while (dataUrl.length > maxCharLength && quality > 0.35) {
                    quality -= 0.1;
                    dataUrl = canvas.toDataURL("image/jpeg", quality);
                }

                resolve(dataUrl);
            };
            img.onerror = () => reject(new Error("Gagal membaca format gambar"));
            img.src = ev.target.result;
        };
        reader.onerror = () => reject(new Error("Gagal memuat file"));
        reader.readAsDataURL(file);
    });
};

