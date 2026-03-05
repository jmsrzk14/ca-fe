'use client';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { DataTableView, type DataTableColumn } from '@/shared/components/data-table-view';

const LOAN_STATUSES = [
    { no: 1, namaStatus: "Pending", warna: "Warning", tampilan: "Pending", variant: "warning" },
    { no: 2, namaStatus: "Diterima", warna: "Success", tampilan: "Diterima", variant: "success" },
    { no: 3, namaStatus: "Ditolak", warna: "Danger", tampilan: "Ditolak", variant: "danger" },
    { no: 4, namaStatus: "Menunggu Pengecekan SLIK", warna: "Info", tampilan: "Menunggu Pengecekan SLIK", variant: "info" },
    { no: 5, namaStatus: "SLIK Sudah Diunggah", warna: "Info", tampilan: "SLIK Sudah Diunggah", variant: "info" },
    { no: 6, namaStatus: "Survey Data Umum Telah Diisi", warna: "Info", tampilan: "Survey Data Umum Telah Diisi", variant: "info" },
    { no: 7, namaStatus: "Survey Finansial Telah Diisi", warna: "Info", tampilan: "Survey Finansial Telah Diisi", variant: "info" },
];

const COLUMNS: DataTableColumn[] = [
    { key: 'no', label: 'No.', align: 'center' },
    { key: 'namaStatus', label: 'Nama Status' },
    { key: 'warna', label: 'Warna' },
    { key: 'tampilan', label: 'Tampilan' },
];

export function LoanStatusView() {
    return (
        <DataTableView
            title="Status Peminjaman"
            addButtonLabel="Tambah Status Peminjaman"
            columns={COLUMNS}
            data={LOAN_STATUSES}
            renderCell={(row, col) => {
                if (col.key === 'no') return <span className="text-foreground/70">{row.no}</span>;
                if (col.key === 'namaStatus') return <span className="font-medium">{row.namaStatus}</span>;
                if (col.key === 'warna') return <span className="font-medium text-foreground/70">{row.warna}</span>;
                if (col.key === 'tampilan') return (
                    <Badge className={cn(
                        "border-none uppercase text-[9px] font-black px-2.5 py-0.5 rounded-md",
                        row.variant === 'warning' && "bg-orange-500 text-white",
                        row.variant === 'success' && "bg-green-500 text-white",
                        row.variant === 'danger' && "bg-rose-500 text-white",
                        row.variant === 'info' && "bg-cyan-500 text-white",
                    )}>
                        {row.tampilan}
                    </Badge>
                );
                return row[col.key];
            }}
            renderActions={() => (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-3 text-[10px] font-bold uppercase text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md border border-blue-200"
                >
                    Ubah
                </Button>
            )}
        />
    );
}
