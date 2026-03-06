export interface SlikHeader {
    nomorReferensi: string;
    tanggalPermintaan: string;
    waktuPermintaan: string;
    jenisPencarian: string;
    tujuanPermintaan: string;
}

export interface DataPokokDebitur {
    namaDebitur: string;
    jenisPenggunaanAkhir: string;
    noIdentitas: string;
    jenisIdentitas: string;
    tempatLahir: string;
    tanggalLahir: string;
    jenisKelamin: string;
    statusPerkawinan: string;
    pendidikan: string;
    pekerjaan: string;
    bidangUsaha: string;
    alamat: string;
    kelurahan: string;
    kecamatan: string;
    kota: string;
    kodePos: string;
    noTelp: string;
    npwp: string;
    namaPerusahaan: string;
    noId: string;
}

export interface RingkasanFasilitas {
    totalPlafon: string;
    totalBakiDebet: string;
    totalTunggakan: string;
    kondisiTerburuk: string;
    jumlahFasilitas: string;
    jumlahPemberiKredit: string;
}

export interface KolektibilitasBulanan {
    bulan: string;
    kolektibilitas: string;
}

export interface Agunan {
    jenisAgunan: string;
    nilaiAgunan: string;
    noAgunan: string;
}

export interface Penjamin {
    namaPenjamin: string;
    jenisIdentitas: string;
    noIdentitas: string;
}

export interface KreditPembiayaan {
    pelapor: string;
    cabangPelapor: string;
    jenisPenggunaanAkhir: string;
    tanggalDibentuk: string;
    tanggalJatuhTempo: string;
    plafon: string;
    realisasi: string;
    bakiDebet: string;
    tunggakan: string;
    kondisi: string;
    frekuensiTunggakan: string;
    nilaiAgunan: string;
    kolektibilitasBulanan: KolektibilitasBulanan[];
    agunan: Agunan[];
    penjamin: Penjamin[];
}

export interface SlikData {
    header: SlikHeader;
    individual: {
        dataPokokDebitur: DataPokokDebitur[];
        ringkasanFasilitas: RingkasanFasilitas;
        fasilitas: {
            kreditPembiayan: KreditPembiayaan[];
        };
    };
}

export interface DebtEntry {
    id: string;
    source: 'credit-bureau' | 'survey';
    creditor: string;
    plafon: string;
    bakiDebet: string;
    dueDate: string;
    status: string;
    kondisi: string;
    detail?: KreditPembiayaan;
}
