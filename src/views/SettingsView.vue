<template>
  <div class="h-screen flex flex-col overflow-auto">
    <!-- 顶部导航 -->
    <header class="bg-white shadow-sm py-4 sticky top-0 z-30">
      <div class="container mx-auto px-4 flex justify-between items-center">
        <h1 class="text-2xl font-semibold text-apple-black">设置</h1>
        <router-link to="/" class="btn bg-transparent text-apple-blue border border-apple-blue hover:bg-apple-blue hover:text-white">
          返回聊天
        </router-link>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="flex-1 container mx-auto px-4 py-6 pb-20">
      <div class="max-w-3xl mx-auto">
        <div class="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h2 class="text-xl font-medium mb-4">API 设置</h2>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">OpenRouter API Key</label>
            <input 
              type="password" 
              v-model="settingsStore.apiKey" 
              class="input" 
              placeholder="sk-or-..."
              @input="settingsStore.saveSettings()"
            />
            <p class="mt-1 text-sm text-gray-500">用于访问不同LLM模型的API密钥</p>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">选择模型</label>
            <div class="space-y-2">
              <!-- 使用默认 key 时显示提示 -->
              <div v-if="settingsStore.isUsingDefaultKey" class="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                使用网站提供的默认 API Key 时，仅能使用免费模型。如需使用其他模型，请设置自己的 API Key。
              </div>

              <select 
                v-model="settingsStore.selectedModel" 
                class="input"
                @change="settingsStore.saveSettings()"
                :disabled="settingsStore.isLoadingModels"
              >
                <option v-for="model in settingsStore.availableModels" 
                        :key="model.id" 
                        :value="model.id"
                >
                  {{ model.name }}
                </option>
              </select>
              
              <!-- 加载状态 -->
              <div v-if="settingsStore.isLoadingModels" class="text-sm text-gray-500">
                正在加载可用模型...
              </div>
              
              <!-- 错误提示 -->
              <div v-if="settingsStore.modelError" class="text-sm text-red-500">
                {{ settingsStore.modelError }}
              </div>
              
              <!-- 选中模型的详细信息 -->
              <div v-if="selectedModelDetails" class="bg-gray-50 p-3 rounded-lg text-sm">
                <p class="text-gray-600">{{ selectedModelDetails.description }}</p>
                <p class="mt-1 text-gray-500">
                  上下文长度: {{ selectedModelDetails.context_length }} tokens
                </p>
                <div class="mt-1 text-gray-500">
                  价格: 
                  <span class="text-xs">
                    输入 ${{ selectedModelDetails.pricing.prompt }} / 1K tokens, 
                    输出 ${{ selectedModelDetails.pricing.completion }} / 1K tokens
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">温度</label>
            <div class="flex items-center gap-4">
              <input 
                type="range" 
                v-model.number="settingsStore.temperature" 
                min="0" 
                max="2" 
                step="0.1" 
                class="w-full"
                @input="settingsStore.saveSettings()"
              />
              <span class="text-sm font-medium">{{ settingsStore.temperature.toFixed(1) }}</span>
            </div>
            <p class="mt-1 text-sm text-gray-500">控制生成结果的随机性（0为确定性，2为最具创造性）</p>
          </div>
        </div>
        
        <div class="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-medium">系统提示词</h2>
            <button 
              @click="settingsStore.toggleSystemPromptPreview" 
              class="text-sm px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              {{ settingsStore.showSystemPromptPreview ? '编辑' : '预览' }}
            </button>
          </div>
          
          <div v-if="!settingsStore.showSystemPromptPreview">
            <textarea 
              v-model="settingsStore.systemPrompt" 
              class="input h-32 font-mono text-sm"
              placeholder="输入系统提示词..."
              @input="settingsStore.saveSettings()"
            ></textarea>
            <p class="mt-1 text-sm text-gray-500">系统提示词定义了AI助手的行为、能力和限制</p>
          </div>
          
          <div v-else class="border rounded-lg p-4 prose prose-sm max-w-none">
            <div v-html="formatMarkdown(settingsStore.systemPrompt)"></div>
          </div>
        </div>
        
        <div class="bg-white rounded-2xl shadow-md p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-medium">当前对话设置</h2>
            <div>
              <button 
                class="btn bg-red-500 hover:bg-red-600"
                @click="settingsStore.clearAllChats"
              >
                清除所有对话
              </button>
            </div>
          </div>
          
          <div v-if="currentChat">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">对话名称</label>
              <input 
                type="text" 
                v-model="currentChat.title" 
                class="input" 
                placeholder="对话名称..."
                @input="chatStore.saveChats()"
              />
            </div>
            
            <div class="mb-4">
              <div class="flex justify-between items-center mb-1">
                <label class="block text-sm font-medium text-gray-700">
                  自定义提示词（仅用于当前对话）
                </label>
                <button 
                  v-if="currentChat.customSystemPrompt"
                  @click="currentChat.showCustomPromptPreview = !currentChat.showCustomPromptPreview" 
                  class="text-xs px-2 py-0.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  {{ currentChat.showCustomPromptPreview ? '编辑' : '预览' }}
                </button>
              </div>
              
              <div v-if="!currentChat.customSystemPrompt || !currentChat.showCustomPromptPreview">
                <textarea 
                  v-model="currentChat.customSystemPrompt" 
                  class="input h-32 font-mono text-sm"
                  placeholder="输入自定义提示词..."
                  @input="chatStore.saveChats()"
                ></textarea>
              </div>
              
              <div v-else class="border rounded-lg p-4 prose prose-sm max-w-none">
                <div v-html="formatMarkdown(currentChat.customSystemPrompt)"></div>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center text-gray-500 py-4">
            没有选中的对话
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import { useSettingsStore } from '../stores/settings';
import { useChatStore } from '../stores/chat';
import { marked } from 'marked';

// 状态管理
const settingsStore = useSettingsStore();
const chatStore = useChatStore();

// 监听 API Key 变化，重新获取模型列表
watch(() => settingsStore.apiKey, (newKey) => {
  if (newKey) {
    settingsStore.fetchAvailableModels();
  }
});

// 获取选中模型的详细信息
const selectedModelDetails = computed(() => {
  return settingsStore.availableModels.find(
    model => model.id === settingsStore.selectedModel
  );
});

// 组件挂载后，如果有 API Key 就获取模型列表
if (settingsStore.apiKey) {
  settingsStore.fetchAvailableModels();
}

// 当前聊天
const currentChat = computed(() => {
  if (chatStore.chatHistory.length === 0) {
    return null;
  }
  return chatStore.chatHistory[chatStore.currentChatIndex];
});

// 格式化Markdown内容
const formatMarkdown = (content) => {
  return marked(content);
};
</script> 