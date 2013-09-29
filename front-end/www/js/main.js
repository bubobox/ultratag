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
    var dragTimer;
    $(document).on('dragover', function(e) {
        var dt = e.originalEvent.dataTransfer;
        if(dt.types != null && (dt.types.indexOf ? dt.types.indexOf('Files') != -1 : dt.types.contains('application/x-moz-file'))) {
            $(".drag-drop").addClass('visible');
            window.clearTimeout(dragTimer);
        }
    });
    $(document).on('dragleave', function(e) {
        dragTimer = window.setTimeout(function() {
            $(".drag-drop").removeClass('visible');
        }, 25);
    });

    // Tinynav 
    $(".tabs").tinyNav({
        active: 'active' // String: Set the "active" class
    });

    // set helper
    $('.select-helper span').html($(this).find('option:selected').html());

    // Select Tabs for mobile
    $('.tinynav').change(function(e) {
        e.preventDefault();
        $('.select-helper span').html($(this).find('option:selected').html());
    });

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

});