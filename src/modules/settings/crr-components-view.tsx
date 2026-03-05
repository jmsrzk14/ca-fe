'use client';

import { Button } from '@/shared/ui/button';
import { DataTableView, type DataTableColumn } from '@/shared/components/data-table-view';

const CRR_COMPONENTS = [
    { no: 1, bagianPenilaian: "Character" },
    { no: 2, bagianPenilaian: "Capacity" },
    { no: 3, bagianPenilaian: "Condition" },
    { no: 4, bagianPenilaian: "Capital" },
    { no: 5, bagianPenilaian: "Collateral" },
    { no: 6, bagianPenilaian: "Legalitas" },
];

const COLUMNS: DataTableColumn[] = [
    { key: 'no', label: 'No.', align: 'center' },
    { key: 'bagianPenilaian', label: 'Bagian Penilaian' },
];

export function CRRComponentsView() {
    return (
        <DataTableView
            title="Setup Komponen Credit Risk Rating"
            addButtonLabel="Tambah Bagian Penilaian"
            columns={COLUMNS}
            data={CRR_COMPONENTS}
            renderCell={(row, col) => {
                if (col.key === 'no') return <span className="text-foreground/70">{row.no}</span>;
                return <span className="font-medium">{row[col.key]}</span>;
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
