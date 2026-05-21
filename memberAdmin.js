// 模擬的後台大水庫會員資料
let allBackendMembers = [
    { username: "fcu_runner", name: "逢甲跑者", phone: "0988-111-222", role: "user", count: 2, isBlacklist: false },
    { username: "taichung_居士", name: "台中陳居士", phone: "0912-345-678", role: "user", count: 5, isBlacklist: false },
    { username: "temple_admin", name: "宮廟最高主事人员", phone: "宮廟內線-101", role: "admin", count: 0, isBlacklist: false },
    { username: "trouble_maker", name: "惡意佔位者", phone: "0933-777-777", role: "blacklist", count: 0, isBlacklist: true }
];

// 修改 auth.js 的特定路由跳轉，點擊「會員管理」時一併初始化表格
const originalCheckAuthAndGoFromAdmin = checkAuthAndGo;
checkAuthAndGo = function(target) {
    if (target === 'list' && currentUserRole === 'admin') {
        showSection('section-member-admin');
        renderAdminMemberTable('all'); // 預設載入全部資料
    } else {
        originalCheckAuthAndGoFromAdmin(target);
    }
};

/**
 * 控制上方的分頁籤切換
 */
function switchAdminTab(buttonElement, filterType) {
    // 1. 移除所有按鈕的 active 狀態
    document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
    // 2. 為當前點擊的按鈕加上 active
    buttonElement.classList.add('active');
    
    // 3. 重新過濾並渲染表格內容
    renderAdminMemberTable(filterType);
}

/**
 * 依據選定的分頁籤渲染對應的表格數據
 * @param {string} filter - 過濾條件 ('all', 'user', 'admin', 'blacklist', 'stats')
 */
function renderAdminMemberTable(filter) {
    const tbody = document.getElementById('admin-member-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    // 特別處理統計報表分頁
    if (filter === 'stats') {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #666; background: #fafafa;">
                    <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 10px;">📊 宮廟年度點燈統計數據</div>
                    一般信眾總數：${allBackendMembers.filter(m=>m.role==='user').length} 人 | 
                    已點燈總盞數：${allBackendMembers.reduce((sum, m) => sum + m.count, 0)} 盞
                </td>
            </tr>
        `;
        return;
    }

    // 依據條件過濾資料庫
    let filteredList = allBackendMembers.filter(member => {
        if (filter === 'all') return true;
        if (filter === 'user') return member.role === 'user' && !member.isBlacklist;
        if (filter === 'admin') return member.role === 'admin';
        if (filter === 'blacklist') return member.isBlacklist;
        return true;
    });

    if (filteredList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #999; padding: 30px;">此分頁查無任何名單資料</td></tr>`;
        return;
    }

    // 動態繪製表格列 (TR)
    filteredList.forEach(member => {
        const tr = document.createElement('tr');
        
        // 權限標籤樣式調整
        let roleBadge = `<span style="color: green; font-weight: bold;">一般信眾</span>`;
        if (member.role === 'admin') roleBadge = `<strong style="color: red;">宮廟管理員</strong>`;
        if (member.isBlacklist) roleBadge = `<span style="color: #666; background: #eee; padding: 2px 6px; border-radius: 4px;">黑名單封鎖</span>`;

        // 操作按鈕定義
        let opButtons = `<button class="admin-op-btn" onclick="adminResetPassword('${member.username}')">重設密碼</button>`;
        if (member.role === 'user') {
            opButtons += ` <button class="admin-op-btn" style="color: #e63946; border-color: #ffccd0;" onclick="adminToggleBlacklist('${member.username}')">${member.isBlacklist ? '解除封鎖' : '封鎖帳號'}</button>`;
        } else if (member.role === 'admin') {
            opButtons = `<span style="color:#aaa;">最高權限保護</span>`;
        }

        tr.innerHTML = `
            <td style="font-weight: bold; color: #4a90e2;">${member.username}</td>
            <td><strong>${member.name}</strong></td>
            <td>${member.phone}</td>
            <td>${roleBadge}</td>
            <td style="text-align: center; font-weight: bold; color: ${member.count > 0 ? 'var(--primary-color)' : '#999'};">${member.count > 0 ? member.count + ' 盞' : '-'}</td>
            <td>${opButtons}</td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * 後台管理員操作：模擬重設密碼
 */
function adminResetPassword(username) {
    alert(`🔐 已成功將帳號 「${username}」 的登入密碼重設為預設值： fcu123456`);
}

/**
 * 後台管理員操作：切換黑名單封鎖狀態
 */
function adminToggleBlacklist(username) {
    const member = allBackendMembers.find(m => m.username === username);
    if (!member) return;
    
    member.isBlacklist = !member.isBlacklist;
    alert(`系統提示：已成功對帳號 「${username}」 執行 ${member.isBlacklist ? '封鎖黑名單' : '解除黑名單'} 處置。`);
    
    // 找出目前點亮的分頁按鈕，重新渲染當前畫面
    const currentActiveTab = document.querySelector('.admin-tab-btn.active');
    if (currentActiveTab) currentActiveTab.click();
}
