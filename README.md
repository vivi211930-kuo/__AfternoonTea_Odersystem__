# 辦公室下午茶：飲料集單系統 🧋

一個專為辦公室揪團訂飲料打造的精美、極簡、響應式每日飲料集單系統。支援當日自適應選單分頁，並透過 **Google Apps Script** 即時同步試算表資料，讓辦公室統計下午茶不再手忙腳亂！

---

## ✨ 核心特色

- **🎨 奶茶與抹茶主題雙配色**：精美的手繪風與現代簡約 SVG 圖標庫，搭配流暢的微互動與 HSL 調和配色。
- **📊 實時資訊統計板**：提供 Bento Style 的當日訂購總杯數、今日總計金額，並實時顯示與 Google Apps Script (GAS) 的連線狀態。
- **📖 快捷菜單點選**：支援在「今日手選飲料菜單」中點擊任一品項，系統將自動填入訂購單中，大幅提升填單效率。
- **⚙️ 自訂客製化**：精準的甜度選擇（正常糖/七分糖/半糖/微糖/無糖）與冰塊選擇（正常冰/少冰/微冰/去冰/溫熱）。
- **🛠️ 點單快速統計**：專為致電飲料店神隊友設計的快速統計卡，買家能一目了然各品項的杯數總計，直接大聲下單。
- **🔌 GAS 雲端即時同步**：整合 Google Apps Script 後端，所有新增、修改、刪除操作均能即時同步至雲端試算表。
- **🛡️ 雙重容錯備份機制**：即使後端網路連線失敗或中斷，系統將自動載入內建的「本日精選備選菜單」，維持完美流暢的使用者體驗。

---

## 🚀 快速開始

### 前置需求

- **Node.js** (建議 v18 以上版本)
- **npm**

### 安裝與啟動

1. **安裝專案依賴項目**：
   ```bash
   npm install
   ```

2. **啟動本機開發伺服器 (Vite)**：
   ```bash
   npm run dev
   ```
   啟動後，在瀏覽器中打開 `http://localhost:5173` 即可進行開發與預覽。

3. **建置生產版本**：
   ```bash
   npm run build
   ```

---

## 📁 專案結構

```text
├── src/
│   ├── App.tsx       # React 專案入口組件
│   ├── main.tsx      # React 掛載點
│   └── index.css     # 全域樣式設定
├── index.html        # 應用程式主要 HTML 檔 (內嵌互動式 React 與應用程式邏輯)
├── vite.config.ts    # Vite 設定檔 (標準 React 與 Tailwind CSS 整合)
└── package.json      # 專案套件管理設定
```

---

## ⚙️ Google Apps Script (GAS) 整合說明

本系統前端主要是透過 `index.html` 中的 `API_URL` 連接您部署的 Google Apps Script 網路應用程式：

1. 在 Google 試算表中建立兩個工作表，分別命名為：
   - `menu` (存放飲料品項、價格、分類與描述)
   - `orders` (存放當日訂單資料，包含 `orderId`、`name`、`drink`、`sugar`、`ice`、`quantity`、`totalPrice` 等欄位)
2. 在該試算表中建立 Apps Script，並寫入對應的 `doGet` 與 `doPost` 處理程式，將其部署為**網路應用程式 (Web App)**，權限設定為「任何人」。
3. 將產生的 Web App 網址貼入 `index.html` 中的 `API_URL` 變數即可完成對接！

---

## 🌐 GitHub Pages 部署說明

本專案已設定好透過 **GitHub Actions** 自動部署至 GitHub Pages。當您將代碼推送到 GitHub 上的 `main` 分支時，將會自動觸發建置與部署。

### 部署設定步驟：

1. **提交並推送變更**：
   請將本次更新的檔案（包括 `.github/workflows/deploy.yml`、`package-lock.json`、`vite.config.ts` 等）提交並推送到您的 GitHub 倉庫 `main` 分支：
   ```bash
   git add .
   git commit -m "Configure GitHub Actions deployment and Pages base URL"
   git push origin main
   ```

2. **設定 GitHub 儲存庫權限**：
   - 進入您在 GitHub 的專案儲存庫頁面，點擊 **Settings** (設定)。
   - 在左側選單中點選 **Pages**。
   - 在 **Build and deployment** -> **Source** 下拉選單中，選擇 **GitHub Actions**。

3. **完成部署**：
   - 點選專案頂部的 **Actions** 標籤，您會看到自動觸發的 **Deploy to GitHub Pages** 工作流正在執行。
   - 待工作流完成後，您的集單系統便會成功發布在：
     `https://<您的 GitHub 帳號>.github.io/__AfternoonTea_Odersystem__/`

