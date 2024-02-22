class Searcher {
	constructor(DOMparent, config){
		this.database = config.database||{};
		this.SHOW_NUM = config.SHOW_NUM||40;
		this.href_key = config.href_key||null;
		// ---
		this.updateDatabase(this.database)
		this.initializeDOM(DOMparent);
		this.createEventListener();

		// console.log(`Start time : ${new Date()}`);
	}
	initializeDOM(parentNode){
		this.dom = {};
		this.dom.parent = parentNode;
		this.dom.parent.classList.add("app");

		this.dom.container = this.createAndAppendElement(parentNode, "div", {
			class: "searcher-container"
		});

		this.dom.seacher = this.createAndAppendElement(this.dom.container, "div", {
			class: "searcher"
		});

		this.dom.input = this.createAndAppendElement(this.dom.seacher, "input", {
			class: "searcher-input",
			placeholder: "keywords..."
		});

		this.dom.cardsContainer = this.createAndAppendElement(this.dom.container, "div", {
			class: "cards-container"
		});

		this.dom.input.focus();
	}
	updateDatabase(database){
		this.database = database;
		this.TOTAL_NUM = Object.keys(this.database).length;
	}
	addMark(text, mark){
		const regex = new RegExp(mark, 'gi');
	    text = text.replace(/(<mark>|<\/mark>)/gim, '');
	    return text.replace(regex, '<mark>$&</mark>');
	}
	createCard(parentDOM, item, search=null){
		const url = item.k.join("/");
		let link_href;
		if(!this.href_key){
			link_href = "#";
		}else{
			link_href = item[this.href_key]||"#";
		}

		const card = this.createAndAppendElement(parentDOM, "a", {
			class: "card",
			href: link_href,
		});

		const card_container = this.createAndAppendElement(card, "div", {
			class: "card-container",
		});

		const title = this.createAndAppendElement(card_container, "h4", {
			class: "card-title",
			innerText: `${item.n}`,
		});

		const keys = this.createAndAppendElement(card_container, "p", {
			class: "card-keys",
			innerText: `${url}`,
		});

		if (search) {
		    title.innerHTML = this.addMark(title.innerHTML, search);
		    keys.innerHTML = this.addMark(keys.innerHTML, search);
		}

		return card;
	}
	createAndAppendElement(parent, tag, attributes = {}) {
	    const element = document.createElement(tag);

	    // class 
	    if (attributes.class) {
	        attributes.class.split(" ").forEach(className => element.classList.add(className));
	        delete attributes.class;  // delete class in attributes
	    }
	    // dataset
	    if (attributes.dataset) {
	        Object.keys(attributes.dataset).forEach(key => element.dataset[key] = attributes.dataset[key]);
	        delete attributes.dataset;  // delete dataset in attributes
	    }
	    // other attributes
	    Object.keys(attributes).forEach(key => element[key] = attributes[key]);

	    parent.appendChild(element);
	    return element;
	}
	search(e){
		const text = e.target.value.trim();
		if(!text){
			this.dom.cardsContainer.innerHTML = "";
			return;
		}

		const fragment = document.createDocumentFragment();
		const items = Object.values(this.database);
		var n = 1;
		for(let item of items){
            if (this.parseKeyword(text, item)) {
            	this.createCard(fragment, item, text);
            	if(++n >= this.SHOW_NUM) break;
            }
        };

        this.dom.cardsContainer.innerHTML = "";
        this.dom.cardsContainer.appendChild(fragment);
	}
	createEventListener(){
		if(this.dom.input && this.search){
			this.search = this.search.bind(this);
			this.dom.input.addEventListener("input",this.search);
		}
	}
	parseKeyword(inputText, item){
		const texts = inputText.toLowerCase().split(",");
		const text1 = texts[0];
		const text2 = texts[1];
		// --- exist text 2
		// if(text2){
		// 	console.log(text2)
		// }
		// ---
		const title = item.n||"";
		const keys = item.k||[];
		if(title.toLowerCase().includes(text1)) return true;
		for(let key of keys){
			if(key.toLowerCase().includes(text1)) return true;
		}
		return false;
	}
}

window.Searcher = Searcher;