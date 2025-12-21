import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    subtitle?: string;
    icon?: LucideIcon;
    iconColor?: string;
    loading?: boolean;
}

export function PremiumCard({
    title,
    subtitle,
    icon: Icon,
    iconColor = "text-emerald-500",
    loading = false,
    className,
    children,
    ...props
}: PremiumCardProps) {
    return (
        <div
            className={cn(
                "glass-card rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                className
            )}
            {...props}
        >
            {(title || Icon) && (
                <div className="flex items-start justify-between mb-4">
                    <div>
                        {title && (
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">
                                {title}
                            </h3>
                        )}
                        {subtitle && (
                            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
                        )}
                    </div>
                    {Icon && (
                        <div className={cn("p-2 rounded-xl bg-gray-50/50 dark:bg-gray-800/50", iconColor)}>
                            <Icon className="w-5 h-5" />
                        </div>
                    )}
                </div>
            )}

            {loading ? (
                <div className="animate-pulse space-y-3">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
            ) : (
                <div className="relative">
                    {children}
                </div>
            )}
        </div>
    );
}
