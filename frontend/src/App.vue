<template>
  <!-- В будущем здесь, вероятно, будет навигация и <router-view /> -->
  <img alt="Vue logo" src="./assets/logo.png">
  <h1>Community Upgrade Platform</h1>
  <HelloWorld msg="Frontend Setup Complete - Ready for Development!"/>
  <!-- <router-view/> -->
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  components: {
    HelloWorld
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
}
/* Глобальные стили можно добавить здесь или в отдельном css/scss файле */
</style>
