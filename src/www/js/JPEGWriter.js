var JPEGWriter = function() {
	JPEGParser.call( this );
};

JPEGWriter.prototype = new JPEGParser();

JPEGWriter.prototype.parse = function( data ) {
	var length = data.length,
		buffer = [],
		result = null,
		skip = 0,
		arr = null,
		i = 0,
		j = 0,
		b = 0;

	for( i=0; i<length; i++ ) {
		b = ( b << 8 ) & 0xFFFF; // shift byte, truncate data
		b += data[i]; // add new data;

		arr = new Uint8Array( 1 );
		arr[0] = data[i];
		buffer.push( arr );

		// Valid markers
		if( b >= 0xFFD8 && b <= 0XFFFE ) {
			if( b == 0xFFD8 ||
				b == 0xFFD9 ||
				( b >= 0xFFD0 && b <= 0xFFD7 ) ||
				b == 0xFFDD ) {
				continue;
			}

			skip = ( data[i+1] << 8 ) + data[i+2];

			result = this.trigger( 'marker', b, data, i+3, skip-2 );
			
			if( !result )
				result = data.subarray( i+3, i+skip+1 );

			skip = result.length + 2;
			arr = new Uint8Array( skip );
			arr[0] = ( skip >> 8 ) & 0xFF;
			arr[1] = skip & 0xFF;		

			for( j=2; j<skip; j++ ) {
				arr[j] = result[j-2];
			}

			buffer.push( arr );

			i += skip;
		}
	}

	return URL.createObjectURL(new Blob( buffer, {type:'image/jpeg'})) + '/image.jpg';
}

JPEGWriter.prototype.trigger = function() {
	var arg = [].slice.call( arguments, 0 ),
		e = arg.shift(),
		i = 0,
		listeners = this._listeners[ e ],
		result = null;

	for( i in listeners ) {
		result = listeners[i].apply( null, arg );
	}

	return result;
};