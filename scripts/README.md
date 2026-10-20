# 素材、設定與建置

## Git 換圖後的標準流程

1. 將有效原圖放進 `public/images/members/`；可以覆蓋原檔，也可以改名後同步修改 `src/data/people.json` 的 `photo` 路徑。路徑以 `/images/members/` 開頭，大小寫必須與檔案一致（Cloudflare 為 Linux）。
2. 提交原圖與設定並 push；Cloudflare Pages 執行 `npm run build`，自動驗證資料、解碼原圖、產生 WebP、生成素材清單，然後才執行 TypeScript 與 Vite。
3. 成功部署後，新圖片使用例如 `jenijeniiii-portrait.0123456789abcdef.webp` 的內容雜湊網址；內容變更才換網址，讓瀏覽器取得新圖。人物大圖、預覽、縮圖、Logo、遊戲圖示均遵循這項規則。

不需要手動執行 Python、安裝全域 sharp 或填寫本機工具路徑。`sharp` 精確版本與跨平台套件由 package-lock.json 鎖定，使用 `npm ci` 安裝，不要略過 optional dependencies。圖片轉檔只會改寫衍生檔，不改原圖；全部圖片成功處理後才更新清單，並清除 `public/images/optimized` 中過時的生成 WebP。這個目錄只供生成檔案使用。

`src/data/assets.json` 與生成的 WebP 沿用版本控制，供檢視差異；它們不是設定來源。即使 Git 上的生成檔過期或不存在，標準 build 仍會從原圖完整重建。Cloudflare 不需要先提交手動轉檔的結果才能更新圖片。

## 設定防呆

| 設定           | 規則與建置行為                                                                                                                                                 |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `username`     | Twitch login，小寫英數與底線，1–25 字，不可重複；不是可隨意修改的顯示名稱。改帳號時須同步修改 links 的 key。                                                   |
| `photo`        | 指向 `/images/members/` 下的本機圖片；有填路徑卻不存在、空檔或無法解碼會停止建置，錯誤指出人物與路徑。照片尚未準備時，明確填 `null` 或省略，才使用 Logo 替代。 |
| 圖片內容       | 支援可解碼的 PNG、JPEG、WebP、AVIF、GIF、TIFF；最多 4,000 萬像素。動圖只產生靜態首格。瀏覽器不直接使用原圖副檔名判定內容；把文字改名 `.png` 無法通過驗證。     |
| `audio`        | 尚未有語音請填 `null` 或省略。填了但檔案缺失／空檔會警告並停用播放，不阻止其他內容部署；不驗證聲音內容。                                                       |
| `color`        | `#` 加六位十六進位色碼，例如 `#9DBFB0`。                                                                                                                       |
| `title`／`bio` | 字串；介紹頁目前最多顯示 200 字，超出會省略。                                                                                                                  |
| `tags`         | 字串陣列；介面僅顯示已支援圖示的前四個遊戲。新增遊戲對應於 sliderData.ts，圖示來源放在 games 的 PNG。                                                          |
| `section`      | 目前固定 `slider`。                                                                                                                                            |
| `links.json`   | `discord` 為物件，key 必須是現有 username；值為 HTTPS 聯絡網址或空字串。舊帳號殘留、非 HTTPS、格式錯誤會停止建置。                                             |
| 檔案路徑       | 不接受遠端網址、反斜線、父目錄跳脫與指向 public 外的連結。                                                                                                     |

已將八筆未上傳語音明確設為 `null`，保留不可播放的介面行為。已從 Git 的 `dcc634b` 恢復 jenijeniiii 的有效原圖至 `jenijeniiii1.png`；若要使用另一張新圖，直接覆蓋該原檔即可。clown2486 的新原圖現在會被重建與使用。

## 本機命令

```powershell
npm ci
npm run dev
```

`npm run dev` 啟動前同樣會驗證並生成素材。原圖或 photo 路徑在伺服器運行中變更後，重啟 dev 或另執行 `npm run assets:build`。只改介紹或色彩仍可由 Vite 更新。

```powershell
npm run build
npm run test:assets
npm run test:clips
npm run lint
npm run format:check
```

`test:assets` 包含臨時目錄中的同名換圖／快取網址／失效設定測試，以及專案實際生成素材的來源雜湊、可解碼性、尺寸與容量驗證；請先 build。錯誤圖片會使 build 非零結束，Cloudflare 會保留上一個成功部署，不會將失敗處理當成成功更新。請在 Deployments 確認目標 commit、build 成功且屬於 Production。

格式修正使用 `npm run format`。JSON 有效與 Prettier 格式一致是兩個檢查；不要因格式警告而誤以為更新內容被略過。

## 字型與快取

中文字型與英文字型的 WOFF2 仍隨專案提交。新增文案若遇到字型子集以外的字元，瀏覽器使用系統字型備援；圖片重建不依賴 Python。需要重新生成字型時才執行：

```powershell
python -m pip install fonttools brotli
python scripts/optimize-fonts.py
```

Cloudflare `_headers` 提供圖片／字型一天快取與 stale-while-revalidate；圖片更新以新雜湊網址解決。字型保留既有檔名與快取策略，修改字型後仍需留意舊快取。Vite preview 不套用 Cloudflare `_headers`。

## Twitch Clip 本機開發

先執行 `npm run build`，再於兩個終端分別啟動：

```powershell
npm run dev:api
npm run dev
```

Vite 將 `/api` 轉送到 `127.0.0.1:8788` 的 Cloudflare Pages Functions。單獨的 `vite preview` 不執行 API。

Twitch 設定沿用 Wrangler／`.dev.vars`（正式站為 Cloudflare Secrets），不將 secret 或 token 放入前端。Vite 禁止讀取 `.dev.vars*` 與 `.wrangler` 狀態檔。

人物名單改動時，前端 users 請求與伺服器 users 快取都依名單版本區分，避免新帳號繼續使用前一次的 24 小時資料。顯示名稱仍從 Twitch 取得；所有人物照片與縮圖則固定使用 Git 原圖產生的版本，不被 Twitch 頭像覆蓋。

`GET /api/clips?username=<既有成員>` 查詢全期間最高觀看 Clip，共享快取最多一小時（瀏覽器五分鐘），空結果快取五分鐘。進入 Clip 模式才載入。`autoplay=true&muted=true` 的實際播放由 Twitch 與瀏覽器控制；分級提示由觀眾自行確認。切回 Info、切換人物或離開可視範圍時卸載播放器。最低尺寸 400×300，空間不足時顯示「在 Twitch 播放精華」。
