# 實況主展示入口與載入效能優化

## 分類提交（2026-10-19）

使用者已授權整理並提交目前工作；依相依關係分類，不推送遠端。

- [x] 檢查工作目錄與變更範圍，確認分為效能、Clip API、介面、文件四類。
- [x] 重跑建置、素材測試、Clip API 測試、ESLint 與格式檢查。
- [x] 提交效能、Clip API、介面三類變更，檢查後僅剩文件；本節隨第四筆文件 commit 納入。
- [x] 記錄提交驗證結果。

### 分類提交 Review

- `dcc634b`：素材／字型、資料模型、轉檔腳本、素材測試、快取與背景運算效能。
- `6848130`：Twitch Clip API、上游驗證、快取、8 項測試及本機開發設定。
- `f230b94`：人物展示入口、延後掛載詳細頁、Info／Clip 切換、播放器與排版／操作修正。
- 第四筆文件提交：維護與啟動方法、任務驗證紀錄及使用者修正經驗。
- 本次重新執行正式建置、素材測試 2/2、Clip API 測試 8/8、src／functions／MJS 腳本 ESLint、Prettier 及 diff 空白檢查，全部通過。瀏覽器驗證沿用上一輪證據，提交整理未改應用程式行為。
- 只提交專案原始碼、正式素材與文件；未追蹤密鑰、本機狀態、測試產物、預覽截圖或 dependencies，未推送遠端。

## 新增 Clip 功能（2026-10-19）

使用者已明確要求在原頁開啟 Clip，將描述區切換為目前人物最高觀看次數的 Twitch Clip。Info 保留原介紹；不新增底部分頁、返回或其他重複導覽。進入 Clip 才查詢與載入播放器；切換人物時同步查詢，離開 Clip 或畫面時停止播放器。

- [x] 查核官方 API 排序、Clip iframe、parent、autoplay／muted、最低 400×300 尺寸及手機限制；檢查現有 Cloudflare API 架構。
- [x] 實作前記錄方案並向使用者說明範圍與播放限制；此需求已明確授權執行。
- [x] 先建立 API 測試，涵蓋合法人物、最高觀看查詢、快取、缺少設定、空結果、上游失敗與非法請求。
- [x] 新增唯讀 clips API，使用伺服器端 Twitch app token，限定既有人物與固定 Twitch 端點，快取查詢結果。
- [x] 啟用 Info／Clip 原頁切換，描述區改為播放器，切換人物、關閉模式及離開畫面時處理播放生命週期。
- [x] 維持人物與姓名排列；Clip 依後續修正只保留播放器，遊戲與 Watch Live 僅在 Info 顯示。窄螢幕提供可操作的播放備援，不造成橫向溢出。
- [x] 驗證 API 與播放器實際回應、錯誤／無片段、人物切換、桌機／手機排版；執行建置、格式、測試與安全／程式碼審查。
- [x] 更新 Review 與啟動方法，明確記錄自動播放及第三方服務驗證限制。

規格：GET `/api/clips?username=<既有成員>` → `{ clip: { id, title, viewCount, url } | null }`；使用 Twitch Get Users 解析 ID、Get Clips `broadcaster_id` + `first=1`，不限制日期。播放器 src 僅從驗證後 ID 組成，parent 使用實際 hostname，`autoplay=true&muted=true`，不將密鑰傳到前端。

### Clip Review

- 先建立測試並確認 API 尚不存在時失敗，實作後 `npm run test:clips` 8/8 通過；涵蓋最高觀看參數、快取、非法人物／方法、缺設定、空結果、上游錯誤與惡意 ID。
- 原素材測試 2/2 通過；TypeScript／正式建置、原始碼 ESLint 與變更檔 Prettier 通過。
- 真實本機 Cloudflare API 對 winsyi 回傳 200，取得全期間最高 Clip（查詢當下 96 views）；lilhanwen3377 的播放器也載入最高 Clip（52 views）。這些是當下資料，不硬編碼在產品中。
- 真實播放器 URL 包含正確 clip ID、目前 hostname 的 parent、autoplay=true、muted=true。Info 可還原描述，切回後 iframe 數量為 0；人物切換會更換 ID，舊請求與播放器被清除。
- 實測 iframe 本身尺寸：1440px 視窗為 491×300，768px 為 714×400.75，454px 為 400×300，901px 為 400×300。453px 及 390px 顯示 Twitch 連結備援；無橫向溢出。邊框已納入最低尺寸計算。
- Info／Clip 切換定位詳細區頂端；Clip 模式以自然高度保留人物、姓名與原側欄，依後續修正隱藏遊戲及 Watch Live，不新增返回或分頁。
- Vite 新增本機 API proxy；沿用既有 Cloudflare 設定，未讀出或變更密鑰。明確保留 Vite 預設敏感檔案阻擋，另封鎖 .dev.vars\*／.wrangler；HEAD /.dev.vars 實測 403，沒有讀取 body。
- 程式碼／安全審查複查通過；獨立視覺審查 disposition: ship。截圖 clip-desktop.png、clip-tablet.png、clip-mobile.png 與尺寸記錄位於 .impeccable/review/。
- 啟動方法見 scripts/README.md：先 build，再分別執行 dev:api 與 dev。保留 3001 前端及 8788 本機 API 供預覽；未部署。
- **自動播放限制**：已設定官方 autoplay／muted 與 iframe autoplay 權限，並驗證播放器載入；沒有宣稱播放成功。winsyi 的最高 Clip 出現 Twitch 內容分級提示，需要觀眾自行確認；另一支影片在內建預覽讀到 muted=true、paused=true、currentTime=0。瀏覽器／Twitch 可阻止自動播放，本次沒有自動點擊分級確認、強制呼叫跨來源播放器或繞過限制。
- API 的失敗／無片段狀態由隔離的假資料測試驗證，並未虛構正式資料。播放器內部第三方失敗、實機手機與正式 Cloudflare 部署環境仍受平台條件影響。

官方依據：https://dev.twitch.tv/docs/api/clips/ 與 https://dev.twitch.tv/docs/embed/video-and-clips/ 。

## 後續調整：人物展示框主題色填滿（2026-10-19）

- [x] 每個展示人物獨立設定主題色，依後續指示以 30% 透明度填充框內背景；中央與兩側皆使用自己的顏色，照片透明度不受影響。
- [x] 檢查切換人物後的顏色及排版，執行建置與程式碼審查。

本次 review：瀏覽器確認五個可見人物的框內背景均為各自主題色、alpha 0.3；切換與人物照片正常。正式建置、變更檔 ESLint／Prettier 與此次程式碼審查通過。截圖：`.impeccable/review/theme-fill.png`。

## 需求與範圍

- 在 About 下方、既有 StreamerSlider 上方加入實況主選人入口。
- 沿用深色、青色與紫色的既有品牌，參考機甲展示的中央人物、左右候選人物、底座與輪替層次；不用鋼鐵人電影素材。
- 切換入口人物只改變預覽；明確點選中央人物或「查看介紹」後，才定位至原有詳細區塊並同步該人物。
- 保留既有人物介紹、遊戲標籤、Twitch 與聯絡功能；依使用者後續指示移除新增的返回陣容與底部分頁控制。
- 優先使用現有 React、CSS 與圖片，不引入 WebGL 或大型輪播套件。

## 計畫

- [x] 檢查專案、Git 工作狀態、現有資料與互動、靜態資源大小。
- [x] 執行修改前正式建置，記錄資源與缺檔基準。
- [x] 完成修改前 ESLint 檢查，記錄既有問題。
- [x] 使用者確認下列實作方案後開始修改應用程式（已回覆「依序開始」）。
- [x] 優化現有人像與 Logo：產生保留透明度的 WebP 與小型縮圖，依顯示用途載入；保留原始來源。
- [x] 精簡字型傳輸（評估中文字型 WOFF2，限制不必要的字元集），量測實際檔案差異。
- [x] 建立選人舞台：中央放大人物、左右候選、底座、姓名與角色、前後切換、成員快速選取與查看介紹。
- [x] 串接選人與原有資訊區塊，詳細內容延後載入，僅掛載必要人物，保留現有導覽入口相容性。
- [x] 將方向鍵與觸控事件限制於所在區塊，避免全域操作誤切人物；支援手機自然捲動、鍵盤與減少動態效果偏好。
- [x] 減少離開可視範圍後仍持續執行的視差工作；缺圖提供替代呈現，缺少語音時不顯示可播放狀態。
- [x] 執行正式建置、ESLint、變更檔格式與資源完整性檢查；驗證選人到介紹的同步。返回控制依使用者要求移除。
- [x] 驗證桌機、平板與手機排版、長名稱、缺少圖片／語音、API 無法使用時的備援，並量測靜態資源前後差異；無法量測的項目見 Review。
- [x] 完成程式碼審查、更新本文件 review 與交付摘要。

## 修改前基準（2026-10-19）

- 專案：React 19 + TypeScript + Vite 8；Cloudflare Pages functions 提供 Twitch API。
- 初始 Git 工作目錄乾淨；未找到既有 tasks/lessons.md。
- `npm run build` 成功：JS 237.68 kB / gzip 79.62 kB；CSS 45.41 kB / gzip 9.04 kB。
- `node node_modules/eslint/bin/eslint.js src functions` 成功，無 lint 錯誤。
- public PNG 總計約 29.00 MiB；18 位成員資料所引用且存在的人像合計 17.74 MiB。這是檔案大小合計，並非已量測的首頁網路傳輸量。
- Logo PNG 1,524,976 bytes；中文字型 TTF 4,911,464 bytes。
- 缺少 `/images/members/clown2486.png`。
- 缺少 8 個語音檔：yyo277、jenijeniiii、hachimi1010、loui61095、yu_er\_\_\_、karicl0、clown2486、luming1228。
- 現有輪播將全部人物同時掛載，方向鍵與水平觸控在 window 監聽，垂直觸控在輪播全面 preventDefault；需避免新增入口後互相干擾。
- HTML metadata 仍有 YOUR_DOMAIN 與 8 位核心成員的舊資訊，與 18 位資料不一致；屬既有問題，本次先列出，不自行擴大修改範圍。
- 本機開發伺服器已啟動於 3000，但內建瀏覽器連線逾時，shell HTTP 檢查回報通訊端權限不足；尚未取得有效的瀏覽器效能基準。

## Review

### 完成內容

- About 下方新增 Roster 選人展示台，中央主角、兩側候選、底座、18 位成員縮圖、手動／自動輪替及查看介紹。
- 只有點選中央人物或查看介紹才掛載原詳細區；原 `#streamerSlider` 深連結仍可開啟。詳細區僅掛載目前選中的一位人物。
- 詳細區保留原導覽、遊戲與 Twitch 操作。依使用者最新指示，沒有新增的返回陣容、底部分頁或上一位／下一位按鈕。
- 使用者回報的詳細區跑版已修復：遊戲固定四欄、圖示最大高度受限、標題不被 flex 壓縮、移除大型三角導覽裝飾。
- 使用原生 lazy 圖片載入，避免單靠 IntersectionObserver 決定是否掛載照片時出現空白；人物 API 仍延後至接近或互動時請求。
- 縮圖列保留原生橫向捲動；展示台水平手勢與鍵盤事件僅影響所在區塊。自動輪替分別處理滑鼠與焦點暫停，離開畫面／背景頁面／減少動態效果時停止。
- 缺圖使用品牌 Logo 並註明；8 個不存在的語音不再顯示可播放狀態。切換人物或離開詳細區會停止語音。
- 視差由持續 rAF 改為事件驅動與收斂後停止；手機星點數量減少，減少動態效果時改為靜態。
- 原始 PNG／TTF 保留；轉檔工具與後續更新方法見 `scripts/README.md`。

### 資源前後差異

以下為本機檔案大小，**不是首頁傳輸量或實際載入時間**。

| 項目                                      |           修改前 |          修改後 |
| ----------------------------------------- | ---------------: | --------------: |
| 所引用且存在的人像 PNG / 優化後全人物大圖 | 18,597,751 bytes |   987,240 bytes |
| 全人物大圖＋預覽＋縮圖（含缺圖備援）      |                — | 1,563,680 bytes |
| 中文字型                                  |  4,911,464 bytes |   146,508 bytes |
| Logo                                      |  1,524,976 bytes |    65,074 bytes |
| 首次 JS（未 gzip）                        |        237.68 kB |       245.09 kB |
| 延後載入的詳細區 JS                       |  全部在主 bundle |        11.13 kB |
| 首次 CSS（未 gzip）                       |         45.41 kB |        25.97 kB |
| 延後載入的詳細區 CSS                      |     全部在主 CSS |        22.80 kB |

新增展示台帶來少量 JS 增長；主要縮減來自圖像、字型、首次 CSS，以及詳細區延後掛載。Cloudflare `_headers` 提供圖像與字型快取；未宣稱本機 Vite 套用了正式站快取。

### 驗證證據

- 最終 `npm run build` 成功（TypeScript 與 Vite）。
- `node node_modules/eslint/bin/eslint.js src functions scripts/*.mjs` 通過。
- 變更的 TS／TSX／CSS／JSON／MJS 通過 Prettier 檢查；`git diff --check` 通過。
- `node --test scripts/verify-assets.test.mjs`：2/2 通過，涵蓋全部成員素材引用、缺檔狀態與圖像／字型大小預算。
- 1920×944：逐一切換 18 位人物，標題高度均非 0，沒有標題／導覽／介紹區重疊，遊戲圖示容器上限 112px。
- 1440×1000、768×1024、390×844：入口與詳細區無非預期橫向溢出；平板長名稱與手機長文可讀；手機縮圖列為原生 `touch-action: auto`。
- 缺圖的 clown2486 有正確圖片替代文字及 Logo；缺語音按鈕不可播放。Vite 不提供 Twitch API 時仍可使用本地帳號與圖片，瀏覽器沒有未處理錯誤。
- 正式建置預覽的 smoke test：初始詳細區 0 個，切換入口後仍 0 個，點查看介紹後 1 個且人物同步；多餘新增控制 0 個；console error 0。
- 程式碼審查提出的 3 項互動問題已修復並複查通過。獨立視覺審查 disposition 為 `ship`，範圍為此次入口及詳細區修復；沿用現有品牌 token，未另建或替換 DESIGN.md。
- 8 張桌機／平板／手機截圖與 18 人幾何記錄保存在 `.impeccable/review/`（本地忽略檔）。整頁截圖未完整顯示 Splash／About 的進場內容，因此不將其當作這兩區的視覺驗收證據。
- 機械設計檢查已執行一次；唯一結果是把橢圓展示底座的 6px 底緣誤判為卡片粗框，審查確認為需求所需底座結構。

### 限制與既有問題

- 本機伺服器改在沙盒外啟動後可供內建瀏覽器驗證。工具的唯讀頁面 scope 無法讀取 Performance API，因此沒有有效的 LCP／INP／CLS、冷載入時間或真實網路傳輸量比較；未將檔案縮減等同這些指標。
- 原資料仍缺 1 張照片與 8 個語音，已提供備援，不虛構素材。
- Twitch 實際回傳姓名、正式 Cloudflare API／快取、真實觸控硬體與低階裝置仍需正式環境驗證；目前完成的是瀏覽器尺寸與 DOM／互動驗證，沒有宣稱實機觸控測試。
- HTML metadata 的 YOUR_DOMAIN、8 位核心成員舊文案維持原狀，已在基準列出，未擴大修改。
- 未部署；後續依使用者要求分類提交 Git commit，見本文件「分類提交」。保留 3001 開發預覽供使用者查看。

## Clip 畫面修正（2026-10-19）

- [x] 確認遊戲與 Watch Live 尚未受模式限制，以及 Contact 與按鈕高度不同的原因。
- [x] Clip 內容區只顯示播放器，統一 Info／Clip／Contact 的高度與垂直對齊。
- [x] 驗證桌機／手機、Info 切回、正式建置及程式碼審查。

### Clip 修正 Review

- 1440×1000 與 390×844：Info／Clip／Contact 的高度均為 44px，垂直中心一致，無頁面橫向溢出。
- Clip 中遊戲清單與 Watch Live 均為 0 個；切回 Info 兩者恢復，播放器卸載。
- TypeScript／Vite 正式建置、針對修改檔的 ESLint、git diff --check 通過；程式碼審查 APPROVE。
- 桌機截圖：`.impeccable/review/clip-clean.png`。本次驗證範圍為版面與內容切換，Twitch 的播放限制沿用前次說明。
