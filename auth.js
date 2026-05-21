// --- 會員認證狀態變數 ---
let isLoggedIn = false;

/**
 * 檢查權限並跳轉頁面
 * @param {string} target - 目標功能名稱或區塊 ID
 */
function checkAuthAndGo(target) {
    if (!isLoggedIn) { 
        alert('請先登入系統！'); 
        showSection('section-login'); 
    } else { 
        if (target === 'list') showSection('section-list'); 
        else alert('進入 ' + target + ' 功能'); 
    }
}

/**
 * 處理頂部導覽列的登入/登出按鈕點擊
 */
function handleLoginClick() { 
    if (isLoggedIn) { 
        isLoggedIn = false; 
        updateAuthNavUI(); 
        if (typeof updateDashboardUI === 'function') updateDashboardUI(); // 通知儀表板更新
        alert('已登出'); 
    } else { 
        showSection('section-login'); 
    } 
}

/**
 * 執行登入驗證
 */
function doLogin() {
    const userVal = document.getElementById('username').value;
    if (userVal && document.getElementById('password').value) {
        isLoggedIn = true; 
        updateAuthNavUI(userVal); 
        if (typeof updateDashboardUI === 'function') updateDashboardUI(userVal); // 通知儀表板更新
        showSection('section-main'); 
        alert('登入成功！');
    } else { 
        alert('請輸入帳號密碼'); 
    }
}

/**
 * 僅更新頂部導覽列與認證相關的基礎 UI
 */
function updateAuthNavUI(username = "信眾") {
    const navBtn = document.getElementById('nav-login-toggle'); 
    const status = document.getElementById('auth-status');
    const text = isLoggedIn ? 'Log out' : 'Login / 註冊'; 
    
    if (navBtn) {
        navBtn.innerText = text; 
        navBtn.classList.toggle('logged-in', isLoggedIn); 
    }
    if (status) {
        status.innerText = isLoggedIn ? '狀態：已登入會員' : '狀態：尚未登入'; 
    }
}