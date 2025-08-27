# 🔌 전기·전자 종합 어시스턴트 (React + FastAPI)

LLM을 활용한 전기공학 챗봇, 문서 Q&A, 공학 계산기 기능을 제공하는 풀스택 웹 애플리케이션입니다.

이 프로젝트는 기존 Gradio 애플리케이션을 확장성 높은 클라이언트-서버 아키텍처로 재개발한 것입니다.

- **프론트엔드:** React, Vite, Axios
- **백엔드:** Python, FastAPI, LangChain

---

## 🚀 실행 방법

### 1. 백엔드 서버 실행

```bash
# 1. 백엔드 디렉토리로 이동
cd backend

# 2. (선택사항) 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate # Windows: venv\Scripts\activate

# 3. 필요한 라이브러리 설치
pip install -r requirements.txt

# 4. .env 파일 생성 및 OpenAI API 키 설정
# backend/.env 파일을 만들고 아래 내용을 추가하세요.
# OPENAI_API_KEY="sk-..."

# 5. FastAPI 서버 실행
uvicorn main:app --reload
```
서버는 `http://127.0.0.1:8000` 에서 실행됩니다.

### 2. 프론트엔드 앱 실행

```bash
# 1. 프론트엔드 디렉토리로 이동 (새 터미널에서)
cd frontend

# 2. 의존성 라이브러리 설치
npm install

# 3. React 개발 서버 실행
npm run dev
```
애플리케이션은 `http://localhost:5173` (또는 다른 포트)에서 열립니다.

**중요:** 프론트엔드 코드(`src/components/*.js`) 내의 `API_URL` 변수를 백엔드 서버 주소(`http://127.0.0.1:8000`)로 설정해야 합니다.

