const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // Настройки сервера для разработки (например, прокси для API запросов к Laravel)
  devServer: {
     proxy: {
       // Проксировать запросы /api на бэкенд (Laravel), запущенный на порту 80
       // Важно: Убедись, что порт и URL соответствуют твоему бэкенду
       '/api': {
         target: 'http://localhost:80', // ИЛИ http://nginx, если frontend и backend в одной docker-compose сети
         changeOrigin: true,
         // pathRewrite: { '^/api': '' }, // Раскомментируй, если /api не нужен в URL бэкенда
       },
     },
     // Можно указать порт для dev-сервера Vue, если стандартный 8080 занят
     // port: 8081
   }
})
