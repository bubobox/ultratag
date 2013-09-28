var EXIFTag = function( id, type, value ) {
	this._id = id;
	this.key = EXIFKeys[ id ];
	this._type = type;
	this._value = value;
};

EXIFTag.prototype = {
	
	key: null,

	value: function() {
		if( this._type == 1 )
			return this._value[0];

		if( this._type == 2 )
			return this._value.map(function(c){return String.fromCharCode(c);}).join('');

		if( this._type == 3 )
			return ( this._value[0] << 8 ) + this._value[1];

		if( this._type == 4 )
			return ( this._value[0] << 24 ) +
				( this._value[1] << 16 ) +
				( this._value[2] << 8 ) +
				this._value[3];

		if( this._type == 5 ) {
			var numerator = ( this._value[0] << 24 ) +
				( this._value[1] << 16 ) +
				( this._value[2] << 8 ) +
				this._value[3];

			var denumerator = ( this._value[4] << 24 ) +
				( this._value[5] << 16 ) +
				( this._value[6] << 8 ) +
				this._value[7];

			return numerator / denumerator;
		}

		throw new 'Not supported, sorry';
	}
};

/**
 * http://www.exiv2.org/tags.html
 * http://www.sno.phy.queensu.ca/~phil/exiftool/TagNames/EXIF.html#LightSource
 * 
 * @type {Object}
 */
var EXIFKeys = {
	0x000B: 'ProcessingSoftware',
	0x0100: 'ImageWidth',
	0x0101: 'ImageLength',
	0x0103: 'Compression',
	0x0131: 'Software',
	0x0132: 'DateTime',
	0x0102: 'BitsPerSample',
	0x0106: 'PhotometricInterpretation'
};