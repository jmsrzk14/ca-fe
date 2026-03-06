'use client';

import * as React from 'react';
import { Badge } from '@/shared/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/shared/ui/dialog';
import { KreditPembiayaan } from '../types';
import { formatRupiah } from '../mock-data';

interface FacilityDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    facility: KreditPembiayaan | null;
}

const KOLEKTIBILITAS_LABELS: Record<string, { label: string; color: string }> = {
    '0': { label: 'Tutup', color: 'bg-gray-100 text-gray-600' },
    '1': { label: 'Lancar', color: 'bg-emerald-500/10 text-emerald-600' },
    '2': { label: 'DPK', color: 'bg-amber-500/10 text-amber-600' },
    '3': { label: 'Kurang Lancar', color: 'bg-orange-500/10 text-orange-600' },
    '4': { label: 'Diragukan', color: 'bg-red-500/10 text-red-600' },
    '5': { label: 'Macet', color: 'bg-red-700/10 text-red-700' },
};

function getKolLabel(kol: string) {
    return KOLEKTIBILITAS_LABELS[kol] || { label: kol, color: 'bg-muted text-muted-foreground' };
}

export function FacilityDetailDialog({ open, onOpenChange, facility }: FacilityDetailDialogProps) {
    if (!facility) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-base">Detail Fasilitas Kredit</DialogTitle>
                    <DialogDescription>{facility.pelapor} - {facility.jenisPenggunaanAkhir}</DialogDescription>
                </DialogHeader>

                <div className="space-y-5">
                    {/* General Info */}
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Pelapor" value={facility.pelapor} />
                        <Field label="Cabang" value={facility.cabangPelapor} />
                        <Field label="Jenis" value={facility.jenisPenggunaanAkhir} />
                        <Field label="Kondisi" value={
                            <Badge variant="secondary" className={`${getKolLabel(facility.kolektibilitasBulanan[0]?.kolektibilitas || '1').color} border-none font-bold text-xs`}>
                                {facility.kondisi}
                            </Badge>
                        } />
                        <Field label="Tanggal Dibentuk" value={facility.tanggalDibentuk} />
                        <Field label="Jatuh Tempo" value={facility.tanggalJatuhTempo} />
                        <Field label="Plafon" value={formatRupiah(facility.plafon)} />
                        <Field label="Realisasi" value={formatRupiah(facility.realisasi)} />
                        <Field label="Baki Debet" value={formatRupiah(facility.bakiDebet)} />
                        <Field label="Tunggakan" value={formatRupiah(facility.tunggakan)} />
                        <Field label="Frek. Tunggakan" value={facility.frekuensiTunggakan} />
                        <Field label="Nilai Agunan" value={formatRupiah(facility.nilaiAgunan)} />
                    </div>

                    {/* Kolektibilitas Timeline */}
                    <div>
                        <h4 className="text-xs font-bold text-foreground mb-2 uppercase tracking-wider">Riwayat Kolektibilitas (24 Bulan)</h4>
                        <div className="grid grid-cols-6 gap-1.5">
                            {facility.kolektibilitasBulanan.map((kb, i) => {
                                const kol = getKolLabel(kb.kolektibilitas);
                                return (
                                    <div key={i} className={`text-center rounded-md py-1.5 px-1 ${kol.color}`}>
                                        <div className="text-[10px] font-medium leading-tight">{kb.bulan}</div>
                                        <div className="text-xs font-bold">{kb.kolektibilitas}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Agunan */}
                    {facility.agunan.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-foreground mb-2 uppercase tracking-wider">Agunan</h4>
                            <div className="border border-border rounded-lg overflow-hidden">
                                <table className="w-full text-xs">
                                    <thead className="bg-muted text-muted-foreground">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-bold">Jenis</th>
                                            <th className="px-3 py-2 text-left font-bold">Nilai</th>
                                            <th className="px-3 py-2 text-left font-bold">No. Agunan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {facility.agunan.map((a, i) => (
                                            <tr key={i}>
                                                <td className="px-3 py-2 font-medium">{a.jenisAgunan}</td>
                                                <td className="px-3 py-2">{formatRupiah(a.nilaiAgunan)}</td>
                                                <td className="px-3 py-2 text-muted-foreground">{a.noAgunan}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Penjamin */}
                    {facility.penjamin.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-foreground mb-2 uppercase tracking-wider">Penjamin</h4>
                            <div className="border border-border rounded-lg overflow-hidden">
                                <table className="w-full text-xs">
                                    <thead className="bg-muted text-muted-foreground">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-bold">Nama</th>
                                            <th className="px-3 py-2 text-left font-bold">Jenis ID</th>
                                            <th className="px-3 py-2 text-left font-bold">No. Identitas</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {facility.penjamin.map((p, i) => (
                                            <tr key={i}>
                                                <td className="px-3 py-2 font-medium">{p.namaPenjamin}</td>
                                                <td className="px-3 py-2">{p.jenisIdentitas}</td>
                                                <td className="px-3 py-2 text-muted-foreground">{p.noIdentitas}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="space-y-0.5">
            <p className="text-[11px] text-muted-foreground">{label}</p>
            <p className="text-sm font-medium text-foreground">{value}</p>
        </div>
    );
}
