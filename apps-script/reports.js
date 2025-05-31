/**
 * 리포트 생성 관련 함수들
 */

/**
 * 일일 리포트 생성
 */
function generateDailyReport() {
  const today = new Date();
  const todayStr = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  
  // 오늘의 학습 결과 가져오기
  const todayResults = getStudentResults(null, todayStr, todayStr);
  
  if (todayResults.length === 0) {
    console.log('오늘 학습 데이터가 없습니다.');
    return;
  }
  
  // 통계 계산
  const stats = calculateDailyStats(todayResults);
  
  // 일일통계 시트에 저장
  saveDailyStats(todayStr, stats);
  
  // 이메일 리포트 발송 (옵션)
  if (CONFIG.ADMIN_EMAIL) {
    sendDailyReportEmail(todayStr, stats, todayResults);
  }
  
  console.log(`일일 리포트 생성 완료: ${todayStr}`);
}

/**
 * 일일 통계 계산
 */
function calculateDailyStats(results) {
  const totalSessions = results.length;
  const avgCorrectRate = results.reduce((sum, r) => sum + parseFloat(r['정답률(%)'] || 0), 0) / totalSessions;
  const totalLearningTime = results.reduce((sum, r) => sum + parseFloat(r['소요시간(초)'] || 0), 0);
  
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
    avgCorrectRate: Math.round(avgCorrectRate * 100) / 100,
    totalLearningTime: Math.round(totalLearningTime),
    popularWorksheet,
    worksheetCounts
  };
}

/**
 * 일일 통계를 시트에 저장
 */
function saveDailyStats(date, stats) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName('일일통계');
  
  if (!sheet) return;
  
  sheet.appendRow([
    date,
    stats.totalSessions,
    stats.avgCorrectRate,
    stats.popularWorksheet,
    stats.totalLearningTime
  ]);
}

/**
 * 일일 리포트 이메일 발송
 */
function sendDailyReportEmail(date, stats, results) {
  const subject = `📊 교육시스템 일일 리포트 (${date})`;
  
  let htmlBody = `
    <h2>교육용 웹학습지 시스템 일일 리포트</h2>
    <h3>📅 ${date}</h3>
    
    <div style="background: #f5f7fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h4>📈 주요 지표</h4>
      <ul>
        <li><strong>총 학습 세션:</strong> ${stats.totalSessions}회</li>
        <li><strong>평균 정답률:</strong> ${stats.avgCorrectRate}%</li>
        <li><strong>총 학습 시간:</strong> ${formatTime(stats.totalLearningTime)}</li>
        <li><strong>인기 워크시트:</strong> ${stats.popularWorksheet}</li>
      </ul>
    </div>
    
    <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h4>📚 워크시트별 현황</h4>
      <ul>
  `;
  
  // 워크시트별 세션 수 추가
  Object.entries(stats.worksheetCounts).forEach(([worksheet, count]) => {
    htmlBody += `<li>${worksheet}: ${count}회</li>`;
  });
  
  htmlBody += `
      </ul>
    </div>
    
    <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h4>🔗 바로가기</h4>
      <ul>
        <li><a href="https://plusiam.github.io/edu-worksheet-system/web-worksheets/">웹학습지 시스템</a></li>
        <li><a href="https://docs.google.com/spreadsheets/d/${CONFIG.SPREADSHEET_ID}">데이터 시트</a></li>
        <li><a href="https://script.google.com/home/projects/${ScriptApp.getScriptId()}">Apps Script 관리</a></li>
      </ul>
    </div>
    
    <p style="color: #666; font-size: 0.9em; margin-top: 30px;">
      이 리포트는 교육용 웹학습지 시스템에서 자동 생성되었습니다.<br>
      GitHub: <a href="https://github.com/plusiam/edu-worksheet-system">plusiam/edu-worksheet-system</a>
    </p>
  `;
  
  try {
    GmailApp.sendEmail(
      CONFIG.ADMIN_EMAIL,
      subject,
      '', // 텍스트 버전 (비워둠)
      {
        htmlBody: htmlBody,
        name: '교육시스템 자동리포트'
      }
    );
    console.log(`이메일 리포트 발송 완료: ${CONFIG.ADMIN_EMAIL}`);
  } catch (error) {
    console.error('이메일 발송 실패:', error);
  }
}

/**
 * 주간 리포트 생성
 */
function generateWeeklyReport() {
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const startDate = Utilities.formatDate(weekAgo, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const endDate = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  
  // 이번 주 결과 가져오기
  const weekResults = getStudentResults(null, startDate, endDate);
  
  if (weekResults.length === 0) {
    console.log('이번 주 학습 데이터가 없습니다.');
    return;
  }
  
  // 주간 통계 계산
  const weekStats = calculateWeeklyStats(weekResults);
  
  // 주간 리포트 이메일 발송
  if (CONFIG.ADMIN_EMAIL) {
    sendWeeklyReportEmail(startDate, endDate, weekStats);
  }
  
  console.log(`주간 리포트 생성 완료: ${startDate} ~ ${endDate}`);
}

/**
 * 주간 통계 계산
 */
function calculateWeeklyStats(results) {
  const dailyStats = {};
  
  // 일별로 그룹화
  results.forEach(result => {
    const date = Utilities.formatDate(new Date(result['타임스탬프']), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    if (!dailyStats[date]) {
      dailyStats[date] = [];
    }
    dailyStats[date].push(result);
  });
  
  // 일별 통계 계산
  const dailyData = Object.entries(dailyStats).map(([date, dayResults]) => {
    const sessions = dayResults.length;
    const avgCorrectRate = dayResults.reduce((sum, r) => sum + parseFloat(r['정답률(%)'] || 0), 0) / sessions;
    
    return {
      date,
      sessions,
      avgCorrectRate: Math.round(avgCorrectRate * 100) / 100
    };
  });
  
  return {
    totalSessions: results.length,
    dailyData: dailyData.sort((a, b) => a.date.localeCompare(b.date)),
    avgCorrectRate: Math.round(results.reduce((sum, r) => sum + parseFloat(r['정답률(%)'] || 0), 0) / results.length * 100) / 100
  };
}

/**
 * 주간 리포트 이메일 발송
 */
function sendWeeklyReportEmail(startDate, endDate, stats) {
  const subject = `📊 교육시스템 주간 리포트 (${startDate} ~ ${endDate})`;
  
  let htmlBody = `
    <h2>교육용 웹학습지 시스템 주간 리포트</h2>
    <h3>📅 ${startDate} ~ ${endDate}</h3>
    
    <div style="background: #f5f7fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h4>📈 주간 요약</h4>
      <ul>
        <li><strong>총 학습 세션:</strong> ${stats.totalSessions}회</li>
        <li><strong>평균 정답률:</strong> ${stats.avgCorrectRate}%</li>
        <li><strong>활동 일수:</strong> ${stats.dailyData.length}일</li>
      </ul>
    </div>
    
    <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h4>📊 일별 현황</h4>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background: #ddd;">
          <th style="padding: 8px; border: 1px solid #ccc;">날짜</th>
          <th style="padding: 8px; border: 1px solid #ccc;">세션 수</th>
          <th style="padding: 8px; border: 1px solid #ccc;">평균 정답률</th>
        </tr>
  `;
  
  stats.dailyData.forEach(day => {
    htmlBody += `
      <tr>
        <td style="padding: 8px; border: 1px solid #ccc;">${day.date}</td>
        <td style="padding: 8px; border: 1px solid #ccc;">${day.sessions}회</td>
        <td style="padding: 8px; border: 1px solid #ccc;">${day.avgCorrectRate}%</td>
      </tr>
    `;
  });
  
  htmlBody += `
      </table>
    </div>
    
    <p style="color: #666; font-size: 0.9em; margin-top: 30px;">
      이 리포트는 교육용 웹학습지 시스템에서 자동 생성되었습니다.
    </p>
  `;
  
  try {
    GmailApp.sendEmail(
      CONFIG.ADMIN_EMAIL,
      subject,
      '',
      {
        htmlBody: htmlBody,
        name: '교육시스템 자동리포트'
      }
    );
    console.log('주간 리포트 이메일 발송 완료');
  } catch (error) {
    console.error('주간 리포트 이메일 발송 실패:', error);
  }
}

/**
 * 리포트 자동 생성 조건 확인
 */
function checkAndGenerateReport(worksheetName) {
  const results = getStudentResults(worksheetName);
  
  // 특정 워크시트가 10회 실행될 때마다 워크시트별 리포트 생성
  if (results.length % 10 === 0) {
    generateWorksheetReport(worksheetName);
  }
}

/**
 * 워크시트별 리포트 생성
 */
function generateWorksheetReport(worksheetName) {
  const results = getStudentResults(worksheetName);
  
  if (results.length === 0) return;
  
  console.log(`${worksheetName} 워크시트 리포트 생성 (총 ${results.length}회 실행)`);
  
  // 워크시트 통계 업데이트
  updateWorksheetStats(worksheetName);
  
  // 필요시 상세 분석 로직 추가
}