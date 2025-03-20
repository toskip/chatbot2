<template>
  <div 
    v-if="details" 
    class="fixed top-4 right-4 bg-white rounded-xl shadow-lg p-4 max-w-md z-50 animate-slide-down"
  >
    <div class="flex justify-between items-center mb-2">
      <h3 class="text-sm font-medium text-gray-700">token消耗</h3>
      <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
        <XMarkIcon class="h-5 w-5" />
      </button>
    </div>
    <pre class="text-xs overflow-auto max-h-40 bg-gray-50 p-2 rounded">{{ details }}</pre>
  </div>
</template>

<script setup>
import { XMarkIcon } from '@heroicons/vue/24/outline';

defineProps({
  details: {
    type: String,
    default: ''
  }
});

defineEmits(['close']);
</script>

<style scoped>
@keyframes slide-down {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-down {
  animation: slide-down 0.3s ease-out forwards;
}
</style> 