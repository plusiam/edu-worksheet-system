/**
 * 데이터베이스 관련 함수들
 * Google Sheets를 데이터베이스로 활용
 */

/**
 * 스프레드시트 초기화
 */
function initializeDatabase() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  
  // 학습결과 시트
  createSheetIfNotExists(ss, '학습결과', [
    '타임스탬프', '워크시트명', '시작시간', '종료시간', '소요시간(초)',
    '총문제수', '정답수', '정답률(%)', '답안내역', '세션ID'
  ]);
  
  // 워크시트 통계 시트
  createSheetIfNotExists(ss, '워크시트통계', [
    '워크시트명', '총실행횟수', '평균정답률', '평균소요시간', '최근실행일'
  ]);
  
  // 일일 통계 시트
  createSheetIfNotExists(ss, '일일통계', [
    '날짜', '총세션수', '평균정답률', '가장인기워크시트', '총학습시간'
  ]);
  
  console.log('데이터베이스 초기화 완료');
}

/**
 * 시트가 없으면 생성하는 함수
 */
function createSheetIfNotExists(spreadsheet, sheetName, headers) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  }
  
  return sheet;
}

/**
 * 학습 결과 조회
 */
function getStudentResults(worksheetName = null, startDate = null, endDate = null) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName('학습결과');
  
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const results = [];
  
  // 헤더를 제외한 데이터 처리
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const result = {};
    
    // 각 열을 객체로 변환
    headers.forEach((header, index) => {
      result[header] = row[index];
    });
    
    // 필터링 조건 확인
    if (worksheetName && result['워크시트명'] !== worksheetName) continue;
    if (startDate && new Date(result['타임스탬프']) < new Date(startDate)) continue;
    if (endDate && new Date(result['타임스탬프']) > new Date(endDate)) continue;
    
    results.push(result);
  }
  
  return results;
}

/**
 * 워크시트별 통계 업데이트
 */
function updateWorksheetStats(worksheetName) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const statsSheet = ss.getSheetByName('워크시트통계');
  const resultsSheet = ss.getSheetByName('학습결과');
  
  if (!statsSheet || !resultsSheet) return;
  
  // 해당 워크시트의 모든 결과 가져오기
  const results = getStudentResults(worksheetName);
  
  if (results.length === 0) return;
  
  // 통계 계산
  const totalSessions = results.length;
  const avgCorrectRate = results.reduce((sum, r) => sum + parseFloat(r['정답률(%)'] || 0), 0) / totalSessions;
  const avgDuration = results.reduce((sum, r) => sum + parseFloat(r['소요시간(초)'] || 0), 0) / totalSessions;
  const lastExecution = Math.max(...results.map(r => new Date(r['타임스탬프']).getTime()));
  
  // 기존 데이터 찾기
  const statsData = statsSheet.getDataRange().getValues();
  let rowIndex = -1;
  
  for (let i = 1; i < statsData.length; i++) {
    if (statsData[i][0] === worksheetName) {
      rowIndex = i + 1; // 1-based index
      break;
    }
  }
  
  const newRow = [
    worksheetName,
    totalSessions,
    Math.round(avgCorrectRate * 100) / 100,
    Math.round(avgDuration),
    new Date(lastExecution)
  ];
  
  if (rowIndex > 0) {
    // 기존 데이터 업데이트
    statsSheet.getRange(rowIndex, 1, 1, 5).setValues([newRow]);
  } else {
    // 새 데이터 추가
    statsSheet.appendRow(newRow);
  }
}

/**
 * 대시보드용 통계 데이터 가져오기
 */
function getDashboardStats() {
  const results = getStudentResults();
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // 기본 통계
  const totalSessions = results.length;
  const avgCorrectRate = totalSessions > 0 
    ? Math.round(results.reduce((sum, r) => sum + parseFloat(r['정답률(%)'] || 0), 0) / totalSessions)
    : 0;
  
  // 오늘과 이번 주 세션 수
  const todaySessions = results.filter(r => {
    const resultDate = new Date(r['타임스탬프']);
    return resultDate.toDateString() === today.toDateString();
  }).length;
  
  const weekSessions = results.filter(r => {
    const resultDate = new Date(r['타임스탬프']);
    return resultDate >= weekAgo;
  }).length;
  
  // 가장 인기 있는 워크시트
  const worksheetCounts = {};
  results.forEach(r => {
    const worksheet = r['워크시트명'];
    worksheetCounts[worksheet] = (worksheetCounts[worksheet] || 0) + 1;
  });
  
  const popularWorksheet = Object.keys(worksheetCounts).reduce((a, b) => 
    worksheetCounts[a] > worksheetCounts[b] ? a : b, '없음'
  );
  
  return {
    totalSessions,
    avgCorrectRate,
    todaySessions,
    weekSessions,
    popularWorksheet
  };
}

/**
 * 데이터 백업 함수
 */
function backupData() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  
  // 백업 폴더 생성 또는 찾기
  let backupFolder;
  const folders = DriveApp.getFoldersByName('교육시스템_백업');
  if (folders.hasNext()) {
    backupFolder = folders.next();
  } else {
    backupFolder = DriveApp.createFolder('교육시스템_백업');
  }
  
  // 스프레드시트 복사
  const backupFile = ss.copy(`교육시스템_백업_${today}`);
  backupFolder.addFile(DriveApp.getFileById(backupFile.getId()));
  
  console.log(`데이터 백업 완료: ${today}`);
  return backupFile.getId();
}

/**
 * 오래된 백업 파일 정리 (30일 이전)
 */
function cleanupOldBackups() {
  const folders = DriveApp.getFoldersByName('교육시스템_백업');
  if (!folders.hasNext()) return;
  
  const backupFolder = folders.next();
  const files = backupFolder.getFiles();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  while (files.hasNext()) {
    const file = files.next();
    if (file.getDateCreated() < thirtyDaysAgo) {
      DriveApp.removeFile(file);
      console.log(`오래된 백업 파일 삭제: ${file.getName()}`);
    }
  }
}