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

    // 1. 화면 업데이트는 함수형으로 예약합니다.
    setMessages(prevMessages => [...prevMessages, userMessage]);

    // 2. API로 보낼 대화 기록은 현재 시점의 messages와 방금 추가한 userMessage를 합쳐서 만듭니다.
    const updatedHistory = [...messages, userMessage];
    
    const messageToSend = currentMessage;
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/chat`, {
        message: messageToSend,
        history: updatedHistory, // 3. 최신 기록이 담긴 배열을 전송합니다.
      });
      
      const assistantMessage = { role: 'assistant', content: response.data.answer };
      
      // 4. AI 답변 또한 함수형 업데이트를 사용해 추가합니다.
      setMessages(prevMessages => [...prevMessages, assistantMessage]);

    } catch (error) {
      const errorMessage = { role: 'assistant', content: `오류: ${error.response?.data?.detail || error.message}` };
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

