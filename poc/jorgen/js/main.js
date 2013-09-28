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
			console.log( e );
			parseData( e.currentTarget.result );
		}

		reader.readAsArrayBuffer( file );
	}

	function parseData( data ) {
		data = new Uint8Array( data );
		var length = data.length;
		var skip = 0;
		var i = 0;
		var b = 0;
		var next = 0;

		for( i=0; i<length; i++ ) {
			b = ( b << 8 ) & 0xFFFF; // shift byte, truncate data
			b += data[i]; // add new data;

			if( i == 100 )
				return;

			//console.log( i, b );

			if( b >= 0xFFD8 && b <= 0XFFFE ) {
				console.log( 'marker found', b.toString(16) );
				if( b == 0xFFD8 )
					continue;
				if( b == 0xFFD9 )
					continue;
				if( b >= 0xFFD0 && b <= 0xFFD7 )
					continue;
				if( b == 0xFFDD ) {
					i++;
					continue;
				}

				if( b == 0xFFE1 && next == 1 )
					break;

				if( b == 0xFFE1 && next < 1 )
					next++;

				skip = ( data[i+1] << 8 ) + data[i+2] + 2;
				i += skip - 1;
			}
		}

		if( typeof data[i] == 'undefined' )
			return;

		skip = ( data[i+1] << 8 ) + data[i+2] - 2;

		i+=3;

		s = '';
		var i2 = 0;
		console.log( 'skip', skip );
		for( ; skip--; i++ ) {
			s += String.fromCharCode( data[i] );
		}

		console.error( s );

		s = s.substring( s.indexOf( '<' ) );

		var parser = new DOMParser();
		xmlDoc = parser.parseFromString( s, 'text/xml' );

		console.info( xmlDoc );
	};
}());