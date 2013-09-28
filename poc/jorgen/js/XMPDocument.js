XMPDocument = function(document) {
	this._document = document;
}

XMPDocument.prototype = {

	_document: null,

	set: function(key, value) {
		var element = this.fetchElement('rdf:UltraTag');
		element.setAttribute(key, this.serializeValue(value));
	},

	get: function(key) {
		key = key || null;
		element = this.fetchElement('rdf:UltraTag');

		if( ! element) {
			return {};
		}

		var attributes = element.attributes;
		var data = {};
		for(var idx in attributes) {
			var item = attributes[idx];
			var dataKey = item.nodeName;
			var dataValue = item.nodeValue;
			if(dataKey !== undefined) {
				data[dataKey] = this.unserializeValue(dataValue);
			}
		}

		if(key === null) {
			return data;
		} else {
			if(data.hasOwnProperty(key)) {
				return data[key];
			}
		}

		return null;
	},

	fetchElement: function(name) {

		// Search ultratag
		for(var idx in this._document.children[0].children[0].children) {
			var element = this._document.children[0].children[0].children[idx];
			if(element.tagName === name) {
				return element;
			}
		}

		newy = this._document.createElement(name);
		this._document.children[0].children[0].appendChild(newy);
		return newy; 
	},

	serializeValue: function(value) {
		if(typeof value === "object") {
			value = JSON.stringify(value);
		}
		return value;
	},

	unserializeValue: function(value) {
		if(this.isJSON(value)) {
			return JSON.parse(value);
		} else {
			return value;
		}
	},

	isJSON: function(value) {
		return /^[\],:{}\s]*$/.test(value.replace(/\\["\\\/bfnrtu]/g, '@').
			replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
			replace(/(?:^|:|,)(?:\s*\[)+/g, '')) ? true : false;
	}

}