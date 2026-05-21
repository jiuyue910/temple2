// 模擬常用人資料庫（一開始預設三筆）
let frequentUsers = [
    { id: 1, name: "王大明", phone: "0988-123-456", birth: "1990-01-01", addr: "台中市西屯區文華路100號", wish: "祈求全家平安健康。" },
    { id: 2, name: "李小美", phone: "0912-345-678", birth: "1995-05-12", addr: "台北市大安區信義路二段", wish: "保佑今年考試順利金榜題名。" },
    { id: 3, name: "張老伯", phone: "0922-777-888", birth: "1953-10-20", addr: "高雄市苓雅區成功路", wish: "身體健康，腳痛快點好。" }
];

let currentFreqId = null; // 紀錄目前正在右側編輯的常用人 ID

// 覆蓋主畫面點擊「更新常用人資料」的跳轉邏輯
// 原本 checkAuthAndGo('profile') 的跳轉目標對應到這裡
function initFrequentModule() {
    renderFrequentList();
    closeFrequentForm();
}

// 修改原有的 checkAuthAndGo 機制以支援初始化
const originalCheckAuthAndGo = checkAuthAndGo;
checkAuthAndGo = function(target) {
    if (target === 'profile' && isLoggedIn) {
        showSection('section-profile');
        initFrequentModule();
    } else {
        originalCheckAuthAndGo(target);
    }
};

/**
 * 渲染左側常用人清單
 */
function renderFrequentList() {
    const listContainer = document.getElementById('frequent-list');
    listContainer.innerHTML = '';

    frequentUsers.forEach((user, index) => {
        const item = document.createElement('div');
        item.className = `frequent-item-card ${currentFreqId === user.id ? 'is-active' : ''}`;
        item.innerText = `${index + 1}. ${user.name}`;
        item.onclick = () => selectFrequentUser(user.id);
        listContainer.appendChild(item);
    });
}

/**
 * 點擊左側項目，將資料帶入右側表單
 */
function selectFrequentUser(id) {
    currentFreqId = id;
    const user = frequentUsers.find(u => u.id === id);
    if (!user) return;

    document.getElementById('frequent-form-title').innerText = `修改「${user.name}」的資料`;
    document.getElementById('frequent-form-body').style.display = 'block';
    document.getElementById('frequent-empty-msg').style.display = 'none';

    // 填入表單資料
    document.getElementById('freq-id').value = user.id;
    document.getElementById('freq-name').value = user.name;
    document.getElementById('freq-phone').value = user.phone;
    document.getElementById('freq-birth').value = user.birth;
    document.getElementById('freq-addr').value = user.addr;
    document.getElementById('freq-wish').value = user.wish;

    renderFrequentList(); // 重新渲染清單以套用選取中的樣式 (.is-active)
}

/**
 * 點擊左下角「新增常用人」，清空右側表單準備收新資料
 */
function prepareNewFrequent() {
    currentFreqId = 'NEW';
    
    document.getElementById('frequent-form-title').innerText = "🆕 新增常用點燈人";
    document.getElementById('frequent-form-body').style.display = 'block';
    document.getElementById('frequent-empty-msg').style.display = 'none';

    // 清空所有欄位
    document.getElementById('freq-id').value = '';
    document.getElementById('freq-name').value = '';
    document.getElementById('freq-phone').value = '';
    document.getElementById('freq-birth').value = '';
    document.getElementById('freq-addr').value = '';
    document.getElementById('freq-wish').value = '';

    renderFrequentList();
}

/**
 * 點擊右下角「儲存」，判斷是更新舊資料還是 Push 新資料
 */
function saveFrequentData() {
    const name = document.getElementById('freq-name').value;
    const phone = document.getElementById('freq-phone').value;
    const birth = document.getElementById('freq-birth').value;
    const addr = document.getElementById('freq-addr').value;
    const wish = document.getElementById('freq-wish').value;

    if (!name) {
        alert("姓名為必填欄位！");
        return;
    }

    if (currentFreqId === 'NEW') {
        // 執行新增
        const newId = frequentUsers.length > 0 ? Math.max(...frequentUsers.map(u => u.id)) + 1 : 1;
        frequentUsers.push({ id: newId, name, phone, birth, addr, wish });
        alert("成功新增常用人！");
        currentFreqId = newId; // 儲存後自動切換至該筆資料
    } else {
        // 執行修改
        const userIndex = frequentUsers.findIndex(u => u.id === currentFreqId);
        if (userIndex !== -1) {
            frequentUsers[userIndex] = { id: currentFreqId, name, phone, birth, addr, wish };
            alert("資料修改並儲存成功！");
        }
    }

    renderFrequentList();
    selectFrequentUser(currentFreqId); // 保持選取更新後的狀態
}

/**
 * 重設右側介面回到初始提示狀態
 */
function closeFrequentForm() {
    currentFreqId = null;
    document.getElementById('frequent-form-title').innerText = "請選擇或新增常用人";
    document.getElementById('frequent-form-body').style.display = 'none';
    document.getElementById('frequent-empty-msg').style.display = 'block';
}

// 同步重寫 altar.js 的快捷匯入功能，讓點燈表單那邊的「匯入常用人」直接抓取第一筆
function importFrequent() {
    if (frequentUsers.length > 0) {
        const defaultUser = frequentUsers[0];
        document.getElementById('form-name').value = defaultUser.name;
        document.getElementById('form-phone').value = defaultUser.phone;
        document.getElementById('form-birth').value = defaultUser.birth;
        document.getElementById('form-addr').value = defaultUser.addr;
        document.getElementById('form-wish').value = defaultUser.wish;
        
        // 快捷匯入時，預設不隱藏心願
        document.getElementById('form-hide-wish').checked = false;
        
        alert(`已成功從常用人後台匯入「${defaultUser.name}」的資料。`);
    } else {
        alert("目前常用人名單內沒有資料，請先至後台新增。");
    }
}