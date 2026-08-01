/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D4AF37',
          50: '#FBF6E8',
          100: '#F5EBC8',
          200: '#E8D48A',
          400: '#E0C060',
          500: '#D4AF37',
          600: '#B8941F',
          700: '#967A18',
        },
        luxgold: {
          DEFAULT: '#D4AF37',
          50: '#FBF6E8',
          100: '#F0D78C',
          200: '#E8C547',
          400: '#D4AF37',
          500: '#C9A227',
          600: '#A88620',
          dim: '#8A7020',
        },
        honey: {
          DEFAULT: '#E8C547',
          50: '#FFF9EE',
          100: '#FEF0D0',
          600: '#C9A227',
          700: '#A88620',
        },
        apricot: {
          DEFAULT: '#E8853A',
          50: '#FFF6ED',
          100: '#FFEAD5',
          600: '#D06E26',
          700: '#B85A18',
        },
        terracotta: { DEFAULT: '#D4644A', 50: '#FDF0EC', 600: '#B84E36' },
        plum: { DEFAULT: '#7A3E5F', 50: '#FCF4F8', 700: '#5C2E48' },
        basil: { DEFAULT: '#6B9B5E', 50: '#F0F5EE', 600: '#4A7042' },
        sage: { DEFAULT: '#6B9B5E', 50: '#F0F5EE' },
        peach: { DEFAULT: '#FFE8D6', 50: '#FFF5ED' },
        charcoal: {
          DEFAULT: '#121212',
          50: '#2A2A2A',
          100: '#1E1E1E',
          200: '#181818',
          300: '#141414',
          800: '#0F0F0F',
          900: '#0A0A0A',
        },
        luxcream: { DEFAULT: '#F5EDE0', muted: '#A89880', dim: '#7A7060' },
        cream: { DEFAULT: '#FFF7ED' },
        ink: { DEFAULT: '#2C2419' },
        muted: { DEFAULT: '#8B7355' },
        line: { DEFAULT: '#F0DFC8' },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: { xl: '0.875rem', '2xl': '1.25rem', '3xl': '1.5rem' },
      boxShadow: {
        card: '0 1px 3px rgba(44,36,25,0.06), 0 8px 24px -8px rgba(212,175,55,0.15)',
        lift: '0 8px 32px -8px rgba(212,175,55,0.35), 0 16px 48px -16px rgba(0,0,0,0.5)',
        nav: '0 1px 0 rgba(212,175,55,0.12)',
        warm: '0 4px 24px -4px rgba(212,175,55,0.3)',
        lux: '0 4px 30px -4px rgba(212,175,55,0.25), inset 0 1px 0 rgba(255,255,255,0.06)',
        glass: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.08)',
      },
      backgroundImage: {
        'warm-radial':
          'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.12), transparent 58%)',
        'lux-hero':
          'linear-gradient(180deg, #1A1A1A 0%, #121212 45%, #0F0F0F 100%)',
        'lux-glow':
          'radial-gradient(ellipse at 30% 0%, rgba(212,175,55,0.18), transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(232,133,58,0.08), transparent 45%)',
        'gold-line': 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
      },
    },
  },
  plugins: [],
};
