XMPDocument = function(document) {
	this._document = document;
}

XMPDocument.prototype = {

	_defaultTagName: 'rdf:UltraTag',
	_document: null,

	set: function(key, value, tag) {
		var tag = tag || this._defaultTagName;
		var element = this.fetchElement(tag);
		element.setAttribute(key, this.serializeValue(value));
	},

	get: function(key, tag) {
		var tag = tag || this._defaultTagName;
		key = key || null;
		element = this.fetchElement(tag);

		console.log( element );

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
		var children = this._document.children[0].children[0].children;

		// Search ultratag
		for(var idx in children) {
			var element = children[idx];
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
		return value.length > 0 && value[0] == '{';
		return /^[\],:{}\s]*$/.test(value.replace(/\\["\\\/bfnrtu]/g, '@').
			replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
			replace(/(?:^|:|,)(?:\s*\[)+/g, '')) ? true : false;
	}

}