import React, { useState, useMemo } from 'react';
import { MenuItem, Order } from '../types';
import { Icons } from './Icons';

interface OrderListProps {
  orders: Order[];
  menu: MenuItem[];
  onEdit: (order: Order) => void;
  onDelete: (orderId: string | undefined) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function OrderList({ orders, menu, onEdit, onDelete, onRefresh, isLoading }: OrderListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  // 計算今日訂單全局統計
  const stats = useMemo(() => {
    let totalCups = 0;
    let totalPrice = 0;
    const drinkBreakdown: Record<string, number> = {};

    orders.forEach(ord => {
      totalCups += ord.quantity;
      totalPrice += ord.totalPrice;
      drinkBreakdown[ord.drink] = (drinkBreakdown[ord.drink] || 0) + ord.quantity;
    });

    return { totalCups, totalPrice, drinkBreakdown };
  }, [orders]);

  // 搜尋關鍵字過濾
  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders;
    const q = searchTerm.toLowerCase();
    return orders.filter(ord => 
      ord.name.toLowerCase().includes(q) || 
      ord.drink.toLowerCase().includes(q) ||
      (ord.sugar && ord.sugar.toLowerCase().includes(q)) ||
      (ord.ice && ord.ice.toLowerCase().includes(q))
    );
  }, [orders, searchTerm]);

  return (
    <div className="space-y-6">
      {/* 本日亮點統計板 (Bento Style Stats) */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white/50 backdrop-blur-md border border-white/40 rounded-2xl p-4 shadow-custom flex items-center gap-3.5">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Icons.Bag className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-400">當日訂購杯數</span>
            <span className="text-2xl font-black text-slate-800 font-mono">
              {stats.totalCups} <span className="text-xs font-semibold text-slate-500">杯</span>
            </span>
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-md border border-white/40 rounded-2xl p-4 shadow-custom flex items-center gap-3.5">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <span className="text-xl font-bold">💰</span>
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-400">今日總計</span>
            <span className="text-2xl font-black text-emerald-700 font-mono">NT$ {stats.totalPrice}</span>
          </div>
        </div>

        <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-4 text-white shadow-custom flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold opacity-90">實時狀態</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div className="flex justify-between items-end mt-1.5">
            <div>
              <span className="block text-[10px] opacity-75 leading-none">工作表狀態</span>
              <span className="text-sm font-bold opacity-100">與 GAS 連線中</span>
            </div>
            <button 
              onClick={onRefresh} 
              disabled={isLoading}
              className="p-1 px-2.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer border-0"
            >
              <Icons.Refresh className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              更新
            </button>
          </div>
        </div>
      </div>

      {/* 訂單明細大面板 */}
      <div className="bg-white/50 backdrop-blur-md border border-white/40 rounded-[28px] shadow-[0_10px_40px_rgba(0,0,0,0.04)] p-6 md:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <i className="inline-block w-2.5 h-6 bg-blue-600 rounded-[4px] mr-1"></i>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                今日清單 Order List
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">點選右側可以用訂購人或茶飲搜尋快濾唷</p>
            </div>
          </div>

          {/* 搜尋欄位 */}
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder="搜尋名字或品項..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-900/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white/80 hover:bg-white rounded-xl text-xs font-semibold font-medium text-slate-700 placeholder-slate-400 transition-all"
            />
            <span className="absolute left-3.5 top-2.5 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
          </div>
        </div>

        {/* 一目了然的點單統計摘要 (買家打電話訂購專用) */}
        {stats.totalCups > 0 && (
          <div className="p-4 rounded-xl bg-white/70 border border-slate-200/60 mr-1 text-xs shadow-sm">
            <span className="block font-bold text-slate-800 mb-2">📊 點單快速統計 (致電飲料店神隊友)</span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.drinkBreakdown).map(([drink, cups]) => (
                <span key={drink} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200/65 font-semibold text-slate-700 font-mono shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                  🥤 {drink} <strong className="text-blue-600 font-bold ml-1">{cups} 杯</strong>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 訂單卡片列表 */}
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 px-6 border border-dashed border-slate-300 rounded-[20px] bg-white/30 backdrop-blur">
            <div className="pulse-effect bg-blue-50 p-4.5 rounded-full mb-4 text-blue-500 flex items-center justify-center">
              <Icons.Coffee className="w-8 h-8" />
            </div>
            {orders.length === 0 ? (
              <>
                <h4 className="font-bold text-slate-700 text-base mb-1">今日尚未有任何人點單</h4>
                <p className="text-xs text-slate-400 text-center max-w-sm leading-relaxed">
                  快在旁邊填上自己的大名 and 想喝的飲料，成為今天辦公室第一個揪團喝飲料的明星吧！☕
                </p>
              </>
            ) : (
              <>
                <h4 className="font-bold text-slate-700 text-base mb-1">找不到符合的點單內容</h4>
                <p className="text-xs text-slate-400 text-center max-w-xs leading-relaxed">
                  請更換您的關鍵字（例如檢查是否有輸入拼音錯誤或錯字唷）
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 max-h-[580px] overflow-y-auto pr-1">
            {filteredOrders.map((ord, idx) => {
              return (
                <div
                  key={ord.orderId || idx}
                  className="bg-white/60 hover:bg-white/85 border border-white/50 rounded-2xl p-4 shadow-custom-sm hover:shadow-custom hover:border-blue-200 transition-all duration-300 flex flex-col justify-between gap-3 group"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1">
                      {/* 訂購人姓名 & 訂單 ID 標記 */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800 text-xs font-bold">
                          <Icons.User className="w-3 h-3 text-slate-600" />
                          {ord.name}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {ord.orderId ? `#${ord.orderId.slice(0, 5)}` : `#${idx+1}`}
                        </span>
                      </div>

                      {/* 飲料名稱 */}
                      <h4 className="text-slate-900 font-bold text-base mt-2 group-hover:text-blue-600 transition-colors">
                        {ord.drink}
                      </h4>
                      
                      {/* 冰塊、甜度與杯數標籤 */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-100/60">
                          🍬 {ord.sugar}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-100/60">
                          ❄️ {ord.ice}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-white text-slate-600 border border-slate-200">
                          共 {ord.quantity} 杯
                        </span>
                      </div>
                    </div>

                    {/* 單項金額 */}
                    <div className="text-right">
                      <span className="block text-lg font-black text-blue-600 font-mono">
                        NT$ {ord.totalPrice}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        NT$ {Math.floor(ord.totalPrice / ord.quantity)} / 杯
                      </span>
                    </div>
                  </div>

                  {/* 動作按鈕：修改、刪除 */}
                  <div className="flex justify-end gap-2 border-t border-slate-950/5 pt-3 mt-1 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(ord)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-blue-50 text-slate-600 hover:text-blue-700 text-xs font-semibold shadow-sm transition-all cursor-pointer"
                    >
                      <Icons.Edit />
                      <span>修改項</span>
                    </button>
                    <button
                      onClick={() => onDelete(ord.orderId)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-semibold shadow-sm transition-all cursor-pointer"
                    >
                      <Icons.Trash />
                      <span>刪除</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
