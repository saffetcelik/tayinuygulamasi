module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // webpack-dev-server uyarılarını bastırma
      if (webpackConfig.devServer) {
        // Eski uyarı veren seçenekleri kaldır
        delete webpackConfig.devServer.onBeforeSetupMiddleware;
        delete webpackConfig.devServer.onAfterSetupMiddleware;
        
        // Yeni seçeneklerle değiştir
        webpackConfig.devServer.setupMiddlewares = (middlewares, devServer) => {
          if (!devServer) {
            throw new Error('webpack-dev-server is not defined');
          }
          return middlewares;
        };
      }
      
      return webpackConfig;
    },
  },
};
