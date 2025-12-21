"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
    <div className="relative flex items-center">
        <input
            type="checkbox"
            className="peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-white dark:bg-gray-900 checked:bg-primary checked:border-primary"
            ref={ref}
            {...props}
        />
        <Check className="h-3 w-3 text-primary-foreground absolute left-0.5 top-0.5 pointer-events-none hidden peer-checked:block" strokeWidth={3} />
    </div>
))
Checkbox.displayName = "Checkbox"

export { Checkbox }
