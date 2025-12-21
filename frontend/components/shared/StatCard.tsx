// frontend/components/shared/StatCard.tsx
"use client";

import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: "up" | "down" | "neutral";
}

export function StatCard({ title, value, icon: Icon, description, trend }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="glass-card p-6 rounded-2xl relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon className="w-24 h-24" />
      </div>

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-xl">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
              trend === 'down' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            }`}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '−'} 2.5%
          </span>
        )}
      </div>

      <div className="relative z-10">
        <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
        <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>

        {description && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            {description}
          </p>
        )}
      </div>

      {/* Decorative gradient blob */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
    </motion.div>
  );
}