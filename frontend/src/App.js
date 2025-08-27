// frontend/src/App.js
import React, { useState } from 'react';
import DocQA from './components/DocQA';
// 다른 컴포넌트들도 import 하세요 (예: Chat.js, Calculators.js)
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('doc-qa');

  return (
    <div className="App">
      <header className="App-header">
        <h1>🔌 전기·전자 종합 어시스턴트</h1>
        <nav>
          <button onClick={() => setActiveTab('chat')}>💬 전기 챗봇</button>
          <button onClick={() => setActiveTab('doc-qa')}>📄 문서 기반 Q&A</button>
          <button onClick={() => setActiveTab('calculator')}>🧮 공학 계산기</button>
        </nav>
      </header>
      <main>
        {activeTab === 'doc-qa' && <DocQA />}
        {/* 다른 탭에 대한 컴포넌트 렌더링 */}
        {activeTab === 'chat' && <div>전기 챗봇 기능이 여기에 구현됩니다.</div>}
        {activeTab === 'calculator' && <div>공학 계산기 기능이 여기에 구현됩니다.</div>}
      </main>
    </div>
  );
}

export default App;
