# EasyStock

주식 투자 초보자를 위한 핵심 용어 학습 및 종목 추천 서비스

## 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite (better-sqlite3)
- **Icons**: Lucide React

## 프로젝트 구조

```
easystock/
├── src/
│   ├── app/              # Next.js App Router 페이지
│   │   ├── api/         # API 라우트
│   │   ├── learn/       # 배우기 페이지
│   │   ├── recommend/   # 추천받기 페이지
│   │   ├── my-stocks/   # 내 관심종목 페이지
│   │   ├── contact/     # 문의하기 페이지
│   │   ├── layout.tsx   # 루트 레이아웃
│   │   ├── page.tsx     # 홈 페이지
│   │   └── globals.css  # 전역 스타일
│   ├── components/
│   │   └── layout/      # 레이아웃 컴포넌트 (Header, Footer)
│   └── lib/
│       └── db.ts        # 데이터베이스 설정 및 초기화
└── data/                # SQLite 데이터베이스 파일

```

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 주요 기능

### 1. 홈 (`/`)
- 서비스 소개
- 주요 기능 안내
- 빠른 시작 가이드

### 2. 배우기 (`/learn`)
- 주식 용어 학습
- 카테고리별 필터링
- 검색 기능
- 용어 상세 페이지

### 3. 추천받기 (`/recommend`)
- 종목 목록 조회
- 종목 검색
- 종목 상세 정보
- 프로필 진단 (준비 중)

### 4. 내 관심종목 (`/my-stocks`)
- 관심 종목 관리
- 종목 상세 정보 및 차트 (준비 중)

### 5. 문의하기 (`/contact`)
- 피드백 제출
- 문의 유형 선택

## 데이터베이스 스키마

### terms (용어)
- id: 고유 ID
- term: 용어명
- category: 카테고리
- simple_explanation: 쉬운 설명
- detailed_explanation: 상세 설명
- example: 예시

### stocks (종목)
- id: 고유 ID
- code: 종목 코드
- name: 종목명
- sector: 업종
- description: 설명
- recommendation_reason: 추천 이유
- risk_level: 리스크 레벨

### faqs (자주 묻는 질문)
- id: 고유 ID
- question: 질문
- answer: 답변
- category: 카테고리

### feedback (피드백)
- id: 고유 ID
- type: 문의 유형
- title: 제목
- content: 내용
- email: 이메일 (선택)

## 개발 참고사항

- 모든 컴포넌트는 Client Component로 작성되어 있습니다 (`'use client'` 디렉티브 사용)
- API 라우트는 Server Component로 작성되어 있습니다
- 데이터베이스는 서버 측에서만 접근 가능합니다
- 초기 데이터는 `src/lib/db.ts`의 `seedDatabase()` 함수에서 개발 서버 실행 시 자동으로 생성됩니다

## 다음 단계

- [ ] 프로필 진단 기능 구현
- [ ] 관심종목 저장 기능 구현
- [ ] 차트 기능 추가 (Chart.js)
- [ ] FAQ 페이지 구현
- [ ] 초보자 강의 페이지 구현

