'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    Home,
    Banknote,
    FileText,
    ClipboardList,
    ClipboardCheck,
    ShieldCheck,
    AlertCircle,
    Users,
    Gavel,
    Printer,
    Settings,
    ChevronRight,
    LogOut,
    MoreHorizontal,
    Command,
} from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarRail,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from '@/shared/ui/sidebar';
import { ROUTES } from '@/core/constants';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/shared/ui/collapsible';

interface NavItem {
    title: string;
    url: string;
    icon: React.ElementType;
    items?: {
        title: string;
        url: string;
    }[];
}

interface NavGroup {
    title: string;
    items: NavItem[];
}

const NAV_ITEMS: NavGroup[] = [
    {
        title: 'Overview',
        items: [
            { title: 'Dashboards', url: '/', icon: Home },
            { title: 'Peminjam', url: '/borrowers', icon: Users },
            { title: 'Pinjaman', url: '/loans', icon: ClipboardList },
            { title: 'SLIK', url: '/slik', icon: FileText },
            {
                title: 'Pengaturan',
                url: ROUTES.SETTINGS,
                icon: Settings,
                items: [
                    { title: 'Produk Peminjaman', url: ROUTES.SETTINGS_LOAN_PRODUCTS },
                    { title: 'Komponen CRR', url: ROUTES.SETTINGS_CRR_COMPONENTS },
                    { title: 'Penilaian CRR', url: ROUTES.SETTINGS_CRR_ASSESSMENT },
                    { title: 'Status Peminjaman', url: ROUTES.SETTINGS_LOAN_STATUS },
                    { title: 'Registri Field', url: ROUTES.ATTRIBUTES },
                ]
            },
        ],
    },
];

export function DashboardSidebar() {
    const pathname = usePathname();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <Sidebar className="border-r border-sidebar-border bg-sidebar" />;
    }

    return (
        <Sidebar
            collapsible="icon"
            className="border-r border-sidebar-border bg-sidebar"
        >
            <SidebarHeader className="h-16 flex items-center justify-center md:group-data-[collapsible=icon]:px-0 px-6 transition-all duration-200 border-b border-sidebar-border bg-sidebar">
                <div className="flex items-center justify-center w-full">
                    <div className="flex items-center justify-center rounded-xl text-primary-foreground">
                        <img
                            src="/dots_CA.png"
                            alt="Logo Expanded"
                            className="h-12 w-24 object-contain group-data-[collapsible=icon]:hidden"
                        />
                        <img
                            src="/dots.png"
                            alt="Logo Collapsed"
                            className="h-10 w-10 object-contain hidden group-data-[collapsible=icon]:block"
                        />
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-4 pt-6 space-y-6">
                {NAV_ITEMS.map((group) => (
                    <SidebarGroup key={group.title} className="p-0">
                        <SidebarMenu>
                            {group.items.map((item) => {
                                const hasSubItems = item.items && item.items.length > 0;
                                const isActive = pathname === item.url || (item.url !== '/' && pathname.startsWith(item.url));

                                if (hasSubItems) {
                                    return (
                                        <Collapsible
                                            key={item.title}
                                            asChild
                                            defaultOpen={isActive}
                                            className="group/collapsible"
                                        >
                                            <SidebarMenuItem>
                                                <CollapsibleTrigger asChild>
                                                    <SidebarMenuButton
                                                        tooltip={item.title}
                                                        isActive={isActive}
                                                        className={cn(
                                                            "h-11 px-4 md:group-data-[collapsible=icon]:px-0 transition-all duration-200",
                                                            isActive ? "bg-white/20 text-white font-bold" : "text-white/70 hover:bg-white/10 hover:text-white"
                                                        )}
                                                    >
                                                        <item.icon className={cn(
                                                            "h-5 w-5 md:group-data-[collapsible=icon]:mr-0 mr-3 shrink-0",
                                                            isActive ? "text-white" : "text-white/60 group-hover:text-white"
                                                        )} />
                                                        <span className="font-semibold flex-1 group-data-[collapsible=icon]:hidden">
                                                            {item.title}
                                                        </span>
                                                        <ChevronRight className="h-4 w-4 ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                                                    </SidebarMenuButton>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <SidebarMenuSub className="ml-9 border-l border-primary/20 mt-1 mb-2">
                                                        {item.items?.map((subItem) => (
                                                            <SidebarMenuSubItem key={subItem.title}>
                                                                <SidebarMenuSubButton
                                                                    asChild
                                                                    isActive={pathname === subItem.url}
                                                                    className={cn(
                                                                        "h-9 px-4 rounded-lg transition-all",
                                                                        pathname === subItem.url
                                                                            ? "text-white font-bold bg-white/15"
                                                                            : "text-white/60 hover:text-white hover:bg-white/10"
                                                                    )}
                                                                >
                                                                    <Link href={subItem.url}>
                                                                        <span>{subItem.title}</span>
                                                                    </Link>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        ))}
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            </SidebarMenuItem>
                                        </Collapsible>
                                    );
                                }

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            isActive={isActive}
                                            className={cn(
                                                "h-11 px-4 md:group-data-[collapsible=icon]:px-0 transition-all duration-200",
                                                isActive ? "bg-white/20 text-white font-bold" : "text-white/70 hover:bg-white/10 hover:text-white"
                                            )}
                                        >
                                            <Link
                                                href={item.url}
                                                className="flex items-center w-full"
                                            >
                                                <item.icon className={cn(
                                                    "h-5 w-5 md:group-data-[collapsible=icon]:mr-0 mr-3 shrink-0",
                                                    isActive ? "text-white" : "text-white/60 group-hover:text-white"
                                                )} />
                                                <span className="font-semibold flex-1 group-data-[collapsible=icon]:hidden">
                                                    {item.title}
                                                </span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ); ``
                            })}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border p-4 bg-sidebar">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="hover:bg-accent transition-colors rounded-xl"
                                >
                                    <Avatar className="h-9 w-9 border-2 border-background shadow-sm ring-2 ring-primary/5">
                                        <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                                        <AvatarFallback className="bg-primary text-primary-foreground">AS</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden ml-2">
                                        <span className="truncate font-bold text-foreground">admin.smp</span>
                                        <span className="truncate text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Administrator</span>
                                    </div>
                                    <MoreHorizontal className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-56 rounded-xl shadow-2xl border-border/50 backdrop-blur-2xl bg-popover/90"
                                side="top"
                                align="end"
                                sideOffset={8}
                            >
                                <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer py-2.5">
                                    <Users className="size-4" />
                                    Account
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer py-2.5">
                                    <Settings className="size-4" />
                                    Settings
                                </DropdownMenuItem>
                                <div className="h-px bg-border my-1" />
                                <DropdownMenuItem className="rounded-lg gap-2 text-destructive cursor-pointer py-2.5 hover:bg-destructive/10">
                                    <LogOut className="size-4" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}



