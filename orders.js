// 修正後的模擬歷史訂單資料庫：廟宇與燈種抽到訂單主層
const mockOrderHistory = [
    {
        orderId: "ORD-2026052001",
        date: "2026-05-20",
        temple: "慈雲宮",         // 廟宇固定在訂單主層
        lamp: "光明燈",           // 燈種固定在訂單主層
        items: [
            { name: "王大明", posId: "L-0-5", wish: "祈求全家平安健康。", hideWish: false },
            { name: "王小美", posId: "L-0-6", wish: "祈求學業進步，金榜題名。", hideWish: true } // 修正為同廟同燈的鄰近位置
        ]
    },
    {
        orderId: "ORD-2026041508",
        date: "2026-04-15",
        temple: "財神廟",         // 另一筆獨立的訂單
        lamp: "財神燈",
        items: [
            { name: "張老伯", posId: "R-2-3", wish: "保佑生意興隆，財源廣進。", hideWish: false }
        ]
    }
];

// 接軌 auth.js 頁面權限機制
const baseCheckAuthAndGo = checkAuthAndGo;
checkAuthAndGo = function(target) {
    if (target === 'orders' && isLoggedIn) {
        showSection('section-orders');
        renderOrderHistory();
    } else {
        baseCheckAuthAndGo(target);
    }
};

/**
 * 動態渲染歷史訂單清單 (修正版：將廟宇與燈種提到外層摘要)
 */
function renderOrderHistory() {
    const container = document.getElementById('orders-history-list');
    if (!container) return;
    container.innerHTML = '';

    mockOrderHistory.forEach(order => {
        const card = document.createElement('div');
        card.style.cssText = "background: white; border: 1px solid #eee; border-radius: 15px; margin-bottom: 20px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.02);";
        
        // 建立概要外殼：把廟宇、燈種標籤移到最上方
        card.innerHTML = `
            <div class="order-header-summary" onclick="toggleOrderDetail(this)" style="padding: 20px 25px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: #fafafa;">
                <div style="text-align: left;">
                    <div style="margin-bottom: 5px;">
                        <span style="font-weight: bold; color: #333; font-size: 1.1rem; margin-right: 10px;">${order.temple}</span>
                        <span style="background: var(--primary-color); color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: bold; margin-right: 15px;">${order.lamp}</span>
                        <span style="background: #e6f7ed; color: #28a745; padding: 3px 10px; border-radius: 20px; font-size: 0.85rem; font-weight: bold;">● 登入疏文成功</span>
                    </div>
                    <div>
                        <span style="color: #666; font-size: 0.95rem; margin-right: 15px;">單號：#${order.orderId}</span>
                        <span style="color: #999; font-size: 0.95rem;">點燈日期：${order.date}</span>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-weight: bold; color: #555;">共 ${order.items.length} 盞</span>
                    <span class="arrow-icon" style="transition: 0.3s; color: #aaa; font-size: 0.8rem;">▼</span>
                </div>
            </div>
            <div class="order-details-content" style="padding: 20px; border-top: 1px solid #f1f3f5; display: none;">
                <div style="display: flex; flex-direction: column; gap: 15px;" class="details-rows-container"></div>
            </div>
        `;

        // 填充展開後的燈位詳細內容（內層移除重複的廟宇和燈種標籤）
        const rowsContainer = card.querySelector('.details-rows-container');
        order.items.forEach(item => {
            const row = document.createElement('div');
            row.style.cssText = "display: flex; justify-content: space-between; align-items: center; background: #fffdf9; border: 1px solid #ffe4b5; padding: 15px 20px; border-radius: 10px;";
            
            const wishText = item.hideWish 
                ? '<span style="color:#999; font-style:italic;">🔒 祈福內容已啟用隱私保護（僅廟方主事可見）</span>' 
                : `心願：${item.wish}`;

            row.innerHTML = `
                <div style="text-align: left;">
                    <strong style="color: var(--primary-color); font-size: 1.1rem;">${item.name}</strong>
                    <div style="margin-top: 5px; color: #666; font-size: 0.95rem;">
                        <span>位置：<strong style="color: #333;">${item.posId}</strong></span> <span style="color: #ccc; margin: 0 10px;">|</span> <span>${wishText}</span>
                    </div>
                </div>
                <button class="nav-link-btn" style="background: #fff; border: 1px solid #ddd; padding: 8px 15px; font-size: 0.9rem; cursor: pointer; border-radius: 6px;" onclick="viewLampLocation('${order.temple}', '${item.posId}')">🔍 查看燈位</button>
            `;
            rowsContainer.appendChild(row);
        });

        container.appendChild(card);
    });
}

/**
 * 手風琴折疊收合邏輯
 */
function toggleOrderDetail(headerElement) {
    const content = headerElement.nextElementSibling;
    const arrow = headerElement.querySelector('.arrow-icon');
    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        arrow.style.transform = 'rotate(180deg)';
    } else {
        content.style.display = 'none';
        arrow.style.transform = 'rotate(0deg)';
    }
}

/**
 * 從歷史紀錄直接打開 Altar 燈位彈窗並高亮定位
 */
function viewLampLocation(templeName, posId) {
    currentTemple = templeName;
    openModalGrid();
    
    setTimeout(() => {
        const targetSlot = document.getElementById(`modal-${posId}`);
        if (targetSlot) {
            targetSlot.classList.remove('taken', 'available');
            targetSlot.classList.add('selecting');
        }
    }, 200);
}