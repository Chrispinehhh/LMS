"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Briefcase,
    Users,
    Truck,
    UserCog,
    Settings,
    X,
    LogOut,
    ChevronRight,
    Calculator
} from "lucide-react";
import { ModeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { backendUser, logout } = useAuth();

    if (!backendUser) return null;

    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

    const NavItem = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => (
        <Link
            href={href}
            onClick={onClose}
            className={cn(
                "group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 mx-2",
                isActive(href)
                    ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground font-semibold shadow-sm ring-1 ring-primary/20"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:translate-x-1"
            )}
        >
            <div className="flex items-center gap-3">
                <Icon className={cn("w-5 h-5 transition-colors", isActive(href) ? "text-primary" : "text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300")} />
                <span>{label}</span>
            </div>
            {isActive(href) && <ChevronRight className="w-4 h-4 opacity-50" />}
        </Link>
    );

    const SectionLabel = ({ label }: { label: string }) => (
        <div className="px-6 py-2 mt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</p>
        </div>
    );

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={cn(
                "fixed lg:static inset-y-0 left-0 z-50",
                "w-72 glass border-r border-glass-border shadow-2xl lg:shadow-none",
                "flex flex-col transition-transform duration-300 ease-out lg:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Logo Section */}
                <div className="p-6 pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 flex items-center justify-center text-white">
                                <span className="font-bold text-lg">S&S</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white leading-none">S&S Logistics</span>
                                <span className="text-xs text-muted-foreground font-medium">Management Portal</span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 space-y-1">
                    <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" />

                    {/* Operations */}
                    {(backendUser.role === 'ADMIN' || backendUser.role === 'MANAGER') && (
                        <>
                            <SectionLabel label="Operations" />
                            <NavItem href="/jobs" icon={Briefcase} label="Jobs" />
                        </>
                    )}

                    {/* Fleet Management */}
                    {(backendUser.role === 'ADMIN' || backendUser.role === 'MANAGER') && (
                        <>
                            <SectionLabel label="Fleet & Team" />
                            <NavItem href="/employees" icon={Users} label="Employees" />
                            <NavItem href="/fleet/drivers" icon={UserCog} label="Drivers" />
                            <NavItem href="/fleet/vehicles" icon={Truck} label="Vehicles" />
                        </>
                    )}

                    {/* Administration */}
                    {backendUser.role === 'ADMIN' && (
                        <>
                            <SectionLabel label="Admin" />
                            <NavItem href="/users" icon={Settings} label="User Management" />
                            <NavItem href="/settings/calculator" icon={Calculator} label="Calculator Settings" />
                        </>
                    )}
                </nav>

                {/* Footer User Profile */}
                <div className="p-4 border-t border-glass-border bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="flex items-center justify-between gap-3 mb-4">
                        <ModeToggle />
                        <p className="text-[10px] text-muted-foreground">v2.0 Premium</p>
                    </div>

                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors text-sm font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
