/* module.exports = {
  webpackDevMiddleware: config => {
    config.watchOptions.poll = 300;
    return config;
  }
} */
// Latest versions of Next.js use a newer version of Webpack which moves
// watchOptions out from webpackDevMiddleware
module.exports = {
  webpack: (config) => {
    config.watchOptions.poll = 300;
    return config;
  },
};
