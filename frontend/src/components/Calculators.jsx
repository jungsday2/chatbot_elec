import React, { useState } from 'react';
import axios from 'axios';
import './Calculators.css';

// 🚨 중요: 로컬 테스트 시 'http://127.0.0.1:8000', 배포 후에는 Render.com 주소로 변경
const API_URL = 'https://chatbot-elec.onrender.com';

const Calculators = () => {
  // 옴의 법칙 상태
  const [ohmState, setOhmState] = useState({ V: '', I: '', R: '' });
  const [ohmResult, setOhmResult] = useState(null);

  // RLC 임피던스 상태
  const [rlcState, setRlcState] = useState({ R: '100', L: '0.01', C: '0.0001', f: '60', mode: '직렬' });
  const [rlcResult, setRlcResult] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const handleOhmChange = (e) => {
    setOhmState({ ...ohmState, [e.target.name]: e.target.value });
  };

  const handleRlcChange = (e) => {
    setRlcState({ ...rlcState, [e.target.name]: e.target.value });
  };

  const handleOhmSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setOhmResult(null);
    try {
      const params = {
        V: ohmState.V ? parseFloat(ohmState.V) : null,
        I: ohmState.I ? parseFloat(ohmState.I) : null,
        R: ohmState.R ? parseFloat(ohmState.R) : null,
      };
      const response = await axios.post(`${API_URL}/calculate/ohms`, params);
      setOhmResult({ success: true, data: response.data });
    } catch (error) {
      setOhmResult({ success: false, message: error.response?.data?.detail || error.message });
    }
    setIsLoading(false);
  };

  const handleRlcSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setRlcResult(null);
    try {
      // ▼▼▼ [수정] 빈 문자열일 경우 null을 보내도록 수정 ▼▼▼
      const params = {
        R: rlcState.R ? parseFloat(rlcState.R) : null,
        L: rlcState.L ? parseFloat(rlcState.L) : null,
        C: rlcState.C ? parseFloat(rlcState.C) : null,
        f: rlcState.f ? parseFloat(rlcState.f) : null,
        mode: rlcState.mode,
      };
      const response = await axios.post(`${API_URL}/calculate/rlc`, params);
      setRlcResult({ success: true, data: response.data });
    } catch (error) {
      setRlcResult({ success: false, message: error.response?.data?.detail || error.message });
    }
    setIsLoading(false);
  };

  const renderResult = (result) => {
    if (!result) return null;
    if (result.success) {
      return <pre className="result-box success">{JSON.stringify(result.data, null, 2)}</pre>;
    }
    return <pre className="result-box error">{result.message}</pre>;
  };

  return (
    <div className="calculators-container">
      <h3>🧮 공학 계산기</h3>

      <div className="calculator-card">
        <h4>1) 옴의 법칙 (V=IR, P=VI)</h4>
        <p className="description">V, I, R 중 2개의 값을 입력하세요.</p>
        <form onSubmit={handleOhmSubmit}>
          <input type="number" name="V" value={ohmState.V} onChange={handleOhmChange} placeholder="V [Volt]" />
          <input type="number" name="I" value={ohmState.I} onChange={handleOhmChange} placeholder="I [Ampere]" />
          <input type="number" name="R" value={ohmState.R} onChange={handleOhmChange} placeholder="R [Ohm]" />
          <button type="submit" disabled={isLoading}>계산</button>
        </form>
        {renderResult(ohmResult)}
      </div>

      <div className="calculator-card">
        <h4>2) 임피던스 계산 (RLC)</h4>
        <form onSubmit={handleRlcSubmit}>
          <div className="rlc-inputs">
            <input type="number" name="R" value={rlcState.R} onChange={handleRlcChange} placeholder="R [Ω]" />
            <input type="number" name="L" value={rlcState.L} onChange={handleRlcChange} placeholder="L [H]" />
            <input type="number" name="C" value={rlcState.C} onChange={handleRlcChange} placeholder="C [F]" />
            <input type="number" name="f" value={rlcState.f} onChange={handleRlcChange} placeholder="f [Hz]" />
          </div>
          <div className="rlc-mode">
            <label>
              <input type="radio" name="mode" value="직렬" checked={rlcState.mode === '직렬'} onChange={handleRlcChange} />
              직렬
            </label>
            <label>
              <input type="radio" name="mode" value="병렬" checked={rlcState.mode === '병렬'} onChange={handleRlcChange} />
              병렬
            </label>
          </div>
          <button type="submit" disabled={isLoading}>임피던스 계산</button>
        </form>
        {renderResult(rlcResult)}
      </div>

      {/* 다른 계산기들도 위와 같은 패턴으로 추가할 수 있습니다. */}
    </div>
  );
};

export default Calculators;

