'use client';

import { ReactNode, useEffect, useState } from 'react';
import { i18n } from '@lingui/core';
import { I18nProvider as LinguiProvider } from '@lingui/react';
import { dynamicActivate, defaultLocale, getInitialLocale } from '@/shared/lib/i18n';

interface I18nProviderProps {
    children: ReactNode;
    initialLocale?: string;
}

export function I18nProvider({ children, initialLocale = getInitialLocale() }: I18nProviderProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        dynamicActivate(initialLocale).then(() => {
            setIsLoaded(true);
        });
    }, [initialLocale]);

    if (!isLoaded) {
        return null; // or a loader
    }

    return (
        <LinguiProvider i18n={i18n}>
            {children}
        </LinguiProvider>
    );
}
