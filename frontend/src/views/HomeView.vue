<template>
  <div class="home">
    <h2>Home View / Dashboard</h2>
    <p>This view component will be rendered by the router for the '/' path (once configured).</p>
    <p>It should display the main content, like a list of available upgrade packages.</p>
    <!-- Здесь будет основной контент страницы -->
  </div>
</template>

<script>
// @ is an alias to /src
// import PackageList from '@/components/PackageList.vue' // Пример импорта компонента

export default {
  name: 'HomeView',
  components: {
    // PackageList // Регистрация компонента
  }
}
</script>

<style scoped>
.home {
  padding: 20px;
}
</style>
