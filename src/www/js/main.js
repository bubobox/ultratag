/*jslint vars: true, devel: true */
/*global $: false */

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
    var dragTimer, lat = null, lng = null, map = null;
    $(document).on('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        view('landing');
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
            useFile(file);
        }
    });

    document.getElementById("file-upload").addEventListener("change", handleFiles, false);
    function handleFiles() {
        var file = this.files[0];
        useFile(file);
    }

    function parseData( data ) {
        view('info');
        data = new Uint8Array( data );

        var parser = new JPEGParser();
        parser.on( 'xmp', function( data, start, length ) {
            var table = createXmpTable( data.get() );
            $('.xmp .table-wrapper.ultratag').html( table );

            var info = data.get( null, 'rdf:Description' );

            // Create namespaces grouped data object
            var namespaces = {};
            for(key in info) {
                var value = info[key];
                if(key.indexOf(':')) {
                    var parts = key.split(':');
                    if( ! namespaces.hasOwnProperty(parts[0])) {
                        namespaces[parts[0]] = {};
                    }
                    namespaces[parts[0]][parts[1]] = value;
                } else {
                    namespaces['global'][key] = value;
                }
            }

            // Add tabs for namespaces
            for(namespace in namespaces) {
                var info = namespaces[namespace];
                table = createXmpTable( info );
                createTab(namespace, namespace, table);
            }

            table = createXmpTable( data.get( null, 'rdf:Description' ) );
            $('.xmp .table-wrapper.other').html( table );
        });
        parser.on( 'exif', function( data ) {

            var table = createExifTable(data);
            createTab('EXIF', 'EXIF', table);

            if(lat && lng) {
                createTab('Map', 'Map', '<div id="map-canvas" class="maps"></div>');
            }

        })
        parser.parse( data );
    };

    function useFile(file) {

        // Check if file is valid
        if( ! isValidImage(file)) {
            $('#upload .large').addClass('shake');
            setTimeout(function() {
                $('#upload .large').removeClass('shake');
            }, 1000);
            return;
        }

        // Clean tabs
        $('#tabs ul li,.tab').remove();

        // Reset map instance
        lat = lng = map = null;


        // Start reading file
        var reader = new FileReader();
        reader.onloadend = function( e ) {
            parseData( e.currentTarget.result );
        }
        reader.readAsArrayBuffer( file );

        // Only show first tab
        $('.tab').hide().eq(0).show()

        // Set file as preview
        var data = URL.createObjectURL(file);
        document.getElementById('preview').src = data;

        // Add basic info about file
        $('.info #name').html(file.name);
        $('.info #width').html(file.width);
        $('.info #height').html(file.height);
        $('.info #size').html(file.size);
        $('.info #modified').html(file.lastModifiedDate);
        $('.info #mime').html(file.type);
    }

    // Bind triggers for tabs
    $('body').on('click', '[data-trigger=tab]', function() {
        tab($(this).data('tab'));
    });

    $('#tinynav1').on('change', function() {
        var value = $(this).val();
        tab(value);
    });

    function tab(idx) {
        $('[data-trigger=tab][data-tab=' + idx + ']').addClass('active').siblings().removeClass('active');
        $('.tab').hide();
        $('#tab' + idx).show();

        var name = $('#tab' + idx + ' h2').html();
        if(name === 'Map') {
            initMaps(lat, lng);
        }
    }

    function view(name) {
        $('.view').hide();
        $('.' + name).show();
    }

    function createTab(name, title, content) {
        var lastIndex = parseInt($('#tabs ul li').last().data('tab')) || 0;
        var newIndex = lastIndex + 1;
        var content = $('<div id="tab' + newIndex + '" class="xmp tab col col-9 content"><h2>' + title + '</h2>' + content + '</div>').hide();
        $('#tabs ul').append('<li data-trigger="tab" data-tab="' + newIndex + '" data-name="' + name + '"><a href="javascript:void(0)">' + name + '</a></li>');
        $('#tabs #tinynav1').append('<option value="' + newIndex + '">' + name + '</option>');
        $('#tabs').parent().append(content);

        // Auto activate first tab
        if(lastIndex === 0) {
            tab(newIndex);
        }
    }

    function createExifTable(data)
    {
        var html = '',
            val = null;
        for(var idx in data) {
            val = data[idx].value();
            if( Object.prototype.toString.call( val ) === '[object Array]' )
                val = convertExifValue( data[idx] );

            if(data[idx].key == 'GPSLatitude') {
                lat = val;
            }
            if(data[idx].key == 'GPSLongitude') {
                lng = val;
            }

            html += '<tr><td>' + data[idx].key + '</td><td>' + val + '</td></tr>';
        }

        return '<table width="100%"><tbody>' + html + '</tbody></table>';
    }

    function convertExifValue( tag ) {
        var values = tag.value();

        if( tag._group == 'GPS' && ( tag._id == 0x0002 || tag._id == 0x0004 ) )
            return values[0] + (values[1]/60) + (values[2]/3600);

        if( values.length > 0 )
            return values.join( ', ' );

        return tag.value();
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

    /**
     * Check if we support the select file object
     */
    function isValidImage(file)
    {
        if(file.type === "image/jpeg" || file.type === "image/jpg") {
            return true;
        } else {
            return false;
        }
    }

    
    function initMaps(lat, lng) {

        // Disable initialization
        if(map) {
            return map;
        }

        // MAPS
        //if( !isMobile.any() ) {
            function initialize(lat, lng) {
                var position = new google.maps.LatLng(lat, lng);
                var mapOptions = {
                    zoom: 15,
                    center: position,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };
                map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

                var marker = new google.maps.Marker({
                    position: position,
                    title:"Hello World!"
                });

                marker.setMap(map);
            }

            initialize(lat, lng);
        /*} else {
            var key = 'AIzaSyCqPHHjPX1c7bDnZ8z318Yvj7DlCKeq9SU';
            var image = '<img class="static-map" src="http://maps.googleapis.com/maps/api/staticmap?center=New+York,NY&zoom=13&size=600x400&key='+key+'&sensor=false">';
            $('.maps').append(image);
        }*/
    }

    // If on mobile scroll to first pixel
    if(isMobile.any()) {
        window.scrollTo(0, 1); 
    }

});