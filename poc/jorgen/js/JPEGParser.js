/**
 * Parses JPEG file format
 */
var JPEGParser = function() {
	this._listeners = {};
	this.on( 'marker', this._onregion.bind( this ) );
};

JPEGParser.prototype = {

	_listeners: null,

	on: function( e, listener ) {
		if( !this._listeners[e] )
			this._listeners[e] = [];

		this._listeners[e].push( listener );
	},

	trigger: function() {
		var arg = [].slice.call( arguments, 0 ),
			e = arg.shift(),
			i = 0,
			listeners = this._listeners[ e ];

		for( i in listeners ) {
			listeners[i].apply( null, arg );
		}
	},

	/**
	 * Parse a binary buffer that contains a JPEG
	 * 
	 * @param  Uint8Array data
	 */
	parse: function( /* Uint8Array */ data ) {
		var length = data.length,
			skip = 0,
			i = 0,
			b = 0;

		for( i=0; i<length; i++ ) {
			b = ( b << 8 ) & 0xFFFF; // shift byte, truncate data
			b += data[i]; // add new data;

			// Valid markers
			if( b >= 0xFFD8 && b <= 0XFFFE ) {
				if( b == 0xFFD8 ||
					b == 0xFFD9 ||
					( b >= 0xFFD0 && b <= 0xFFD7 ) ||
					b == 0xFFDD ) {
					this.trigger( 'marker', b, data, i+1, 0 );
					continue;
				}

				skip = ( data[i+1] << 8 ) + data[i+2];

				this.trigger( 'marker', b, data, i+3, skip-2 );

				i += skip - 1 + 2;
			}
		}
	},

	/**
	 * Parses the block followed by the marker.
	 * 
	 * @param  int marker 
	 * @param  Uint8Array data
	 * @param  int start 
	 * @param  int length 
	 */
	_onregion: function( marker, data, start, length ) {
		if( marker == 0xFFE1 ) {
			var id = '';
			id += String.fromCharCode( data[start] ) +
				String.fromCharCode( data[start+1] ) +
				String.fromCharCode( data[start+2] ) +
				String.fromCharCode( data[start+3] );

			/**
			 * Event argument format
			 *
			 * @param mixed data Data as returned by parser.
			 * @param object raw Raw data. ( buffer, start, length );
			 */

			if( id == 'Exif' )
				return this.trigger( 'exif', this._parsers.exif( data, start, length ), {
					data: data,
					start: start,
					length: length
				});

			if( id == 'http' )
				return this.trigger( 'xmp', this._parsers.xmp( data, start, length ), {
					data: data,
					start: start,
					length: length
				});

			return;
		}
	},

	_parsers: {
		/**
		 * Parses XMP data
		 * 
		 * @param  Uint8Array   Data Binary image.
		 * @param  int start    First byte offset
		 * @param  int length   Length of region
		 * @return DOMDocument  XML DOM Documenten of XMP data
		 */
		xmp: function( data, start, length ) {
			var s = '',
				i = 0,
				dom = new DOMParser();

			for( i=0; i<length; i++ ) {
				s += String.fromCharCode( data[start+i] );
			}

			s = s.substring( s.indexOf( '<' ) );

			var domDocument = dom.parseFromString( s, 'text/xml' );
			return new XMPDocument(domDocument);
		},

		/**
		 * Parses Exif data
		 * 
		 * @param  Uint8Array   Data Binary image.
		 * @param  int start    First byte offset
		 * @param  int length   Length of region
		 * @return Object 		Key-value pairs of data
		 */
		exif: function( data, start, length ) {
			var i = 6 + 2 + 2, // Exif\0\0 + MM + TIFF header
				initial_byte = start+6, // Header start
				first_data = ( data[start+i++] << 24 ) +
					( data[start+i++] << 16 ) +
					( data[start+i++] << 8 ) +
					data[start+i++],
				initial_data = initial_byte + first_data;

				count = ( data[initial_data] << 8 ) + data[initial_data+1];

				i = initial_data+2,
				j = 0,
				x = 0,
				tag = {},
				result = [];

			for( j=0; j<count; j++ ) {
				tmpstring = '';
				tag = {
					id: ( data[i++] << 8 ) + data[i++],
					type: ( data[i++] << 8 ) + data[i++],
					components: ( data[i++] << 24 ) +
						( data[i++] << 16 ) +
						( data[i++] << 8 ) +
						data[i++],
					valueOffset: ( data[i++] << 24 ) +
						( data[i++] << 16 ) +
						( data[i++] << 8 ) +
						data[i++],
					value: []
				};

				if( tag.type == 3 )
					tag.components *= 2;

				if( tag.type == 4 )
					tag.components *= 4;

				if( tag.type == 5 )
					tag.components *= 8;

				for( x=0; x<tag.components; x++ ) {
					tag.value.push( data[initial_byte+tag.valueOffset+x]);
				}
				result.push( new EXIFTag( tag.id, tag.type, tag.value ) );
			}

			return result;
		}
	}

};