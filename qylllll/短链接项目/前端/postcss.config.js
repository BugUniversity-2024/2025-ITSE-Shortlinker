module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {
      overrideBrowserslist: [
        'Chrome >= 54',
        'ChromeAndroid >= 54',
        'Edge >= 79',
        'Firefox >= 60',
        'Safari >= 9',
        'iOS >= 9'
      ],
      flexbox: 'no-2009',
      grid: 'autoplace'
    },
  },
}