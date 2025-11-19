document.addEventListener('DOMContentLoaded', function() {
    const chatHistory = document.getElementById('chat-history');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const clearBtn = document.getElementById('clear-btn');
    
    // 聊天历史记录
    let chatHistoryData = [];
    
    // 发送消息函数
    function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        // 添加用户消息到界面
        addMessageToUI('user', message);
        
        // 清空输入框
        userInput.value = '';
        
        // 添加到历史记录
        const userMessage = message;
        
        // 显示正在输入指示器
        const typingIndicator = addTypingIndicator();
        
        // 禁用发送按钮
        sendBtn.disabled = true;
        
        // 发送到后端
        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: userMessage,
                history: chatHistoryData
            })
        })
        .then(response => response.json())
        .then(data => {
            // 移除正在输入指示器
            chatHistory.removeChild(typingIndicator);
            
            if (data.status === 'success') {
                // 将机器人的回复分段显示
                displayBotResponseInParts(data.parts);
                
                // 更新历史记录
                const botMessage = data.parts.join('');
                chatHistoryData.push({
                    user: userMessage,
                    bot: botMessage
                });
            } else {
                addMessageToUI('bot', '抱歉，出现了错误: ' + data.message);
            }
        })
        .catch(error => {
            // 移除正在输入指示器
            chatHistory.removeChild(typingIndicator);
            addMessageToUI('bot', '网络错误，请稍后再试');
            console.error('Error:', error);
        })
        .finally(() => {
            // 启用发送按钮
            sendBtn.disabled = false;
        });
    }
    
    // 分段显示机器人回复
    function displayBotResponseInParts(parts) {
        if (parts.length === 0) return;
        
        // 先显示第一部分
        addMessageToUI('bot', parts[0]);
        
        // 依次显示后续部分，间隔一定时间
        let index = 1;
        const interval = setInterval(() => {
            if (index < parts.length) {
                addMessageToUI('bot', parts[index]);
                index++;
            } else {
                clearInterval(interval);
            }
        }, 500);
    }
    
    // 添加消息到界面
    function addMessageToUI(sender, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;
        
        messageDiv.appendChild(contentDiv);
        chatHistory.appendChild(messageDiv);
        
        // 滚动到底部
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
    
    // 添加正在输入指示器
    function addTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'typing-indicator';
        contentDiv.innerHTML = '<span></span><span></span><span></span>';
        
        typingDiv.appendChild(contentDiv);
        chatHistory.appendChild(typingDiv);
        
        // 滚动到底部
        chatHistory.scrollTop = chatHistory.scrollHeight;
        
        return typingDiv;
    }
    
    // 清除历史记录
    function clearHistory() {
        fetch('/clear_history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // 清除界面历史记录
                chatHistory.innerHTML = '';
                chatHistoryData = [];
                
                // 显示欢迎消息
                addMessageToUI('bot', '你好呀~ 我是玉兰 你的专属助手 有什么我可以帮你的吗？');
            }
        })
        .catch(error => {
            console.error('Error clearing history:', error);
        });
    }
    
    // 绑定事件
    sendBtn.addEventListener('click', sendMessage);
    
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    clearBtn.addEventListener('click', clearHistory);
});