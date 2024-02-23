# CCU course searcher

> 應用名稱：CCU course searcher（中正課程查詢系統）
> 應用頁面：https://kiki.ccu.edu.tw/~ccmisp06/Course/
> 瀏覽器：<img src="https://www.google.com/chrome/static/images/chrome-logo.svg" height="20pt">**Chrome**
> 應用主旨：用於幫助課程查詢，並沒有任何的自動選課、搶課功能。

## 安裝方法

> PS：由於 Google 的功能還位於審核階段，所以還在未在Chrome應用程式中上架。

**開啟開發人員模式**：

1. 使用瀏覽器Chrome，並進入擴充功能頁面 [chrome://extensions/](chrome://extensions/)

    ![](https://github.com/Jeffreymaomao/ccu-course-searcher/raw/main/assets/chrome_extension.png)

2. 點擊開啟右上方開發人員模式，（<img src="https://github.com/Jeffreymaomao/ccu-course-searcher/raw/main/assets/dev_close.png" height="13pt"> ➡ <img src="https://github.com/Jeffreymaomao/ccu-course-searcher/raw/main/assets/dev_open.png" height="13pt">），此時頁面會出現

    ![](https://github.com/Jeffreymaomao/ccu-course-searcher/raw/main/assets/chrome_extension_dev.png)

**載入擴充功能**：

1. 下載擴充供能：https://github.com/Jeffreymaomao/ccu-course-searcher/releases/download/v1.0.0/app.zip

2. 解壓縮 `app.zip` 檔案，變成資料夾 `app/` ，並將資料夾放在固定的位置（或任何喜歡的位置）。

3. 載擴充功能最左邊會有「載入未封裝項目」按鈕，點擊並選擇剛剛的資料夾 `app` 

    ![](https://github.com/Jeffreymaomao/ccu-course-searcher/raw/main/assets/open_folder.png)

4. 載入成功後會出現

    ![](https://github.com/Jeffreymaomao/ccu-course-searcher/raw/main/assets/loaded.png)

## 使用方法

進入 [國立中正大學課程表](https://kiki.ccu.edu.tw/~ccmisp06/Course/) 後就會從原本的網頁（左圖）變成載入後的結果（右圖）：
 <img src="https://github.com/Jeffreymaomao/ccu-course-searcher/raw/main/assets/ccu_original.png" width="45%"> <img src="https://github.com/Jeffreymaomao/ccu-course-searcher/raw/main/assets/ccu_loaded.png" width="45%" align="right">


- 底下是原始的表格，但由於原始的網頁架構有些許的複雜，因此我有更改一些外觀。

- 上方會有一行可以打字的輸入框，可以輸入一些關鍵字進行搜尋。
    > 輸入方法，選擇一種方式查詢：
    >
    > - 名稱：`國文`、`英文`、`藝術`、`分子`、`流體`、...
    > - 科系：`科系:物理`、`科系:數學`、`科系:資工`、`科系:通識中心`、...
    > - 地點：`地點:物理館`、`地點:數學館`、`地點:數學館`、`地點:工學院`、...
    > - 教授：`教授:<教授名稱>`
    > - 向度：`向度:<向度名稱>` （這裡還沒辦法直接輸入1,2,3,4,5，我之後改進😖）
    > - 人數：`人數:<50>`、`人數:<40>`,...（這沒必要，但就是可以這樣搜尋）
    >
    > PS: 出現的卡片資訊上，有出現的文字都可以搜尋的到。

- 搜尋結果後會出現包含搜尋文字的資訊卡片，點擊後，會自動跳轉到該頁面課程位置，如圖
    <img src="https://github.com/Jeffreymaomao/ccu-course-searcher/raw/main/assets/search_1.png" width="45%"> <img src="https://github.com/Jeffreymaomao/ccu-course-searcher/raw/main/assets/search_2.png" width="45%" align="right">

> 如果有任何問題，歡迎聯繫我：notetreerepository@gmail.com

## 網頁應用程式開發

- 平常要查想要上的課都很麻煩，學校的網頁又非常難瀏覽、查詢。例如我現在想要上有關流體力學的課程，我只能找尋有相關的科系點進去查詢，使用其他查詢系統又非常麻煩，不知道有沒有開這堂課，所以我才會開發這個應用程式。
- 這個搜尋的功能我是直接從我另外一個正在開發的 `JavaScript` 應用複製過來，所以其實還沒有很完善，但能用就好。
- 這個應用程式原本是使用`UserScript`來做開發，並借助 TamperMonkey 來使用，但後來為了讓一般人更容易使用，我才改用 Google 的擴充功能。