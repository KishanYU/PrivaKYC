module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        card: '0 10px 30px rgba(15, 23, 42, 0.08)',
      },
      colors: {
        surface: {
          DEFAULT: '#f8fafc',
          muted: '#f1f5f9',
          card: '#ffffff',
          border: '#e2e8f0',
        },
        brand: {
          DEFAULT: '#2563eb',
          faint: '#eff6ff',
          dark: '#1d4ed8',
        },
      },
    },
  },
  plugins: [],
};
