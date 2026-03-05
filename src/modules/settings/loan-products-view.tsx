'use client';

import { Button } from '@/shared/ui/button';
import { DataTableView, type DataTableColumn } from '@/shared/components/data-table-view';

const LOAN_PRODUCTS = [
    { no: 1, namaProduk: "pINJAMAN", kategori: "Modal Kerja", tanggalDibuat: "September 30, 2025 - 15:56 WIB", tanggalDiubah: "September 30, 2025 - 15:56 WIB" },
    { no: 2, namaProduk: "KREDIT PEGAWAI SWASTA", kategori: "Konsumtif", tanggalDibuat: "July 9, 2025 - 15:54 WIB", tanggalDiubah: "July 9, 2025 - 16:16 WIB" },
    { no: 3, namaProduk: "UMKM", kategori: "Modal Kerja", tanggalDibuat: "June 30, 2025 - 12:48 WIB", tanggalDiubah: "July 25, 2025 - 16:50 WIB" },
];

const COLUMNS: DataTableColumn[] = [
    { key: 'no', label: 'No.', align: 'center' },
    { key: 'namaProduk', label: 'Nama Produk' },
    { key: 'kategori', label: 'Kategori' },
    { key: 'tanggalDibuat', label: 'Tanggal Dibuat' },
    { key: 'tanggalDiubah', label: 'Tanggal Diubah' },
];

export function LoanProductsView() {
    return (
        <DataTableView
            title="Produk Peminjaman"
            addButtonLabel="Tambah Produk Peminjaman"
            columns={COLUMNS}
            data={LOAN_PRODUCTS}
            renderCell={(row, col) => {
                if (col.key === 'no') return <span className="text-foreground/70">{row.no}</span>;
                if (col.key === 'namaProduk') return <span className="font-bold uppercase">{row.namaProduk}</span>;
                if (col.key === 'kategori') return <span className="font-medium text-foreground/80">{row.kategori}</span>;
                return <span className="text-foreground/70">{row[col.key]}</span>;
            }}
            renderActions={() => (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-3 text-[10px] font-bold uppercase text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md border border-blue-200"
                >
                    Detail
                </Button>
            )}
        />
    );
}
