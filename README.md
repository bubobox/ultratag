ultratag
========

Extended image EXIF data

Tools
=====
* Online EXIF viewer http://regex.info/exif.cgi
* http://search.cpan.org/dist/Image-ExifTool/lib/Image/ExifTool/TagNames.pod
* SVG filter examples http://docs.webplatform.org/wiki/svg/tutorials/smarter_svg_filters

PNG Standard example
====================
Voorbeeld van een andere project dat een standaard heeft willen maken voor "EXIF" data in PNG's.
http://pmt.sourceforge.net/exif/drafts/d020.html

Face thumbs
===========
/*****************/
		var reader = new FileReader();
	    reader.onload = function(evt) {
	        var fileData = evt.target.result;
	        var bytes = new Uint8Array(fileData);
	        var binaryText = '';

	        for (var index = 0; index < bytes.byteLength; index++) {
	            binaryText += String.fromCharCode( bytes[index] );
	        }

	        window.test = Base64.encode(binaryText);

	    };
	    reader.readAsArrayBuffer(file);
		/*****************/