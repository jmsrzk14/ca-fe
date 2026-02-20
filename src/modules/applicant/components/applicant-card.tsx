'use client';

import * as React from 'react';
import Link from 'next/link';
import { Mail, Phone, MoreHorizontal, ExternalLink, User, Building2 } from 'lucide-react';
import { Applicant } from '@/shared/types/api';
import { Card, CardContent, CardFooter, CardHeader } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

interface ApplicantCardProps {
    applicant: Applicant;
}

export default function ApplicantCard({ applicant }: ApplicantCardProps) {
    // Helper to get initials
    const initials = applicant.fullName
        ? applicant.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : '??';

    return (
        <Card className="group overflow-hidden border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-600/5 hover:-translate-y-1">
            <CardHeader className="p-5 pb-0">
                <div className="flex justify-between items-start">
                    <Avatar className="h-12 w-12 border-2 border-background shadow-sm ring-2 ring-primary/5 group-hover:ring-orange-500/20 transition-all">
                        <AvatarFallback className="bg-orange-100 text-orange-700 font-bold text-base">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-orange-500/10 hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl w-48 shadow-2xl">
                            <DropdownMenuItem asChild className="gap-2 rounded-lg cursor-pointer">
                                <Link href={`/borrowers/${applicant.id}`}>
                                    <ExternalLink className="h-4 w-4" />
                                    View Details
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="mt-4 space-y-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-foreground truncate group-hover:text-orange-500 transition-colors">
                            {applicant.fullName}
                        </h3>
                        {applicant.applicantType === 'CORPORATE' ? (
                            <Building2 className="h-3.5 w-3.5 text-blue-500" />
                        ) : (
                            <User className="h-3.5 w-3.5 text-primary" />
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono flex items-center gap-1.5">
                        ID: {applicant.id.slice(0, 12)}...
                    </p>
                </div>
            </CardHeader>
            <CardContent className="p-5 pt-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                    <Badge variant={applicant.applicantType === 'CORPORATE' ? 'default' : 'secondary'} className="rounded-lg px-2 py-0.5 text-[10px] font-bold">
                        {applicant.applicantType}
                    </Badge>
                    <Badge variant="outline" className="rounded-lg px-2 py-0.5 text-[10px] font-medium border-border/50 bg-muted/20">
                        {applicant.createdAt ? new Date(applicant.createdAt).toLocaleDateString() : 'Feb 19, 2026'}
                    </Badge>
                </div>

                <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 text-primary/60" />
                        <span className="truncate">{applicant.fullName?.toLowerCase().replace(/\s+/g, '.')}@example.com</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 text-primary/60" />
                        <span>+62 812-XXX-XXX</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-5 pt-0">
                <Button asChild variant="outline" className="w-full rounded-xl h-9 text-xs font-bold border-border/50 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all">
                    <Link href={`/borrowers/${applicant.id}`}>View Profile</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
