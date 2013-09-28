
(function() {
	var zone = document.querySelector( '#dropzone' );

	zone.addEventListener( 'drop', function( e ) {
		var files = e.dataTransfer.files,
			count = files.length;

		for( i=0; i<count;i++ )
			console.log( files[i] );

		e.preventDefault();
		e.cancel = true;

		readFile( files[0] );
	});

	zone.addEventListener( 'dragover', function( e ) {
		zone.style.background = 'yellow';
		e.preventDefault();
	});

	function readFile( file ) {
		var reader = new FileReader();

		reader.onloadend = function( e ) {
			parseData( e.currentTarget.result );
		}

		reader.readAsArrayBuffer( file );
	}

	function parseData( data ) {
		data = new Uint8Array( data );

		var parser = new JPEGParser();
		parser.on( 'xmp', function( data, start, length ) {
			var s = '',
				i = 0,
				dom;

			for( i=0; i<length; i++ ) {
				s += String.fromCharCode( data[start+i] );
			}

			s = s.substring( s.indexOf( '<' ) );

			dom = new DOMParser();
			doc = dom.parseFromString( s, 'text/xml' );
			console.log( doc );
		});

		parser.parse( data );
	};
}());

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

	_onregion: function( marker, data, start, length ) {
		if( marker == 0xFFE1 ) {
			var id = '';
			id += String.fromCharCode( data[start] ) +
				String.fromCharCode( data[start+1] ) +
				String.fromCharCode( data[start+2] ) +
				String.fromCharCode( data[start+3] );

			if( id == 'Exif' )
				return this.trigger( 'exif', data, start, length );

			if( id == 'http' )
				return this.trigger( 'xmp', data, start, length );

			return;
		}
	}

};

XMPDocument = function() {
	
}