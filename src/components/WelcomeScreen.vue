<template>
  <div class="flex flex-col items-center justify-center h-full text-center p-6">
    <div class="mb-8">
      <svg class="w-16 h-16 mx-auto mb-4 text-apple-blue" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        <circle cx="12" cy="10" r="2"></circle>
        <path d="M8 10h.01M16 10h.01"></path>
      </svg>
      <h2 class="text-2xl font-semibold text-apple-black">欢迎使用 LLM 聊天助手</h2>
      <p class="text-gray-500 mt-2">AI 驱动的智能助手，随时为您提供帮助</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
      <div v-if="!hasApiKey" class="bg-white p-4 rounded-xl shadow-sm border border-red-200">
        <div class="flex items-start">
          <ExclamationTriangleIcon class="h-5 w-5 text-red-500 mr-2 mt-0.5" />
          <div>
            <h3 class="font-medium text-apple-black">设置 API 密钥</h3>
            <p class="text-sm text-gray-500 mt-1">您需要添加 OpenRouter API 密钥才能开始对话</p>
            <router-link to="/settings" class="btn mt-3 inline-flex items-center text-sm py-1.5">
              <CogIcon class="h-4 w-4 mr-1" />
              前往设置
            </router-link>
          </div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div class="flex items-start">
          <LightBulbIcon class="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
          <div>
            <h3 class="font-medium text-apple-black">自定义提示词</h3>
            <p class="text-sm text-gray-500 mt-1">通过设置系统提示词来定制AI助手的行为</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div class="flex items-start">
          <DocumentDuplicateIcon class="h-5 w-5 text-purple-500 mr-2 mt-0.5" />
          <div>
            <h3 class="font-medium text-apple-black">多对话支持</h3>
            <p class="text-sm text-gray-500 mt-1">可以创建多个对话，每个都有独立的上下文</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div class="flex items-start">
          <AdjustmentsHorizontalIcon class="h-5 w-5 text-green-500 mr-2 mt-0.5" />
          <div>
            <h3 class="font-medium text-apple-black">多种模型选择</h3>
            <p class="text-sm text-gray-500 mt-1">支持 OpenAI、Anthropic、Google 等多种 LLM 模型</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div class="flex items-start">
          <PencilSquareIcon class="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
          <div>
            <h3 class="font-medium text-apple-black">消息编辑</h3>
            <p class="text-sm text-gray-500 mt-1">可以编辑对话中的任何消息，包括您的提问和AI的回答</p>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8">
      <p class="text-gray-400 text-sm">输入消息开始对话</p>
      <ArrowDownIcon class="h-5 w-5 mx-auto mt-2 text-gray-400 animate-bounce" />
    </div>
  </div>
</template>

<script setup>
import { 
  ExclamationTriangleIcon, 
  LightBulbIcon, 
  DocumentDuplicateIcon,
  AdjustmentsHorizontalIcon,
  CogIcon,
  ArrowDownIcon,
  PencilSquareIcon
} from '@heroicons/vue/24/outline';
import { useSettingsStore } from '../stores/settings';

const settingsStore = useSettingsStore();

// 检查用户是否已设置API密钥
const hasApiKey = !!settingsStore.apiKey;
</script> 