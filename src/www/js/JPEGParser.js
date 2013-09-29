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

		_read: function( data, start, count, big_endian ) {
			var v = this._readBytes( data, start, count, big_endian ),
				result = 0,
				i = 0;

			for( i in v ) {
				result = ( result << 8 ) + v[i];
			}

			return result;
		},

		_read32: function( data, start, big_endian ) {
			return this._read( data, start, 4, big_endian );
		},

		_read16: function( data, start, big_endian ) {
			return this._read( data, start, 2, big_endian );
		},

		_read8: function( data, start, big_endian ) {
			return data[start];
		},

		_readBytes: function( data, start, count, big_endian ) {
			var v = [];

			while( count-- )
				v.push( data[start++] );

			if( big_endian )
				v.reverse();

			return v;
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
			var self = this,
				initial_byte = start+6,
				big_endian = data[initial_byte] == 0x49,
				i = initial_byte + 2 + 2, // MM + TIFF Header
				first_data = this._read32( data, i, big_endian ),

				parse = function( data, start, headerOffset, length, result, group ) {
					var count = self._read16( data, start, big_endian );
					start += 2;

					return readTags( data, start, headerOffset, count, result || [], group );
				},

				readTags = function( data, start, headerOffset, count, result, group ) {
					var j = 0;

					for( j=0; j<count; j++ ) {

						tag = readTag( data, start, headerOffset );
						t = new EXIFTag( tag.id, tag.type, tag.components, tag.value, group || 'Exif' );
						result.push( t );

						/**
						 * GPS Tags
						 */
						if( t._id == 0x8825 ) {
							parse( data, headerOffset+t.value(), headerOffset, length-t.value, result, 'GPS' );
						}

						/**
						 * ExifOffset
						 */
						if( t._id == 0x8769 ) {
							var offset = t.value();
							parse( data, headerOffset+offset, headerOffset, length-offset, result, 'Exif' );
						}

						start += 12;
					}

					return result;
				},

				readTag = function( data, start, headerOffset ) {
					var tag = {
							id: self._read16( data, start, big_endian),
							type: self._read16( data, start+2, big_endian),
							components: self._read32( data, start+4, big_endian),
							length: 0,
							valueOffset: 0,
							value: []
						};

					start += 8;

					tag.length = tag.components;

					if( tag.type == 3 )
						tag.length *= 2;

					if( tag.type == 4 || tag.type == 9 )
						tag.length *= 4;

					if( tag.type == 5 || tag.type == 10 )
						tag.length *= 8;

					// Values could be embeded where we would expect the offset to be.
					if( tag.length <= 4 ) {
						tag.value = self._readBytes( data, start, 4, big_endian );
						start += 4;
					} else {
						tag.valueOffset = self._read32( data, start, big_endian );
						start += 4;

						tag.value = self._readBytes( data, headerOffset+tag.valueOffset, tag.length, false );
					}

					return tag;
				}

			i += 4; // count

			return parse( data, initial_byte+first_data, initial_byte, length-( initial_byte - start ) );
		}
	}

};