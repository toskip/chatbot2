<template>
  <div class="min-h-screen flex flex-col">
    <!-- 顶部导航 -->
    <header class="bg-white shadow-sm py-4">
      <div class="container mx-auto px-4 flex justify-between items-center">
        <div class="flex items-center">
          <button 
            class="mr-3 block md:hidden p-1 rounded-md hover:bg-gray-100"
            @click="toggleSidebar"
          >
            <Bars3Icon class="h-6 w-6 text-apple-black" />
          </button>
          <h1 class="text-2xl font-semibold text-apple-black">扯淡聊天助手</h1>
        </div>
        <router-link to="/settings" class="btn bg-transparent text-apple-blue border border-apple-blue hover:bg-apple-blue hover:text-white">
          设置
        </router-link>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="flex-1 container mx-auto px-4 py-6 flex gap-4 relative">
      <!-- 移动设备侧边栏背景遮罩 -->
      <div 
        v-if="showSidebar" 
        class="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
        @click="toggleSidebar"
      ></div>
      
      <!-- 侧边栏：对话历史 -->
      <aside 
        class="w-64 bg-white rounded-2xl p-4 shadow-md z-20 transition-all duration-300"
        :class="{ 
          'fixed left-4 top-20': !isDesktop, 
          '-translate-x-full md:translate-x-0': !showSidebar && !isDesktop,
          'translate-x-0': showSidebar || isDesktop
        }"
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium">对话历史</h2>
          <div class="flex">
            <button 
              class="p-2 rounded-full hover:bg-gray-100 md:hidden"
              @click="toggleSidebar"
            >
              <XMarkIcon class="h-5 w-5 text-gray-500" />
            </button>
            <button 
              class="p-2 rounded-full hover:bg-gray-100" 
              @click="chatStore.createNewChat"
            >
              <PlusIcon class="h-5 w-5 text-apple-blue" />
            </button>
          </div>
        </div>
        <div class="space-y-2 overflow-y-auto max-h-[calc(100vh-12rem)]">
          <button 
            v-for="(chat, index) in chatStore.chatHistory" 
            :key="index"
            class="w-full text-left p-2 rounded-lg hover:bg-gray-100 flex items-center gap-2"
            :class="{ 'bg-gray-100': chatStore.currentChatIndex === index }"
            @click="() => {
              chatStore.setCurrentChat(index);
              if (!isDesktop) toggleSidebar();
            }"
          >
            <ChatBubbleLeftIcon class="h-4 w-4" />
            <span class="truncate">{{ chat.title || '新对话' }}</span>
          </button>
        </div>
      </aside>

      <!-- 主聊天区域 -->
      <section class="flex-1 flex flex-col bg-white rounded-2xl shadow-md overflow-hidden">
        <!-- 对话区域顶部工具栏 -->
        <div class="border-b p-2 flex justify-end">
          <button 
            class="text-apple-blue hover:bg-gray-100 p-1.5 rounded-md flex items-center text-sm"
            @click="toggleContextViewer"
            title="导出聊天记录"
          >
            <DocumentTextIcon class="h-4 w-4 mr-1" />
            <span>导出记录</span>
          </button>
        </div>
        
        <!-- 对话区域 -->
        <div 
          class="flex-1 p-4 overflow-y-auto" 
          ref="chatContainer"
          :class="{'pb-safe': isMobile}"
        >
          <div v-if="currentChat.messages.length === 0" class="h-full">
            <WelcomeScreen />
          </div>
          
          <div v-else class="space-y-4">
            <div 
              v-for="(message, idx) in currentChat.messages" 
              :key="idx"
              class="flex gap-4"
              :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
            >
              <div 
                class="max-w-3xl rounded-2xl p-4 relative group"
                :class="message.role === 'user' ? 'bg-apple-blue text-white' : 'bg-gray-100 text-apple-black'"
              >
                <!-- 编辑按钮 -->
                <button 
                  v-if="!editingMessageIndex || editingMessageIndex !== idx"
                  @click="startEditingMessage(idx)"
                  class="absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  :class="[
                    message.role === 'user' 
                      ? 'bg-white/20 hover:bg-white/30 text-white right-2' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-600 right-8'
                  ]"
                >
                  <PencilIcon class="h-3.5 w-3.5" />
                </button>

                <!-- 重新生成按钮 - 只在最后一条AI消息显示 -->
                <button 
                  v-if="message.role === 'assistant' && idx === currentChat.messages.length - 1 && !chatStore.isLoading"
                  @click="regenerateResponse"
                  class="absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-gray-200 hover:bg-gray-300 text-gray-600"
                  title="重新生成回复"
                >
                  <ArrowPathIcon class="h-3.5 w-3.5" />
                </button>
                
                <!-- 正常显示消息内容 -->
                <div v-if="editingMessageIndex !== idx">
                  <!-- 显示推理内容 - 移到内容上方 -->
                  <ReasoningBox 
                    v-if="message.role === 'assistant' && message.reasoning" 
                    :content="message.reasoning" 
                    :isLoading="false" 
                  />
                  <div v-html="formatMessage(message.content)"></div>
                </div>
                
                <!-- 编辑消息表单 -->
                <div v-else class="flex flex-col gap-2">
                  <textarea 
                    v-model="editedMessageContent" 
                    class="input resize-none h-32 text-black"
                    :class="message.role === 'user' ? 'bg-white' : 'bg-white'"
                  ></textarea>
                  <div class="flex justify-end gap-2">
                    <button 
                      @click="cancelEditingMessage" 
                      class="px-3 py-1 rounded-md text-sm"
                      :class="message.role === 'user' ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'"
                    >
                      取消
                    </button>
                    <button 
                      @click="saveEditedMessage" 
                      class="px-3 py-1 rounded-md text-sm bg-green-500 hover:bg-green-600 text-white"
                    >
                      保存
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 显示正在流式输出的响应 -->
            <div v-if="chatStore.isLoading" class="flex justify-start gap-4">
              <div class="max-w-3xl rounded-2xl p-4 bg-gray-100 text-apple-black">
                <!-- 显示推理内容 -->
                <ReasoningBox 
                  v-if="chatStore.streamingReasoning || !chatStore.streamingResponse" 
                  :content="chatStore.streamingReasoning" 
                  :isLoading="chatStore.isLoading" 
                />
                
                <!-- 显示实际响应内容 -->
                <div v-if="chatStore.streamingResponse" class="mt-2">
                  <div v-html="formatMessage(chatStore.streamingResponse)"></div>
                </div>
                
                <!-- 如果没有响应内容，显示加载动画 -->
                <div v-if="!chatStore.streamingResponse && !chatStore.streamingReasoning" class="mt-2 flex items-center">
                  <span class="inline-block h-2 w-2 rounded-full bg-apple-blue animate-pulse mr-1"></span>
                  <span class="inline-block h-2 w-2 rounded-full bg-apple-blue animate-pulse mr-1" style="animation-delay: 0.2s"></span>
                  <span class="inline-block h-2 w-2 rounded-full bg-apple-blue animate-pulse" style="animation-delay: 0.4s"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 输入区域 -->
        <div class="border-t p-4" :class="{'pb-safe': isMobile}">
          <div class="flex gap-2 items-end">
            <textarea 
              v-model="userInput" 
              class="input resize-none h-12 transition-all duration-200"
              :style="textareaStyle"
              placeholder="输入消息..."
              @keydown.enter="handleEnterKey"
              @input="adjustTextareaHeight"
              ref="inputTextarea"
              :disabled="chatStore.isLoading"
            ></textarea>
            <button 
              class="btn h-12 flex-shrink-0" 
              @click="sendMessage" 
              :disabled="chatStore.isLoading"
              :class="{ 'opacity-50 cursor-not-allowed': chatStore.isLoading }"
            >
              <PaperAirplaneIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>
    </main>
    
    <!-- 推理详情组件 -->
    <TokenDetails 
      :details="chatStore.tokenDetails" 
      @close="chatStore.tokenDetails = ''" 
    />

    <!-- 添加记录查看器模态框 -->
    <div v-if="showContextViewer" class="fixed inset-0 bg-black bg-opacity-50 z-30 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[80vh] flex flex-col">
        <div class="p-4 border-b flex justify-between items-center">
          <h3 class="text-lg font-medium">聊天记录</h3>
          <div class="flex gap-2">
            <button 
              class="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"
              @click="copyContextToClipboard"
              title="复制到剪贴板"
            >
              <ClipboardDocumentIcon class="h-5 w-5" />
            </button>
            <button 
              class="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"
              @click="toggleContextViewer"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
        <div class="p-4 overflow-y-auto flex-1">
          <pre class="text-xs font-mono bg-gray-50 p-4 rounded-md overflow-x-auto whitespace-pre-wrap">{{ formattedContext }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch, onBeforeUnmount } from 'vue';
import { useChatStore } from '../stores/chat';
import { marked } from 'marked';
import { 
  ChatBubbleLeftIcon, 
  ChatBubbleLeftRightIcon,
  PlusIcon,
  PaperAirplaneIcon,
  Bars3Icon,
  XMarkIcon,
  PencilIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  ClipboardDocumentIcon
} from '@heroicons/vue/24/outline';
import TokenDetails from '../components/TokenDetails.vue';
import WelcomeScreen from '../components/WelcomeScreen.vue';
import ReasoningBox from '../components/ReasoningBox.vue';

// 状态管理
const chatStore = useChatStore();

// 聊天容器引用
const chatContainer = ref(null);

// 用户输入
const userInput = ref('');

// 移动设备侧边栏状态
const showSidebar = ref(false);
const isDesktop = ref(window.innerWidth >= 768);
const isMobile = ref(false);

// 检测是否为移动设备
const checkMobileDevice = () => {
  // 检查是否为iOS设备
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  // 检查是否为移动设备（包括Android）
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  isMobile.value = isIOS || isMobileDevice;
};

// 窗口大小变化处理
const handleResize = () => {
  isDesktop.value = window.innerWidth >= 768;
  if (isDesktop.value) {
    showSidebar.value = true;
  }
  checkMobileDevice();
};

// 当前聊天
const currentChat = computed(() => {
  if (chatStore.chatHistory.length === 0) {
    return { messages: [] };
  }
  return chatStore.chatHistory[chatStore.currentChatIndex];
});

// 切换侧边栏显示/隐藏
const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value;
};

// 格式化消息内容（Markdown）
const formatMessage = (content) => {
  return marked(content);
};

// 发送消息
const sendMessage = async () => {
  if (!userInput.value.trim() || chatStore.isLoading) return;
  
  // 添加用户消息
  chatStore.addMessage({
    role: 'user',
    content: userInput.value
  });
  
  // 清空输入
  const message = userInput.value;
  userInput.value = '';
  
  // 滚动到底部
  await nextTick();
  scrollToBottom();
  
  // 发送到API并获取响应
  await chatStore.sendMessageToLLM(message);
};

// 滚动到底部
const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

// 监听消息变化，自动滚动
watch(
  () => currentChat.value.messages.length,
  () => nextTick(() => scrollToBottom())
);

// 监听流式响应变化，自动滚动
watch(
  () => chatStore.streamingResponse,
  () => nextTick(() => scrollToBottom())
);

// 组件挂载后
onMounted(() => {
  // 如果没有聊天历史，创建一个新的
  if (chatStore.chatHistory.length === 0) {
    chatStore.createNewChat();
  }
  
  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize);
  
  // 初始化响应式设置
  handleResize();
  
  // 检测移动设备
  checkMobileDevice();
});

// 组件卸载前
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

// 编辑消息相关
const editingMessageIndex = ref(null);
const editedMessageContent = ref('');

const startEditingMessage = (index) => {
  editingMessageIndex.value = index;
  editedMessageContent.value = currentChat.value.messages[index].content;
};

const cancelEditingMessage = () => {
  editingMessageIndex.value = null;
  editedMessageContent.value = '';
};

const saveEditedMessage = () => {
  if (editingMessageIndex.value !== null) {
    // 更新消息内容
    currentChat.value.messages[editingMessageIndex.value].content = editedMessageContent.value;
    
    // 保存到本地存储
    chatStore.saveChats();
    
    // 重置编辑状态
    editingMessageIndex.value = null;
    editedMessageContent.value = '';
  }
};

// 重新生成方法
const regenerateResponse = async () => {
  if (chatStore.isLoading) return;
  
  // 获取最后一条用户消息
  const lastUserMessageIndex = currentChat.value.messages
    .map((msg, index) => ({ ...msg, index }))
    .filter(msg => msg.role === 'user')
    .pop();

  if (!lastUserMessageIndex) return;

  // 删除最后一条AI回复
  currentChat.value.messages.pop();
  
  // 保存更改
  chatStore.saveChats();
  
  // 重新发送最后一条用户消息
  await chatStore.sendMessageToLLM(currentChat.value.messages[lastUserMessageIndex.index].content);
};

// 添加处理Enter键的方法
const handleEnterKey = (e) => {
  // 如果按下Shift+Enter，则允许换行
  if (e.shiftKey) {
    return;
  }
  // 否则阻止默认行为并发送消息
  e.preventDefault();
  sendMessage();
};

// 添加记录查看器相关状态
const showContextViewer = ref(false);

// 格式化记录数据
const formattedContext = computed(() => {
  if (chatStore.chatHistory.length === 0) {
    return '{}';
  }
  
  const contextData = {
    systemPrompt: chatStore.getCurrentSystemPrompt,
    messages: currentChat.value.messages
  };
  
  return JSON.stringify(contextData, null, 2);
});

// 切换记录查看器显示/隐藏
const toggleContextViewer = () => {
  showContextViewer.value = !showContextViewer.value;
};

// 复制记录到剪贴板
const copyContextToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(formattedContext.value);
    alert('已复制到剪贴板');
  } catch (err) {
    console.error('复制失败:', err);
    alert('复制失败，请手动复制');
  }
};

// 添加输入框引用
const inputTextarea = ref(null);

// 添加计算样式
const textareaStyle = computed(() => {
  // 只有当内容包含换行符时才改变高度
  if (userInput.value.includes('\n')) {
    return {
      height: inputTextarea.value ? `${Math.min(inputTextarea.value.scrollHeight, 160)}px` : '48px'
    };
  }
  return {}; // 默认高度
});

// 修改调整高度的方法
const adjustTextareaHeight = () => {
  if (!inputTextarea.value || !userInput.value.includes('\n')) {
    // 如果没有换行，重置为默认高度
    inputTextarea.value.style.height = '48px';
    return;
  }
  
  // 重置高度，以便正确计算
  inputTextarea.value.style.height = 'auto';
  
  // 计算新高度，但限制最大高度
  const newHeight = Math.min(inputTextarea.value.scrollHeight, 160);
  
  // 设置新高度
  inputTextarea.value.style.height = `${newHeight}px`;
};

// 监听用户输入变化，调整高度
watch(userInput, () => {
  nextTick(() => adjustTextareaHeight());
});
</script> 