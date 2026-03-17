const fs = require('fs');
const path = require('path');

function mergeTranslations(locale, newKeys) {
    const filePath = path.join(__dirname, `src/locales/${locale}/messages.json`);
    let existing = {};
    if (fs.existsSync(filePath)) {
        existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    
    const merged = { ...existing, ...newKeys };
    const sorted = {};
    Object.keys(merged).sort().forEach(key => {
        sorted[key] = merged[key];
    });
    
    fs.writeFileSync(filePath, JSON.stringify(sorted, null, 2));
    console.log(`Merged ${Object.keys(newKeys).length} keys into ${locale}/messages.json. Total keys: ${Object.keys(sorted).length}`);
}

const idKeys = {
    "Memuat data survey...": "Memuat data survey...",
    "Gagal memuat survey": "Gagal memuat survey",
    "Terjadi kesalahan pada sistem.": "Terjadi kesalahan pada sistem.",
    "Belum ada survey": "Belum ada survey",
    "Belum ada tugas survey yang dibuat untuk pengajuan ini.": "Belum ada tugas survey yang dibuat untuk pengajuan ini.",
    "Assign Survey Baru": "Assign Survey Baru",
    "Daftar Survey": "Daftar Survey",
    "Survey Umum": "Survey Umum",
    "Assign Sekarang": "Assign Sekarang",
    "Mohon lengkapi semua field form": "Mohon lengkapi semua field form",
    "Memproses...": "Memproses...",
    "Gagal menugaskan survey: ": "Gagal menugaskan survey: ",
    "Cari template survey...": "Cari template survey...",
    "Pilih template survey yang akan ditugaskan untuk pengajuan ini.": "Pilih template survey yang akan ditugaskan untuk pengajuan ini.",
    "Gagal memuat data peminjam": "Gagal memuat data peminjam",
    "Tambah Peminjam Baru": "Tambah Peminjam Baru"
};

const enKeys = {
    "Memuat data survey...": "Loading survey data...",
    "Gagal memuat survey": "Failed to load survey",
    "Terjadi kesalahan pada sistem.": "A system error occurred.",
    "Belum ada survey": "No surveys available",
    "Belum ada tugas survey yang dibuat untuk pengajuan ini.": "No survey tasks have been created for this application.",
    "Assign Survey Baru": "Assign New Survey",
    "Daftar Survey": "Survey List",
    "Survey Umum": "General Survey",
    "Assign Sekarang": "Assign Now",
    "Mohon lengkapi semua field form": "Please complete all form fields",
    "Memproses...": "Processing...",
    "Gagal menugaskan survey: ": "Failed to assign survey: ",
    "Cari template survey...": "Search survey templates...",
    "Pilih template survey yang akan ditugaskan untuk pengajuan ini.": "Select the survey template to be assigned for this application.",
    "Gagal memuat data peminjam": "Failed to load borrower data",
    "Tambah Peminjam Baru": "Add New Borrower"
};

mergeTranslations('id', idKeys);
mergeTranslations('en', enKeys);
