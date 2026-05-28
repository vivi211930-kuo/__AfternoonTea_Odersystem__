import React, { useState, useEffect, useMemo } from 'react';
import { MenuItem, Order } from './types';
import { Icons } from './components/Icons';
import OrderForm from './components/OrderForm';
import OrderList from './components/OrderList';

// Google Apps Script Web App API 網址
const API_URL = "https://script.google.com/macros/s/AKfycbzbW1TTicDjAmlriHBNDWw1YqljaM3CP7iMLO-hx-JJYAhw9hcOBv91SZ8Q_FXsvxuDOg/exec";

// 備份菜單：當後端連線中或失敗時，提供完美的初始使用者體驗
const FALLBACK_MENU: MenuItem[] = [
  { name: "黑糖波霸鮮奶茶", price: 65, category: "人氣鮮奶", description: "慢火熬煮手炒黑糖蜜波霸，加入初鹿鮮乳，醇厚誘人" },
  { name: "茉香翡翠蜂綠茶", price: 45, category: "現萃原茶", description: "新鮮茉莉花與鮮翠綠茶共舞，尾韻帶有淡淡高雅龍眼蜜香" },
  { name: "極上大吉嶺紅茶", price: 40, category: "現萃原茶", description: "精選莊園級大吉嶺茶葉，富含成熟果香與熟成麝香葡萄香氣" },
  { name: "四季金萱青茶", price: 40, category: "現萃原茶", description: "自帶天然馥郁奶香，金黃茶湯入喉甘滑溫潤不苦澀" },
  { name: "手作大甲芋泥綠", price: 65, category: "濃純大甲芋", description: "手搗新鮮大甲檳榔心芋，顆粒細緻、芋泥香濃" },
  { name: "芋頭波霸厚奶", price: 70, category: "濃純大甲芋", description: "綿香芋泥、珍Q波霸與厚香奶茶完美的華麗三重絕配" },
  { name: "紅柚滿滿氣泡綠", price: 60, category: "鮮果特調", description: "飽滿多汁手剝紅柚果肉，搭配翡翠綠茶與微微碳酸沁涼" },
  { name: "爆漿青檸百香綠", price: 55, category: "鮮果特調", description: "整粒新鮮百香果融入清香綠，再壓入整顆屏東特產翠綠青檸" },
  { name: "芝芝黑糖可可", price: 75, category: "濃厚厚芝士", description: "香濃法式深黑可可，蓋上厚厚一層純鮮奶打製鹹甜起司奶蓋" },
  { name: "古早冬瓜檸檬青", price: 45, category: "經典古早味", description: "手工慢火冬瓜糖熬煮，混搭黃金青茶與翠綠新鮮檸檬角" }
];

export default function App() {
  const [menu, setMenu] = useState<MenuItem[]>(FALLBACK_MENU);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentEditOrder, setCurrentEditOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showIntro, setShowIntro] = useState(true);

  // 載入資料 (GET)
  const fetchDatabase = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch(API_URL);
      if (!res.ok) {
        throw new Error(`雲端試算表響應錯誤狀態：${res.status}`);
      }
      const data = await res.json();
      
      // 後端回傳 menu 與 orders
      if (data.menu && data.menu.length > 0) {
        setMenu(data.menu);
      } else {
        console.log("GAS 菜單為空，使用精美備份菜單");
        setMenu(FALLBACK_MENU);
      }

      if (data.orders) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("載入失敗：", err);
      setErrorMessage("雲端載入失敗！系統已替您自動載入「本日精選備選菜單」。");
      // 失敗時保持 fallback menu，至少可讓前端維持可用狀態
      setMenu(FALLBACK_MENU);
    } finally {
      setIsLoading(false);
    }
  };

  // 載入時觸發一次
  useEffect(() => {
    fetchDatabase();
  }, []);

  // 快速一鍵將選單大卡片的飲料注入表單
  const handleSelectFromMenu = (drink: MenuItem) => {
    const formTarget = document.getElementById("order-form-container");
    if (formTarget) {
      formTarget.scrollIntoView({ behavior: 'smooth' });
    }
    
    setCurrentEditOrder({
      name: localStorage.getItem("drink_username") || "",
      drink: drink.name,
      sugar: "半糖",
      ice: "少冰",
      quantity: 1,
      totalPrice: drink.price
    });
  };

  // 提交訂單 (新增或修改) - POST
  const handleFormSubmit = async (formData: any) => {
    setIsSubmitting(true);
    setErrorMessage("");
    
    const isUpdate = !!formData.orderId;
    const payload = {
      action: isUpdate ? "update" : "create",
      data: formData
    };

    try {
      // 為避免 CORS options 預檢擋住，與 GAS 通訊時使用 plain POST payload 策略 
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      // 部分 CORS 機制會跟隨 302 跳轉但由於跨網域造成不允許讀取 body
      // 我們在此做雙重容錯：如果 status 成功，或是 type 是 opaque
      if (!response.ok && response.status !== 0) {
        throw new Error(`雲端工作表回應拒絕: ${response.status}`);
      }

      // 清除修改模式
      setCurrentEditOrder(null);
      
      // 即時從雲端重新拉取最新列表，保證完全一致性
      await fetchDatabase();
      
      // 滾動回到清單
      const listTarget = document.getElementById("orders-hub");
      if (listTarget) {
        listTarget.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      console.error("提交失敗：", err);
      setErrorMessage("訂單傳送時發生未知網路中斷。請重新再試一次！");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 處理刪除 - POST
  const handleDelete = async (orderId: string | undefined) => {
    if (!orderId) return;
    if (!window.confirm("你確定要刪除這筆飲料訂單嗎？😢")) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    const payload = {
      action: "delete",
      data: { orderId }
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      if (!response.ok && response.status !== 0) {
        throw new Error("GAS 刪除失敗");
      }

      // 重新整理
      await fetchDatabase();
    } catch (err) {
      console.error("刪除失敗：", err);
      setErrorMessage("刪除失敗！可能由於跨網域載入延遲，建議點擊「實時更新」重試！");
    } finally {
      setIsLoading(false);
    }
  };

  // 依類別將菜單分組分頁顯示
  const categorizedMenu = useMemo(() => {
    const groups: Record<string, MenuItem[]> = {};
    menu.forEach(item => {
      const cat = item.category || "精選調飲";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [menu]);

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 md:py-10 space-y-6 flex-grow flex flex-col">
      
      {/* Header 智慧標題列 */}
      <header className="bg-white/40 backdrop-blur-md border border-white/30 rounded-3xl p-6 md:px-8 md:py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden transition-all shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
        {/* Background absolute coffee pattern decors */}
        <div className="absolute right-0 bottom-[-50px] opacity-5 pointer-events-none select-none">
          <svg className="w-72 h-72 fill-current text-blue-500" viewBox="0 0 24 24">
            <path d="M2 21h18v-2H2v2zM20 8h-2V5h2v3zm2-3c0-1.1-.9-2-2-2h-4v7h4c1.1 0 2-.9 2-2V5zm-4 7H4v5h14v-5z" />
          </svg>
        </div>

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">🧋</span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight font-sans bg-gradient-to-r from-blue-700 to-emerald-600 bg-clip-text text-transparent">
              辦公室下午茶：飲料集單系統
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            🥤 今日揪團特調試算表！今日日期已自動定位，資料由 Google Apps Script 後端即時同步。
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 flex-wrap sm:flex-nowrap">
          {/* 更新按鈕 */}
          <button
            onClick={fetchDatabase}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 active:scale-95 text-xs font-bold font-semibold transition-all cursor-pointer disabled:opacity-50 shadow-sm"
          >
            <Icons.Refresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? "同步中..." : "重新整理數據"}</span>
          </button>
          
          {/* 手動提示今日日期 */}
          <div className="px-4 py-2 bg-blue-50/40 backdrop-blur border border-blue-100 rounded-xl text-center">
            <span className="block text-[9px] text-blue-500 font-bold uppercase tracking-wider font-mono">Today Session</span>
            <span className="text-xs font-mono font-bold text-blue-700 tracking-wide">
              {new Date().toISOString().split('T')[0]}
            </span>
          </div>
        </div>
      </header>

      {/* 錯誤/通知橫幅 */}
      {errorMessage && (
        <div className="bg-amber-50 border-l-4 border-amber-500 text-slate-700 p-4 rounded-xl shadow-custom-sm flex items-start gap-3 transition-all duration-300">
          <Icons.Warning />
          <div className="flex-grow">
            <p className="font-bold text-sm text-amber-800">系統小警示</p>
            <p className="text-xs text-amber-950 mt-0.5">{errorMessage}</p>
          </div>
          <button 
            onClick={() => setErrorMessage("")}
            className="text-amber-500 hover:text-amber-800 text-xs font-bold px-1 cursor-pointer border-0 bg-transparent"
          >
            我知道了
          </button>
        </div>
      )}

      {/* 介紹說明卡 & 快捷選單推薦 */}
      {showIntro && (
        <div className="bg-white/40 backdrop-blur-md border border-white/30 rounded-3xl p-5 md:p-6 shadow-custom-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">💡</span>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">💡 揪團小撇步：點擊下方菜單，自動幫你填寫訂票！</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  不需手動慢慢輸入飲料名稱，直接在下方<b>「今日飲料菜單」</b>點擊您中意的項目，系統便會快速帶入左側的訂票區域。訂購人、甜度、冰塊設定好後呼叫試算表就完成囉！
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowIntro(false)}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline self-end sm:self-center cursor-pointer border-0 bg-transparent"
            >
              隱藏這項提示 ×
            </button>
          </div>
        </div>
      )}

      {/* 主版面佈局：左表單，右清單 (2 Column Grid) */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-grow">
        
        {/* 左側：OrderForm 填單區 (佔 5格) */}
        <div className="lg:col-span-5 space-y-6">
          <OrderForm
            menu={menu}
            onSubmit={handleFormSubmit}
            editOrder={currentEditOrder}
            onCancelEdit={() => setCurrentEditOrder(null)}
            isSubmitting={isSubmitting}
          />

          {/* 即時載入小動畫 */}
          {isLoading && (
            <div className="flex items-center justify-center p-4 bg-white/50 backdrop-blur rounded-xl border border-slate-950/10 gap-2.5">
              <Icons.Refresh className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="text-xs font-bold text-slate-600">正在取得今日最新訂單資訊...</span>
            </div>
          )}
        </div>

        {/* 右側：分類菜單點選 & 今日訂單回饋 (佔 7格) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 可點選之精美即時菜單 */}
          <div className="bg-white/50 backdrop-blur-md border border-white/40 rounded-[28px] shadow-[0_10px_40px_rgba(0,0,0,0.04)] p-6 md:p-8">
            <div className="flex items-center gap-2.5 mb-4">
              <i className="inline-block w-2.5 h-6 bg-blue-600 rounded-[4px] mr-1"></i>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-1">
                📖 今日手選飲料菜單 <span className="text-xs font-normal text-slate-400 font-sans">(點擊直接填單)</span>
              </h3>
            </div>
            
            {/* 滾動類別 */}
            <div className="space-y-4 max-h-[290px] overflow-y-auto pr-1">
              {(Object.entries(categorizedMenu) as [string, MenuItem[]][]).map(([category, items]) => (
                <div key={category} className="space-y-2">
                  <span className="inline-block text-[11px] font-black tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md font-sans">
                    {category}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {items.map(drink => (
                      <div
                        key={drink.name}
                        onClick={() => handleSelectFromMenu(drink)}
                        className="p-2.5 bg-white/70 hover:bg-white border border-slate-950/5 hover:border-blue-300 rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-between text-left group"
                      >
                        <div className="truncate max-w-[70%]">
                          <span className="block text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                            {drink.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate leading-tight mt-0.5">
                            {drink.description || "經典推薦招牌"}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-blue-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-sm font-mono">
                          ${drink.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 今日訂單詳細清單 */}
          <div id="orders-hub">
            <OrderList
              orders={orders}
              menu={menu}
              onEdit={(ord) => {
                setCurrentEditOrder(ord);
                const formTarget = document.getElementById("order-form-container");
                if (formTarget) {
                  formTarget.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              onDelete={handleDelete}
              onRefresh={fetchDatabase}
              isLoading={isLoading}
            />
          </div>

        </div>

      </main>

    </div>
  );
}
