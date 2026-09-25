/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Pistachio Green Theme (#B8D8A2)
        "pistachio": "#B8D8A2",
        "pistachio-dark": "#3a6127",
        "pistachio-deep": "#244118",
        "pistachio-light": "#f0f7ec",
        "pistachio-subtle": "#dceccf",
        
        // Primary brand mapping to #B8D8A2 with dark/black readable text
        "primary": "#B8D8A2",
        "primary-container": "#a2c889",
        "primary-fixed": "#e4f1dc",
        "primary-fixed-dim": "#d3e7c7",
        "on-primary": "#142611",
        "on-primary-fixed": "#172d13",
        "on-primary-fixed-variant": "#23421d",
        "on-primary-container": "#142611",
        
        // Muted Forest & Olive Secondary accents
        "secondary": "#4d733b",
        "secondary-container": "#B8D8A2",
        "secondary-fixed": "#e4f1dc",
        "secondary-fixed-dim": "#d3e7c7",
        "on-secondary": "#ffffff",
        "on-secondary-fixed": "#172d13",
        "on-secondary-fixed-variant": "#23421d",
        "on-secondary-container": "#142611",
        
        // Tertiary
        "tertiary": "#2f5221",
        "tertiary-container": "#dceccf",
        "tertiary-fixed": "#e4f1dc",
        "tertiary-fixed-dim": "#d3e7c7",
        "on-tertiary": "#ffffff",
        "on-tertiary-fixed": "#142611",
        "on-tertiary-fixed-variant": "#244118",
        "on-tertiary-container": "#142611",
        
        // Clean Pure White Backgrounds & Surfaces
        "background": "#ffffff",
        "surface": "#ffffff",
        "surface-dim": "#f3f4f6",
        "surface-bright": "#ffffff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#fafcf9",
        "surface-container": "#f3f7f1",
        "surface-container-high": "#eaf2e8",
        "surface-container-highest": "#dfecdc",
        
        // Dark / Black text for maximum readability
        "on-surface": "#111827",
        "on-surface-variant": "#374151",
        "outline": "#9ca3af",
        "outline-variant": "#e5e7eb",
        
        // Errors & Inverses
        "error": "#b91c1c",
        "error-container": "#fee2e2",
        "on-error": "#ffffff",
        "on-error-container": "#7f1d1d",
        "inverse-surface": "#1f2937",
        "inverse-on-surface": "#f9fafb",
        "inverse-primary": "#B8D8A2",
      },
      fontFamily: {
        "sans": ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        "body": ["'Plus Jakarta Sans'", "sans-serif"],
        "mono": ["'JetBrains Mono'", "monospace"],
        "code": ["'JetBrains Mono'", "monospace"],
        "match": ["'JetBrains Mono'", "monospace"],
      }
    },
  },
  plugins: [],
}
