import type { Config } from "tailwindcss"
import tailwindcssAnimate from "tailwindcss-animate"
import plugin from 'tailwindcss/plugin'

const config = {
    darkMode: ["class"],
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: {
                DEFAULT: "1rem",
                sm: "1.5rem",
                lg: "2rem",
                xl: "2.5rem",
                "2xl": "3rem",
            },
            screens: {
                "2xl": "1400px",
            },
        },
        screens: {
            'xs': '475px',
            'sm': '640px',
            'md': '768px',
            'lg': '1024px',
            'xl': '1280px',
            '2xl': '1400px',
        },
        extend: {
            backgroundImage: {
                'hero-pattern': "url('/hero-background.jpg')",
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            fontSize: {
                'xs': ['0.75rem', { lineHeight: '1rem' }],
                'sm': ['0.875rem', { lineHeight: '1.25rem' }],
                'base': ['1rem', { lineHeight: '1.5rem' }],
                'lg': ['1.125rem', { lineHeight: '1.75rem' }],
                'xl': ['1.25rem', { lineHeight: '1.75rem' }],
                '2xl': ['1.5rem', { lineHeight: '2rem' }],
                '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
                '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
                '5xl': ['3rem', { lineHeight: '1' }],
                '6xl': ['3.75rem', { lineHeight: '1' }],
                '7xl': ['4.5rem', { lineHeight: '1' }],
                '8xl': ['6rem', { lineHeight: '1' }],
                '9xl': ['8rem', { lineHeight: '1' }],
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '128': '32rem',
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                blob: {
                    "0%": {
                        transform: "translate(0px, 0px) scale(1)"
                    },
                    "33%": {
                        transform: "translate(20px, -30px) scale(1.05)"
                    },
                    "66%": {
                        transform: "translate(-15px, 15px) scale(0.95)"
                    },
                    "100%": {
                        transform: "translate(0px, 0px) scale(1)"
                    },
                },
                "fade-in": {
                    "0%": {
                        opacity: "0",
                        transform: "translateY(10px)"
                    },
                    "100%": {
                        opacity: "1",
                        transform: "translateY(0)"
                    },
                },
                "slide-in": {
                    "0%": {
                        transform: "translateX(-100%)"
                    },
                    "100%": {
                        transform: "translateX(0)"
                    },
                },
                "pulse-soft": {
                    "0%, 100%": {
                        opacity: "1"
                    },
                    "50%": {
                        opacity: "0.8"
                    },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "blob": "blob 7s infinite",
                "blob-slow": "blob 10s infinite",
                "fade-in": "fade-in 0.5s ease-out",
                "slide-in": "slide-in 0.3s ease-out",
                "pulse-soft": "pulse-soft 2s ease-in-out infinite",
            },
            backdropBlur: {
                xs: '2px',
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.25)',
            },
        },
    },
    plugins: [
        tailwindcssAnimate,
        plugin(function ({ addUtilities, addComponents, theme }) {
            // Animation delay utilities
            addUtilities({
                '.animation-delay-100': {
                    'animation-delay': '100ms',
                },
                '.animation-delay-200': {
                    'animation-delay': '200ms',
                },
                '.animation-delay-300': {
                    'animation-delay': '300ms',
                },
                '.animation-delay-500': {
                    'animation-delay': '500ms',
                },
                '.animation-delay-1000': {
                    'animation-delay': '1000ms',
                },
                '.animation-delay-2000': {
                    'animation-delay': '2000ms',
                },
                '.animation-delay-4000': {
                    'animation-delay': '4000ms',
                },

                // Text shadow utilities
                '.text-shadow': {
                    'text-shadow': '0 2px 4px rgba(0, 0, 0, 0.1)',
                },
                '.text-shadow-md': {
                    'text-shadow': '0 4px 8px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)',
                },
                '.text-shadow-lg': {
                    'text-shadow': '0 15px 30px rgba(0, 0, 0, 0.11), 0 5px 15px rgba(0, 0, 0, 0.08)',
                },
                '.text-shadow-none': {
                    'text-shadow': 'none',
                },

                // Glass morphism utilities
                '.glass': {
                    'background': 'rgba(255, 255, 255, 0.1)',
                    'backdrop-filter': 'blur(10px)',
                    'border': '1px solid rgba(255, 255, 255, 0.2)',
                },
                '.glass-dark': {
                    'background': 'rgba(0, 0, 0, 0.1)',
                    'backdrop-filter': 'blur(10px)',
                    'border': '1px solid rgba(255, 255, 255, 0.1)',
                },

                // Safe area utilities for mobile devices
                '.pb-safe': {
                    'padding-bottom': 'env(safe-area-inset-bottom)',
                },
                '.pt-safe': {
                    'padding-top': 'env(safe-area-inset-top)',
                },
                '.pl-safe': {
                    'padding-left': 'env(safe-area-inset-left)',
                },
                '.pr-safe': {
                    'padding-right': 'env(safe-area-inset-right)',
                },
            });

            // Responsive container components
            addComponents({
                '.container-responsive': {
                    width: '100%',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    paddingLeft: theme('spacing.4'),
                    paddingRight: theme('spacing.4'),
                    '@screen sm': {
                        paddingLeft: theme('spacing.6'),
                        paddingRight: theme('spacing.6'),
                    },
                    '@screen lg': {
                        paddingLeft: theme('spacing.8'),
                        paddingRight: theme('spacing.8'),
                    },
                    '@screen xl': {
                        maxWidth: theme('screens.xl'),
                    },
                    '@screen 2xl': {
                        maxWidth: theme('screens.2xl'),
                    },
                },

                // Mobile-first responsive text
                '.text-responsive': {
                    fontSize: theme('fontSize.base'),
                    '@screen sm': {
                        fontSize: theme('fontSize.lg'),
                    },
                    '@screen lg': {
                        fontSize: theme('fontSize.xl'),
                    },
                },

                // Touch-friendly button sizes
                '.btn-touch': {
                    minHeight: '44px',
                    minWidth: '44px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                },
            });
        }),
    ],
} satisfies Config

export default config
