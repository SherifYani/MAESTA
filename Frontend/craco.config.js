const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Ignore missing source map warnings from third-party packages
      webpackConfig.ignoreWarnings = [
        ...(webpackConfig.ignoreWarnings || []),
        {
          module: /@mediapipe\/tasks-vision/,
        },
      ];
      return webpackConfig;
    },
  },
  devServer: (devServerConfig) => {
    if (Array.isArray(devServerConfig.allowedHosts)) {
      devServerConfig.allowedHosts = devServerConfig.allowedHosts.filter(Boolean);
      if (devServerConfig.allowedHosts.length === 0) {
        devServerConfig.allowedHosts = ['localhost', '127.0.0.1'];
      }
    }

    return devServerConfig;
  },
  style: {
    postcss: {
      plugins: [
        tailwindcss('./tailwind.config.js'),
        autoprefixer,
      ],
    },
  },
}
