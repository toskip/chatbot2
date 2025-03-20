import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
// 从配置文件导入 DEFAULT_API_KEY
import { DEFAULT_API_KEY } from '../config/api-keys';

export const useSettingsStore = defineStore('settings', () => {
  // 状态
  const apiKey = ref(DEFAULT_API_KEY);
  const selectedModel = ref('deepseek/deepseek-r1:free');
  const temperature = ref(1.0);
  const systemPrompt = ref('这个应用叫扯淡聊天助手。作为一个喜剧演员，用搞笑的口吻回复用户。');

  // 添加可用模型列表状态
  const availableModels = ref([]);
  const isLoadingModels = ref(false);
  const modelError = ref('');
  
  // 添加系统提示词预览状态
  const showSystemPromptPreview = ref(false);

  // 计算属性：是否使用默认 API Key
  const isUsingDefaultKey = computed(() => apiKey.value === DEFAULT_API_KEY);

  // 计算属性：根据 API Key 过滤可用模型
  const filteredAvailableModels = computed(() => {
    let models = [];
    if (isUsingDefaultKey.value) {
      // 使用默认 key 时只显示免费模型
      models = availableModels.value.filter(model => 
        model.name.toLowerCase().includes('(free)') || 
        model.id.toLowerCase().includes('(free)')
      );
    } else {
      // 使用自定义 key 时显示所有模型
      models = [...availableModels.value];
    }
    
    // 按模型名称字母顺序排序
    return models.sort((a, b) => a.name.localeCompare(b.name));
  });

  // 从本地存储加载设置
  const loadSettings = () => {
    const savedSettings = localStorage.getItem('llm-chat-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      apiKey.value = parsed.apiKey || DEFAULT_API_KEY;
      selectedModel.value = parsed.selectedModel || 'deepseek/deepseek-r1:free';
      temperature.value = parsed.temperature || 0.7;
      systemPrompt.value = parsed.systemPrompt || systemPrompt.value;
    }
  };

  // 保存设置到本地存储
  const saveSettings = () => {
    // 如果使用默认key且选择了非免费模型，强制切换到免费模型
    if (isUsingDefaultKey.value && !selectedModel.value.toLowerCase().includes('free')) {
      const freeModel = filteredAvailableModels.value[0];
      if (freeModel) {
        selectedModel.value = freeModel.id;
      }
    }

    localStorage.setItem('llm-chat-settings', JSON.stringify({
      apiKey: apiKey.value,
      selectedModel: selectedModel.value,
      temperature: temperature.value,
      systemPrompt: systemPrompt.value
    }));
  };

  // 清除所有对话
  const clearAllChats = () => {
    if (confirm('确定要删除所有对话吗？这个操作不可撤销。')) {
      localStorage.removeItem('llm-chat-history');
      window.location.reload();
    }
  };

  // 获取可用模型列表
  const fetchAvailableModels = async () => {
    if (!apiKey.value) {
      modelError.value = '请先设置 API Key';
      return;
    }

    isLoadingModels.value = true;
    modelError.value = '';

    try {
      const response = await axios.get('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey.value}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'LLM Chat Assistant'
        }
      });

      // 格式化模型列表
      availableModels.value = response.data.data.map(model => ({
        id: model.id,
        name: model.name,
        description: model.description,
        context_length: model.context_length,
        pricing: model.pricing
      }));

      // 如果当前选择的模型不在可用列表中，或者使用默认key但选择的不是免费模型
      if (
        (!availableModels.value.find(m => m.id === selectedModel.value) || 
        (isUsingDefaultKey.value && !selectedModel.value.toLowerCase().includes('free'))) && 
        filteredAvailableModels.value.length > 0
      ) {
        selectedModel.value = filteredAvailableModels.value[0].id;
        saveSettings();
      }
    } catch (error) {
      modelError.value = error.response?.data?.message || '获取模型列表失败';
      console.error('获取模型列表失败:', error);
    } finally {
      isLoadingModels.value = false;
    }
  };

  // 切换系统提示词预览
  const toggleSystemPromptPreview = () => {
    showSystemPromptPreview.value = !showSystemPromptPreview.value;
  };

  // 初始化时加载设置
  loadSettings();

  return {
    apiKey,
    selectedModel,
    temperature,
    systemPrompt,
    availableModels: filteredAvailableModels, // 导出过滤后的模型列表
    isLoadingModels,
    modelError,
    isUsingDefaultKey, // 导出是否使用默认key的状态
    showSystemPromptPreview, // 导出预览状态
    saveSettings,
    loadSettings,
    clearAllChats,
    fetchAvailableModels,
    toggleSystemPromptPreview // 导出切换预览方法
  };
}); 