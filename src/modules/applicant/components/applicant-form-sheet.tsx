'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    X,
    Calendar,
    Mail,
    Phone,
    MapPin,
    User,
    Building2,
    Save,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { applicantService } from '@/core/api';
import { ApplicantType } from '@/shared/types/api';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/shared/ui/sheet';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';

interface ApplicantFormSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ApplicantFormSheet({ open, onOpenChange }: ApplicantFormSheetProps) {
    const queryClient = useQueryClient();
    const [type, setType] = React.useState<ApplicantType>('PERSONAL');

    // Mutation for creating applicant
    const mutation = useMutation({
        mutationFn: (data: any) => applicantService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applicants'] });
            toast.success('Applicant created successfully');
            onOpenChange(false);
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create applicant');
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const firstName = formData.get('firstName') as string;
        const lastName = formData.get('lastName') as string;

        const payload = {
            applicantType: type,
            fullName: type === 'PERSONAL' ? `${firstName} ${lastName}` : (formData.get('companyName') as string),
            identityNumber: formData.get('identityNumber') as string,
            // Additional attributes mapping
            attributes: [
                { key: 'email', value: formData.get('email') as string, dataType: 'STRING' },
                { key: 'phone', value: formData.get('phone') as string, dataType: 'STRING' },
                { key: 'address', value: formData.get('address') as string, dataType: 'STRING' },
                { key: 'birthDate', value: formData.get('birthDate') as string, dataType: 'DATE' },
            ].filter(attr => attr.value),
        };

        mutation.mutate(payload);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[600px] p-0 overflow-y-auto bg-background/95 backdrop-blur-xl border-l border-border/50">
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <SheetHeader className="p-8 border-b border-border/50 bg-muted/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <SheetTitle className="text-2xl font-bold tracking-tight">Add Borrower</SheetTitle>
                                <SheetDescription className="mt-2">
                                    Fill in the details below to register a new borrower in the system.
                                </SheetDescription>
                            </div>
                        </div>

                        <Tabs
                            value={type}
                            onValueChange={(v) => setType(v as ApplicantType)}
                            className="w-full mt-6"
                        >
                            <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl">
                                <TabsTrigger value="PERSONAL" className="rounded-lg gap-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                                    <User className="h-4 w-4" />
                                    Person
                                </TabsTrigger>
                                <TabsTrigger value="CORPORATE" className="rounded-lg gap-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                                    <Building2 className="h-4 w-4" />
                                    Company
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </SheetHeader>

                    <div className="flex-1 p-8 space-y-10">
                        {/* Basic Information */}
                        <section className="space-y-6">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <span className="h-1 w-1 rounded-full bg-orange-600" />
                                Basic Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {type === 'PERSONAL' ? (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName" className="text-sm font-medium">First Name <span className="text-orange-600">*</span></Label>
                                            <Input id="firstName" name="firstName" placeholder="e.g. John" required className="rounded-xl border-border/50 bg-background/50 focus:ring-orange-500/20" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName" className="text-sm font-medium">Last Name <span className="text-orange-600">*</span></Label>
                                            <Input id="lastName" name="lastName" placeholder="e.g. Doe" required className="rounded-xl border-border/50 bg-background/50 focus:ring-orange-500/20" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-2 col-span-2">
                                        <Label htmlFor="companyName" className="text-sm font-medium">Company Name <span className="text-orange-600">*</span></Label>
                                        <Input id="companyName" name="companyName" placeholder="e.g. PT Artha Grafia" required className="rounded-xl border-border/50 bg-background/50 focus:ring-orange-500/20" />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="birthDate" className="text-sm font-medium">
                                        {type === 'PERSONAL' ? 'Date of Birth' : 'Establishment Date'} <span className="text-orange-600">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input id="birthDate" name="birthDate" type="date" required className="pl-10 rounded-xl border-border/50 bg-background/50 focus:ring-orange-500/20" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="identityNumber" className="text-sm font-medium">
                                        {type === 'PERSONAL' ? 'Personal ID Number (NIK)' : 'Business Registration Number'} <span className="text-orange-600">*</span>
                                    </Label>
                                    <Input id="identityNumber" name="identityNumber" placeholder="16-digit ID number" required className="rounded-xl border-border/50 bg-background/50 focus:ring-orange-500/20" />
                                </div>
                            </div>
                        </section>

                        {/* Contact Details */}
                        <section className="space-y-6">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <span className="h-1 w-1 rounded-full bg-orange-600" />
                                Contact Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="address" className="text-sm font-medium">Home Address <span className="text-orange-600">*</span></Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input id="address" name="address" placeholder="Full street address..." required className="pl-10 rounded-xl border-border/50 bg-background/50 focus:ring-orange-500/20" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium">Email <span className="text-orange-600">*</span></Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input id="email" name="email" type="email" placeholder="email@domain.com" required className="pl-10 rounded-xl border-border/50 bg-background/50 focus:ring-orange-500/20" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-sm font-medium">Phone <span className="text-orange-600">*</span></Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input id="phone" name="phone" placeholder="+62 812-3456-789" required className="pl-10 rounded-xl border-border/50 bg-background/50 focus:ring-orange-500/20" />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="p-8 border-t border-border/50 bg-muted/30 flex items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 rounded-xl h-12 font-bold"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-[2] bg-orange-600 hover:bg-orange-700 text-white rounded-xl h-12 font-bold shadow-lg shadow-orange-600/20 gap-2"
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Save className="h-5 w-5" />
                            )}
                            Save Borrower
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
