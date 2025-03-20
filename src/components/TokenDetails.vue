<template>
  <div 
    v-if="isVisible" 
    class="fixed top-4 right-4 bg-white rounded-xl shadow-lg p-4 max-w-md z-50"
    :class="isClosing ? 'animate-fade-out' : 'animate-slide-down'"
  >
    <div class="flex justify-between items-center mb-2">
      <h3 class="text-sm font-medium text-gray-700">token消耗</h3>
      <button @click="handleClose" class="text-gray-400 hover:text-gray-600">
        <XMarkIcon class="h-5 w-5" />
      </button>
    </div>
    <pre class="text-xs overflow-auto max-h-40 bg-gray-50 p-2 rounded">{{ details }}</pre>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue';
import { XMarkIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  details: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close']);

const isVisible = ref(false);
const isClosing = ref(false);
let timeout = null;

// 监听 details 变化
watch(() => props.details, (newDetails) => {
  if (newDetails) {
    // 清除之前的定时器
    if (timeout) {
      clearTimeout(timeout);
    }
    isVisible.value = true;
    isClosing.value = false;
    
    // 3秒后开始关闭动画
    timeout = setTimeout(() => {
      closeWithAnimation();
    }, 3000);
  }
});

// 带动画的关闭
const closeWithAnimation = () => {
  isClosing.value = true;
  // 等待动画完成后真正关闭
  setTimeout(() => {
    isVisible.value = false;
    emit('close');
  }, 300); // 动画持续时间
};

// 处理手动关闭
const handleClose = () => {
  if (timeout) {
    clearTimeout(timeout);
  }
  closeWithAnimation();
};

// 组件卸载前清理
onBeforeUnmount(() => {
  if (timeout) {
    clearTimeout(timeout);
  }
});
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

@keyframes fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.animate-slide-down {
  animation: slide-down 0.3s ease-out forwards;
}

.animate-fade-out {
  animation: fade-out 0.3s ease-out forwards;
}
</style> 