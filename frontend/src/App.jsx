import React, { useState } from 'react';
import DocQA from './components/DocQA.jsx';
import Calculators from './components/Calculators.jsx';
import Chat from './components/Chat.jsx';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('chat');

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return <Chat />;
      case 'doc-qa':
        return <DocQA />;
      case 'calculator':
        return <Calculators />;
      // '단위 및 기호' 탭은 이미지에만 존재하므로 일단 비워둡니다.
      case 'units':
        return <div>단위 및 기호 컨텐츠</div>;
      default:
        return <Chat />;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>⚡️ 전기·전자 종합 어시스턴트</h1>
        <p>요약, 계산, 대화, 문서 분석까지 하나의 툴에서 해결하세요.</p>
      </header>

      <nav className="app-nav">
        <button className={activeTab === 'chat' ? 'active' : ''} onClick={() => setActiveTab('chat')}>
          💬 전기 챗봇
        </button>
        <button className={activeTab === 'doc-qa' ? 'active' : ''} onClick={() => setActiveTab('doc-qa')}>
          📄 문서 기반 Q&A
        </button>
        <button className={activeTab === 'calculator' ? 'active' : ''} onClick={() => setActiveTab('calculator')}>
          🧮 공학 계산기
        </button>
        <button className={activeTab === 'units' ? 'active' : ''} onClick={() => setActiveTab('units')}>
          📚 단위 및 기호
        </button>
      </nav>

      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
