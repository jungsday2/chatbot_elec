// frontend/src/App.js
import React, { useState } from 'react';
import DocQA from './components/DocQA.jsx';
import Calculators from './components/Calculators.jsx';
import Chat from './components/Chat.jsx';
// 다른 컴포넌트들도 import 하세요 (예: Chat.js, Calculators.js)
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('doc-qa');

  return (
    <div className="App">
      <header className="App-header">
        <h1>🔌 전기·전자 종합 어시스턴트</h1>
        <nav>
          <button className={activeTab === 'chat' ? 'active' : ''} onClick={() => setActiveTab('chat')}>💬 전기 챗봇</button>
          <button className={activeTab === 'doc-qa' ? 'active' : ''} onClick={() => setActiveTab('doc-qa')}>📄 문서 기반 Q&A</button>
          <button className={activeTab === 'calculator' ? 'active' : ''} onClick={() => setActiveTab('calculator')}>🧮 공학 계산기</button>
        </nav>
      </header>
      <main>
        {activeTab === 'doc-qa' && <DocQA />}
        {/* 다른 탭에 대한 컴포넌트 렌더링 */}
        {activeTab === 'chat' && <Chat />}
        {activeTab === 'calculator' && <Calculators />}
      </main>
    </div>
  );
}

export default App;
