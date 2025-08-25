import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        jakarta: [
          "Plus Jakarta Sans",
          "-apple-system",
          "Roboto",
          "Helvetica",
          "sans-serif",
        ],
        inter: ["Inter", "-apple-system", "Roboto", "Helvetica", "sans-serif"],
        vietnam: [
          "Be Vietnam Pro",
          "-apple-system",
          "Roboto",
          "Helvetica",
          "sans-serif",
        ],
        roboto: ["Roboto", "sans-serif"],
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Brand Colors (merged)
        brand: {
          blue: "#3839C9",
          purple: "#191A78",
          light: "#F7F9FF",
          gray: "#A2A2A2",
          text: {
            primary: "#20242A",
            secondary: "#637996",
          },
          primary: "#505BFB",
          secondary: "#878EFF",
          active: "#424BC9",
          accent: "#C6FF9A",
          dark: "#3839C9",
        },
        footer: {
          bg: "rgba(192, 200, 255, 0.26)",
        },
        // Custom colors for OnboardTicket design
        'ticket-primary': '#505BFB',
        'ticket-secondary': '#878EFF',
        'ticket-accent': '#C6FF9A',
        'ticket-dark': '#424BC9',
        'ticket-darker': '#3839C9',
        'ticket-light': 'rgba(135, 142, 255, 0.38)',
        'ticket-footer': 'rgba(192, 200, 255, 0.26)',
        'ticket-gray': '#4D4848',
        'ticket-gray-light': 'rgba(136, 125, 125, 0.46)',
        'ticket-text': '#524C4C',

        // OnboardTicket custom colors
        'ob-primary': '#3839C9',
        'ob-teal': '#227D9B',
        'ob-background': '#E7E9FF',
        'ob-gray': '#A2A2A2',
        'ob-dark': '#20242A',
        'ob-text': '#303850',
      },
      // OnboardTicket brand colors
        'onboard': {
          primary: '#505BFB',
          secondary: '#C6FF9A',
          purple: {
            50: '#F6F6FF',
            100: '#878EFF',
            200: '#C0C8FF',
            300: '#878EFF',
            400: '#505BFB',
            500: '#424BC9',
            600: '#3839C9',
          },
          green: {
            400: '#C6FF9A',
          },
          gray: {
            100: '#FEF7FF',
            200: '#F6F6FF',
            300: '#4D4848',
            400: '#524C4C',
            500: '#616161',
          },
        },
      
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
