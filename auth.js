// --- 會員認證與權限角色狀態變數 ---
let isLoggedIn = false;
let currentUserRole = "user"; // "user" 代表一般信眾，"admin" 代表特定管理員帳號

/**
 * 檢查權限並跳轉頁面
 * @param {string} target - 目標功能名稱或區塊 ID
 */
function checkAuthAndGo(target) {
    if (!isLoggedIn) { 
        alert('請先登入系統！'); 
        showSection('section-login'); 
        return;
    }

    // 依據角色權限進行路由跳轉攔截
    if (target === 'list') {
        if (currentUserRole === 'admin') {
            showSection('section-member-admin'); // 管理員進入會員管理
        } else {
            showSection('section-list'); // 一般信眾進入選廟點燈
        }
    } else if (target === 'profile') {
        showSection('section-profile');
        if (typeof initFrequentModule === 'function') initFrequentModule();
    } else if (target === 'orders') {
        showSection('section-orders');
        if (typeof renderOrderHistory === 'function') renderOrderHistory();
    }
}

/**
 * 處理頂部導覽列的登入/登出按鈕點擊
 */
function handleLoginClick() { 
    if (isLoggedIn) { 
        isLoggedIn = false; 
        currentUserRole = "user"; // 登出時還原為一般身分
        updateAuthNavUI(); 
        if (typeof updateDashboardUI === 'function') updateDashboardUI(); // 通知儀表板更新
        alert('已登出'); 
        showSection('section-main');
    } else { 
        showSection('section-login'); 
    } 
}

/**
 * 執行登入驗證
 */
function doLogin() {
    const userVal = document.getElementById('username').value.trim();
    const passVal = document.getElementById('password').value;

    if (userVal && passVal) {
        isLoggedIn = true; 
        
        // ✨ 判斷是否為特定管理員帳號
        if (userVal === "temple" && passVal === "1234") {
            currentUserRole = "admin";
            alert('特定帳號登入：進入寺廟與會員管理後端系統！');
        } else {
            currentUserRole = "user";
            alert('信眾登入成功！');
        }

        updateAuthNavUI(userVal); 
        if (typeof updateDashboardUI === 'function') updateDashboardUI(userVal, currentUserRole); // 傳遞身分進行變身
        showSection('section-main'); 
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
        status.innerText = isLoggedIn ? `狀態：已登入會員` : '狀態：尚未登入'; 
    }
}

/**
 * 配合導覽列點擊邏輯切換
 */
function goToCartIfFormActive() {
    if (!isLoggedIn) {
        alert('請先登入會員');
        showSection('section-login');
        return;
    }

    if (currentUserRole === 'admin') {
        showSection('section-temple-admin'); // 特定帳號點擊導覽列直接進入寺廟管理
    } else {
        if (typeof showSection === 'function') showSection('section-form');
    }
}