/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  safelist: [
    // For General Waste
    'bg-gradient-to-br',
    'from-rose-100',
    'via-rose-50',
    'to-white',
    'bg-gradient-to-r',
    'from-rose-500',
    'to-red-500',
    'text-rose-600',
    'shadow-rose-200',
    'from-rose-200',
    'to-rose-400',

    // For Commingled
    'from-amber-100',
    'via-amber-50',
    'to-white',
    'from-amber-500',
    'to-yellow-500',
    'text-amber-600',
    'shadow-amber-200',
    'from-amber-200',
    'to-amber-400',

    // For Organic
    'from-emerald-100',
    'via-emerald-50',
    'to-white',
    'from-emerald-500',
    'to-green-500',
    'text-emerald-600',
    'shadow-emerald-200',
    'from-emerald-200',
    'to-emerald-400',

    // For Paper & Cardboard
    'from-blue-100',
    'via-blue-50',
    'to-white',
    'from-blue-500',
    'to-indigo-500',
    'text-blue-600',
    'shadow-blue-200',
    'from-blue-200',
    'to-blue-400',

    // For Glass
    'from-purple-100',
    'via-purple-50',
    'to-white',
    'from-purple-500',
    'to-violet-500',
    'text-purple-600',
    'shadow-purple-200',
    'from-purple-200',
    'to-purple-400',

    // Fallback/default colors
    'from-gray-100',
    'via-gray-50',
    'to-white',
    'from-gray-500',
    'to-slate-500',
    'text-gray-600',
    'shadow-gray-200',
    'from-gray-200',
    'to-gray-400',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: 0,
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: 0,
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
