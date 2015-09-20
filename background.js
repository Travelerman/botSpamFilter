(function() {
	var getElement = function(html) {
		var el = document.createElement("div");
		el.innerHTML = html;
		return el.firstChild;
	},
	blackList = {
		size: { width: 200, height: 200},
		list: [],
		load: function() {
			var list,
				$this = this;
			chrome.storage.sync.get("data", function(object){
				try {
					$this.list = object.data.list || [];
					$this.enabled = object.data.enabled == true;
				} catch(e) {
					$this.list = [];
				}
				if (!($this.list instanceof Array)) {
					$this.list = [];
				}
				$this.render();
			});
		},
		save: function() {
			var enabled = document.getElementById("blackList.enabled").checked == true;
			chrome.storage.sync.set({'data': {list: this.list, enabled: enabled}});
		},
		init: function() {
			this.load();
			this.work();
		},
		add: function(name) {
			if (name != null && name.replace(/ /g, "") != "") {
				this.list.push(name);
				this.renderItems();
			}
			this.save();
		},
		remove: function(index) {
			this.list.splice(index, 1);
			this.renderItems();
			this.save();
		},
		render: function() {
			var el,
				$this = this,
				html = [
					"<div id='blackList.Container' style='z-index:9999;background-color:white;width:" + this.size.width + "px;height:" + this.size.height +"px;position:absolute;top:0px;left:0px;border:solid 1px gray;'>",
					"<div style='width:100%;height:20px;background-color:#bababa;'><span style='padding:2px 2px;display:block;'>Черный список</span></div>",
					"<div style='width:100%;'><input type='checkbox' id='blackList.enabled' value='on/off'/><span style=''>Включить/выключить</span></div>",
					"<input type='text' id='blackList.input' style='width:" + (this.size.width - 30) + "px'/><input type='button'  id='blackList.button.add' style='width:20px' value='+'>",
					"<div style='width:100%;height:" + (this.size.height - 60) + "px;overflow-y:auto;overflow-x: hidden;white-space:nowrap;' id='blackList.items'></div>",
					"</div>"
					].join(""),
				buttonAdd,
				checkBox;
			el = document.getElementById("blackList.Container");
			if (el) {
				document.body.removeChild(el);
			}
			document.body.appendChild(getElement(html))
			buttonAdd = document.getElementById("blackList.button.add");
			buttonAdd.onclick = function() {
				var name = document.getElementById("blackList.input");
				$this.add(name.value);
			}
			checkBox = document.getElementById("blackList.enabled");
			checkBox.onclick = function() {
				$this.save();
			}
			document.getElementById("blackList.enabled").checked = this.enabled == true;
			this.renderItems();
		},
		renderItems: function() {
			var elItems = document.getElementById("blackList.items"),
				html = "",
				$this = this;
			for(var index = 0; index < this.list.length; index++) {
				html += "<div style='inline-block;width:100%; padding:5px 0px 0px 0px;' ><input style='' type='button' style='width:20px;' value=' - ' index='" + index + "'/><span style='height:20px'>" + this.list[index] + "</span></div>";
			};
			elItems.innerHTML = html;		
			elItems.onclick = function(el) {
				var attr = el.target.getAttribute("index");
				if (attr != null) {
					$this.remove(parseInt(attr));
				}
			}
		},
		work: function() {
			var $this = this, timeout = 200;
			try {
				var	elements = document.querySelectorAll(".commentUsername"),	
					blocked = document.querySelectorAll("[blocked='1']"),	
					el,
					enabled = false,
					hash = {};
				el = document.getElementById("blackList.enabled");
				if (el) {
					enabled = el.checked == true;
				}
				for(var index = 0; index < this.list.length; index++) {
					hash[this.list[index].trim()] = true;
				}
				for(var index = 0; index < blocked.length; index++) {
					if (!(blocked[index].text in hash) || !enabled) {
						blocked[index].parentNode.parentNode.style.cssText = "";
						blocked[index].setAttribute("blocked", "0");
					}
				}
				for(var index = 0;enabled && index < elements.length; index++) {
					if (String(elements[index].text).trim() in hash) {
						elements[index].parentNode.parentNode.style.cssText = "display:none;";
						elements[index].setAttribute("blocked", "1");
					}
				}
			} catch(e) {};
			setTimeout(function() {
				$this.work();
			}, timeout);
		}
	};
	blackList.init();
})();
