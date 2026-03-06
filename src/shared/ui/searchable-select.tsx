'use client';

import * as React from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { cn } from '@/shared/lib/utils';

export interface SearchableSelectOption {
    value: string;
    label: string;
}

interface SearchableSelectProps {
    options: SearchableSelectOption[];
    value?: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    disabled?: boolean;
    className?: string;
}

export function SearchableSelect({
    options,
    value,
    onValueChange,
    placeholder = 'Pilih...',
    searchPlaceholder = 'Cari...',
    emptyMessage = 'Tidak ditemukan.',
    disabled = false,
    className,
}: SearchableSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');

    const selected = options.find(opt => opt.value === value);

    // For large lists, filter in JS to avoid rendering 500+ items
    const filtered = React.useMemo(() => {
        if (!search) return options.slice(0, 50);
        const lower = search.toLowerCase();
        return options
            .filter(opt => opt.label.toLowerCase().includes(lower) || opt.value.toLowerCase().includes(lower))
            .slice(0, 50);
    }, [options, search]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild disabled={disabled}>
                <button
                    type="button"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        'flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors',
                        'placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        className,
                    )}
                >
                    <span className={cn('truncate', !selected && 'text-muted-foreground')}>
                        {selected ? selected.label : placeholder}
                    </span>
                    <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <CommandPrimitive
                    shouldFilter={false}
                    className="flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground"
                >
                    <div className="flex items-center border-b px-3">
                        <Search className="mr-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="flex h-9 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <CommandPrimitive.List className="max-h-[200px] overflow-y-auto p-1">
                        {filtered.length === 0 && (
                            <div className="py-4 text-center text-sm text-muted-foreground">
                                {emptyMessage}
                            </div>
                        )}
                        {filtered.map(opt => (
                            <CommandPrimitive.Item
                                key={opt.value}
                                value={opt.value}
                                onSelect={() => {
                                    onValueChange(opt.value);
                                    setOpen(false);
                                    setSearch('');
                                }}
                                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                            >
                                <Check
                                    className={cn(
                                        'mr-2 h-3.5 w-3.5 shrink-0',
                                        value === opt.value ? 'opacity-100' : 'opacity-0',
                                    )}
                                />
                                <span className="truncate">{opt.label}</span>
                            </CommandPrimitive.Item>
                        ))}
                        {!search && options.length > 50 && (
                            <div className="py-2 text-center text-xs text-muted-foreground">
                                Ketik untuk mencari lebih banyak...
                            </div>
                        )}
                    </CommandPrimitive.List>
                </CommandPrimitive>
            </PopoverContent>
        </Popover>
    );
}
