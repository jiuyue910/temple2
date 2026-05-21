// --- 點燈選位核心與購物車變數 ---
let tempOrders = []; // 用於存放多筆訂單 (購物車)
let currentSelectedId = null;
let currentTemple = "";
let currentLamp = "";
let editingIndex = null; // 用於追蹤目前正在編輯清單中的哪一筆 (null 代表新增)

// 模擬已點燈資料庫 (他人佔用)
const mockOccupiedData = {
    'L-0-5': { name: '李O耘', wish: '身體健康，萬事如意。', hideWish: false },
    'R-2-3': { name: '王O明', wish: '祈求事業順利，發大財。', hideWish: true } // 測試隱藏心願
};

// 寺廟與燈種資料庫
const templeData = {
    '慈雲宮': { totalLamps: 64, desc: '本廟創立於清乾隆年間，神威顯赫。', lamps: [{ name: '光明燈', desc: '祈求前途光明。', stock: '85/100' }, { name: '太歲燈', desc: '趨吉避凶。', stock: '42/50' }] },
    '龍安寺': { totalLamps: 32, desc: '主祀觀世音菩薩，適合祈求心靈平靜。', lamps: [{ name: '文昌燈', desc: '助益學業功名。', stock: '12/30' }, { name: '藥師燈', desc: '祈求身體健康。', stock: '28/40' }] },
    '財神廟': { totalLamps: 90, desc: '全台聞名的求財聖地。', lamps: [{ name: '財神燈', desc: '招財進寶', stock: '5/60' }, { name: '發財斗燈', desc: '生意興隆。', stock: '1/10' }] }
};

/**
 * 切換顯示特定的 Section 區塊 (SPA 核心路由切換)
 */
function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo(0, 0);
}

/**
 * 開啟指定寺廟，渲染燈種清單
 */
function openTemple(name) {
    currentTemple = name;
    const data = templeData[name];
    document.getElementById('display-temple-name').innerText = name;
    document.getElementById('display-temple-desc').innerText = data.desc;
    
    const listContainer = document.getElementById('display-lamp-list');
    listContainer.innerHTML = ''; 
    
    data.lamps.forEach(lamp => {
        const card = document.createElement('div');
        card.className = 'lamp-item';
        card.onclick = () => openGridPage(name, lamp.name);
        card.innerHTML = `
            <div class="lamp-header">
                <span class="lamp-name" style="font-size:1.2rem;">${lamp.name}</span>
                <span class="lamp-stock">庫存：${lamp.stock}</span>
            </div>
            <p class="lamp-desc">${lamp.desc}</p>
        `;
        listContainer.appendChild(card);
    });
    showSection('section-detail');
}

/**
 * 進入大廳燈位選取頁面
 */
function openGridPage(templeName, lampName) {
    currentLamp = lampName;
    const total = Math.min(templeData[templeName].totalLamps || 32, 90);
    initPillars('left-pillar', 'right-pillar', 'L', 'R', Math.floor(total/2));
    showSection('section-grid');
}

/**
 * 初始化兩側燈柱
 */
function initPillars(lId, rId, lPrefix, rPrefix, count) {
    createPillar(lId, lPrefix, count, false);
    createPillar(rId, rPrefix, count, false);
    currentSelectedId = null;
    document.getElementById('grid-info-board').innerHTML = '<p style="color:#999; text-align:center; font-size:1.2rem; margin-top: 50px;">請點擊燈位查看資訊</p>';
}

/**
 * 動態繪製單個燈柱的格子
 */
function createPillar(elementId, prefix, count, isModal) {
    const el = document.getElementById(elementId);
    el.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const row = Math.floor(i / 8); 
        const col = i % 8;
        const id = `${prefix}-${row}-${col}`;
        const slot = document.createElement('div');
        slot.id = isModal ? `modal-${id}` : id;
        
        const isTempTaken = tempOrders.some(o => o.posId === id);
        
        slot.className = 'lamp-slot ' + (mockOccupiedData[id] || isTempTaken ? 'taken' : 'available');
        slot.onclick = () => isModal ? handleModalSlotClick(id) : handleSlotClick(id);
        el.appendChild(slot);
    }
}

/**
 * 處理一般頁面燈位點擊
 */
function handleSlotClick(id) {
    const board = document.getElementById('grid-info-board');
    const tempOrder = tempOrders.find(o => o.posId === id);
    const mockOrder = mockOccupiedData[id];

    if (mockOrder || tempOrder) {
        const info = mockOrder || tempOrder;
        
        // 判斷是否隱藏祈福心願
        const displayWish = info.hideWish 
            ? '<span style="color:#888; font-style:italic;">此點燈人隱藏了他的祈福內容</span>' 
            : info.wish;

        board.innerHTML = `
            <h3 style="color:var(--status-taken)">位置資訊</h3>
            <div class="info-item" style="font-size:1.4rem; margin: 20px 0;">
                <span class="info-label">姓名：</span>${info.name}
            </div>
            <div class="info-item" style="font-size:1.4rem;">
                <span class="info-label">祈福內容：</span><br>${displayWish}
            </div>`;
        clearSelection();
    } else {
        clearSelection();
        const el = document.getElementById(id);
        if(el) {
            el.classList.add('selecting');
            currentSelectedId = id;
            board.innerHTML = `<h3>您的選擇</h3><div class="info-item" style="font-size:1.4rem; margin: 20px 0;"><span class="info-label">目前位置：</span>${id}</div><p style="font-size:1.2rem;">此位置可用！您可以選擇此處。</p><button class="btn" style="width:100%; padding:20px; background:var(--primary-color); color:white; font-size:1.3rem; margin-top:30px;" onclick="goToForm()">確認位置並下一步</button>`;
        }
    }
}

/**
 * 導向表單填寫頁面
 */
function goToForm() {
    document.getElementById('current-pos-display').innerText = `目前填寫位置：${currentSelectedId}`;
    showSection('section-form');
    renderOrderPreview(); 
}

/**
 * 直接從導覽列或按鈕進入表單購物車頁面
 */
function goToCartIfFormActive() {
    if(isLoggedIn) {
        showSection('section-form');
        renderOrderPreview();
    } else {
        alert('請先登入會員');
        showSection('section-login');
    }
}

/**
 * 清除目前選取格子的選取動畫狀態
 */
function clearSelection() {
    if (currentSelectedId) {
        const el = document.getElementById(currentSelectedId);
        if (el) el.classList.remove('selecting');
    }
}

/**
 * 點擊「再點一盞」按鈕，先暫存目前內容，再跳出彈窗選位
 */
function addAnotherOrder() {
    const name = document.getElementById('form-name').value;
    if(!name) { alert("請輸入姓名後再儲存！"); return; }
    
    saveCurrentToTemp();
    renderOrderPreview(); 
    openModalGrid();
}

/**
 * 儲存/更新當前表單欄位資料至暫存陣列中
 */
function saveCurrentToTemp() {
    const orderData = {
        temple: currentTemple,
        lamp: currentLamp,
        posId: currentSelectedId,
        name: document.getElementById('form-name').value,
        phone: document.getElementById('form-phone').value,
        birth: document.getElementById('form-birth').value,
        time: document.getElementById('form-time').value,
        addr: document.getElementById('form-addr').value,
        wish: document.getElementById('form-wish').value,
        hideWish: document.getElementById('form-hide-wish').checked // 儲存隱藏勾選狀態
    };

    if (editingIndex !== null) {
        tempOrders[editingIndex] = orderData;
        editingIndex = null; 
    } else {
        tempOrders.push(orderData);
    }
    resetFormFields();
    updateCartCount();
}

/**
 * 更新購物車角標與儀表板暫存統計
 */
function updateCartCount() {
    document.getElementById('cart-count').innerText = tempOrders.length;
    
    // 同步把數據回填給儀表板上的購物車數字標籤
    const dashCartCount = document.querySelectorAll('.profile-stats strong')[1];
    if (dashCartCount) {
        dashCartCount.innerText = tempOrders.length > 0 ? tempOrders.length : "0";
    }
}

/**
 * 渲染表單旁的已選清單（購物車預覽區）
 */
function renderOrderPreview() {
    const container = document.getElementById('order-preview-list');
    if (tempOrders.length === 0) {
        container.innerHTML = '<p style="color: #ccc; text-align: center; padding: 20px;">尚未有暫存訂單</p>';
        return;
    }

    container.innerHTML = '';
    tempOrders.forEach((order, index) => {
        const card = document.createElement('div');
        card.className = `order-preview-card ${editingIndex === index ? 'is-editing' : ''}`;
        
        card.onclick = (e) => {
            if(e.target.tagName !== 'BUTTON') {
                editOrder(index);
            }
        };
        
        card.innerHTML = `
            <div class="order-info">
                <span class="order-idx">#${index + 1}</span>
                <strong>${order.name}</strong> 
                <span class="order-tag">${order.lamp}</span>
                <span class="order-pos">位置: ${order.posId}</span>
            </div>
            <button class="delete-order-btn" onclick="deleteOrder(${index})">刪除</button>
        `;
        container.appendChild(card);
    });
}

/**
 * 從清單中點擊載入，重新編輯某一筆訂單
 */
function editOrder(index) {
    const order = tempOrders[index];
    editingIndex = index;
    
    document.getElementById('form-name').value = order.name;
    document.getElementById('form-phone').value = order.phone;
    document.getElementById('form-birth').value = order.birth;
    document.getElementById('form-time').value = order.time;
    document.getElementById('form-addr').value = order.addr;
    document.getElementById('form-wish').value = order.wish;
    document.getElementById('form-hide-wish').checked = order.hideWish || false; // 還原隱藏勾選
    
    currentSelectedId = order.posId;
    document.getElementById('current-pos-display').innerText = `目前修改位置：${currentSelectedId}`;
    
    renderOrderPreview();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * 從暫存清單中移除一筆訂單
 */
function deleteOrder(index) {
    event.stopPropagation();
    if (confirm("確定要移除這筆訂單嗎？")) {
        tempOrders.splice(index, 1);
        if (editingIndex === index) {
            editingIndex = null;
            resetFormFields();
        } else if (editingIndex > index) {
            editingIndex--; 
        }
        renderOrderPreview();
        updateCartCount();
    }
}

/**
 * 重設表單所有輸入欄位與選位暫存
 */
function resetFormFields() {
    document.getElementById('form-name').value = "";
    document.getElementById('form-phone').value = "";
    document.getElementById('form-birth').value = "";
    document.getElementById('form-addr').value = "";
    document.getElementById('form-wish').value = "";
    document.getElementById('form-hide-wish').checked = false; // 重設核取方塊
    currentSelectedId = null;
    editingIndex = null;
    document.getElementById('current-pos-display').innerText = "";
}

/**
 * 開啟彈窗版的神明廳格子以供快速選下一盞燈的位置
 */
function openModalGrid() {
    const modal = document.getElementById('grid-modal');
    modal.style.display = "flex";
    const total = Math.min(templeData[currentTemple].totalLamps || 32, 90);
    const count = Math.floor(total/2);
    createPillar('modal-left-pillar', 'L', count, true);
    createPillar('modal-right-pillar', 'R', count, true);
}

/**
 * 處理彈窗內的燈位點擊
 */
function handleModalSlotClick(id) {
    const isTakenByOthers = tempOrders.some((o, idx) => o.posId === id && idx !== editingIndex);
    
    if (mockOccupiedData[id] || isTakenByOthers) {
        alert("此位置已不可選！");
        return;
    }
    currentSelectedId = id;
    document.getElementById('current-pos-display').innerText = `目前填寫位置：${currentSelectedId}`;
    closeModal();
}

/**
 * 關閉選位彈窗
 */
function closeModal() {
    document.getElementById('grid-modal').style.display = "none";
}

/**
 * 送出最終所有訂單完成點燈
 */
function submitFinalOrder() {
    const name = document.getElementById('form-name').value;
    
    if(name || currentSelectedId) {
        saveCurrentToTemp();
    }

    if(tempOrders.length === 0) {
        alert("目前清單中沒有訂單！");
        return;
    }

    let summary = `成功完成 ${tempOrders.length} 筆點燈訂單！\n\n名單如下：\n`;
    tempOrders.forEach((o, i) => {
        summary += `${i+1}. ${o.name} (${o.posId})\n`;
    });
    
    alert(summary);
    
    tempOrders = [];
    updateCartCount();
    resetFormFields();
    showSection('section-main');
}