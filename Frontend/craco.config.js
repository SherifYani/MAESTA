const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.ignoreWarnings = [
        ...(webpackConfig.ignoreWarnings || []),
        (warning) => (
          warning.module?.resource?.includes('node_modules\\three-stdlib')
          || warning.module?.resource?.includes('node_modules/three-stdlib')
        ) && warning.message?.includes('Failed to parse source map'),
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
