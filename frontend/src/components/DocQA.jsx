// frontend/src/components/DocQA.js
import React, { useState } from 'react';
import axios from 'axios';

// 백엔드 API 주소 (Render.com 배포 주소로 변경해야 함)
const API_URL = 'https://chatbot-elec.onrender.com'; // 🚨 중요: 배포된 백엔드 주소로 변경!

const DocQA = () => {
  const [file, setFile] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus('파일을 선택해주세요.');
      return;
    }
    setIsLoading(true);
    setUploadStatus('파일 업로드 및 처리 중...');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/docs/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSessionId(response.data.session_id);
      setUploadStatus(response.data.message);
    } catch (error) {
      setUploadStatus(`오류: ${error.response?.data?.detail || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !sessionId) {
      alert('질문을 입력하거나 문서를 먼저 업로드해주세요.');
      return;
    }

    const userMessage = { role: 'user', content: currentMessage };
    // ▼▼▼ [수정] 함수형 업데이트로 변경 ▼▼▼
    setMessages(prevMessages => [...prevMessages, userMessage]);
    const messageToSend = currentMessage; // 현재 메시지 값을 변수에 저장
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/docs/query`, {
        session_id: sessionId,
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
    <div>
      <h3>📄 문서 기반 Q&A</h3>
      <div style={{ marginBottom: '1rem' }}>
        <input type="file" onChange={handleFileChange} accept=".pdf" disabled={isLoading} />
        <button onClick={handleUpload} disabled={isLoading || !file}>
          {isLoading && uploadStatus.includes('처리 중') ? '처리 중...' : '문서 처리 시작'}
        </button>
        {uploadStatus && <p>{uploadStatus}</p>}
      </div>

      {sessionId && (
        <div>
          <div style={{ height: '400px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
            {messages.map((msg, index) => (
              <div key={index} style={{ textAlign: msg.role === 'user' ? 'right' : 'left', margin: '5px 0' }}>
                <span style={{ background: msg.role === 'user' ? '#dcf8c6' : '#f1f0f0', padding: '5px 10px', borderRadius: '7px' }}>
                  <strong>{msg.role}:</strong> {msg.content}
                </span>
              </div>
            ))}
          </div>
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="문서 내용에 대해 질문하세요..."
            style={{ width: '80%', padding: '8px' }}
            disabled={isLoading}
          />
          <button onClick={handleSendMessage} disabled={isLoading}>
            {isLoading ? '생각 중...' : '전송'}
          </button>
        </div>
      )}
    </div>
  );
};

export default DocQA;
