# 建置與技術補充

非技術編輯人員請從 [網站編輯指南](../README.md) 選擇操作；本頁提供工程人員的本機指令與設定。

## Cloudflare Pages 設定

| 設定              | 值                                                       |
| ----------------- | -------------------------------------------------------- |
| Production branch | `main`                                                   |
| 根目錄            | 儲存庫根目錄，留空                                       |
| Build command     | `npm run build`                                          |
| 輸出目錄          | `dist`                                                   |
| Node              | `.node-version` 指定 22；後台若有 `NODE_VERSION`，須一致 |

不要將 build command 改成只執行 `vite build`；標準指令會先驗證資料與圖片，再執行 TypeScript／Vite。圖片或設定錯誤會使建置失敗，請修正錯誤後重新提交，不要略過驗證。

## 自動素材規則

- `sharp` 精確版本及跨平台套件由 package-lock.json 鎖定；使用 `npm ci`，不要略過 optional dependencies。不需要全域 sharp 或 Python 來重建圖片。
- 人物大圖／預覽／縮圖、Logo 與遊戲圖示皆使用內容雜湊網址。`assets.json` 與生成 WebP 沿用版本控制，但建置始終以原圖及 people 設定重建，生成檔不存在也能 build。
- 原圖不會被轉檔改寫。全部來源成功處理後才更新 manifest；`public/images/optimized/` 僅供生成檔使用，過時 WebP 會被移除。
- 支援可解碼的 PNG、JPEG、WebP、AVIF、GIF、TIFF，最多 4,000 萬像素；動圖只取靜態首格。不接受遠端圖片路徑、父目錄跳脫或指向 public 外的連結。
- `photo: null`／省略才使用替代圖；有填卻缺檔或壞圖會失敗。語音缺檔／空檔則警告並停用，不驗證音訊內容。
- 遊戲原圖放在 `public/images/games/*.png`；新增類別還需在 `src/data/sliderData.ts` 的 `TAG_ICONS` 對應顯示名稱。只放圖不會新增可用 tag。

## 本機開發與檢查

```powershell
npm ci
npm run build
```

需要 API 時，分別啟動兩個終端：

```powershell
npm run dev:api
npm run dev
```

`dev` 啟動前會驗證並生成素材；執行期間改原圖或 photo 路徑後，重啟 dev 或另執行 `npm run assets:build`。Vite 將 `/api` 轉送至 `127.0.0.1:8788`。單獨 `npm run preview` 不執行 API，也不套用 Cloudflare `_headers`。

完整檢查：

```powershell
npm run build
npm run test:assets
npm run test:clips
npm run lint
npm run format:check
```

素材測試含同名換圖、損壞圖片、設定錯誤、來源雜湊、生成檔與容量預算；需先 build。容量預算是靜態檔案大小，不等同載入時間。

本機提交時，一併提交原檔、設定及 build 更新的 `assets.json`／版本化 WebP。GitHub 網頁編輯則只需更新來源與設定，由 Cloudflare 生成。名單一致性與 Clip 測試讀取當前 people，不需為合法改名或移除成員修改測試帳號。

## 字型與快取

WOFF2 隨專案提交；子集以外字元使用系統字型備援。需要重新生成字型時才執行：

```powershell
python -m pip install fonttools brotli
python scripts/optimize-fonts.py
```

Cloudflare `_headers` 提供圖片／字型一天快取與 stale-while-revalidate。圖片以新雜湊網址更新；字型仍用固定檔名，修改時須留意舊快取。

## Twitch 設定與播放

密鑰放於 Cloudflare Secrets；本機使用已忽略的 `.dev.vars`，不放入 people、README 或前端。Vite 禁止讀取 `.dev.vars*` 與 `.wrangler` 狀態檔。

users 的前端請求與伺服器快取依帳號名單區分版本；改帳號不會沿用舊名單的瀏覽器快取。顯示名稱取自 Twitch，照片與縮圖取自 Git 原圖。

`GET /api/clips?username=<既有成員>` 取得全期間最高觀看 Clip，共享快取最多一小時、瀏覽器五分鐘，空結果五分鐘。進入 Clip 才載入，切回 Info、換人或離開可視範圍時卸載。自動播放設為靜音，實際播放與分級提示由 Twitch／瀏覽器控制；最低尺寸 400×300，不足時提供 Twitch 連結。
