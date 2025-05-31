# API 참조 문서 📖

## 웹학습지 → Apps Script 통신

### 데이터 전송 형식

#### 학습 결과 전송
```javascript
// POST 요청 데이터 구조
{
  "action": "saveResult",
  "timestamp": "2025-05-31T10:30:00.000Z",
  "worksheet": "grade3-friendship",
  "startTime": "2025-05-31T10:25:00.000Z",
  "endTime": "2025-05-31T10:30:00.000Z",
  "duration": 300,
  "totalQuestions": 10,
  "correctAnswers": 8,
  "answers": [
    {
      "questionId": "q1",
      "answer": "친구와 함께 놀기",
      "isCorrect": true,
      "timestamp": "2025-05-31T10:25:30.000Z"
    }
  ]
}
```

#### 응답 형식
```javascript
// 성공 응답
{
  "success": true,
  "sessionId": "abc123-def456-ghi789"
}

// 오류 응답
{
  "error": "오류 메시지"
}
```

## JavaScript 클래스 및 함수

### LearningSession 클래스

```javascript
// 학습 세션 생성
const session = new LearningSession('grade3-friendship');

// 답안 추가
session.addAnswer('q1', '친구와 함께 놀기', true);
session.addAnswer('q2', '혼자 놀기', false);

// 세션 종료 및 결과 전송
const results = await session.finish();
```

#### 메서드

| 메서드 | 설명 | 매개변수 |
|--------|------|---------|
| `addAnswer(questionId, answer, isCorrect)` | 답안 추가 | questionId: 문제ID, answer: 답안, isCorrect: 정답여부 |
| `finish()` | 세션 종료 및 결과 전송 | 없음 |

### 유틸리티 함수

#### `submitToAppsScript(data)`
웹학습지에서 Apps Script로 데이터 전송

```javascript
const success = await submitToAppsScript({
  action: 'saveResult',
  worksheet: 'grade3-friendship',
  // ... 기타 데이터
});
```

#### `updateProgress(current, total)`
진행률 표시 업데이트

```javascript
updateProgress(5, 10); // 50% 진행률 표시
```

#### `showAlert(message, type)`
알림 메시지 표시

```javascript
showAlert('정답입니다!', 'success');
showAlert('다시 시도해보세요.', 'warning');
```

## Apps Script 함수

### 데이터베이스 함수

#### `getStudentResults(worksheetName, startDate, endDate)`
학습 결과 조회

```javascript
// 특정 워크시트 결과
const results = getStudentResults('grade3-friendship');

// 날짜 범위 필터링
const results = getStudentResults(null, '2025-05-01', '2025-05-31');
```

#### `updateWorksheetStats(worksheetName)`
워크시트별 통계 업데이트

```javascript
updateWorksheetStats('grade3-friendship');
```

#### `getDashboardStats()`
대시보드용 통계 반환

```javascript
const stats = getDashboardStats();
// 반환값: { totalSessions, avgCorrectRate, todaySessions, weekSessions, popularWorksheet }
```

### 리포트 함수

#### `generateDailyReport()`
일일 리포트 생성 및 이메일 발송

```javascript
generateDailyReport(); // 매일 자동 실행
```

#### `generateWeeklyReport()`
주간 리포트 생성

```javascript
generateWeeklyReport(); // 매주 실행
```

### 유틸리티 함수

#### `formatTime(seconds)`
초를 시:분:초 형태로 변환

```javascript
formatTime(3661); // "1시간 1분 1초"
```

#### `calculateGrade(correctRate)`
정답률에 따른 등급 계산

```javascript
const grade = calculateGrade(85);
// 반환값: { grade: 'A', emoji: '🥇', message: '훌륭해요!' }
```

#### `validateLearningResult(data)`
학습 결과 데이터 유효성 검사

```javascript
const validation = validateLearningResult(data);
// 반환값: { valid: true/false, error: '오류메시지' }
```

## 데이터베이스 스키마

### 학습결과 시트

| 컬럼 | 타입 | 설명 |
|------|------|------|
| 타임스탬프 | DateTime | 결과 저장 시간 |
| 워크시트명 | String | 학습지 이름 |
| 시작시간 | DateTime | 학습 시작 시간 |
| 종료시간 | DateTime | 학습 종료 시간 |
| 소요시간(초) | Number | 총 소요 시간 |
| 총문제수 | Number | 전체 문제 수 |
| 정답수 | Number | 정답 개수 |
| 정답률(%) | Number | 정답률 |
| 답안내역 | JSON | 상세 답안 데이터 |
| 세션ID | String | 고유 세션 식별자 |

### 워크시트통계 시트

| 컬럼 | 타입 | 설명 |
|------|------|------|
| 워크시트명 | String | 학습지 이름 |
| 총실행횟수 | Number | 총 실행 횟수 |
| 평균정답률 | Number | 평균 정답률 |
| 평균소요시간 | Number | 평균 소요 시간(초) |
| 최근실행일 | DateTime | 마지막 실행 일시 |

### 일일통계 시트

| 컬럼 | 타입 | 설명 |
|------|------|------|
| 날짜 | Date | 통계 날짜 |
| 총세션수 | Number | 하루 총 세션 수 |
| 평균정답률 | Number | 하루 평균 정답률 |
| 가장인기워크시트 | String | 가장 많이 사용된 워크시트 |
| 총학습시간 | Number | 하루 총 학습 시간(초) |

## 웹앱 엔드포인트

### GET 요청

#### 대시보드
```
GET https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=dashboard
```

#### 리포트
```
GET https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=reports
```

### POST 요청

#### 학습 결과 저장
```
POST https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
Content-Type: application/json

{
  "action": "saveResult",
  "worksheet": "grade3-friendship",
  // ... 기타 데이터
}
```

#### 통계 조회
```
POST https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
Content-Type: application/json

{
  "action": "getStats",
  "worksheet": "grade3-friendship",
  "startDate": "2025-05-01",
  "endDate": "2025-05-31"
}
```

## 에러 코드

| 코드 | 메시지 | 설명 |
|------|--------|------|
| `INVALID_ACTION` | Unknown action | 지원하지 않는 액션 |
| `MISSING_FIELD` | 필수 필드 누락: {field} | 필수 데이터 누락 |
| `INVALID_DATA` | 데이터가 유효하지 않습니다 | 데이터 형식 오류 |
| `DATABASE_ERROR` | 데이터베이스 오류 | 스프레드시트 접근 오류 |
| `PERMISSION_DENIED` | 권한이 없습니다 | 접근 권한 오류 |

## 사용 예제

### 기본 웹학습지 구현

```javascript
// 학습 세션 시작
const session = new LearningSession('my-worksheet');

// 문제 출제 및 답안 수집
function submitAnswer(questionId, answer, correctAnswer) {
  const isCorrect = answer === correctAnswer;
  session.addAnswer(questionId, answer, isCorrect);
  
  if (isCorrect) {
    showAlert('정답입니다! 🎉', 'success');
  } else {
    showAlert('다시 생각해보세요.', 'warning');
  }
  
  updateProgress(session.answers.length, totalQuestions);
}

// 학습 완료
async function completeWorksheet() {
  const results = await session.finish();
  
  if (results) {
    const grade = calculateGrade(results.correctAnswers / results.totalQuestions * 100);
    showAlert(`학습 완료! 등급: ${grade.grade} ${grade.emoji}`, 'success');
  }
}
```

### Apps Script 커스텀 함수

```javascript
// 특정 학생의 학습 패턴 분석
function analyzeStudentPattern(worksheetName, days = 30) {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
  
  const results = getStudentResults(
    worksheetName, 
    Utilities.formatDate(startDate, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
    Utilities.formatDate(endDate, Session.getScriptTimeZone(), 'yyyy-MM-dd')
  );
  
  // 분석 로직 구현
  const analysis = {
    totalAttempts: results.length,
    averageScore: results.reduce((sum, r) => sum + parseFloat(r['정답률(%)'] || 0), 0) / results.length,
    improvementTrend: calculateTrend(results),
    weeklyPattern: getWeeklyPattern(results)
  };
  
  return analysis;
}
```