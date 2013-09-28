
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
			
			XMP = new XMPDocument(data);
			console.error(XMP, data);
			XMP.set('test', 'hello');
			XMP.set('names', ['Jorgen', 'Wim', 'Stefan', 'Joris']);
			XMP.set('user', {
				name: 'Jef',
				age: 28
			});
			console.error(XMP.get('user'));
		});

		parser.parse( data );
	};
}());
