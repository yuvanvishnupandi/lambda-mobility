/**
 * Lambda Design System Tokens
 */

const colors = require('tailwindcss/colors')

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'Menlo', 'Consolas', 'monospace'],
      },

      /* ── Semantic tokens ────────────────────────────────────────────── */
      colors: {
        // Elevation surfaces on the industrial chassis.
        // 0 = chassis (page), 1 = highlight highlight-tone, 2 = raised panel,
        // 3 = recessed well, 4 = control surface, 5 = deepest recess.
        surface: {
          0: '#FBFBFA',
          1: '#FFFFFF',
          2: '#F7F7F4',
          3: '#EFEFEA',
          4: '#E5E5DF',
          5: '#DCDCD5',
        },
        line: {
          soft: '#EBEBE6',
          DEFAULT: '#E5E5DF',
          strong: '#D0D0C8',
          brand: '#FF6B4A',
        },
        ink: {
          DEFAULT: '#111111',
          secondary: '#444440',
          muted: '#666662',
          faint: '#888880',
        },
        // The safety-orange accent. It is the emergency-stop button of the
        // palette — interactive triggers and live status only.
        brand: {
          50: '#fff1f2',
          100: '#ffe0e3',
          200: '#ffc9cd',
          300: '#ff9ba4',
          400: '#ff7680',
          500: '#ff4757',
          600: '#e93a49',
          700: '#c22f3c',
          800: '#9c2833',
          900: '#7a242c',
          950: '#450f15',
        },
        // Secondary technical accent — muted steel for selection rails etc.
        iris: {
          50: '#f4f6fa',
          100: '#e5eaf2',
          200: '#c3cfe0',
          300: '#94a8c4',
          400: '#647ba0',
          500: '#486085',
          600: '#3a4f6f',
          700: '#2f415c',
          800: '#28364b',
          900: '#222c3d',
          950: '#141b26',
        },

        /* ── Signal colours (data-meaning only: LEDs, trends, charts) ──── */
        slate: colors.slate,
        gray: colors.slate,
        zinc: colors.slate,
        neutral: colors.slate,
        stone: colors.slate,
        blue: colors.blue,
        indigo: colors.indigo,
        violet: colors.violet,
        purple: colors.purple,
        fuchsia: colors.fuchsia,
        pink: colors.pink,
        rose: colors.rose,
        red: colors.red,
        orange: colors.orange,
        amber: colors.amber,
        yellow: colors.yellow,
        lime: colors.lime,
        green: colors.green,
        emerald: colors.emerald,
        teal: colors.teal,
        cyan: colors.cyan,
        sky: colors.sky,
        aqua: {
          50: '#e8fafd',
          100: '#d0f4fa',
          200: '#a5e8f4',
          300: '#6ed6ea',
          400: '#2cc9e3',
          500: '#12aecb',
          600: '#0c8ba6',
          700: '#0c6e84',
          800: '#0f5768',
          900: '#123f4b',
          950: '#08222b',
        },
        mint: {
          50: '#e6fbf4',
          100: '#ccf6e7',
          200: '#9bebd0',
          300: '#5fddb2',
          400: '#28c68f',
          500: '#12a876',
          600: '#0e8a61',
          700: '#0b6c4c',
          800: '#0a553d',
          900: '#083f2e',
          950: '#072a1f',
        },
      },

      borderRadius: {
        xs: '0.25rem',   //   4px — badges, tiny keys
        sm: '0.375rem',  //   6px — small controls
        DEFAULT: '0.5rem',
        md: '0.625rem',  //  10px — inputs, small cards
        lg: '0.75rem',   //  12px — panels
        xl: '1rem',      //  16px — large panels
        '2xl': '1.5rem', //  24px — bezels, hero modules
        '3xl': '1.875rem',
      },

      boxShadow: {
        /* Neumorphic dual-shadow system — the core visual signature. */
        card: '8px 8px 16px #babecc, -8px -8px 16px #ffffff',
        key: '5px 5px 10px #babecc, -5px -5px 10px #ffffff, inset 1px 1px 0 rgba(255,255,255,0.6)',
        'key-accent':
          '4px 4px 8px rgba(166,50,60,0.45), -4px -4px 8px rgba(255,100,110,0.45), inset 1px 1px 0 rgba(255,255,255,0.25)',
        pressed: 'inset 6px 6px 12px #babecc, inset -6px -6px 12px #ffffff',
        recessed: 'inset 4px 4px 8px #babecc, inset -4px -4px 8px #ffffff',
        groove: 'inset 2px 2px 4px #babecc, inset -2px -2px 4px #ffffff',
        sharp: '4px 4px 8px rgba(0,0,0,0.15), -1px -1px 1px rgba(255,255,255,0.8)',
        'glow-accent': '0 0 10px 2px rgba(255,71,87,0.55)',
        'glow-mint': '0 0 10px 2px rgba(34,197,94,0.5)',
        'glow-amber': '0 0 10px 2px rgba(217,119,6,0.5)',
        'glow-rose': '0 0 10px 2px rgba(225,29,72,0.5)',
        float: '14px 14px 28px #b3b8c7, -14px -14px 28px #ffffff',
        /* Compatibility aliases — legacy elevation names map onto the
           neumorphic scale so ported screens keep coherent depth. */
        e0: 'inset 1px 1px 2px rgba(163,177,198,0.4), inset -1px -1px 2px rgba(255,255,255,0.8)',
        e1: '5px 5px 10px #babecc, -5px -5px 10px #ffffff',
        e2: '8px 8px 16px #babecc, -8px -8px 16px #ffffff',
        e3: '14px 14px 28px #b3b8c7, -14px -14px 28px #ffffff',
        xs: '1px 1px 2px rgba(45,52,54,0.08)',
        'glow-sm': '0 0 10px 2px rgba(255,71,87,0.45)',
        'card-hover': '14px 14px 28px #b3b8c7, -14px -14px 28px #ffffff',
      },

      backgroundImage: {
        // Blueprint grid for schematic / technical sections.
        'grid-fine':
          'linear-gradient(to right, rgba(45,52,54,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(45,52,54,0.05) 1px, transparent 1px)',
        'grid-dots': 'radial-gradient(rgba(45,52,54,0.09) 1px, transparent 1px)',
        'accent-rail': 'linear-gradient(90deg, #ff4757 0%, #ff7680 100%)',
        'panel-sheen':
          'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 46%)',
        'glass-fade': 'linear-gradient(180deg, rgba(240,242,245,0.96) 0%, rgba(224,229,236,0.94) 100%)',
      },

      backgroundSize: {
        'grid-fine': '40px 40px',
        'grid-dots': '18px 18px',
      },

      transitionTimingFunction: {
        // Mechanical spring with slight overshoot — switches, not fades.
        mech: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        snap: 'cubic-bezier(0.16, 1, 0.3, 1)',
        silk: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },

      animation: {
        'page-in': 'pageIn 0.32s cubic-bezier(0.175, 0.885, 0.32, 1.275) both',
        rise: 'riseIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both',
        pop: 'popIn 0.26s cubic-bezier(0.175, 0.885, 0.32, 1.275) both',
        fade: 'fadeIn 0.28s ease-out both',
        'slide-right': 'slideInRight 0.34s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-left': 'slideInLeft 0.34s cubic-bezier(0.16, 1, 0.3, 1) both',
        'pulse-soft': 'pulseSoft 2.6s ease-in-out infinite',
        'ping-slow': 'pingSlow 2.4s cubic-bezier(0, 0, 0.2, 1) infinite',
        scan: 'scanY 5.5s linear infinite',
        sheen: 'sheen 2.6s ease-in-out infinite',
        shimmer: 'shimmer 1.6s linear infinite',
        spin: 'spin 4s linear infinite',
      },

      keyframes: {
        pageIn: {
          '0%': { opacity: '0', transform: 'translate3d(10px, 0, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        riseIn: {
          '0%': { opacity: '0', transform: 'translate3d(0, 14px, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translate3d(18px, 0, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translate3d(-18px, 0, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
        pingSlow: {
          '0%': { transform: 'scale(1)', opacity: '0.7' },
          '75%, 100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        scanY: {
          '0%': { transform: 'translateY(-10%)', opacity: '0' },
          '12%': { opacity: '0.8' },
          '88%': { opacity: '0.8' },
          '100%': { transform: 'translateY(1000%)', opacity: '0' },
        },
        sheen: {
          '0%': { backgroundPosition: '-160% 0' },
          '100%': { backgroundPosition: '260% 0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
