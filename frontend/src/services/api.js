// import axios from 'axios';

// const apiClient = axios.create({
//   baseURL: '/api', // Используем относительный URL, который будет проксирован devServer'ом
//   headers: {
//     'Accept': 'application/json',
//     'Content-Type': 'application/json',
//     // 'X-Requested-With': 'XMLHttpRequest' // Часто нужен для Laravel
//   }
// });

// // Можно добавить перехватчики запросов/ответов для добавления токенов, обработки ошибок и т.д.
// // apiClient.interceptors.request.use(config => { ... });
// // apiClient.interceptors.response.use(response => { ... }, error => { ... });


// export default {
//   // Пример функции для получения пакетов
//   getPackages() {
//     // return apiClient.get('/packages');
//     console.warn("API call 'getPackages' not implemented.");
//     return Promise.resolve({ data: [] }); // Возвращаем заглушку
//   },

//   // Добавь другие методы API здесь
//   // getPackageDetails(id) {
//   //   return apiClient.get();
//   // },
//   // applyPackage(id) {
//   //   return apiClient.post();
//   // }
// };

console.warn("API client not implemented yet in src/services/api.js. Install axios (or use fetch) and define API methods.");

export default {}; // Экспортируем пустой объект

