XMPDocument = function() {

}

XMPDocument.prototype = {

	_document: null,

	addChild: function(key, value) {
		console.log(this._document, key, value);
	}

}