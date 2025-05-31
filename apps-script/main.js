/**
 * 교육용 웹학습지 시스템 - Google Apps Script 메인 파일
 * GitHub Repository: plusiam/edu-worksheet-system
 */

// 전역 설정
const CONFIG = {
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID', // Google Sheets ID
  GITHUB_REPO: 'plusiam/edu-worksheet-system',
  ADMIN_EMAIL: 'your-email@gmail.com'
};

/**
 * 웹앱의 GET 요청 처리
 */
function doGet(e) {
  const action = e.parameter.action || 'dashboard';
  
  switch(action) {
    case 'dashboard':
      return createDashboard();
    case 'reports':
      return createReports();
    default:
      return HtmlService.createHtmlOutput('<h1>교육용 웹학습지 시스템</h1>');
  }
}

/**
 * 웹앱의 POST 요청 처리 (웹학습지에서 데이터 수신)
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    switch(action) {
      case 'saveResult':
        return saveStudentResult(data);
      case 'getStats':
        return getStatistics(data);
      default:
        return ContentService
          .createTextOutput(JSON.stringify({error: 'Unknown action'}))
          .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService
      .createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 학생 학습 결과 저장
 */
function saveStudentResult(data) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let sheet = ss.getSheetByName('학습결과');
    
    // 시트가 없으면 생성
    if (!sheet) {
      sheet = ss.insertSheet('학습결과');
      // 헤더 추가
      sheet.getRange(1, 1, 1, 10).setValues([[
        '타임스탬프', '워크시트명', '시작시간', '종료시간', '소요시간(초)',
        '총문제수', '정답수', '정답률(%)', '답안내역', '세션ID'
      ]]);
    }
    
    // 데이터 추가
    const sessionId = Utilities.getUuid();
    const correctRate = Math.round((data.correctAnswers / data.totalQuestions) * 100);
    
    sheet.appendRow([
      data.timestamp,
      data.worksheet,
      data.startTime,
      data.endTime,
      data.duration,
      data.totalQuestions,
      data.correctAnswers,
      correctRate,
      JSON.stringify(data.answers),
      sessionId
    ]);
    
    // 자동 리포트 생성 (일정 조건 충족시)
    checkAndGenerateReport(data.worksheet);
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true, sessionId: sessionId}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error saving result:', error);
    return ContentService
      .createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 대시보드 HTML 생성
 */
function createDashboard() {
  const stats = getDashboardStats();
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>교육용 웹학습지 대시보드</title>
      <style>
        body { font-family: 'Malgun Gothic', sans-serif; margin: 20px; }
        .card { background: #f5f5f5; padding: 20px; margin: 10px; border-radius: 8px; }
        .stat { font-size: 2em; color: #667eea; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>📊 학습 현황 대시보드</h1>
      
      <div class="card">
        <h3>전체 통계</h3>
        <p>총 학습 세션: <span class="stat">${stats.totalSessions}</span></p>
        <p>평균 정답률: <span class="stat">${stats.avgCorrectRate}%</span></p>
        <p>가장 인기 있는 워크시트: <span class="stat">${stats.popularWorksheet}</span></p>
      </div>
      
      <div class="card">
        <h3>최근 활동</h3>
        <p>오늘 학습 세션: <span class="stat">${stats.todaySessions}</span></p>
        <p>이번 주 학습 세션: <span class="stat">${stats.weekSessions}</span></p>
      </div>
      
      <div class="card">
        <h3>바로가기</h3>
        <a href="https://plusiam.github.io/edu-worksheet-system/web-worksheets/">웹학습지 바로가기</a><br>
        <a href="https://docs.google.com/spreadsheets/d/${CONFIG.SPREADSHEET_ID}">데이터 시트 열기</a>
      </div>
    </body>
    </html>
  `;
  
  return HtmlService.createHtmlOutput(html);
}

/**
 * GitHub에서 최신 Apps Script 코드 동기화
 */
function syncFromGitHub() {
  try {
    const files = ['main.js', 'database.js', 'reports.js', 'utils.js'];
    
    files.forEach(filename => {
      const url = `https://api.github.com/repos/${CONFIG.GITHUB_REPO}/contents/apps-script/${filename}`;
      const response = UrlFetchApp.fetch(url);
      const data = JSON.parse(response.getContentText());
      const content = Utilities.newBlob(Utilities.base64Decode(data.content)).getDataAsString();
      
      console.log(`Synced ${filename} from GitHub`);
      // 여기서 실제 스크립트 파일을 업데이트하는 로직 추가
      // (현재는 로그만 출력)
    });
    
    console.log('GitHub 동기화 완료');
  } catch (error) {
    console.error('GitHub 동기화 오류:', error);
  }
}

/**
 * 정기적으로 실행할 트리거 함수
 */
function dailyTrigger() {
  // 일일 리포트 생성
  generateDailyReport();
  
  // GitHub에서 코드 동기화 (옵션)
  // syncFromGitHub();
}

/**
 * 트리거 설정 함수 (최초 1회 실행)
 */
function setupTriggers() {
  // 기존 트리거 삭제
  ScriptApp.getProjectTriggers().forEach(trigger => {
    ScriptApp.deleteTrigger(trigger);
  });
  
  // 매일 오전 9시에 실행
  ScriptApp.newTrigger('dailyTrigger')
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .create();
    
  console.log('트리거 설정 완료');
}