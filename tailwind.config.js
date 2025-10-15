/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
  			'gradient-green-radial': 'radial-gradient(ellipse at top, #065f46, #000000)',
  			'gradient-green-dark': 'linear-gradient(135deg, #000000 0%, #064e3b 50%, #000000 100%)',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			// Deep Green Palette
  			deepGreen: {
  				50: '#f0fdf4',
  				100: '#dcfce7',
  				200: '#bbf7d0',
  				300: '#86efac',
  				400: '#4ade80',
  				500: '#10b981',
  				600: '#059669',
  				700: '#047857',
  				800: '#065f46',
  				900: '#064e3b',
  				950: '#022c22',
  			},
  			// Code Black Palette
  			codeBlack: {
  				50: '#f8f8f8',
  				100: '#f0f0f0',
  				200: '#e4e4e4',
  				300: '#d1d1d1',
  				400: '#b4b4b4',
  				500: '#9a9a9a',
  				600: '#6b6b6b',
  				700: '#4a4a4a',
  				800: '#2a2a2a',
  				900: '#1a1a1a',
  				950: '#0a0a0a',
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		boxShadow: {
  			'green-glow': '0 0 20px rgba(16, 185, 129, 0.3)',
  			'green-glow-lg': '0 0 40px rgba(16, 185, 129, 0.4)',
  			'green-inner': 'inset 0 2px 4px 0 rgba(16, 185, 129, 0.1)',
  		},
  		animation: {
  			'pulse-green': 'pulse-green 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			'glow': 'glow 2s ease-in-out infinite alternate',
  		},
  		keyframes: {
  			'pulse-green': {
  				'0%, 100%': { opacity: '1' },
  				'50%': { opacity: '0.7' },
  			},
  			'glow': {
  				'from': { boxShadow: '0 0 10px rgba(16, 185, 129, 0.4), 0 0 20px rgba(16, 185, 129, 0.3)' },
  				'to': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.6), 0 0 30px rgba(16, 185, 129, 0.4)' },
  			},
  		},
  	},
  	container: {
  		center: 'true'
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
