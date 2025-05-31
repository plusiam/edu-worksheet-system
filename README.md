# 교육용 웹학습지 시스템 📚

> GitHub Pages 웹학습지 + Google Apps Script 백엔드 연동 시스템

## 프로젝트 구조

```
edu-worksheet-system/
├── web-worksheets/          # 웹학습지 모음
│   ├── grade3-friendship/    # 3학년 우애 학습지
│   ├── grade4-emotion/       # 4학년 감정 학습지
│   └── common/               # 공통 컴포넌트
├── apps-script/              # Google Apps Script 코드
│   ├── main.js              # 메인 스크립트
│   ├── database.js          # 데이터 관리
│   ├── reports.js           # 리포트 생성
│   └── utils.js             # 유틸리티 함수
├── docs/                     # 문서화
└── config/                   # 설정 파일
```

## 사용 방법

### 1단계: 웹학습지 개발
- `web-worksheets/` 폴더에서 인터랙티브 학습지 개발
- GitHub Pages로 자동 배포
- 학생들이 브라우저에서 직접 사용

### 2단계: 데이터 수집
- 학습 결과를 Google Apps Script로 전송
- Google Sheets에 자동 저장
- 실시간 분석 및 리포트 생성

## 배포 URL
- 웹학습지: `https://plusiam.github.io/edu-worksheet-system/web-worksheets/`
- Apps Script: Google Apps Script 콘솔에서 관리

## 개발자
- 교육자: plusiam
- 목적: 수업연구, 시각화, 자동화
