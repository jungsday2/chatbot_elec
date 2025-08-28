import React, { useState } from 'react';
import DocQA from './components/DocQA.jsx';
import Calculators from './components/Calculators.jsx';
import Chat from './components/Chat.jsx';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('chat'); // 기본 탭을 챗봇으로 변경

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return <Chat />;
      case 'doc-qa':
        return <DocQA />;
      case 'calculator':
        return <Calculators />;
      default:
        return <Chat />;
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <header className="sidebar-header">
          <h1>🔌 전기·전자 종합 어시스턴트</h1>
        </header>
        <nav className="sidebar-nav">
          <button className={activeTab === 'chat' ? 'active' : ''} onClick={() => setActiveTab('chat')}>
            <span>💬</span> 전기 챗봇
          </button>
          <button className={activeTab === 'doc-qa' ? 'active' : ''} onClick={() => setActiveTab('doc-qa')}>
            <span>📄</span> 문서 기반 Q&A
          </button>
          <button className={activeTab === 'calculator' ? 'active' : ''} onClick={() => setActiveTab('calculator')}>
            <span>🧮</span> 공학 계산기
          </button>
        </nav>
      </aside>
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
