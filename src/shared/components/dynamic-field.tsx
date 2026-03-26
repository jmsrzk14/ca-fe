'use client';

import * as React from 'react';
import { Input } from '@/shared/ui/input';
import { NumericInput } from '@/shared/ui/numeric-input';
import { Label } from '@/shared/ui/label';
import { SearchableSelect } from '@/shared/ui/searchable-select';
import { AttributeRegistry } from '@/shared/types/api';
import { t } from '@/shared/lib/t';
import { formatThousands, parseThousands } from '@/shared/lib/utils';

interface DynamicFieldProps {
    field: AttributeRegistry;
    value: string;
    onChange: (key: string, value: string) => void;
    error?: string;
    inputClass?: string;
    disabled?: boolean;
}

export function DynamicField({ field, value, onChange, error, inputClass = 'h-9 rounded-md', disabled = false }: DynamicFieldProps) {
    const id = field.attributeCode;
    const rawLabel = field.uiLabel || field.description || id;
    const label = t`${rawLabel}`;
    const isRequired = field.isRequired;

    const labelContent = (
        <Label className="text-xs font-medium text-muted-foreground">
            {label} {isRequired && <span className="text-destructive">*</span>}
        </Label>
    );

    const errorContent = error ? (
        <p className="text-[10px] text-destructive mt-0.5">{error}</p>
    ) : null;

    const choices = field.choices;
    const hasChoices = choices && choices.length > 0;
    const dataType = field.dataType?.toUpperCase();

    // SELECT with choices from backend — searchable combobox
    if (dataType === 'SELECT' && hasChoices) {
        const options = choices
            .slice()
            .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
            .map(opt => ({ value: opt.code, label: opt.value }));

        return (
            <div key={id} className="space-y-1.5">
                {labelContent}
                <SearchableSelect
                    options={options}
                    value={value || ''}
                    onValueChange={(v) => onChange(id, v)}
                    placeholder={t`Pilih ${label}...`}
                    searchPlaceholder={t`Cari ${label}...`}
                    className={inputClass}
                    disabled={disabled}
                />
                {errorContent}
            </div>
        );
    }

    // SELECT without choices — show disabled select
    if (dataType === 'SELECT' && !hasChoices) {
        return (
            <div key={id} className="space-y-1.5">
                {labelContent}
                <SearchableSelect
                    options={[]}
                    value=""
                    onValueChange={() => { }}
                    placeholder={t`Tidak ada pilihan`}
                    disabled
                    className={inputClass}
                />
                {errorContent}
            </div>
        );
    }

    // BOOLEAN — searchable with Ya/Tidak
    if (dataType === 'BOOLEAN') {
        const boolOptions = [
            { value: 'true', label: t`Ya` },
            { value: 'false', label: t`Tidak` },
        ];
        return (
            <div key={id} className="space-y-1.5">
                {labelContent}
                <SearchableSelect
                    options={boolOptions}
                    value={value || ''}
                    onValueChange={(v) => onChange(id, v)}
                    placeholder={t`Pilih...`}
                    className={inputClass}
                    disabled={disabled}
                />
                {errorContent}
            </div>
        );
    }

    // DATE
    if (dataType === 'DATE') {
        return (
            <div key={id} className="space-y-1.5">
                {labelContent}
                <Input
                    id={id}
                    name={id}
                    type="date"
                    value={value || ''}
                    onChange={(e) => onChange(id, e.target.value)}
                    className={inputClass}
                    disabled={disabled}
                />
                {errorContent}
            </div>
        );
    }

    // NUMBER
    if (dataType === 'NUMBER') {
        return (
            <div key={id} className="space-y-1.5">
                {labelContent}
                <NumericInput
                    id={id}
                    name={id}
                    value={value || ''}
                    onValueChange={(v) => onChange(id, v)}
                    className={inputClass}
                    disabled={disabled}
                    placeholder="0"
                />
                {errorContent}
            </div>
        );
    }

    // STRING / TEXT (default)
    return (
        <div key={id} className="space-y-1.5">
            {labelContent}
            <Input
                id={id}
                name={id}
                value={value || ''}
                onChange={(e) => onChange(id, e.target.value)}
                className={inputClass}
                placeholder={t`Masukkan ${label}`}
                disabled={disabled}
            />
            {errorContent}
        </div>
    );
}
