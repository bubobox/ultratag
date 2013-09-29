
(function() {
	var zone = document.querySelector( '#dropzone' );

	zone.addEventListener( 'drop', function( e ) {
		var files = e.dataTransfer.files,
			count = files.length;

		//for( i=0; i<count;i++ )
			//console.log( files[i] );

		e.preventDefault();
		e.cancel = true;

		window.f = files[0];

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
				console.error( data[i].key, data[i].value() );
		})

		parser.parse( data );

		var writer = new JPEGWriter();

		writer.on( 'xmp', function( doc ) {
			doc.set('test', 'Hello');

			var xml = (new XMLSerializer()).serializeToString(doc._document);
			xml = 'http://ns.adobe.com/xap/1.0/' + xml;

			var buf = new Uint8Array( xml.length );
			for( i=0; i<xml.length; i++ ) {
				buf[i] = xml.charCodeAt(i);
			}

			return buf;
		});

		document.getElementsByTagName('div')[0].innerHTML =
			'<a download="image.jpeg" href="' + writer.parse( data ) + '">click here to download</a>';
	};
}());
