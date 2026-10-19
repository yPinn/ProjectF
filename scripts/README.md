# 素材最佳化與驗證

產出的 WebP、WOFF2 與 `src/data/assets.json` 隨專案提交，正式建置不需要安裝轉檔工具。

## 更新圖片或語音

保留 `public/images/members` 原圖，更新 `src/data/people.json` 後執行：

```powershell
node scripts/optimize-assets.mjs
```

此腳本需要環境中可解析的 `sharp`，或以第二參數指定其模組入口檔案。它產生透明 WebP 人像（大圖、預覽、縮圖）、Logo 與遊戲圖示，並更新素材清單。缺少照片時使用品牌 Logo；缺少語音時將音訊標記為不可用，不自行補上人物或音訊內容。原始素材不會被改寫。

## 更新字型

```powershell
python -m pip install fonttools brotli
python scripts/optimize-fonts.py
```

新增介面中文、修改人物文案後重新執行。腳本從 `src` 的 TSX／JSON 擷取字元，產生 `jf-openhuninn-ui.woff2`，並轉換既有英文字型。Twitch 動態姓名若包含子集以外字元，會使用既有系統字型備援。保留原始 TTF，以便再次產生。

## 驗證

```powershell
node --test scripts/verify-assets.test.mjs
npm run test:clips
npm run build
npm run lint
```

驗證素材引用與 2 MiB 全人物變體、200 KiB 中文字型、80 KiB Logo 的檔案大小上限。這些是靜態資源預算，不代表實際網路傳輸量或 Core Web Vitals。Cloudflare Pages 的 `_headers` 提供素材快取；本機 Vite preview 不套用這份設定。

## Twitch Clip 本機開發

先執行 `npm run build`，再於兩個終端分別啟動：

```powershell
npm run dev:api
npm run dev
```

Vite 將 `/api` 轉送到 `127.0.0.1:8788` 的 Cloudflare Pages Functions；也可直接開啟該位址使用正式建置。單獨的 `vite preview` 不會執行 API。

Twitch 設定沿用既有 Wrangler／`.dev.vars`（正式站為 Cloudflare Secrets），不將 secret 或 token 加入前端。Vite 禁止讀取 `.dev.vars*` 與 `.wrangler` 狀態檔；不需將密鑰貼到瀏覽器。

`GET /api/clips?username=<既有成員>` 查詢全期間最高觀看 Clip，成功結果於共享快取保存最多一小時（瀏覽器五分鐘），空結果快取五分鐘。首次進入 Clip 模式才發送請求。播放器採 `autoplay=true&muted=true`，實際是否開始仍由 Twitch 與瀏覽器控制；內容分級提示需由觀眾自行確認。切回 Info、切換人物或離開可視範圍時卸載播放器。

Twitch Clip 最低尺寸是 400×300；容器預留兩邊 1px 邊框。空間不足時顯示「在 Twitch 播放精華」，不以裁切、隱藏或縮放播放器繞過尺寸限制。
