// ==UserScript==
// @name         中正選課查詢系統
// @namespace    http://tampermonkey.net/
// @version      2024-02-21
// @description  這個使用者腳本為中正大學的選課系統提供了一個查詢功能。它可以讓用戶輸入關鍵字搜索課程信息，並高亮顯示搜索結果。同時，它還會自動更新課程數據庫，以提供最新的課程信息。該腳本使得查找和選擇適合的課程變得更加方便和高效。
// @author       Chang Mao
// @match        https://kiki.ccu.edu.tw/~ccmisp06/Course/index.html
// @match        https://kiki.ccu.edu.tw/~ccmisp06/Course/
// @match        https://kiki.ccu.edu.tw/~ccmisp06/Course/*
// @exclude      https://kiki.ccu.edu.tw/~ccmisp06/Course/*e.html
// @icon         https://www.ccu.edu.tw/var/file/0/1000/img/1331/emblem.png
// ==/UserScript==

(function() {
    'use strict';
    // Your code here...
    document.body.style.overflow = "scroll";
    // === main
    // ---
    const locationURL = new URL(window.location.href);
    const filename = locationURL.pathname.split("/").pop();
    const searchParams = locationURL.searchParams;
    const searchId = searchParams.get("search");
    if(searchId) searchClassDOM(searchId);

    const isInHomePage = filename === "index.html" || filename === "";

    // --- visulization
    const tables = document.querySelectorAll("table");
    const searcherDOM = document.createElement("div");
    let insertBeforeTable = isInHomePage ? tables[1] : tables[0];
    if(isInHomePage){
        tables[1].style.width = "100%";
        tables[1].classList.add("ccu-main-table");
    }

    insertBeforeTable.parentNode.insertBefore(searcherDOM, insertBeforeTable);

    const searcher = new Searcher(searcherDOM,{
        "SHOW_NUM":100,
        "href_key":"url"
    });
    updateDatebase(searcher);
    // --- update
    if(!CCU_class_needUpdate()){
        updateDatebase(searcher)
        console.log("no need to update!");
        return;
    }else{
        if(!isInHomePage) return;
        const all_a_DOMs = [...tables[1].querySelectorAll("a")];
        const all_departments = all_a_DOMs.map(a=>a.innerText);
        const all_links = all_a_DOMs.map(a=>a.href);
        const promises = parseDocFromLinks(all_links, all_departments);
        Promise.all(promises)
        .then(()=>{
            localStorage.clear();
            updateDatebase(searcher);
            console.log("update searcher database!");
        }).catch((e)=>{})
    }

    // === function
    // --- for visulization
    function classInfo2database(info){
        Object.keys(info).forEach(id=>{
            info[id].n = info[id]["科目名稱"];
            info[id].k = [
                `教授:${info[id]["任課教授"]}`,
                `科系:${info[id]["科系"]}`,
                `地點:${info[id]["上課地點"]}`,
                `時間:${info[id]["上課時間"]}`,
                `人數:${info[id]["限修人數"]}`,
                `編號:${info[id]["編號"]}`,
            ];
            if(info[id]["向度"]){
                info[id].k.push(`向度:${info[id]["向度"]}`)
            }
        });

        return info;
    }

    function searchClassDOM(searchText) {
        const rows = document.querySelectorAll('tr');
        let firstMatchFound = false;

        rows.forEach(row => {
            if (row.innerText.includes(searchText)) {
                Array.from(row.cells).forEach(cell => {
                    cell.style.paddingTop = "5px";
                    cell.style.background = "rgba(255,255,0,0.1)";
                    cell.style.boxShadow = "0px 0px 5px rgba(255,100,100,0.5)";
                });

                if (!firstMatchFound) {
                    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstMatchFound = true;
                }
            }
        });
    }

    function updateDatebase(searcher){
        const CCU_class = localStorage.getItem("CCU_class");
        if(!CCU_class) return;
        const classInfo = JSON.parse(CCU_class)["class info"];
        if(!classInfo) return;

        const database = classInfo2database(classInfo);
        if(searcher)searcher.updateDatabase(database);
    }

    // --- for ccu class structure
    function CCU_class_needUpdate(){
        let UPDATE = true;
        let CCU_class = localStorage.getItem("CCU_class");
        if(CCU_class){
            try{
                CCU_class = JSON.parse(CCU_class);
                const last = CCU_class["last update"];
                const now = getTimeString();
                if(last===now) UPDATE=false;
                CCU_class["last update"] = now;
            }catch(e){}
        }else{
            // first init (CCU_class not exist)
            CCU_class = {
                "last update": getTimeString(),
                "class info": {}
            }
        }
        localStorage.setItem("CCU_class", JSON.stringify(CCU_class));
        return UPDATE;
    }

    function parseDocFromLinks(links, departments, maxNum = 1000) {
        let promises = [];

        for (let num = 0; num < links.length && num < maxNum; num++) {
            const url = links[num];
            const department = departments[num];

            let promise = fetchContent(url)
                .then(content => {
                    const classInfo = parseDoc(url, content, department);
                    return classInfo;
                })
                .then(info => {
                    if (!info) return null;
                    saveToLocalStorage(info);
                    return info;
                })
                .catch(error => {
                    console.error(error);
                    return null;
                });

            promises.push(promise);
        }

        return promises
    }


    function saveToLocalStorage(newInfo){
        const CCU_class = JSON.parse(localStorage.getItem("CCU_class"));
        const oldInfo = CCU_class["class info"];
        const info = Object.assign({}, oldInfo, newInfo);
        CCU_class["class info"] = info;
        localStorage.setItem("CCU_class", JSON.stringify(CCU_class));
    }

    function getTimeString() {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始，所以需要加 1
        const day = String(currentDate.getDate()).padStart(2, '0');
        const hours = String(currentDate.getHours()).padStart(2, '0');
        const minutes = String(currentDate.getMinutes()).padStart(2, '0');
        const seconds = String(currentDate.getSeconds()).padStart(2, '0');

        //return`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        // return`${year}-${month}-${day} ${hours}:${minutes}`;
        // return`${year}-${month}-${day} ${hours}`;
        return`${year}-${month}-${day}`;
    }

    function fetchContent(url) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        const content = xhr.responseText;
                        resolve(content);
                    } else {
                        reject(new Error('Failed to fetch content. Status code: ' + xhr.status));
                    }
                }
            };
            xhr.onerror = function() {
                reject(new Error('Failed to make request.'));
            };
            xhr.send();
        });
    }

    function parseDoc(url, stringContent, department){
        const parser = new DOMParser();
        const doc = parser.parseFromString(stringContent, 'text/html');
        const title = doc.querySelector('title').textContent;
        const table = doc.querySelector("table");
        const tr = table.querySelector("tr");
        const tableString = [...tr.querySelectorAll("th")].map(t=>t.innerHTML.trim().replace(/<br>/g,"/")).join("|");
        const tmpDOM = document.createElement("p");
        tmpDOM.innerHTML = tableString;
        const table_titles = tmpDOM.innerText.split("|")

        if(table_titles.length<10) return null;

        const info_template = {};
        for(let title of table_titles){
            info_template[title] = "";
        }

        const result = {};
        table.querySelectorAll('tr').forEach(row => {
            const cells = row.querySelectorAll('td');
            if(!cells.length) return null;

            const info = Object.fromEntries(table_titles.map(title => [title, ""]));
            cells.forEach((cell, index) => {
                const link = (cell.querySelector("a")||{}).href;
                const text = cell.textContent.trim();
                info[table_titles[index]] = text.replace(/\n\s+/g,"/");
                if(text==="link") info[table_titles[index]] = link;
            });
            const id = md5(JSON.stringify(info["編號"]));
            info["科系"] = department;
            info.url = `${url}?search=${info["編號"]}`;
            result[id] = info;
        });
        return result;
    }

    function md5(d){return rstr2hex(binl2rstr(binl_md5(rstr2binl(d),8*d.length))).toLocaleLowerCase()}function rstr2hex(d){for(var _,m="0123456789ABCDEF",f="",r=0;r<d.length;r++)_=d.charCodeAt(r),f+=m.charAt(_>>>4&15)+m.charAt(15&_);return f}function rstr2binl(d){for(var _=Array(d.length>>2),m=0;m<_.length;m++)_[m]=0;for(m=0;m<8*d.length;m+=8)_[m>>5]|=(255&d.charCodeAt(m/8))<<m%32;return _}function binl2rstr(d){for(var _="",m=0;m<32*d.length;m+=8)_+=String.fromCharCode(d[m>>5]>>>m%32&255);return _}function binl_md5(d,_){d[_>>5]|=128<<_%32,d[14+(_+64>>>9<<4)]=_;for(var m=1732584193,f=-271733879,r=-1732584194,i=271733878,n=0;n<d.length;n+=16){var h=m,t=f,g=r,e=i;f=md5_ii(f=md5_ii(f=md5_ii(f=md5_ii(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_ff(f=md5_ff(f=md5_ff(f=md5_ff(f,r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+0],7,-680876936),f,r,d[n+1],12,-389564586),m,f,d[n+2],17,606105819),i,m,d[n+3],22,-1044525330),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+4],7,-176418897),f,r,d[n+5],12,1200080426),m,f,d[n+6],17,-1473231341),i,m,d[n+7],22,-45705983),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+8],7,1770035416),f,r,d[n+9],12,-1958414417),m,f,d[n+10],17,-42063),i,m,d[n+11],22,-1990404162),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+12],7,1804603682),f,r,d[n+13],12,-40341101),m,f,d[n+14],17,-1502002290),i,m,d[n+15],22,1236535329),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+1],5,-165796510),f,r,d[n+6],9,-1069501632),m,f,d[n+11],14,643717713),i,m,d[n+0],20,-373897302),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+5],5,-701558691),f,r,d[n+10],9,38016083),m,f,d[n+15],14,-660478335),i,m,d[n+4],20,-405537848),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+9],5,568446438),f,r,d[n+14],9,-1019803690),m,f,d[n+3],14,-187363961),i,m,d[n+8],20,1163531501),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+13],5,-1444681467),f,r,d[n+2],9,-51403784),m,f,d[n+7],14,1735328473),i,m,d[n+12],20,-1926607734),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+5],4,-378558),f,r,d[n+8],11,-2022574463),m,f,d[n+11],16,1839030562),i,m,d[n+14],23,-35309556),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+1],4,-1530992060),f,r,d[n+4],11,1272893353),m,f,d[n+7],16,-155497632),i,m,d[n+10],23,-1094730640),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+13],4,681279174),f,r,d[n+0],11,-358537222),m,f,d[n+3],16,-722521979),i,m,d[n+6],23,76029189),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+9],4,-640364487),f,r,d[n+12],11,-421815835),m,f,d[n+15],16,530742520),i,m,d[n+2],23,-995338651),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+0],6,-198630844),f,r,d[n+7],10,1126891415),m,f,d[n+14],15,-1416354905),i,m,d[n+5],21,-57434055),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+12],6,1700485571),f,r,d[n+3],10,-1894986606),m,f,d[n+10],15,-1051523),i,m,d[n+1],21,-2054922799),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+8],6,1873313359),f,r,d[n+15],10,-30611744),m,f,d[n+6],15,-1560198380),i,m,d[n+13],21,1309151649),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+4],6,-145523070),f,r,d[n+11],10,-1120210379),m,f,d[n+2],15,718787259),i,m,d[n+9],21,-343485551),m=safe_add(m,h),f=safe_add(f,t),r=safe_add(r,g),i=safe_add(i,e)}return Array(m,f,r,i)}function md5_cmn(d,_,m,f,r,i){return safe_add(bit_rol(safe_add(safe_add(_,d),safe_add(f,i)),r),m)}function md5_ff(d,_,m,f,r,i,n){return md5_cmn(_&m|~_&f,d,_,r,i,n)}function md5_gg(d,_,m,f,r,i,n){return md5_cmn(_&f|m&~f,d,_,r,i,n)}function md5_hh(d,_,m,f,r,i,n){return md5_cmn(_^m^f,d,_,r,i,n)}function md5_ii(d,_,m,f,r,i,n){return md5_cmn(m^(_|~f),d,_,r,i,n)}function safe_add(d,_){var m=(65535&d)+(65535&_);return(d>>16)+(_>>16)+(m>>16)<<16|65535&m}function bit_rol(d,_){return d<<_|d>>>32-_}
})();