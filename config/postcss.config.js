module.exports = {
  plugins: {
    'postcss-import': {},
    'autoprefixer': {
      browsers: [
        '>1%',
        'last 4 versions',
        'Firefox ESR',
        'not ie < 9',
      ]
    },
    'precss': {},
    'postcss-flexbugs-fixes': {},
  }
}
