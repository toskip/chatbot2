import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import { useSettingsStore } from './settings';

export const useChatStore = defineStore('chat', () => {
  // 获取设置
  const settingsStore = useSettingsStore();
  
  // 状态
  const chatHistory = ref([]);
  const currentChatIndex = ref(0);
  const isLoading = ref(false);
  const streamingResponse = ref('');
  const streamingReasoning = ref('');
  const responseStream = ref(null);
  const tokenDetails = ref('');
  
  // 创建新的对话
  const createNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: '新对话',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
      customSystemPrompt: '',
    };
    
    chatHistory.value.unshift(newChat);
    currentChatIndex.value = 0;
    saveChats();
    
    return newChat;
  };
  
  // 设置当前聊天
  const setCurrentChat = (index) => {
    currentChatIndex.value = index;
  };
  
  // 添加消息到当前对话
  const addMessage = (message) => {
    if (chatHistory.value.length === 0) {
      createNewChat();
    }
    
    const chat = chatHistory.value[currentChatIndex.value];
    chat.messages.push(message);
    chat.updatedAt = new Date().toISOString();
    
    // 如果是第一条消息，尝试使用它作为标题
    if (chat.messages.length === 1 && message.role === 'user') {
      const title = message.content.slice(0, 30);
      chat.title = title + (title.length < message.content.length ? '...' : '');
    }
    
    saveChats();
  };
  
  // 保存聊天历史到本地存储
  const saveChats = () => {
    localStorage.setItem('llm-chat-history', JSON.stringify(chatHistory.value));
  };
  
  // 从本地存储加载聊天历史
  const loadChats = () => {
    const saved = localStorage.getItem('llm-chat-history');
    if (saved) {
      chatHistory.value = JSON.parse(saved);
    }
  };
  
  // 获取当前聊天的系统提示词
  const getCurrentSystemPrompt = computed(() => {
    if (chatHistory.value.length === 0) return settingsStore.systemPrompt;
    
    const currentChat = chatHistory.value[currentChatIndex.value];
    // 如果当前对话有自定义提示词，则使用它，否则使用全局设置
    return currentChat.customSystemPrompt || settingsStore.systemPrompt;
  });
  
  // 发送消息到LLM
  const sendMessageToLLM = async (message) => {
    if (!settingsStore.apiKey) {
      addMessage({
        role: 'assistant',
        content: '请在设置中添加您的OpenRouter API Key。'
      });
      return;
    }
    
    // 清空流式响应
    streamingResponse.value = '';
    streamingReasoning.value = '';
    tokenDetails.value = '';
    isLoading.value = true;
    
    // 准备消息历史
    const currentChat = chatHistory.value[currentChatIndex.value];
    const messages = [
      {
        role: 'system',
        content: getCurrentSystemPrompt.value
      },
      ...currentChat.messages
    ];
    
    try {
      // 使用OpenRouter API
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settingsStore.apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'LLM Chat Frontend'
        },
        body: JSON.stringify({
          model: settingsStore.selectedModel,
          messages: messages,
          temperature: settingsStore.temperature,
          stream: true,
          frequency_penalty: 0,
          presence_penalty: 0,
          max_tokens: 4000,
          reasoning: {
            exclude:false
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || '请求失败');
      }
      console.log(messages)
      // 处理流式响应
      const reader = response.body.getReader();
      responseStream.value = reader;
      
      let reasoningResponse = '';
      let fullResponse = '';
      let done = false;
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        
        if (done) break;
        
        // 处理流式响应的数据
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data === '[DONE]') break;
            
            try {
              const parsedData = JSON.parse(data);
              
              // 检查是否有token消耗
              if (parsedData.usage) {
                tokenDetails.value = JSON.stringify(parsedData.usage, null, 2);
              }
              
              // 获取生成的内容
              const reasoning = parsedData.choices[0]?.delta?.reasoning || '';
              const content = parsedData.choices[0]?.delta?.content || '';
              if(reasoning) {
                reasoningResponse += reasoning;
                streamingReasoning.value = reasoningResponse;
                //console.log(reasoningResponse);
              }
              else if (content) {
                fullResponse += content;
                streamingResponse.value = fullResponse;
              }
            } catch (e) {
              console.error('解析流式数据失败:', e);
            }
          }
        }
      }
      
      // 添加完整响应到聊天历史，包含推理内容
      addMessage({
        role: 'assistant',
        content: fullResponse,
        reasoning: reasoningResponse
      });
      
    } catch (error) {
      console.error('调用API失败:', error);
      addMessage({
        role: 'assistant',
        content: `发生错误: ${error.message}`
      });
    } finally {
      streamingResponse.value = '';
      streamingReasoning.value = '';
      isLoading.value = false;
      responseStream.value = null;
    }
  };
  
  // 加载聊天历史
  loadChats();
  
  // 如果没有聊天历史，创建一个新的
  if (chatHistory.value.length === 0) {
    createNewChat();
  }
  
  return {
    chatHistory,
    currentChatIndex,
    isLoading,
    streamingResponse,
    streamingReasoning,
    tokenDetails,
    createNewChat,
    setCurrentChat,
    addMessage,
    saveChats,
    loadChats,
    sendMessageToLLM,
    getCurrentSystemPrompt
  };
}); 