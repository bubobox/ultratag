/*jslint vars: true, devel: true */
/*global $: false */

/*
(function() {
    var zone = document.querySelector( '.drag-drop' );

    zone.addEventListener( 'drop', function( e ) {
        var files = e.dataTransfer.files,
            count = files.length;

        for( i=0; i<count;i++ )
            console.log( files[i] );

        e.preventDefault();
        e.cancel = true;

        readFile( files[0] );
    });

    function readFile( file ) {
        var reader = new FileReader();
        console.error(file);
        reader.onloadend = function( e ) {
            //parseData( e.currentTarget.result );
        }

        reader.readAsArrayBuffer( file );
    }

}());*/

// Mobile browser detection
var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};


$(function(){

    // Show the dropzone when dragging files (not folders or page
    // elements). The dropzone is hidden after a timer to prevent 
    // flickering to occur as `dragleave` is fired constantly.
    var dragTimer;
    $(document).on('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var dt = e.originalEvent.dataTransfer;
        if(dt.types != null && (dt.types.indexOf ? dt.types.indexOf('Files') != -1 : dt.types.contains('application/x-moz-file'))) {
            $(".drag-drop").addClass('visible');
            window.clearTimeout(dragTimer);
        }
    });
    $(document).on('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dragTimer = window.setTimeout(function() {
            $(".drag-drop").removeClass('visible');
        }, 25);
    });

    $(document).on('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(".drag-drop").removeClass('visible');
        if(e.originalEvent.dataTransfer){
            var file = e.originalEvent.dataTransfer.files[0];

            if(file.type !== 'image/jpeg') {
                alert('For the moment we only support jpeg images.');
            }

            readFile(file);
        }
    });

    function readFile( file ) {
        var reader = new FileReader();
        useFile(file);
        reader.onloadend = function( e ) {
            parseData( e.currentTarget.result );
        }
        reader.readAsArrayBuffer( file );
    }

    function parseData( data ) {
        view('info');
        data = new Uint8Array( data );
        var parser = new JPEGParser();
        parser.on( 'xmp', function( data, start, length ) {
            var table = createXmpTable( data.get() );
            $('.xmp .table-wrapper.ultratag').html( table );

            table = createXmpTable( data.get( null, 'rdf:Description' ) );
            $('.xmp .table-wrapper.other').html( table );
        });
        parser.on( 'exif', function( data ) {
            var table = createExifTable(data);
            $('.exif .table-wrapper').html(table);
        })
        parser.parse( data );
    };

    function useFile(file) {

        // Set file as preview
        var data = URL.createObjectURL(file);
        document.getElementById('preview').src = data;
        console.log(file);
        $('.info #name').html(file.name);
        $('.info #width').html(file.width);
        $('.info #height').html(file.height);
        $('.info #size').html(file.size);
        $('.info #modified').html(file.lastModifiedDate);
        $('.info #mime').html(file.type);

        initMaps();
    }

    // Bind triggers for tabs
    $('[data-trigger=tab]').on('click', function() {
        tab($(this).data('tab'));
    });

    function tab(idx) {
        $('[data-trigger=tab][data-tab=' + idx + ']').addClass('active').siblings().removeClass('active');
        $('.tab').hide();
        $('#tab' + idx).show();
    }

    function view(name) {
        $('.view').hide();
        $('.' + name).show();
    }

    // Tinynav 
    $(".tabs").tinyNav({
        active: 'active' // String: Set the "active" class
    });

    function createExifTable(data)
    {
        var html = '';
        for(var idx in data) {
            html += '<tr><td>' + data[idx].key + '</td><td>' + data[idx].value() + '</td></tr>';
        }
        return '<table width="100%"><tbody>' + html + '</tbody></table>';
    }

    function createXmpTable(data)
    {
        var html = '';
        for(var idx in data) {
            html += '<tr><td>' + idx + '</td><td>' + data[idx] + '</td></tr>';
        }
        return '<table width="100%"><tbody>' + html + '</tbody></table>';
    }

    // set helper
    $('.select-helper span').html($(this).find('option:selected').html());

    // Select Tabs for mobile
    $('.tinynav').change(function(e) {
        e.preventDefault();
        $('.select-helper span').html($(this).find('option:selected').html());
    });

    function initMaps() {
        // Disable initialization
        initMaps = function() {};

        // MAPS
        if( !isMobile.any() ) {
            var map;
            function initialize() {
                var mapOptions = {
                    zoom: 8,
                    center: new google.maps.LatLng(-34.397, 150.644),
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };
                map = new google.maps.Map(document.getElementById('map-canvas'),
                    mapOptions);
            }

            google.maps.event.addDomListener(window, 'load', initialize);
        } else {
            var key = 'AIzaSyCqPHHjPX1c7bDnZ8z318Yvj7DlCKeq9SU';
            var image = '<img class="static-map" src="http://maps.googleapis.com/maps/api/staticmap?center=New+York,NY&zoom=13&size=600x400&key='+key+'&sensor=false">';
            $('.maps').append(image);
        }
    }
});