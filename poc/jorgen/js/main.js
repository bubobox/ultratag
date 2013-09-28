
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
			
			XMP = data;
			console.log(data);
			data.set('test', 'hello');
			data.set('names', ['Jorgen', 'Wim', 'Stefan', 'Joris']);
			data.set('user', {
				name: 'Jef',
				age: 28
			});
			console.error(data.get('user'));
		});

		parser.parse( data );
	};
}());
