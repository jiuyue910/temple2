/**
 * 更新首頁智慧儀表板狀態、導覽列與選選單按鈕 (動態支援特定管理員帳號切換)
 * @param {string} username - 登入的會員名稱
 * @param {string} role - 帳號權限角色 ('user' 或 'admin')
 */
function updateDashboardUI(username = "信眾", role = "user") {
    const dashUser = document.getElementById('dash-username');
    const stats = document.querySelectorAll('.profile-stats strong'); 
    const statLabels = document.querySelectorAll('.profile-stats span');
    
    // 獲取需要被動態變身的導覽列與大選單按鈕
    const navLampBtn = document.querySelector(".nav-menu button:nth-child(2)"); // 線上點燈按鈕
    const navCartBtn = document.getElementById("nav-cart-btn");                 // 暫存訂單按鈕
    const menuGrid = document.querySelector(".menu-grid");                       // 主畫面右側選單組

    if (isLoggedIn) {
        if (dashUser) dashUser.innerText = role === 'admin' ? `${username} (管理員)` : `${username} 居士`; 
        
        if (role === "admin") {
            // 💼 情況 A：特定管理員登入畫面變身
            if (stats.length > 0) {
                stats[0].innerText = "3"; 
                statLabels[0].innerText = "管理宮廟數";
                stats[1].innerText = "158"; 
                statLabels[1].innerText = "今日全宮點燈數";
            }

            // 1. 頂部導覽列按鈕重寫成管理模式
            if (navLampBtn) navLampBtn.innerText = "會員管理";
            if (navCartBtn) navCartBtn.innerHTML = "寺廟管理";

            // 2. 主畫面大按鈕變身為後端管理入口
            if (menuGrid) {
                menuGrid.innerHTML = `
                    <button class="btn" style="background: #fff0f1; border: 1px solid #ffccd0;" onclick="showSection('section-member-admin')"><span>👥</span>會員權限與名單管理</button>
                    <button class="btn" style="background: #f0f7ff; border: 1px solid #ccdf3f;" onclick="loadAndOpenTempleAdmin()"><span>⛩️</span>寺廟簡介與燈種維護</button>
                    <button class="btn" onclick="showSection('section-orders')"><span>🔍</span>查看全宮點燈名冊</button>
                `;
            }
        } else {
            // ⛩️ 情況 B：一般信眾登入
            if (stats.length > 0) {
                stats[0].innerText = "2"; 
                statLabels[0].innerText = "年度點燈";
                stats[1].innerText = typeof tempOrders !== 'undefined' ? tempOrders.length : "0"; 
                statLabels[1].innerText = "暫存訂單";
            }
            restoreUserDashboardUI(navLampBtn, navCartBtn, menuGrid);
        }
    } else {
        // ❌ 情況 C：登出或未登入狀態
        if (dashUser) dashUser.innerText = "信眾您好"; 
        if (stats.length > 0) {
            stats[0].innerText = "-"; statLabels[0].innerText = "年度點燈";
            stats[1].innerText = "-"; statLabels[1].innerText = "暫存訂單";
        }
        restoreUserDashboardUI(navLampBtn, navCartBtn, menuGrid);
    }
}

/**
 * 還原回一般信眾的靜態前台按鈕
 */
function restoreUserDashboardUI(navLampBtn, navCartBtn, menuGrid) {
    if (navLampBtn) navLampBtn.innerText = "線上點燈";
    if (navCartBtn) {
        const count = typeof tempOrders !== 'undefined' ? tempOrders.length : 0;
        navCartBtn.innerHTML = `暫存訂單 <span id="cart-count">${count}</span>`;
    }
    if (menuGrid) {
        menuGrid.innerHTML = `
            <button class="btn" onclick="checkAuthAndGo('list')"><span>⛩️</span>選寺廟點燈</button>
            <button class="btn" onclick="checkAuthAndGo('profile')"><span>📝</span>更新常用人資料</button>
            <button class="btn" onclick="checkAuthAndGo('orders')"><span>🔍</span>查詢訂單紀錄</button>
        `;
    }
}

/**
 * 載入現有前端資料庫數值，並打開寺廟管理後端
 */
function loadAndOpenTempleAdmin() {
    showSection('section-temple-admin');
    if (typeof templeData !== 'undefined' && templeData['慈雲宮']) {
        document.getElementById('admin-temple-desc').value = templeData['慈雲宮'].desc;
        document.getElementById('admin-lamp0-stock').value = templeData['慈雲宮'].lamps[0].stock;
        document.getElementById('admin-lamp1-stock').value = templeData['慈雲宮'].lamps[1].stock;
    }
}

/**
 * 儲存後端修改，即時更新前端核心變數中的數據
 */
function saveTempleBackendChanges() {
    if (typeof templeData === 'undefined' || !templeData['慈雲宮']) return;

    const updatedDesc = document.getElementById('admin-temple-desc').value;
    const updatedStock0 = document.getElementById('admin-lamp0-stock').value;
    const updatedStock1 = document.getElementById('admin-lamp1-stock').value;

    // 變更記憶體核心全域變數，達成即時同步效果
    templeData['慈雲宮'].desc = updatedDesc;
    templeData['慈雲宮'].lamps[0].stock = updatedStock0;
    templeData['慈雲宮'].lamps[1].stock = updatedStock1;

    alert("💾 宮廟設定儲存成功！前端信眾選用畫面已同步即時發布。");
    showSection('section-main');
}