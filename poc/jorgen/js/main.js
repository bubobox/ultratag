
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
			
			// Set example
			data.set('test', 'hello');
			data.set('names', ['Jorgen', 'Wim', 'Stefan', 'Joris']);
			data.set('user', {
				name: 'Jef',
				age: 28
			});

			
			// Get example 
			//data.get('user')
		});
		parser.on( 'exif', function( data ) {
			var i = 0;
			for( i in data )
				console.log( data[i]._id.toString(16), data[i].key, data[i].value() );
		})

		parser.parse( data );
	};
}());
