import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Chat.css';

// 🚨 중요: 로컬 테스트 시 'http://127.0.0.1:8000', 배포 후에는 Render.com 주소로 변경
const API_URL = 'https://chatbot-elec.onrender.com';

const Chat = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '안녕하세요! 어떻게 도와드릴까요? 전기·공학에 관한 질문이나 다른 주제에 대해 이야기하고 싶으신가요?' }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatWindowRef = useRef(null);

  // 메시지 목록이 업데이트될 때마다 맨 아래로 스크롤
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = { role: 'user', content: currentMessage };
    setMessages(prevMessages => [...prevMessages, userMessage]);

    const updatedHistory = [...messages, userMessage];
    const messageToSend = currentMessage;
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/chat`, {
        message: messageToSend,
        history: updatedHistory,
      });
      const assistantMessage = { role: 'assistant', content: response.data.answer };
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (error) {
      const errorMessage = { role: 'assistant', content: `오류: ${error.response?.data?.detail || error.message}` };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (query) => {
    setCurrentMessage(query);
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // 복사 성공 시 간단한 알림이나 UI 피드백을 추가할 수 있습니다.
      // alert('복사되었습니다!');
    });
  };

  const startNewChat = () => {
    setMessages([
        { role: 'assistant', content: '안녕하세요! 어떻게 도와드릴까요? 전기·공학에 관한 질문이나 다른 주제에 대해 이야기하고 싶으신가요?' }
    ]);
    setCurrentMessage('');
  }

  return (
    <div className="chat-container">
      <p className="chat-description">전기공학 질문을 답해주는 챗봇입니다.</p>
      <div className="chat-window" ref={chatWindowRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message-wrapper ${msg.role}`}>
            {msg.role === 'assistant' && <div className="avatar">🤖</div>}
            <div className="message-content">
              <p>{msg.content}</p>
              <button className="copy-btn" onClick={() => handleCopyToClipboard(msg.content)}>
                📋
              </button>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message-wrapper assistant">
            <div className="avatar">🤖</div>
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
          placeholder="아래 예시를 클릭하거나 직접 질문을 입력하세요..."
          disabled={isLoading}
        />
        <div className="example-queries">
          <span>예시 질문</span>
          <button onClick={() => handleExampleClick('한국 도매 전력시장 가격 구조 요약')}>한국 도매 전력시장 가격 구조 요약</button>
          <button onClick={() => handleExampleClick('BESS 시장 트렌드 핵심 포인트')}>BESS 시장 트렌드 핵심 포인트</button>
          <button onClick={() => handleExampleClick('EV 충전 인프라 최근 이슈 정리')}>EV 충전 인프라 최근 이슈 정리</button>
        </div>
        <button className="new-chat-btn" onClick={startNewChat}>새로운 대화 시작 (기록 삭제)</button>
      </div>
    </div>
  );
};

export default Chat;
