module.exports = {
    webpack: (config, { isServer }) => {
      // Ignore source map files globally
      config.module.rules.push({
        test: /\.map$/,
        loader: 'ignore-loader',
      });
  
      // // If you are using Puppeteer or chrome-aws-lambda, ensure Webpack doesn't process those files
      // config.resolve.alias = {
      //   ...config.resolve.alias,
      //   'chrome-aws-lambda': require.resolve('chrome-aws-lambda'),
      // };
  
      return config;
    },
  };
  