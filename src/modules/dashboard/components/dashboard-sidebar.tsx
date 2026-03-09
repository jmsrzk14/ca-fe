'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    Users,
    ClipboardList,
    Building2,
    Settings,
    ChevronRight,
    LogOut,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { ROUTES } from '@/core/constants';
import { useAuth } from '@/lib/hooks/use-auth';
import { useSidebar } from './sidebar-context';

interface NavItem {
    href: string;
    label: string;
    icon: React.ElementType;
    children?: { href: string; label: string }[];
}

const NAV_ITEMS: NavItem[] = [
    { href: '/', label: 'Dashboards', icon: Home },
    { href: '/borrowers', label: 'Peminjam', icon: Users },
    { href: '/loans', label: 'Pinjaman', icon: ClipboardList },
    { href: '/credit-bureau', label: 'Credit Bureau', icon: Building2 },
];

const ADMIN_ITEMS: NavItem[] = [
    {
        href: ROUTES.SETTINGS,
        label: 'Pengaturan',
        icon: Settings,
        children: [
            { href: ROUTES.ATTRIBUTES, label: 'Registri Field' },
        ],
    },
];

export function DashboardSidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { isCollapsed } = useSidebar();

    return (
        <aside className={cn(
            "flex flex-col shrink-0 bg-sidebar border-r border-sidebar-border transition-all duration-300",
            isCollapsed ? "w-16" : "w-60"
        )}>
            {/* Brand */}
            <div className="h-14 flex items-center gap-3 px-4 border-b border-sidebar-border overflow-hidden">
                <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0">
                    <img
                        src="dots.png"
                        alt="dots"
                        className={cn(
                            "object-contain transition-all duration-300",
                            isCollapsed ? "w-8 h-8" : "w-6 h-6"
                        )}
                    />
                </div>
                {!isCollapsed && (
                    <div className="min-w-0 transition-opacity duration-200">
                        <p className="text-white text-sm font-bold leading-none">DOTS</p>
                        <p className="text-sidebar-foreground/60 text-[10px] leading-tight mt-0.5 truncate">
                            Credit Analyst
                        </p>
                    </div>
                )}
            </div>

            {/* Branch context */}
            {!isCollapsed && (
                <div className="mx-3 mt-3 px-3 py-2 rounded-md bg-sidebar-accent/40 border border-sidebar-border transition-opacity duration-200">
                    <p className="text-[10px] text-sidebar-foreground/40 uppercase tracking-wide font-medium">
                        Kantor Pusat
                    </p>
                    <p className="text-xs text-sidebar-foreground mt-0.5 truncate">
                        {user?.username ?? "—"}
                    </p>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-2 custom-scrollbar">
                {!isCollapsed && (
                    <p className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-wider px-3 mb-2 transition-opacity duration-200">
                        Utama
                    </p>
                )}
                <ul className="space-y-1">
                    {NAV_ITEMS.map((item) => (
                        <NavLink key={item.href} item={item} pathname={pathname} />
                    ))}
                </ul>

                {!isCollapsed && (
                    <p className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-wider px-3 mt-6 mb-2 transition-opacity duration-200">
                        Administrasi
                    </p>
                )}
                <ul className="space-y-1">
                    {ADMIN_ITEMS.map((item) => (
                        <NavLinkWithChildren key={item.href} item={item} pathname={pathname} />
                    ))}
                </ul>
            </nav>

            {/* User footer */}
            <div className="border-t border-sidebar-border p-3 space-y-1 overflow-hidden">
                <div className={cn(
                    "flex items-center gap-2.5 px-2 py-2 rounded-md",
                    isCollapsed && "justify-center px-0"
                )}>
                    <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                        <span className="text-[11px] font-bold text-primary">
                            {user?.fullName?.charAt(0)?.toUpperCase() ?? "?"}
                        </span>
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0 transition-opacity duration-200">
                            <p className="text-xs font-semibold text-white truncate leading-none">
                                {user?.fullName ?? "—"}
                            </p>
                            <p className="text-[10px] text-sidebar-foreground/50 truncate mt-0.5">
                                {user?.roles?.join(", ") || "—"}
                            </p>
                        </div>
                    )}
                </div>
                <button
                    onClick={logout}
                    className={cn(
                        "flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs text-sidebar-foreground/40 hover:text-red-400 hover:bg-sidebar-accent/40 transition-colors",
                        isCollapsed && "justify-center"
                    )}
                >
                    <LogOut className="w-3.5 h-3.5" />
                    {!isCollapsed && <span>Keluar</span>}
                </button>
            </div>
        </aside>
    );
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
    const { isCollapsed } = useSidebar();

    return (
        <li>
            <Link
                href={item.href}
                className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                    isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-white',
                    isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? item.label : undefined}
            >
                <item.icon
                    className={cn(
                        'shrink-0 transition-all duration-300',
                        isCollapsed ? 'w-5 h-5' : 'w-4 h-4',
                        isActive ? 'text-primary' : 'text-sidebar-foreground/40'
                    )}
                />
                {!isCollapsed && <span className="flex-1 transition-opacity duration-200">{item.label}</span>}
                {!isCollapsed && isActive && <ChevronRight className="w-3 h-3 text-sidebar-foreground/20" />}
            </Link>
        </li>
    );
}

function NavLinkWithChildren({ item, pathname }: { item: NavItem; pathname: string }) {
    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
    const [open, setOpen] = React.useState(isActive);
    const { isCollapsed } = useSidebar();

    return (
        <li>
            <button
                onClick={() => setOpen(!open)}
                className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors w-full outline-none',
                    isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-white',
                    isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? item.label : undefined}
            >
                <item.icon
                    className={cn(
                        'shrink-0 transition-all duration-300',
                        isCollapsed ? 'w-4 h-4' : 'w-4 h-4',
                        isActive ? 'text-primary' : 'text-sidebar-foreground/40'
                    )}
                />
                {!isCollapsed && <span className="flex-1 text-left transition-opacity duration-200">{item.label}</span>}
                {!isCollapsed && (
                    <ChevronRight
                        className={cn(
                            'w-3 h-3 text-sidebar-foreground/20 transition-transform',
                            open && 'rotate-90'
                        )}
                    />
                )}
            </button>
            {open && !isCollapsed && item.children && (
                <ul className="mt-1 ml-5 pl-3 border-l border-sidebar-border space-y-0.5 animate-in slide-in-from-left-1 duration-200">
                    {item.children.map((child) => {
                        const childActive = pathname === child.href;
                        return (
                            <li key={child.href}>
                                <Link
                                    href={child.href}
                                    className={cn(
                                        'flex items-center px-3 py-1.5 rounded-md text-sm transition-colors',
                                        childActive
                                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                                            : 'text-sidebar-foreground/60 hover:text-white hover:bg-sidebar-accent/50'
                                    )}
                                >
                                    {child.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </li>
    );
}
