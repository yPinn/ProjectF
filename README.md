# 專案維護

這是 React + Vite 網站，部署至 Cloudflare Pages。後續換圖只需更新原圖與設定，標準建置會自動驗證、轉檔及更新圖片版本。

```powershell
npm ci
npm run build
npm run preview
```

Cloudflare Pages：production branch 為 `main`、根目錄為儲存庫根目錄（留空）、build command 為 `npm run build`、輸出目錄為 `dist`。Node 由 `.node-version` 指定 22；若後台另有 `NODE_VERSION`，須與其一致。不要將 build command 改成只執行 `vite build`，那會略過資料與圖片驗證。

平常修改的檔案：

| 內容                                               | 來源                                                     |
| -------------------------------------------------- | -------------------------------------------------------- |
| 成員 Twitch 帳號、照片路徑、介紹、色彩、遊戲、語音 | `src/data/people.json`                                   |
| Discord 聯絡網址                                   | `src/data/links.json`，key 與 username 相同              |
| 人物原圖                                           | `public/images/members/`                                 |
| Logo／遊戲原圖                                     | `public/images/logo.png`、`public/images/games/*.png`    |
| 自動生成、不手改                                   | `src/data/assets.json`、`public/images/optimized/*.webp` |

帳號已改為 `lulumin1228`。帳號變更需同步更新 people 的 username、links 的 key；照片／語音路徑必須指向真實檔案，檔名不一定要等於帳號。Twitch API、直播與 Clip 會從 people 自動取用新帳號，不另維護名單。

詳細規則、錯誤處理、驗證及 API 本機啟動方式見 [維護與建置說明](scripts/README.md)。
