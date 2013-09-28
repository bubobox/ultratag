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
		var length = data.length;
		var skip = 0;
		var i = 0;
		var b = 0;

		for( i=0; i<length; i++ ) {
			b = ( b << 8 ) & 0xFFFF; // shift byte, truncate data
			b += data[i]; // add new data;

			if( b >= 0xFFD8 && b <= 0XFFFE ) {
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

				if( b == 0xFFE4 )
					break;

				skip = ( data[i+1] << 8 ) + data[i+2] + 2;
				i += skip - 1;
			}
		}

		skip = ( data[i+1] << 8 ) + data[i+2] + 2;

		i += 2;

		string = '';
		for( ; skip--; i++ ) {
			string += String.fromCharCode( data[i] );
		}

		console.log( string );
	};
}());