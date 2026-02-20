'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowLeft,
    User,
    Building2,
    Fingerprint,
    Mail,
    Phone,
    Edit3,
    X,
    Copy,
    Smartphone,
    Link as LinkIcon,
} from 'lucide-react';
import { applicantService } from '@/core/api';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Skeleton } from '@/shared/ui/skeleton';
import { Separator } from '@/shared/ui/separator';
import Link from 'next/link';
import { toast } from 'sonner';

interface ApplicantDetailProps {
    id: string;
}

export function ApplicantDetail({ id }: ApplicantDetailProps) {
    const { data: applicant, isLoading, error } = useQuery({
        queryKey: ['applicant', id],
        queryFn: () => applicantService.getById(id),
    });

    if (isLoading) {
        return <DetailSkeleton />;
    }

    if (error || !applicant) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="p-4 bg-destructive/10 text-destructive rounded-full">
                    <User className="h-10 w-10" />
                </div>
                <h2 className="text-xl font-bold">Applicant Not Found</h2>
                <p className="text-muted-foreground">The applicant you are looking for does not exist or has been removed.</p>
                <Button asChild variant="outline">
                    <Link href="/borrowers">Go Back to List</Link>
                </Button>
            </div>
        );
    }

    const response = applicant as any;
    // Handle both cases: { applicant: { ... } } and directly { ... }
    const data = response?.applicant || response || {};
    const attributes = data.attributes || [];

    // Helper to get attribute value
    const getAttr = (key: string) => attributes.find((a: any) => a.key === key)?.value || '-';

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('ID copied to clipboard');
    };

    return (
        <div className="bg-background min-h-screen text-foreground animate-in fade-in duration-500">
            {/* Main Header */}
            <div className="max-w-[1200px] mx-auto px-8 pt-12 pb-4">
                <div className="flex items-start justify-between gap-8">
                    <div className="space-y-6 flex-1">
                        <div className="flex items-center gap-6">
                            <h1 className="text-5xl font-extrabold tracking-tight text-foreground">
                                {data.fullName}
                            </h1>
                            <div className="flex items-center gap-3">
                                <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-border bg-background/50 hover:bg-muted transition-all">
                                    <Mail className="h-5 w-5 text-foreground" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-border bg-background/50 hover:bg-muted transition-all">
                                    <Smartphone className="h-5 w-5 text-foreground" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-orange-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-orange-600/20">
                                    {data.fullName?.charAt(0) || 'A'}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                    {data.updatedAt ? `Updated ${new Date(data.updatedAt).toLocaleDateString()}` : 'No update info'}
                                    <LinkIcon className="h-3 w-3 text-cyan-500 ml-1" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-16">
                        <Button asChild variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full">
                            <Link href="/borrowers">
                                <X className="h-6 w-6" />
                            </Link>
                        </Button>
                        <div
                            className="bg-muted/50 border border-border rounded-lg px-4 py-1.5 flex items-center gap-3 cursor-pointer hover:bg-muted transition-all group shadow-sm"
                            onClick={() => copyToClipboard(data.id)}
                        >
                            <Copy className="h-3.5 w-3.5 text-muted-foreground group-hover:text-orange-600 transition-colors" />
                            <code className="text-xs text-muted-foreground font-mono">
                                {data.id}
                            </code>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <Tabs defaultValue="profile" className="mt-12">
                    <TabsList className="bg-transparent h-auto p-0 gap-10 border-b border-border w-full justify-start rounded-none">
                        <TabsTrigger
                            value="profile"
                            className="bg-transparent p-0 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:bg-transparent data-[state=active]:text-foreground text-base font-bold transition-all"
                        >
                            Profile
                        </TabsTrigger>
                        <TabsTrigger
                            value="applications"
                            className="bg-transparent p-0 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:bg-transparent data-[state=active]:text-foreground text-base font-bold transition-all text-muted-foreground/60 hover:text-muted-foreground"
                        >
                            Applications
                        </TabsTrigger>
                        <TabsTrigger
                            value="portal"
                            className="bg-transparent p-0 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:bg-transparent data-[state=active]:text-foreground text-base font-bold transition-all text-muted-foreground/60 hover:text-muted-foreground"
                        >
                            Digital Lending Portal
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="pt-10 space-y-16">
                        {/* Profile Section Header */}
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="text-3xl font-bold text-foreground">Profile</h2>
                            <div className="flex gap-4">
                                <Badge variant={data.applicantType === 'CORPORATE' ? 'default' : 'secondary'} className="px-4 py-1.5 rounded-full font-bold">
                                    {data.applicantType}
                                </Badge>
                                <Button variant="link" className="text-cyan-600 font-bold p-0 h-auto flex gap-2 items-center hover:no-underline hover:text-cyan-500">
                                    <Edit3 className="h-4 w-4" />
                                    Edit Profile
                                </Button>
                            </div>
                        </div>

                        {/* Basic Information */}
                        <div className="space-y-8">
                            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <User className="h-5 w-5 text-orange-600" />
                                Basic Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-10">
                                <DetailRow label="Full Name" value={data.fullName || '-'} />
                                <DetailRow label="ID (NIK)" value={getAttr('id_nik')} />
                                <DetailRow label="Birth Date" value={data.birthDate || '-'} />
                                <DetailRow label="Marital Status" value={getAttr('id_status_kawin')} />
                                {getAttr('id_status_kawin') === 'Kawin' && (
                                    <DetailRow label="Spouse Name" value={getAttr('sp_nama')} />
                                )}
                            </div>
                        </div>

                        {/* Contact Details */}
                        <div className="space-y-8">
                            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <Phone className="h-5 w-5 text-orange-600" />
                                Contact Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-10">
                                <DetailRow label="Primary Phone" value={getAttr('c_hp1')} />
                                <DetailRow label="Email Address" value={getAttr('c_email')} isLink />
                                <DetailRow label="Residential Address" value={getAttr('addr_residence')} />
                            </div>
                        </div>

                        {/* Employment & Financials */}
                        <div className="space-y-8">
                            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-orange-600" />
                                Employment & Financials
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-10">
                                <DetailRow label="Job Status" value={getAttr('job_status')} />
                                <DetailRow label="Net Salary" value={getAttr('job_gaji_bersih') !== '-' ? `Rp ${Number(getAttr('job_gaji_bersih')).toLocaleString()}` : '-'} />
                                <DetailRow label="Company Name" value={getAttr('job_instansi_nama')} />
                            </div>
                        </div>

                        {/* Behavioral Information */}
                        <div className="space-y-8">
                            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <Fingerprint className="h-5 w-5 text-orange-600" />
                                Behavioral Records
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-10">
                                <DetailRow label="Discipline Level" value={getAttr('beh_disiplin')} />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="applications">
                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-muted/10 rounded-2xl border-2 border-dashed border-border py-12">
                            <LinkIcon className="h-10 w-10 mb-4 opacity-20" />
                            <p className="font-medium text-lg">No applications found.</p>
                            <Button variant="link" className="text-orange-600 font-bold mt-2">Create New Application</Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

function DetailRow({ label, value, isLink }: { label: string; value: string; isLink?: boolean }) {
    return (
        <div className="flex items-center border-b border-border pb-5 justify-between gap-4">
            <span className="text-sm text-muted-foreground font-semibold uppercase tracking-tight w-48">{label}</span>
            <span className={`text-base font-bold flex-1 text-right md:text-left ${isLink ? 'text-cyan-600 hover:text-cyan-500 cursor-pointer transition-colors' : 'text-foreground'}`}>
                {value}
            </span>
        </div>
    );
}

function DetailSkeleton() {
    return (
        <div className="p-8 space-y-8">
            <div className="space-y-4">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-6 w-96" />
            </div>
            <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
    );
}
