import { useQuery } from '@tanstack/react-query';
import { referenceService } from '@/core/api/services/reference-service';
import { useMemo } from 'react';

export function useAttributeRegistry() {
    const { data, isLoading } = useQuery({
        queryKey: ['attribute-registry'],
        queryFn: () => referenceService.getAttributeRegistry(),
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    const registryMap = useMemo(() => {
        if (!data?.attributes) return {};
        return data.attributes.reduce((acc: Record<string, any>, attr: any) => {
            acc[attr.attributeCode] = attr;
            return acc;
        }, {});
    }, [data]);

    const getLabel = (key: string, fallback?: string) => {
        return registryMap[key]?.uiLabel || fallback || key;
    };

    const getAttributeConfig = (key: string) => {
        return registryMap[key];
    };

    return {
        registry: data?.attributes || [],
        registryMap,
        getLabel,
        getAttributeConfig,
        isLoading,
    };
}
