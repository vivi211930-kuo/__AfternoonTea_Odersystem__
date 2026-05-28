import React, { useState, useEffect, useMemo } from 'react';
import { MenuItem, Order } from '../types';
import { Icons } from './Icons';

interface OrderFormProps {
  menu: MenuItem[];
  onSubmit: (formData: any) => void;
  editOrder: Order | null;
  onCancelEdit: () => void;
  isSubmitting: boolean;
}

export default function OrderForm({ menu, onSubmit, editOrder, onCancelEdit, isSubmitting }: OrderFormProps) {
  const [name, setName] = useState(() => localStorage.getItem("drink_username") || "");
  const [selectedDrinkName, setSelectedDrinkName] = useState("");
  const [sugar, setSugar] = useState("半糖");
  const [ice, setIce] = useState("少冰");
  const [quantity, setQuantity] = useState(1);

  const SUGAR_OPTIONS = ["正常糖", "七分糖", "半糖", "微糖", "無糖"];
  const ICE_OPTIONS = ["正常冰", "少冰", "微冰", "去冰", "溫熱"];

  // 當切換到編輯模式時，自動帶入該筆訂單數據
  useEffect(() => {
    if (editOrder) {
      setName(editOrder.name);
      setSelectedDrinkName(editOrder.drink);
      setSugar(editOrder.sugar || "半糖");
      setIce(editOrder.ice || "少冰");
      setQuantity(editOrder.quantity || 1);
    } else {
      // 恢復為預設
      setSelectedDrinkName(menu[0]?.name || "");
      setSugar("半糖");
      setIce("少冰");
      setQuantity(1);
    }
  }, [editOrder, menu]);

  // 當選取飲料變更，或數量變更時，自動即時計算單杯與總價
  const activeDrink = useMemo(() => {
    return menu.find(item => item.name === selectedDrinkName) || null;
  }, [selectedDrinkName, menu]);

  const totalPrice = useMemo(() => {
    if (!activeDrink) return 0;
    return activeDrink.price * quantity;
  }, [activeDrink, quantity]);

  // 儲存名字到 localStorage，確保下次自動填寫
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    localStorage.setItem("drink_username", val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("請填寫訂購人姓名喔！");
      return;
    }
    if (!selectedDrinkName) {
      alert("請選擇想喝的飲料！");
      return;
    }

    const formData: any = {
      name: name.trim(),
      drink: selectedDrinkName,
      sugar,
      ice,
      quantity: Math.max(1, quantity),
      totalPrice
    };

    if (editOrder) {
      formData.orderId = editOrder.orderId;
    }

    onSubmit(formData);
  };

  return (
    <div id="order-form-container" className="bg-white/50 backdrop-blur-md border border-white/40 rounded-[28px] shadow-[0_10px_40px_rgba(0,0,0,0.04)] p-6 md:p-8 flex flex-col justify-between transition-all duration-300">
      <div>
        {/* 表單抬頭 */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-950/10">
          <div className="flex items-center gap-2.5">
            <i className="inline-block w-2.5 h-6 bg-blue-600 rounded-[4px] mr-1"></i>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                {editOrder ? "修改今日訂單" : "我要點餐 Order Form"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {editOrder ? `正在編輯 ${editOrder.name} 的飲料項目` : "選擇喜愛的冰熱度與甜度"}
              </p>
            </div>
          </div>
          
          {editOrder && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="text-xs font-semibold px-2.5 py-1 text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-all"
            >
              取消修改
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 訂購人姓名 */}
          <div>
            <label className="block text-[13px] font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
              <Icons.User className="w-4 h-4 text-blue-500" />
              訂購人姓名
            </label>
            <input
              type="text"
              placeholder="請輸入您的姓名 (例如王小明)"
              value={name}
              onChange={handleNameChange}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-950/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white/80 hover:bg-white transition-all font-medium text-slate-800 placeholder-slate-400 text-sm"
            />
          </div>

          {/* 選擇飲料 */}
          <div>
            <label className="block text-[13px] font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
              <span className="inline-block text-blue-500">🥤</span>
              選擇飲料品項
            </label>
            <div className="relative">
              <select
                value={selectedDrinkName}
                onChange={(e) => setSelectedDrinkName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-950/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white/80 hover:bg-white transition-all font-semibold text-slate-800 text-sm appearance-none cursor-pointer"
              >
                <option value="" disabled>-- 請選擇一杯飲品 --</option>
                {menu.map(drink => (
                  <option key={drink.name} value={drink.name}>
                    {drink.name} (NT$ {drink.price})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
            
            {activeDrink && (
              <div className="mt-2.5 p-3 rounded-xl bg-white/70 border border-slate-100 text-xs text-slate-600 space-y-1 shadow-sm">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>類別: {activeDrink.category || "精選"}</span>
                  <span className="text-blue-600">單價: NT$ {activeDrink.price} / 杯</span>
                </div>
                {activeDrink.description && (
                  <p className="text-slate-500 leading-relaxed italic">「{activeDrink.description}」</p>
                )}
              </div>
            )}
          </div>

          {/* 甜度篩選按鈕 */}
          <div>
            <label className="block text-[13px] font-semibold text-slate-600 mb-2">甜度選擇</label>
            <div className="grid grid-cols-5 gap-1.5">
              {SUGAR_OPTIONS.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSugar(opt)}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-all duration-200 ${
                    sugar === opt
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white/80 text-slate-600 border-slate-950/5 hover:bg-white cursor-pointer"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 冰塊篩選按鈕 */}
          <div>
            <label className="block text-[13px] font-semibold text-slate-600 mb-2">冰塊選擇</label>
            <div className="grid grid-cols-5 gap-1.5">
              {ICE_OPTIONS.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setIce(opt)}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-all duration-200 ${
                    ice === opt
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white/80 text-slate-600 border-slate-950/5 hover:bg-white cursor-pointer"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 數量調整加減鈕 */}
          <div className="flex items-center justify-between bg-white/70 p-4 rounded-xl border border-slate-950/5">
            <div>
              <span className="block text-sm font-bold text-slate-800">數量</span>
              <span className="text-xs text-slate-400">目前點選數量</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-600 transition-all font-bold cursor-pointer"
              >
                <Icons.Minus />
              </button>
              <span className="w-8 text-center text-lg font-bold text-slate-800 font-mono">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(q => q + 1)}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all font-bold cursor-pointer"
              >
                <Icons.Plus />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 總結算與送出 */}
      <div className="mt-8 pt-6 border-t border-slate-950/10 space-y-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium text-slate-500">預估結算金額</span>
          <div className="text-right">
            <span className="text-xs text-slate-400 mr-1 font-mono">NT$ {activeDrink?.price || 0} × {quantity} =</span>
            <span className="text-2xl font-black text-blue-700 font-mono">
              NT$ {totalPrice}
            </span>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !name || !selectedDrinkName}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-white shadow-md transition-all duration-300 flex items-center justify-center gap-2 ${
            isSubmitting
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-95 shadow-[0_8px_20px_rgba(37,99,235,0.2)] active:scale-95 cursor-pointer"
          }`}
        >
          {isSubmitting ? (
            <>
              <Icons.Refresh className="w-5 h-5 animate-spin" />
              <span>傳送至雲端試算表...</span>
            </>
          ) : (
            <>
              <Icons.Check />
              <span>{editOrder ? `送出修改 ($${totalPrice})` : `送出訂單 ($${totalPrice})`}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
