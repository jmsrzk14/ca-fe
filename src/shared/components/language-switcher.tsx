'use client';

import { useLingui } from '@lingui/react';
import { dynamicActivate, locales } from '@/shared/lib/i18n';
import { Button } from '@/shared/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
    const { i18n } = useLingui();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl gap-2 font-medium border-border/50">
                    {locales[i18n.locale as keyof typeof locales] || i18n.locale}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl w-40 shadow-xl">
                {Object.entries(locales).map(([locale, label]) => (
                    <DropdownMenuItem
                        key={locale}
                        onClick={async () => {
                            await dynamicActivate(locale);
                            window.location.reload();
                        }}
                        className="rounded-lg cursor-pointer"
                    >
                        {label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
