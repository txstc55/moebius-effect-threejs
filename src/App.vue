<template>
  <Moebius/>
</template>

<script>
import Moebius from './components/Moebius.vue'

export default {
  name: 'App',
  components: {
    Moebius
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
}
html,
body {
  width: 100%;
  height: 100%;
  font-family: "Courier New", Courier, monospace;
  font-size: 95%;
  margin: 0; 
  height: 100%; 
  overflow: hidden

}
</style>
