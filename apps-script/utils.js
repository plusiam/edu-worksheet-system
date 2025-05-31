/**
 * 유틸리티 함수들
 */

/**
 * 시간 포맷팅 (초 -> 시:분:초)
 */
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}시간 ${minutes}분 ${remainingSeconds}초`;
  } else if (minutes > 0) {
    return `${minutes}분 ${remainingSeconds}초`;
  } else {
    return `${remainingSeconds}초`;
  }
}

/**
 * 날짜 범위 유효성 검사
 */
function isValidDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return start <= end && start <= new Date() && end <= new Date();
}

/**
 * 배열을 CSV 형태로 변환
 */
function arrayToCSV(data) {
  return data.map(row => 
    row.map(cell => 
      typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
    ).join(',')
  ).join('\n');
}

/**
 * 이메일 주소 유효성 검사
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 안전한 JSON 파싱
 */
function safeJsonParse(jsonString, defaultValue = null) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('JSON 파싱 오류:', error);
    return defaultValue;
  }
}

/**
 * 배열에서 통계 계산
 */
function calculateStats(numbers) {
  if (!numbers || numbers.length === 0) {
    return { mean: 0, median: 0, min: 0, max: 0, count: 0 };
  }
  
  const sorted = numbers.slice().sort((a, b) => a - b);
  const count = numbers.length;
  const sum = numbers.reduce((a, b) => a + b, 0);
  const mean = sum / count;
  
  let median;
  if (count % 2 === 0) {
    median = (sorted[count / 2 - 1] + sorted[count / 2]) / 2;
  } else {
    median = sorted[Math.floor(count / 2)];
  }
  
  return {
    mean: Math.round(mean * 100) / 100,
    median: Math.round(median * 100) / 100,
    min: sorted[0],
    max: sorted[count - 1],
    count: count
  };
}

/**
 * 텍스트 정리 (HTML 태그 제거 등)
 */
function sanitizeText(text) {
  if (typeof text !== 'string') return '';
  
  return text
    .replace(/<[^>]*>/g, '') // HTML 태그 제거
    .replace(/&nbsp;/g, ' ') // &nbsp; 공백으로 변환
    .replace(/&amp;/g, '&')   // &amp; -> &
    .replace(/&lt;/g, '<')   // &lt; -> <
    .replace(/&gt;/g, '>')   // &gt; -> >
    .trim();
}

/**
 * 랜덤 ID 생성
 */
function generateRandomId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 배열을 청크로 분할
 */
function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * 한국어 날짜 포맷팅
 */
function formatKoreanDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[d.getDay()];
  
  return `${year}년 ${month}월 ${day}일 (${weekday})`;
}

/**
 * 진행률 계산
 */
function calculateProgress(current, total) {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
}

/**
 * 데이터 검증 함수
 */
function validateLearningResult(data) {
  const required = ['worksheet', 'startTime', 'endTime', 'totalQuestions', 'correctAnswers'];
  
  for (const field of required) {
    if (!data.hasOwnProperty(field)) {
      return { valid: false, error: `필수 필드 누락: ${field}` };
    }
  }
  
  if (data.totalQuestions <= 0) {
    return { valid: false, error: '총 문제 수는 0보다 커야 합니다' };
  }
  
  if (data.correctAnswers < 0 || data.correctAnswers > data.totalQuestions) {
    return { valid: false, error: '정답 수가 유효하지 않습니다' };
  }
  
  const startTime = new Date(data.startTime);
  const endTime = new Date(data.endTime);
  
  if (startTime >= endTime) {
    return { valid: false, error: '시작 시간이 종료 시간보다 늦습니다' };
  }
  
  return { valid: true };
}

/**
 * 학습 성과 등급 계산
 */
function calculateGrade(correctRate) {
  if (correctRate >= 90) return { grade: 'A+', emoji: '🏆', message: '완벽해요!' };
  if (correctRate >= 80) return { grade: 'A', emoji: '🥇', message: '훌륭해요!' };
  if (correctRate >= 70) return { grade: 'B+', emoji: '🥈', message: '잘했어요!' };
  if (correctRate >= 60) return { grade: 'B', emoji: '🥉', message: '좋아요!' };
  if (correctRate >= 50) return { grade: 'C+', emoji: '👍', message: '노력했어요!' };
  return { grade: 'C', emoji: '💪', message: '다시 도전해보세요!' };
}

/**
 * 에러 로깅
 */
function logError(functionName, error, additionalInfo = {}) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    function: functionName,
    error: error.toString(),
    stack: error.stack,
    additionalInfo: additionalInfo
  };
  
  console.error('Error Log:', JSON.stringify(errorLog, null, 2));
  
  // 심각한 오류의 경우 이메일 알림
  if (CONFIG.ADMIN_EMAIL && error.name === 'Error') {
    try {
      GmailApp.sendEmail(
        CONFIG.ADMIN_EMAIL,
        '🚨 교육시스템 오류 발생',
        `함수: ${functionName}\n오류: ${error.toString()}\n시간: ${new Date().toLocaleString('ko-KR')}`
      );
    } catch (emailError) {
      console.error('이메일 알림 발송 실패:', emailError);
    }
  }
  
  return errorLog;
}