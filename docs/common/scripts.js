// 공통 JavaScript 함수들

// Google Apps Script 연동 설정
const CONFIG = {
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
    GITHUB_REPO: 'plusiam/edu-worksheet-system'
};

// 학습 결과를 Google Apps Script로 전송
async function submitToAppsScript(data) {
    try {
        const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'saveResult',
                timestamp: new Date().toISOString(),
                ...data
            })
        });
        
        console.log('데이터 전송 완료:', data);
        return true;
    } catch (error) {
        console.error('데이터 전송 실패:', error);
        return false;
    }
}

// 진행률 표시
function updateProgress(current, total) {
    const percentage = Math.round((current / total) * 100);
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    
    if (progressFill) {
        progressFill.style.width = percentage + '%';
    }
    
    if (progressText) {
        progressText.textContent = `${current}/${total} (${percentage}%)`;
    }
}

// 모달 창 제어
function showModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'block';
    }
}

function hideModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';
    }
}

// 알림 메시지 표시
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    // 3초 후 자동 제거
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// 학습 세션 관리
class LearningSession {
    constructor(worksheetName) {
        this.worksheetName = worksheetName;
        this.startTime = new Date();
        this.answers = [];
        this.currentQuestion = 0;
    }
    
    addAnswer(questionId, answer, isCorrect) {
        this.answers.push({
            questionId,
            answer,
            isCorrect,
            timestamp: new Date()
        });
    }
    
    async finish() {
        const endTime = new Date();
        const duration = Math.round((endTime - this.startTime) / 1000); // 초 단위
        
        const results = {
            worksheet: this.worksheetName,
            startTime: this.startTime.toISOString(),
            endTime: endTime.toISOString(),
            duration: duration,
            totalQuestions: this.answers.length,
            correctAnswers: this.answers.filter(a => a.isCorrect).length,
            answers: this.answers
        };
        
        // Google Apps Script로 전송
        const success = await submitToAppsScript(results);
        
        if (success) {
            showAlert('학습 결과가 저장되었습니다! 🎉');
        } else {
            showAlert('결과 저장에 실패했습니다. 다시 시도해주세요.', 'warning');
        }
        
        return results;
    }
}

// 유틸리티 함수들
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// 전역 변수
let currentSession = null;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('교육용 웹학습지 시스템 로드 완료');
    
    // 모달 닫기 이벤트
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
});