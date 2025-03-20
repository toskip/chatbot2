<template>
  <div class="mt-2 border rounded-lg overflow-hidden">
    <div 
      class="flex justify-between items-center p-2 bg-gray-100 cursor-pointer"
      @click="isCollapsed = !isCollapsed"
    >
      <div class="text-xs font-medium text-gray-700 flex items-center">
        <span v-if="isLoading" class="mr-1">推理中</span>
        <span v-else>推理过程</span>
        <span v-if="isLoading" class="inline-flex ml-1">
          <span class="h-1.5 w-1.5 rounded-full bg-gray-500 animate-pulse mr-0.5"></span>
          <span class="h-1.5 w-1.5 rounded-full bg-gray-500 animate-pulse mr-0.5" style="animation-delay: 0.2s"></span>
          <span class="h-1.5 w-1.5 rounded-full bg-gray-500 animate-pulse" style="animation-delay: 0.4s"></span>
        </span>
      </div>
      <svg 
        class="h-4 w-4 text-gray-500 transition-transform duration-200"
        :class="{ 'rotate-180': !isCollapsed }"
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </div>
    <div 
      v-show="!isCollapsed" 
      class="p-2 bg-gray-50 text-xs font-mono overflow-auto max-h-60 whitespace-pre-wrap"
      ref="reasoningContent"
    >
      <div v-if="content" v-html="formatMarkdown(content)"></div>
      <div v-else-if="isLoading" class="text-gray-500">AI正在烧烤中...</div>
      <div v-else class="text-gray-500">无推理内容</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { marked } from 'marked';

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

const isCollapsed = ref(false);
const reasoningContent = ref(null);

// 格式化Markdown内容
const formatMarkdown = (text) => {
  // 先处理换行符，确保 \n\n 和 \n 被正确转换为换行
  const processedText = text
    .replace(/\\n\\n/g, '\n\n')  // 处理双换行
    .replace(/\\n/g, '\n');      // 处理单换行
  return marked(processedText);
};

// 滚动到底部
const scrollToBottom = () => {
  if (reasoningContent.value) {
    reasoningContent.value.scrollTop = reasoningContent.value.scrollHeight;
  }
};

// 监听内容变化，自动滚动
watch(
  () => props.content,
  () => {
    if (!isCollapsed.value) {
      // 使用 requestAnimationFrame 确保在下一帧执行滚动
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
  }
);

// 监听 isLoading 变化，如果开始加载就展开推理框
watch(
  () => props.isLoading,
  (newVal) => {
    if (newVal) {
      isCollapsed.value = false;
    }
  }
);
</script> 