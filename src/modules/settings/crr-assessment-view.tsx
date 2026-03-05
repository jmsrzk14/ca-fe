'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { DataTableView, type DataTableColumn } from '@/shared/components/data-table-view';

const CRR_ASSESSMENTS = [
    { no: 1, tingkatResiko: "Sangat Rendah", kategori: "Sangat Layak", skorMinimum: "4.3", skorMaximum: "999,999.99" },
    { no: 2, tingkatResiko: "Rendah", kategori: "Layak", skorMinimum: "3.7", skorMaximum: "4.3" },
    { no: 3, tingkatResiko: "Cukup Rendah", kategori: "Cukup Layak", skorMinimum: "3.1", skorMaximum: "3.7" },
    { no: 4, tingkatResiko: "Tinggi", kategori: "Kurang Layak", skorMinimum: "2.5", skorMaximum: "3.1" },
    { no: 5, tingkatResiko: "Sangat Tinggi", kategori: "Sangat Kurang Layak", skorMinimum: "-999,999.99", skorMaximum: "2.5" },
];

const COLUMNS: DataTableColumn[] = [
    { key: 'no', label: 'No.', align: 'center' },
    { key: 'tingkatResiko', label: 'Tingkat Resiko' },
    { key: 'kategori', label: 'Kategori' },
    { key: 'skorMinimum', label: 'Skor Minimum' },
    { key: 'skorMaximum', label: 'Skor Maximum' },
];

export function CRRAssessmentView() {
    return (
        <DataTableView
            title="Credit Risk Category"
            addButtonLabel="Tambah Credit Risk Category"
            columns={COLUMNS}
            data={CRR_ASSESSMENTS}
            renderCell={(row, col) => {
                if (col.key === 'no') return <span className="text-foreground/70">{row.no}</span>;
                if (col.key === 'tingkatResiko' || col.key === 'kategori') return <span className="font-medium">{row[col.key]}</span>;
                return <span className="text-foreground/70">{row[col.key]}</span>;
            }}
            renderActions={() => (
                <div className="flex items-center justify-center gap-1.5">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-md border border-orange-200"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-md border border-rose-200"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )}
        />
    );
}
