# -*- coding: utf-8 -*-
import os
import uuid
import cmath
import math
from typing import Any, Dict, List

# --- 환경 설정 및 라이브러리 임포트 ---
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# LangChain 관련
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain.chains import create_retrieval_chain
from langchain.chains.history_aware_retriever import create_history_aware_retriever
from langchain.chains.combine_documents import create_stuff_documents_chain

# 계산 관련
import sympy as sp

# --- 환경 변수 및 LLM 설정 ---
load_dotenv()
if not os.getenv("OPENAI_API_KEY"):
    raise RuntimeError("OPENAI_API_KEY를 .env 파일에 설정해주세요.")

OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
llm_gen = ChatOpenAI(model=OPENAI_MODEL, temperature=0.3)
embeddings = OpenAIEmbeddings()

# --- FastAPI 앱 초기화 및 CORS 설정 ---
app = FastAPI(title="전기·전자 종합 어시스턴트 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 React 앱 주소만 허용: ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 데이터 모델 정의 (Pydantic) ---
class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]]

class DocQueryRequest(BaseModel):
    session_id: str
    message: str
    history: List[Dict[str, str]]

class OhmLawRequest(BaseModel):
    V: float | None = None
    I: float | None = None
    R: float | None = None

class RlcRequest(BaseModel):
    R: float | None = None
    L: float | None = None
    C: float | None = None
    f: float | None = None
    mode: str

# --- 세션 데이터 저장소 (RAG Retriever 관리) ---
# 간단한 인메모리 저장소. 프로덕션에서는 Redis 등 사용 권장.
SESSION_DATA: Dict[str, Any] = {}

# --- 계산 함수들 ---
def ohms_law(V: float | None, I: float | None, R: float | None) -> Dict[str, Any]:
    try:
        known_vars = sum(x is not None for x in [V, I, R])
        if known_vars < 2:
            raise ValueError("세 변수(V, I, R) 중 최소 2개는 입력해야 합니다.")
        if V is None: V = I * R
        elif I is None: I = V / R if R != 0 else float('inf')
        elif R is None: R = V / I if I != 0 else float('inf')
        P = V * I
        return {"V[V]": V, "I[A]": I, "R[Ω]": R, "P[W]": P}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

def impedance_rlc_series(R: float, L: float, C: float, f: float) -> Dict[str, Any]:
    if f <= 0: raise ValueError("주파수(f)는 0보다 커야 합니다.")
    w = 2 * math.pi * f
    XL = w * L
    XC = 1 / (w * C) if C > 0 else float('inf')
    Z_complex = complex(R, XL - XC)
    return {
        "결과 (복소수)": f"{Z_complex.real:.4f} + {Z_complex.imag:.4f}j Ω",
        "크기 |Z|": f"{abs(Z_complex):.4f} Ω",
        "위상 ∠Z": f"{math.degrees(cmath.phase(Z_complex)):.4f}°",
    }

def impedance_rlc_parallel(R: float | None, L: float | None, C: float | None, f: float) -> Dict[str, Any]:
    if f <= 0: raise ValueError("주파수(f)는 0보다 커야 합니다.")
    w = 2 * math.pi * f
    Y_total = complex(0, 0) # Total Admittance
    if R and R > 0: Y_total += 1/R
    if L and L > 0: Y_total += complex(0, -1/(w*L))
    if C and C > 0: Y_total += complex(0, 1/(w*C))
    if Y_total == 0: return {"error": "모든 소자가 없거나 L/C가 공진 상태일 수 있습니다."}
    Z_total = 1 / Y_total
    return {
        "결과 (복소수)": f"{Z_total.real:.4f} + {Z_total.imag:.4f}j Ω",
        "크기 |Z|": f"{abs(Z_total):.4f} Ω",
        "위상 ∠Z": f"{math.degrees(cmath.phase(Z_total)):.4f}°",
    }

# --- API 엔드포인트 ---
@app.get("/")
def read_root():
    return {"message": "전기·전자 종합 어시스턴트 API"}

@app.post("/chat")
async def handle_chat(request: ChatRequest):
    """일반 전기 챗봇 엔드포인트"""
    chat_history = [HumanMessage(content=msg['content']) if msg['role'] == 'user' else AIMessage(content=msg['content']) for msg in request.history]
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful assistant specializing in electrical engineering. Answer in Korean."),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{input}")
    ])
    chain = prompt | llm_gen
    
    response = await chain.ainvoke({"input": request.message, "history": chat_history})
    return {"answer": response.content}

@app.post("/docs/upload")
async def upload_document(file: UploadFile = File(...)):
    """PDF 문서를 업로드하고 처리하여 세션을 생성"""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="PDF 파일만 업로드할 수 있습니다.")
    
    temp_dir = "/tmp/pdf_uploads"
    os.makedirs(temp_dir, exist_ok=True)
    temp_file_path = os.path.join(temp_dir, f"{uuid.uuid4()}.pdf")

    with open(temp_file_path, "wb") as buffer:
        buffer.write(await file.read())

    try:
        loader = PyPDFLoader(temp_file_path)
        documents = loader.load()
        if not documents:
            raise HTTPException(status_code=400, detail="PDF에서 텍스트를 추출하지 못했습니다.")
        
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(documents)
        vectorstore = FAISS.from_documents(documents=splits, embedding=embeddings)
        
        session_id = str(uuid.uuid4())
        SESSION_DATA[session_id] = vectorstore.as_retriever()
        
        return {"session_id": session_id, "message": f"'{file.filename}' 처리 완료!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"문서 처리 중 오류 발생: {e}")
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@app.post("/docs/query")
async def handle_doc_query(request: DocQueryRequest):
    """업로드된 문서에 대해 질문"""
    retriever = SESSION_DATA.get(request.session_id)
    if not retriever:
        raise HTTPException(status_code=404, detail="유효하지 않은 세션 ID입니다. 문서를 먼저 업로드해주세요.")

    chat_history = [HumanMessage(content=msg['content']) if msg['role'] == 'user' else AIMessage(content=msg['content']) for msg in request.history]

    contextualize_q_prompt = ChatPromptTemplate.from_messages([
        ("system", "Given a chat history and the latest user question, formulate a standalone question."),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ])
    history_aware_retriever = create_history_aware_retriever(llm_gen, retriever, contextualize_q_prompt)
    
    qa_system_prompt = "Answer the user's question based on the below context. Answer in Korean:\n\n{context}"
    qa_prompt = ChatPromptTemplate.from_messages([("system", qa_system_prompt), ("human", "{input}")])
    question_answer_chain = create_stuff_documents_chain(llm_gen, qa_prompt)
    
    rag_chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)
    
    response = await rag_chain.ainvoke({"input": request.message, "chat_history": chat_history})
    return {"answer": response["answer"]}

@app.post("/calculate/ohms")
def calculate_ohms(req: OhmLawRequest):
    return ohms_law(req.V, req.I, req.R)

@app.post("/calculate/rlc")
def calculate_rlc(req: RlcRequest):
    try:
        # ▼▼▼ [수정] 입력값이 None일 경우 기본값을 사용하도록 수정 ▼▼▼
        f = req.f if req.f is not None and req.f > 0 else 60.0
        R = req.R if req.R is not None else 0.0
        L = req.L if req.L is not None else 0.0
        C = req.C if req.C is not None else 0.0
        
        if req.mode == "직렬":
            return impedance_rlc_series(R, L, C, f)
        elif req.mode == "병렬":
            return impedance_rlc_parallel(req.R, req.L, req.C, f) # 병렬 함수는 None을 그대로 전달
        else:
            raise HTTPException(status_code=400, detail="mode는 '직렬' 또는 '병렬'이어야 합니다.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

