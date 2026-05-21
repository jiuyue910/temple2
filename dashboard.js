/**
 * 更新首頁儀表板狀態與模擬數據
 * @param {string} username - 登入的會員名稱
 */
function updateDashboardUI(username = "信眾") {
    const dashUser = document.getElementById('dash-username');
    const stats = document.querySelectorAll('.profile-stats strong'); 
    
    if (isLoggedIn) {
        if (dashUser) dashUser.innerText = `${username} 居士`; 
        if (stats.length > 0) stats[0].innerText = "2"; // 模擬已點燈數
    } else {
        if (dashUser) dashUser.innerText = "信眾您好"; 
        if (stats.length > 0) stats[0].innerText = "-"; 
    }
}