console.log("beutify");

function waitForElement(selector, intervalTime = 100) {
    return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) {
                clearInterval(interval);
                resolve(element);
            }
        }, intervalTime);

        setTimeout(() => {
            clearInterval(interval);
            reject(new Error('Element did not appear within the allowed time.'));
        }, 20000);
    });
}

function removeFontTagsAndRebuild(element) {
    // 检查元素是否为文本
    if (element.nodeType === 3) {
        const textContent = element.textContent.trim().replace(/\s+/g, " ");
        // 如果处理后的文本只包含空格，或者文本长度超过20个字符，则不处理
        if (textContent === "" || textContent === " ") {
            return element.cloneNode(true);
        }
        // 创建一个没有链接的<a>标签来包裹文本
        var wrapper = document.createElement('a');
        var textFont = document.createElement('font');
        textFont.size = 2;
        wrapper.href = 'javascript:void(0);'; // 使链接不跳转
        wrapper.grabable = false;
        wrapper.className = 'no-link'; // 添加.no-link类
        textFont.textContent = textContent;
		wrapper.appendChild(textFont);
        return wrapper;

    } else if (element.tagName === 'A') {
        // 直接返回<a>标签的克隆
        return element.cloneNode(true);
    }
    // 获取所有子元素
    var children = Array.from(element.childNodes);
    var newElement = document.createDocumentFragment();
    for (var child of children) {
        // 递归处理每个子元素
        var processedChild = removeFontTagsAndRebuild(child);
        if (processedChild) {
            newElement.appendChild(processedChild);
        }
    }
    return newElement;
}



waitForElement('.ccu-main-table', 100).then(table => {
	table.querySelectorAll('td').forEach((td)=>{
	    const processedContent = removeFontTagsAndRebuild(td);
	    const container = document.createElement('div');
	    td.innerHTML = '';
	    container.classList.add("link-container")
	    td.appendChild(container);
	    container.appendChild(processedContent);
	});
    table.querySelectorAll('th').forEach((th)=>{
        th.bgColor = "";
    });
}).catch(error => {
    console.error(error);
});
