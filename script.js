let isLoggedIn = false;
let currentSelectedId = null;
let tempOrders = []; // 用於存放多筆訂單
let currentTemple = "";
let currentLamp = "";
let editingIndex = null; // 用於追蹤目前正在編輯清單中的哪一筆 (null 代表新增)

// 模擬已點燈資料庫
const mockOccupiedData = {
    'L-0-5': { name: '李O耘', wish: '身體健康，萬事如意。' },
    'R-2-3': { name: '王O明', wish: '祈求事業順利，發大財。' }
};

const templeData = {
    '慈雲宮': { totalLamps: 64, desc: '本廟創立於清乾隆年間，神威顯赫。', lamps: [{ name: '光明燈', desc: '祈求前途光明。', stock: '85/100' }, { name: '太歲燈', desc: '趨吉避凶。', stock: '42/50' }] },
    '龍安寺': { totalLamps: 32, desc: '主祀觀世音菩薩，適合祈求心靈平靜。', lamps: [{ name: '文昌燈', desc: '助益學業功名。', stock: '12/30' }, { name: '藥師燈', desc: '祈求身體健康。', stock: '28/40' }] },
    '財神廟': { totalLamps: 90, desc: '全台聞名的求財聖地。', lamps: [{ name: '財神燈', desc: '招財進寶。', stock: '5/60' }, { name: '發財斗燈', desc: '生意興隆。', stock: '1/10' }] }
};

function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo(0,0);
}

function checkAuthAndGo(target) {
    if (!isLoggedIn) { 
        alert('請先登入系統！'); 
        showSection('section-login'); 
    } else { 
        if (target === 'list') showSection('section-list'); 
        else alert('進入 ' + target + ' 功能'); 
    }
}

function handleLoginClick() { 
    if (isLoggedIn) { 
        isLoggedIn = false; 
        updateUI(); 
        alert('已登出'); 
    } else { 
        showSection('section-login'); 
    } 
}

function doLogin() {
    const userVal = document.getElementById('username').value;
    if (userVal && document.getElementById('password').value) {
        isLoggedIn = true; 
        updateUI(userVal); 
        showSection('section-main'); 
        alert('登入成功！');
    } else { 
        alert('請輸入帳號密碼'); 
    }
}

function updateUI(username = "信眾") {
    const btn = document.getElementById('login-toggle-btn');
    const navBtn = document.getElementById('nav-login-toggle');
    const status = document.getElementById('auth-status');
    const dashUser = document.getElementById('dash-username');
    
    const text = isLoggedIn ? 'Log out' : 'Login / 註冊';
    btn.innerText = text;
    navBtn.innerText = text;
    
    btn.classList.toggle('logged-in', isLoggedIn);
    navBtn.classList.toggle('logged-in', isLoggedIn);
    status.innerText = isLoggedIn ? '狀態：已登入會員' : '狀態：尚未登入';
    
    // 同步升級：更新首頁儀表板狀態
    if (isLoggedIn) {
        dashUser.innerText = `${username} 居士`;
        document.querySelectorAll('.profile-stats Strong')[0].innerText = "2"; // 模擬年度點了2盞燈
    } else {
        dashUser.innerText = "信眾您好";
        document.querySelectorAll('.profile-stats Strong')[0].innerText = "-";
    }
}

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
        card.innerHTML = `<div class="lamp-header"><span class="lamp-name" style="font-size:1.2rem;">${lamp.name}</span><span class="lamp-stock">庫存：${lamp.stock}</span></div><p class="lamp-desc">${lamp.desc}</p>`;
        listContainer.appendChild(card);
    });
    showSection('section-detail');
}

function openGridPage(templeName, lampName) {
    currentLamp = lampName;
    const total = Math.min(templeData[templeName].totalLamps || 32, 90);
    initPillars('left-pillar', 'right-pillar', 'L', 'R', Math.floor(total/2));
    showSection('section-grid');
}

function initPillars(lId, rId, lPrefix, rPrefix, count) {
    createPillar(lId, lPrefix, count, false);
    createPillar(rId, rPrefix, count, false);
    currentSelectedId = null;
    document.getElementById('grid-info-board').innerHTML = '<p style="color:#999; text-align:center; font-size:1.2rem; margin-top: 50px;">請點擊燈位查看資訊</p>';
}

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

function handleSlotClick(id) {
    const board = document.getElementById('grid-info-board');
    if (mockOccupiedData[id] || tempOrders.some(o => o.posId === id)) {
        const info = mockOccupiedData[id] || { name: '您已選的位置', wish: '-' };
        board.innerHTML = `<h3 style="color:var(--status-taken)">位置資訊</h3><div class="info-item" style="font-size:1.4rem; margin: 20px 0;"><span class="info-label">姓名：</span>${info.name}</div><div class="info-item" style="font-size:1.4rem;"><span class="info-label">祈福內容：</span><br>${info.wish}</div>`;
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

function goToForm() {
    document.getElementById('current-pos-display').innerText = `目前填寫位置：${currentSelectedId}`;
    showSection('section-form');
    renderOrderPreview(); 
}

function goToCartIfFormActive() {
    if(isLoggedIn) {
        showSection('section-form');
        renderOrderPreview();
    } else {
        alert('請先登入會員');
        showSection('section-login');
    }
}

function clearSelection() {
    if (currentSelectedId) {
        const el = document.getElementById(currentSelectedId);
        if (el) el.classList.remove('selecting');
    }
}

function addAnotherOrder() {
    const name = document.getElementById('form-name').value;
    if(!name) { alert("請輸入姓名後再儲存！"); return; }
    
    saveCurrentToTemp();
    renderOrderPreview(); 
    openModalGrid();
}

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
        wish: document.getElementById('form-wish').value
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

function updateCartCount() {
    document.getElementById('cart-count').innerText = tempOrders.length;
    
    // 首頁儀表板內的暫存數據同步更新
    const dashCartCount = document.querySelectorAll('.profile-stats strong')[1];
    if (dashCartCount) {
        dashCartCount.innerText = tempOrders.length > 0 ? tempOrders.length : "0";
    }
}

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

function editOrder(index) {
    const order = tempOrders[index];
    editingIndex = index;
    
    document.getElementById('form-name').value = order.name;
    document.getElementById('form-phone').value = order.phone;
    document.getElementById('form-birth').value = order.birth;
    document.getElementById('form-time').value = order.time;
    document.getElementById('form-addr').value = order.addr;
    document.getElementById('form-wish').value = order.wish;
    currentSelectedId = order.posId;
    document.getElementById('current-pos-display').innerText = `目前修改位置：${currentSelectedId}`;
    
    renderOrderPreview();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

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

function resetFormFields() {
    document.getElementById('form-name').value = "";
    document.getElementById('form-phone').value = "";
    document.getElementById('form-birth').value = "";
    document.getElementById('form-addr').value = "";
    document.getElementById('form-wish').value = "";
    currentSelectedId = null;
    editingIndex = null;
    document.getElementById('current-pos-display').innerText = "";
}

function openModalGrid() {
    const modal = document.getElementById('grid-modal');
    modal.style.display = "flex";
    const total = Math.min(templeData[currentTemple].totalLamps || 32, 90);
    const count = Math.floor(total/2);
    createPillar('modal-left-pillar', 'L', count, true);
    createPillar('modal-right-pillar', 'R', count, true);
}

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

function closeModal() {
    document.getElementById('grid-modal').style.display = "none";
}

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

function importFrequent() {
    document.getElementById('form-name').value = "王大明";
    document.getElementById('form-phone').value = "0988-123-456";
    document.getElementById('form-birth').value = "1990-01-01";
    document.getElementById('form-addr').value = "台中市西屯區文華路100號";
    document.getElementById('form-wish').value = "祈求全家平安健康。";
    alert("已從資料庫匯入常用人資料。");
}