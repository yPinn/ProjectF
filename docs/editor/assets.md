# 更新圖片與語音

[回編輯首頁](../../README.md) · [編輯成員資料](members.md) · [儲存與確認發布](publish.md)

## 更換現有照片：同名覆蓋最簡單

1. 開啟 [src/data/people.json](../../src/data/people.json)，找到該成員的 `username`，查看同一組的 `photo`。
2. 假設內容是 `"photo": "/images/members/winsyi.png"`，把電腦上的新照片命名為 **winsyi.png**。
3. 開啟 [public/images/members](../../public/images/members)，按檔案列表上方 **Add file → Upload files**，上傳新照片。這是在替換原照片，**不用先刪舊檔**。
4. 等上傳完成，依 [儲存與確認發布](publish.md) 提交。檔名沒變就不用改 `people.json`；網站會自動重做縮圖並使用新版本。

照片建議用透明背景 PNG 或 WebP。**先確認新照片能在電腦上正常開啟；不是 PNG 的檔案，不要只把副檔名改成 `.png`。**

## 使用不同檔名，或第一次新增照片

1. 先把照片上傳到 [public/images/members](../../public/images/members) 並儲存，例如 `winsyi-new.png`。
2. 開啟 [people.json](../../src/data/people.json) → 鉛筆圖示，找到該成員，將 `photo` 改成 `"/images/members/winsyi-new.png"`，再儲存。
3. [確認發布結果](publish.md)。舊照片可暫時保留，避免刪到其他成員共用的圖片。

`public/images/members/` 是上傳資料夾，設定中則填 `/images/members/檔名`，**不用加 `public`**。檔名的大小寫與副檔名都要一致。沒有照片時填 `"photo": null`，會顯示品牌替代圖。

## 更新人物語音

1. 準備能正常播放的 MP3，開啟 [public/audio](../../public/audio)，用 **Add file → Upload files** 上傳並儲存。
2. 開啟 [people.json](../../src/data/people.json) → 鉛筆圖示，找到成員，把 `audio` 填成 `"/audio/檔名.mp3"`。若是覆蓋原本同名 MP3，不用再改設定。
3. 儲存後，在正式網站點人物確認播放。不要語音時改成 `"audio": null`。

## 更換 Logo 或遊戲圖示

| 要換的圖片   | 上傳位置                                         | 操作方式                                     |
| ------------ | ------------------------------------------------ | -------------------------------------------- |
| 品牌 Logo    | [public/images](../../public/images)             | 上傳新的 **logo.png** 覆蓋同名原圖。         |
| 既有遊戲圖示 | [public/images/games](../../public/images/games) | 找到對應原檔，以相同檔名及格式覆蓋。         |
| 新遊戲種類   | 交由工程人員處理                                 | 需要另外加入程式對應，單純上傳圖片不會出現。 |

每次上傳後，都要完成 [儲存與確認發布](publish.md)。

## 避免上傳錯誤

- 使用 **Upload files** 上傳真正的圖片／音檔；不要使用 **Create new file** 建立只有圖片名稱的文字檔。
- 不必改 `assets.json` 或 `optimized` 資料夾；這些縮圖與轉檔結果由網站自動產生。
- 有填照片路徑但檔案不存在或已損壞，發布會失敗；尚未準備的照片請填 `null`。
