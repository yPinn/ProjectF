# 儲存與確認發布

[回編輯首頁](../../README.md) · [編輯成員資料](members.md) · [更新圖片與語音](assets.md)

## 1. 在 GitHub 儲存

編輯檔案或上傳完成後：

1. 按 **Commit changes…**（提交變更）。「commit」就是把這次修改儲存成一筆紀錄。
2. 填一句修改說明，例如「更新 winsyi 介紹」或「更換 Jenny 照片」。
3. 若可選擇直接儲存至 **main**，選擇後按 **Commit changes**。這會觸發正式網站更新。
4. 若系統要求建立分支或 Pull request（變更申請），依畫面送出申請，請有權限的管理員檢查並合併到 main；**送出申請還不等於正式發布**。

看不到鉛筆或上傳按鈕時，先確認已登入正確 GitHub 帳號，並請專案管理員確認編輯權限。

## 2. 確認 Cloudflare 完成更新

1. 登入 Cloudflare，開啟 **Workers & Pages → 本網站專案 → Deployments**。
2. 找到**最後一次修改**對應的紀錄，確認修改說明／commit 編號相符、環境是 **Production**（正式站），而且狀態成功。若還在執行，等待完成。
3. 開啟正式網址，檢查照片、介紹、遊戲與 CONTACT；用手機再看一次排版。更新語音時，也點人物試播。

需修改多份檔案時，全部儲存完後再核對最後一筆部署。圖片的新版本會自動套用，通常不必手動清快取；**重建（rebuild）只處理已存在 GitHub 的內容，不會上傳電腦裡尚未儲存的檔案**。

沒有 Cloudflare 權限時，請管理員代查發布結果，並提供這次 GitHub 修改紀錄的連結。

## 3. 更新沒有成功時

| 遇到的狀況／錯誤      | 下一步                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| 還是舊照片或舊介紹    | 先回 GitHub 確認修改已儲存到 main，再確認 Cloudflare 最後一筆 Production 成功；不要只重建舊紀錄。 |
| `missing file`        | 檢查原圖是否已上傳、`photo` 路徑與大小寫是否一致；尚未有照片就填 `null`。                         |
| `cannot decode image` | 在電腦上試開圖片，重新上傳完整原圖；不要只修改副檔名。                                            |
| JSON 格式錯誤         | 檢查是否少了雙引號、括號、成員之間的逗號，或最後一項多了逗號。                                    |
| 帳號／CONTACT 錯誤    | 檢查 `username` 是否重複、`links.json` 是否仍有舊帳號、網址是否以 `https://` 開頭。               |
| 語音無法播放          | 確認 MP3 本身能播放、檔案已上傳、`audio` 路徑正確；`null` 表示停用。                              |
| 介紹末尾被省略        | 將 `bio` 縮短到 220 字以內，建議 120–180 字。                                                     |

仍無法排除時，把**修改紀錄連結、失敗訊息與畫面截圖**交給工程人員。

按鈕名稱參考 [GitHub 編輯說明](https://docs.github.com/en/repositories/working-with-files/managing-files/editing-files)、[上傳檔案說明](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)；發布紀錄可參考 [Cloudflare 專案管理說明](https://developers.cloudflare.com/learning-paths/personal-website/pages-setup/git-manage-site/)。
