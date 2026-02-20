'use client';

import * as React from 'react';
import { User, Building2 } from 'lucide-react';
import { Applicant } from '@/shared/types/api';
import ApplicantCard from './applicant-card';

interface ApplicantKanbanProps {
    applicants: Applicant[];
}

export function ApplicantKanban({ applicants }: ApplicantKanbanProps) {
    const personalApplicants = applicants.filter(a => a.applicantType === 'PERSONAL');
    const corporateApplicants = applicants.filter(a => a.applicantType === 'CORPORATE');

    return (
        <div className="flex gap-6 overflow-x-auto pb-6 -mx-2 px-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {/* Personal Column */}
            <KanbanColumn
                title="Personal"
                count={personalApplicants.length}
                icon={<User className="h-4 w-4 text-primary" />}
                color="bg-primary/10"
            >
                {personalApplicants.map(app => (
                    <ApplicantCard key={app.id} applicant={app} />
                ))}
            </KanbanColumn>

            {/* Corporate Column */}
            <KanbanColumn
                title="Corporate"
                count={corporateApplicants.length}
                icon={<Building2 className="h-4 w-4 text-blue-500" />}
                color="bg-blue-500/10"
            >
                {corporateApplicants.map(app => (
                    <ApplicantCard key={app.id} applicant={app} />
                ))}
            </KanbanColumn>

            {/* Placeholder for empty state if needed */}
            {applicants.length === 0 && (
                <div className="w-full h-64 flex flex-col items-center justify-center text-muted-foreground bg-muted/5 rounded-2xl border-2 border-dashed border-border/50">
                    <p>No applicants found matching your criteria.</p>
                </div>
            )}
        </div>
    );
}

interface KanbanColumnProps {
    title: string;
    count: number;
    icon: React.ReactNode;
    color: string;
    children: React.ReactNode;
}

function KanbanColumn({ title, count, icon, color, children }: KanbanColumnProps) {
    return (
        <div className="flex flex-col gap-4 min-w-[320px] max-w-[320px]">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${color}`}>
                        {icon}
                    </div>
                    <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">{title}</h3>
                </div>
                <div className="bg-muted px-2 py-0.5 rounded-full text-[10px] font-bold text-muted-foreground border border-border/50">
                    {count}
                </div>
            </div>

            <div className="flex flex-col gap-4 min-h-[500px] p-2 rounded-2xl bg-muted/20 border border-border/30 shadow-inner">
                {children}
            </div>
        </div>
    );
}
