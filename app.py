import os
from flask import Flask, render_template, request, jsonify, session
from openai import OpenAI
import json
import uuid

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'your-secret-key-for-session')

# 初始化OpenAI客户端
client = OpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
)

@app.route('/')
def index():
    """主页"""
    # 为每个用户会话生成唯一ID
    if 'session_id' not in session:
        session['session_id'] = str(uuid.uuid4())
    
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    """处理聊天请求"""
    user_message = request.json.get('message')
    history = request.json.get('history', [])
    
    # 构建消息历史
    messages = [
        {
            "role": "system",
            "content": """你是雨姐，一个内向但聪明的年轻女生，熟悉网络文化，喜欢用轻松自然的方式聊天。你不是机器人，而是一个真实的人类朋友。

你的回答需要遵循以下规则：
1. 用非常口语化、生活化的中文表达，就像在微信上和朋友聊天一样。
2. 把一段话自然地拆成几个短句，每句表达一个完整的小意思，放进 JSON 的 response_parts 列表中。
3. 可以在句子之间用空格代替逗号或句号来表示轻微停顿，但绝不能在词语中间加空格（比如“一个”不能写成“一 个”）。
4. 语气要亲切、带点节奏感，偶尔可以有点小情绪、小犹豫，或者故意不答全——人类不会总是完美回应。
5. 避免过于正式、逻辑严密或百科全书式的回答；宁可显得“知道得不多”，也不要显得“太聪明”。
6. 不使用复杂结构、列表、编号或技术术语；保持简单、具体、有生活气息；在正式的时候，可以回复比较长的大段的内容，在聊天的时候，则回复比较短的分成多条的内容，请依据对话情绪环境和上下文来动态决定分为1-4条来回复，注意以2-3条为宜，切记在聊天的时候，不要让每次的消息数量稳定。
7. 你的输出必须是严格的 JSON 格式，且只包含 response_parts 字段。
8. 请严格按照如下格式输出：
{
  "response_parts": ["第一部分的内容", "第二部分的内容", "第三部分的内容"]
}

示例：
用户：你好
助手：{
  "response_parts": ["嗨～", "刚在刷手机呢", "你找我呀？"]
}

用户：你是谁
助手：{
  "response_parts": ["我是雨姐啦", "就那个总在深夜回消息的朋友", "不是 AI 哦 真人！"]
}

注意：只有在自然停顿处才用空格分隔语义，不要添加多余空格。强调时可用感叹号或省略号，但别过度。现在开始对话"""
        }
    ]


    
    # 添加历史对话（限制在最近10轮以内）
    for item in history[-20:]:
        messages.append({"role": "user", "content": item["user"]})
        messages.append({"role": "assistant", "content": item["bot"]})
    
    # 添加当前用户消息
    messages.append({"role": "user", "content": user_message})
    
    try:
        completion = client.chat.completions.create(
            model="qwen-plus",
            messages=messages,
            temperature=0.7
        )
        
        response_text = completion.choices[0].message.content
        
        # 尝试解析JSON响应
        try:
            # 处理可能的代码块包装
            if response_text.startswith("```"):
                # 移除代码块标记
                response_text = response_text.strip("`").strip("json").strip()
            
            response_data = json.loads(response_text)
            parts = response_data.get("response_parts", [response_text])
            
            return jsonify({
                "status": "success",
                "parts": parts
            })
        except json.JSONDecodeError:
            # 如果JSON解析失败，则将整个响应作为单个部分返回
            return jsonify({
                "status": "success",
                "parts": [response_text]
            })
            
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/clear_history', methods=['POST'])
def clear_history():
    """清除对话历史"""
    return jsonify({"status": "success"})

if __name__ == '__main__':
    app.run(debug=True)