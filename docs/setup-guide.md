# 설정 가이드 📋

## 1. GitHub 설정

### 저장소 클론
```bash
git clone https://github.com/plusiam/edu-worksheet-system.git
cd edu-worksheet-system
```

### GitHub Pages 활성화
1. GitHub 저장소 → Settings → Pages
2. Source: Deploy from a branch
3. Branch: main / (root)
4. Save

## 2. Google Apps Script 설정

### 프로젝트 생성
1. [Google Apps Script](https://script.google.com) 접속
2. "새 프로젝트" 클릭
3. 프로젝트명: "교육용 웹학습지 시스템"

### 코드 복사
1. `apps-script/` 폴더의 모든 `.js` 파일 내용을 Apps Script로 복사
2. 각 파일을 별도의 스크립트 파일로 생성

### 설정 수정
`main.js`의 CONFIG 객체 수정:
```javascript
const CONFIG = {
  SPREADSHEET_ID: 'YOUR_GOOGLE_SHEETS_ID', // 생성한 시트 ID
  GITHUB_REPO: 'plusiam/edu-worksheet-system',
  ADMIN_EMAIL: 'your-email@gmail.com' // 리포트 받을 이메일
};
```

## 3. Google Sheets 설정

### 스프레드시트 생성
1. [Google Sheets](https://sheets.google.com) 접속
2. 빈 스프레드시트 생성
3. 이름: "교육시스템 데이터베이스"
4. URL에서 스프레드시트 ID 복사

### 권한 설정
1. 스프레드시트 공유 → Apps Script 프로젝트에 편집 권한 부여
2. Apps Script → 권한 → Google Sheets API 승인

## 4. 웹앱 배포

### Apps Script 배포
1. Apps Script 프로젝트 → 배포 → 새 배포
2. 유형: 웹앱
3. 실행 대상: 본인
4. 액세스 권한: 모든 사용자
5. 배포 → 웹앱 URL 복사

### 웹학습지 설정
`web-worksheets/common/scripts.js`의 URL 수정:
```javascript
const CONFIG = {
    APPS_SCRIPT_URL: 'YOUR_WEB_APP_URL', // 복사한 웹앱 URL
    GITHUB_REPO: 'plusiam/edu-worksheet-system'
};
```

## 5. 트리거 설정

Apps Script에서 실행:
```javascript
setupTriggers(); // 함수 실행
initializeDatabase(); // 데이터베이스 초기화
```

## 6. 테스트

### 웹학습지 접속
- URL: `https://plusiam.github.io/edu-worksheet-system/web-worksheets/`
- 샘플 학습지 실행 후 결과 확인

### 데이터 확인
- Google Sheets에서 "학습결과" 시트 확인
- Apps Script 로그 확인

### 대시보드 접속
- Apps Script 웹앱 URL에 `?action=dashboard` 추가
- 통계 데이터 확인

## 7. 문제 해결

### 자주 발생하는 오류

**CORS 오류**
```javascript
// mode: 'no-cors' 옵션 확인
fetch(url, { method: 'POST', mode: 'no-cors', ... })
```

**권한 오류**
- Apps Script 권한 재승인
- Google Sheets 공유 설정 확인

**데이터 저장 안됨**
- 스프레드시트 ID 확인
- 웹앱 URL 확인
- Apps Script 실행 로그 확인

## 8. 사용자 정의

### 새 워크시트 추가
1. `web-worksheets/` 폴더에 새 폴더 생성
2. HTML, CSS, JS 파일 작성
3. `common/scripts.js`의 `LearningSession` 클래스 활용
4. 메인 인덱스 페이지에 링크 추가

### 리포트 사용자 정의
- `apps-script/reports.js` 수정
- 이메일 템플릿 변경
- 새로운 통계 지표 추가

## 9. 백업 및 유지보수

### 자동 백업
- 매일 자정에 자동 백업 실행
- Google Drive "교육시스템_백업" 폴더에 저장

### 코드 동기화
- GitHub에서 코드 수정 후
- Apps Script에 수동 복사 또는
- `syncFromGitHub()` 함수 활용

---

## 추가 도움말

문제가 발생하면:
1. Apps Script 실행 기록 확인
2. Google Sheets 데이터 확인
3. 브라우저 개발자 도구 콘솔 확인
4. GitHub Issues에 문의