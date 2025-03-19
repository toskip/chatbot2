# LLM聊天助手

这是一个基于Vue.js的LLM聊天机器人前端项目，允许用户通过设置OpenRouter API key访问不同的LLM模型，自定义编辑对话设置和对话历史。

## 功能特点

- 支持通过OpenRouter API访问多种LLM模型
- 允许用户自定义系统提示词(System Prompt)
- 支持编辑对话历史(Context)
- 流式输出LLM响应内容
- 显示模型推理过程
- 高端大气的Apple风格UI设计
- 响应式设计，支持多种设备

## 项目预览

![项目预览](./preview.png)

## 如何使用

1. **安装依赖并启动项目**
   ```bash
   # 安装依赖
   pnpm install
   
   # 启动开发服务器
   pnpm dev
   ```

2. **设置API密钥**
   - 注册[OpenRouter](https://openrouter.ai/)账号
   - 获取API密钥
   - 在应用的"设置"页面中添加密钥

3. **开始聊天**
   - 选择你喜欢的LLM模型
   - 可选：自定义系统提示词
   - 开始与AI对话

## 自定义提示词

系统提示词定义了AI助手的行为模式。例如：

```
你是一个专业的JavaScript开发者，擅长解决Vue.js相关问题。请提供详细、准确的技术建议。
```

## 项目功能实现说明

1. **架构设计**
   - 使用Vue 3的Composition API构建组件
   - 使用Pinia进行状态管理
   - 使用Vue Router进行路由管理
   - 使用TailwindCSS进行UI设计

2. **主要功能**
   - 对话管理：创建、切换、编辑对话
   - 模型选择：支持多种LLM模型
   - 系统提示词：全局和每个对话可单独设置
   - 流式响应：实时显示AI回答
   - 响应式设计：适配桌面和移动设备

3. **数据存储**
   - 使用localStorage存储设置和对话历史
   - 所有数据均保存在本地浏览器中

## 已知问题

- 构建生产版本时可能会遇到TailwindCSS配置问题，需要调整postcss配置

## 后续改进计划

- 添加主题切换功能
- 支持导出/导入对话历史
- 添加更多自定义设置选项
- 支持更多LLM服务提供商
- 添加语音输入/输出功能

## 技术栈

- 前端框架：Vue 3 (Composition API)
- 路由：Vue Router
- 状态管理：Pinia
- UI设计：TailwindCSS
- HTTP客户端：Fetch API
- Markdown渲染：marked
- 图标：Heroicons

## 贡献指南

欢迎提交Pull Request或Issue，一起改进这个项目！

## 许可证

MIT
