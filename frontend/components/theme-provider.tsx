"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Since we are using Next.js 13+ app directory, we need to wrap next-themes provider
// in a client component to use it in the layout.
export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
