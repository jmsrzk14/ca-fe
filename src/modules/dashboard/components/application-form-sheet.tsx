'use client';

import * as React from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/shared/ui/sheet';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { cn } from '@/shared/lib/utils';
import { User, Building2, MapPin, Mail, Phone, Calendar, Fingerprint, ChevronRight } from 'lucide-react';

interface ApplicationFormSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ApplicationFormSheet({ open, onOpenChange }: ApplicationFormSheetProps) {
    const [step, setStep] = React.useState(1);
    const [type, setType] = React.useState<'person' | 'company'>('person');

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="left" className="sm:max-w-[1100px] w-[90vw] p-0 bg-background border-r border-border overflow-hidden flex flex-col h-full gap-0">
                <div className="flex flex-col h-full">
                    {/* Header Area */}
                    <div className="p-10 border-b border-border/50 bg-muted/5">
                        <SheetHeader className="p-0">
                            <div className="flex flex-col gap-1">
                                <SheetTitle className="text-4xl font-bold tracking-tight text-foreground">
                                    Form Pengajuan
                                </SheetTitle>
                                <p className="text-sm text-muted-foreground font-medium">Personal Loan</p>
                            </div>
                        </SheetHeader>
                    </div>

                    {/* Main Form Content */}
                    <div className="flex-1 overflow-y-auto p-10 pt-8 pb-32">
                        {step === 1 ? (
                            <div className="space-y-12 animate-in fade-in slide-in-from-left-4 duration-500">
                                {/* Type Toggle & Section Title */}
                                <div className="flex items-center justify-between border-b border-border/20 pb-6">
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-2xl font-bold text-foreground">Borrower Profile</h3>
                                        <p className="text-sm text-muted-foreground">Please provide the borrower's basic information</p>
                                    </div>
                                    <Tabs value={type} onValueChange={(v) => setType(v as 'person' | 'company')} className="w-[240px]">
                                        <TabsList className="grid w-full grid-cols-2 bg-muted/30 p-1.5 rounded-xl border border-border/50">
                                            <TabsTrigger value="person" className="rounded-lg text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all h-9">
                                                Person
                                            </TabsTrigger>
                                            <TabsTrigger value="company" className="rounded-lg text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all h-9">
                                                Company
                                            </TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>

                                {/* Basic Information Section */}
                                <div className="space-y-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <User className="h-4 w-4 text-primary" />
                                        </div>
                                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/80">Basic Information</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-12 gap-y-10">
                                        <div className="space-y-3">
                                            <Label htmlFor="firstName" className="text-xs font-black uppercase tracking-wider text-muted-foreground">First Name <span className="text-rose-500">*</span></Label>
                                            <Input id="firstName" placeholder="Text" className="h-12 bg-muted/10 border-border/50 focus:bg-background transition-all rounded-xl px-5 text-sm" />
                                        </div>
                                        <div className="space-y-3">
                                            <Label htmlFor="dob" className="text-xs font-black uppercase tracking-wider text-muted-foreground">Date Of Birth <span className="text-rose-500">*</span></Label>
                                            <div className="relative group">
                                                <Input id="dob" placeholder="MM/DD/YYYY" className="h-12 bg-muted/10 border-border/50 focus:bg-background transition-all pr-12 rounded-xl px-5 text-sm" />
                                                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label htmlFor="lastName" className="text-xs font-black uppercase tracking-wider text-muted-foreground">Last Name <span className="text-rose-500">*</span></Label>
                                            <Input id="lastName" placeholder="Text" className="h-12 bg-muted/10 border-border/50 focus:bg-background transition-all rounded-xl px-5 text-sm" />
                                        </div>
                                        <div className="space-y-3">
                                            <Label htmlFor="idNumber" className="text-xs font-black uppercase tracking-wider text-muted-foreground">Personal ID Number <span className="text-rose-500">*</span></Label>
                                            <div className="relative group">
                                                <Input id="idNumber" placeholder="U.S. Social Security Number (###-##-####)" className="h-12 bg-muted/10 border-border/50 focus:bg-background transition-all pr-12 rounded-xl px-5 text-sm" />
                                                <Fingerprint className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Details Section */}
                                <div className="space-y-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <MapPin className="h-4 w-4 text-primary" />
                                        </div>
                                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/80">Contact Details</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-12 gap-y-10">
                                        <div className="space-y-3">
                                            <Label htmlFor="homeAddress" className="text-xs font-black uppercase tracking-wider text-muted-foreground">Home Address <span className="text-rose-500">*</span></Label>
                                            <div className="relative group">
                                                <Input id="homeAddress" placeholder="Address" className="h-12 bg-muted/10 border-border/50 focus:bg-background transition-all pr-12 rounded-xl px-5 text-sm" />
                                                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label htmlFor="mailingAddress" className="text-xs font-black uppercase tracking-wider text-muted-foreground">Mailing Address <span className="text-rose-500">?</span></Label>
                                            <div className="relative group">
                                                <Input id="mailingAddress" placeholder="Address" className="h-12 bg-muted/10 border-border/50 focus:bg-background transition-all pr-12 rounded-xl px-5 text-sm" />
                                                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label htmlFor="email" className="text-xs font-black uppercase tracking-wider text-muted-foreground">Email <span className="text-rose-500">*</span></Label>
                                            <div className="relative group">
                                                <Input id="email" type="email" placeholder="email@domain.com" className="h-12 bg-muted/10 border-border/50 focus:bg-background transition-all pr-12 rounded-xl px-5 text-sm" />
                                                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label htmlFor="phone" className="text-xs font-black uppercase tracking-wider text-muted-foreground">Phone <span className="text-rose-500">*</span></Label>
                                            <div className="relative group flex gap-3">
                                                <div className="flex h-12 items-center px-4 bg-muted/10 border border-border/50 rounded-xl cursor-pointer hover:bg-muted transition-colors font-bold text-xs uppercase tracking-tighter">
                                                    US
                                                </div>
                                                <Input id="phone" placeholder="(201) 555-0123" className="h-12 flex-1 bg-muted/10 border-border/50 focus:bg-background transition-all rounded-xl px-5 text-sm" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in slide-in-from-left-4 duration-500">
                                <div className="h-28 w-28 rounded-3xl bg-primary/10 flex items-center justify-center mb-10 shadow-2xl shadow-primary/5">
                                    <Building2 className="h-14 w-14 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground">Application Details</h3>
                                <p className="text-muted-foreground max-w-sm mt-4 text-base">Additional details about the loan application will be requested in this step.</p>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions with Stepper */}
                    <div className="p-10 border-t border-border/50 flex items-center justify-between bg-muted/2 backdrop-blur-md">
                        {/* Stepper at bottom left */}
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setStep(1)}>
                                <div className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-full text-xs font-black transition-all shadow-xl",
                                    step === 1 ? "bg-primary text-primary-foreground scale-110" : "bg-muted text-muted-foreground opacity-50"
                                )}>
                                    1
                                </div>
                                <div className="flex flex-col">
                                    <span className={cn(
                                        "text-[10px] font-black uppercase tracking-[0.2em]",
                                        step === 1 ? "text-primary" : "text-muted-foreground opacity-50"
                                    )}>
                                        Step 01
                                    </span>
                                    <span className={cn(
                                        "text-sm font-bold",
                                        step === 1 ? "text-foreground" : "text-muted-foreground opacity-50"
                                    )}>
                                        Borrower Profile
                                    </span>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
                            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setStep(2)}>
                                <div className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-full text-xs font-black transition-all shadow-xl",
                                    step === 2 ? "bg-primary text-primary-foreground scale-110" : "bg-muted text-muted-foreground opacity-50"
                                )}>
                                    2
                                </div>
                                <div className="flex flex-col">
                                    <span className={cn(
                                        "text-[10px] font-black uppercase tracking-[0.2em]",
                                        step === 2 ? "text-primary" : "text-muted-foreground opacity-50"
                                    )}>
                                        Step 02
                                    </span>
                                    <span className={cn(
                                        "text-sm font-bold",
                                        step === 2 ? "text-foreground" : "text-muted-foreground opacity-50"
                                    )}>
                                        Application Details
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <Button
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground hover:bg-transparent h-12"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => step < 2 ? setStep(step + 1) : onOpenChange(false)}
                                className="h-14 px-12 bg-[#1e5adb] hover:bg-[#1e5adb]/90 text-white font-black rounded-2xl shadow-2xl shadow-blue-500/30 transition-all active:scale-95 text-xs uppercase tracking-[0.2em]"
                            >
                                {step === 1 ? 'Next Step' : 'Buat Pengajuan'}
                            </Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
