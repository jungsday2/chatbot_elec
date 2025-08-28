import React, { useState } from 'react';
import axios from 'axios';
import './Chat.css';

// 🚨 중요: 로컬 테스트 시 'http://127.0.0.1:8000', 배포 후에는 Render.com 주소로 변경
const API_URL = 'https://chatbot-elec.onrender.com';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = { role: 'user', content: currentMessage };
    // ▼▼▼ [수정] 함수형 업데이트로 변경 ▼▼▼
    setMessages(prevMessages => [...prevMessages, userMessage]);
    const messageToSend = currentMessage; // 현재 메시지 값을 변수에 저장
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/chat`, {
        // ▼▼▼ [수정] API 요청 시 최신 대화 기록을 보내도록 수정 ▼▼▼
        message: messageToSend,
        history: [...messages, userMessage], // API에는 직전 메시지까지 포함하여 전송
      });
      const assistantMessage = { role: 'assistant', content: response.data.answer };
      // ▼▼▼ [수정] 함수형 업데이트로 변경 ▼▼▼
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (error) {
      const errorMessage = { role: 'assistant', content: `오류: ${error.response?.data?.detail || error.message}` };
      // ▼▼▼ [수정] 함수형 업데이트로 변경 ▼▼▼
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <h3>💬 전기 챗봇</h3>
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="message-content">
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant">
            <div className="message-content">
              <p><i>생각 중...</i></p>
            </div>
          </div>
        )}
      </div>
      <div className="chat-input-area">
        <input
          type="text"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="전기/전자에 대해 질문하세요..."
          disabled={isLoading}
        />
        <button onClick={handleSendMessage} disabled={isLoading}>전송</button>
      </div>
    </div>
  );
};

export default Chat;

