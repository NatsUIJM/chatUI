# Flask ChatBot Application

一个基于Flask和通义千问API的聊天机器人应用，模拟微信聊天风格。

## 功能特点

1. 模拟微信聊天风格的口语化回复
2. 分段输出回复内容
3. 前端实时渲染分段内容
4. 手动清除对话历史功能
5. 响应式设计，适配移动端

## 环境要求

- Python 3.7+
- Flask
- OpenAI Python SDK

## 安装步骤

1. 克隆或下载本项目

2. 安装依赖：
   ```
   pip install -r requirements.txt
   ```

3. 设置环境变量：
   ```
   export DASHSCOPE_API_KEY=your_api_key_here
   export SECRET_KEY=your_secret_key_here
   ```

4. 运行应用：
   ```
   python app.py
   ```

5. 访问 http://localhost:5000 查看应用

## 使用说明

- 在输入框中输入你想说的话，按回车或点击发送按钮
- 点击"清除历史记录"按钮可以清空对话历史
- 机器人会以类似微信聊天的口语化风格回复你
- 回复内容会被分割成多个片段逐步显示，模拟真实打字效果

## 自定义

你可以修改 [app.py](file:///Users/shijian/VSCode/chatUI/templates/app.py) 中的系统提示词来改变机器人的性格和行为模式。