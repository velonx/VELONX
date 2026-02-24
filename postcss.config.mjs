const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' ? {
      cssnano: {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
          normalizeWhitespace: true,
          minifyFontValues: true,
          minifyGradients: true,
          reduceIdents: false, // Keep animation names intact
          zindex: false, // Don't modify z-index values
        }],
      },
    } : {}),
  },
};

export default config;
