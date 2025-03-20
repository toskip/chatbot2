<script setup>
// No imports needed here
</script>

<template>
  <router-view />
</template>

<style>
/* 全局样式已在style.css中定义 */

/* 安全区域填充 */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 1rem);
}
</style>
