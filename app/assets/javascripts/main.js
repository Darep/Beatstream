//= require store.min
//= require slick.grid
//= require helpers

$(document).ready(function () {

    // resize the main-area to correct height
    function resizeMain() {
        var h = $(window).height() - $('#wrap > header').outerHeight() - $('#player').outerHeight();
        var w = $(window).width() - $('#sidebar').outerWidth();
        $('#main').css('height', h);
        $('#content-wrap').css('width', w);

        var h2 = h - $('.page-header').innerHeight();
        $('.grid-container').css('height', h2);

        if (grid)
            grid.resizeCanvas();
    }

    $(window).resize(function () {
        resizeMain();
    });
    $(window).resize();

    
    // init:

    var songs = null;
    var grid = null;
    var audio = $('#player audio');
    audio.css('display', 'none');

    var playerTrack = $('#player-song .track');
    var playPause = $('#play-pause');
    var prevButton = $('#prev');
    var nextButton = $('#next');
    var elapsed = $('#player-time .elapsed');
    var duration = $('#player-time .duration');

    var currentSong = null;

    // shuffle
    var shuffleButton = $('#shuffle');
    var shuffle = false;

    if (store.get('shuffle')) {
        shuffle = store.get('shuffle');
    }

    if (shuffle) {
        shuffleButton.addClass('enabled');
    }

    shuffleButton.click(function (e) {
        e.preventDefault();

        shuffle = !shuffle;
        store.set('shuffle', shuffle);

        $(this).toggleClass('enabled');
    });

    // volume slider
    var volume = 0.6;
    if (store.get('volume')) {
        volume = parseFloat(store.get('volume'));
        if (volume >= 0 && volume <= 1.0) {
            audio[0].volume = volume;
        }
    }

    $('#player-volume-slider').slider({
        orientation: 'horizontal',
        value: volume * 100,
        max: 100,
        min: 0,
        range: 'min',
        slide: function (event, ui) {
            audio[0].volume = parseFloat(ui.value/100);
        },
        stop: function (event, ui) {
            store.set('volume', parseFloat(ui.value/100));
        }
    });

    // seekbar
    var seekbar = $('#seekbar-slider');
    var user_is_seeking = false;
    seekbar.slider({
        orientation: 'horizontal',
        disabled: true,
        value: 0,
        max: 100,
        min: 0,
        range: 'min',
        slide: function (event, ui) {
        },
        start: function(event, ui) {
            user_is_seeking = true;
        },
        stop: function(event, ui) {
            audio[0].currentTime = ui.value;
            user_is_seeking = false;
        }
    });

    playPause.click(function (e) {
        e.preventDefault();

        if (grid.currentSong == null) {
            grid.currentSong = grid.getDataLength();
            nextSong();
            return;
        }

        if (audio[0].paused) {
            audio[0].play();
        }
        else {
            audio[0].pause();
        }
    });

    nextButton.click(function (e) {
        e.preventDefault();
        nextSong();
    });

    prevButton.click(function (e) {
        e.preventDefault();
        prevSong();
    });

    audio.bind('play', function() {
        playPause.removeClass('paused');
    });

    audio.bind('pause', function() {
        playPause.addClass('paused');
    });

    audio.bind('ended', function () {
        nextSong();
    });

    audio.bind('timeupdate', function () {
        var elaps = parseInt(audio[0].currentTime),
            mins = Math.floor(elaps/60, 10),
            secs = elaps - mins*60;

        elapsed.text((mins > 9 ? mins : '0' + mins) + ':' + (secs > 9 ? secs : '0' + secs));

        if (!user_is_seeking) {
            seekbar.slider('option', 'value', elaps);
        }
    });

    audio.bind('durationchange', function () {
        var dur = parseInt(audio[0].duration),
            mins = Math.floor(dur/60, 10),
            secs = dur - mins*60;

        duration.text((mins > 9 ? mins : '0' + mins) + ':' + (secs > 9 ? secs : '0' + secs));

        seekbar.slider('option', 'max', dur);
        seekbar.slider('option', 'disabled', false);
    });


    // SlickGrid

    var columns = [
        { id: 'np', resizable: false, width: 22 },
        { id: 'title', name: 'Title', field: 'title', sortable: true },
        { id: 'tracknum', name: '', field: 'tracknum', sortable: true, resizable: false, cssClass: 'tracknum', width: 30 },
        { id: 'artist', name: 'Artist', field: 'artist', sortable: true },
        { id: 'album', name: 'Album', field: 'album', sortable: true },
        { id: 'duration', name: 'Duration', field: 'nice_length', sortable: true, cssClass: 'duration', width: 30 },
        { id: 'path', name: '', field: 'path' }
    ];

    var options = {
        /*autoHeight: true,*/
        editable: false,
        forceFitColumns: true,
        enableAutoTooltips: true,
        enableCellNavigation: false,
        enableColumnReorder: false,
        multiSelect: false,
        rowHeight: 22
    };

    $.getJSON('/songs/index', function(data) {
        grid = new Slick.Grid("#slickgrid", data, columns, options);
        grid.setSelectionModel(new Slick.RowSelectionModel());

        // remove 'path' column
        grid.setColumns(columns.slice(0, -1));

        console.log(grid);

        // double-click => play song
        grid.onClick.subscribe(function (e) {
            var cell = grid.getCellFromEvent(e);

            grid.setSelectedRows([cell.row]);
        });

        grid.onDblClick.subscribe(function (e) {
            var cell = grid.getCellFromEvent(e);

            grid.startPlaying(cell.row);

            e.stopPropagation();
        });

        grid.onSelectedRowsChanged.subscribe(function (e) {
            var row = grid.getSelectedRows()[0];
        });

        grid.currentSong = null;

        grid.startPlaying = function (row) {
            var song = grid.getDataItem(row);
            
            playSong(song.nice_title, song.path);

            // now playing icon
            var cells = {};
            cells[row] = { np: 'playing' };

            grid.removeCellCssStyles('currentSong_playing');
            grid.addCellCssStyles('currentSong_playing', cells);

            grid.currentSong = row;
            grid.setSelectedRows([row]);

            grid.scrollRowIntoView(row);
        };
    });

    // enable buttons
    $('#player-buttons button').removeAttr('disabled');

    // song playback functions

    function prevSong() {
        var newRow = grid.getDataLength() - 1;
        var currentRow = grid.currentSong; //grid.getSelectedRows()[0];

        if ((currentRow - 1) >= 0) {
            newRow = currentRow - 1;
        }

        grid.startPlaying(newRow);
    }

    function nextSong() {
        var numberOfRows = grid.getDataLength();
        var newRow = 0;
        var currentRow = grid.currentSong; //grid.getSelectedRows()[0];

        if (shuffle) {
            newRow = randomToN(numberOfRows);
        }
        else if ((currentRow + 1) < numberOfRows) {
            newRow = currentRow + 1;
        }

        grid.startPlaying(newRow);
    }

    function playSong(song, path) {
        var uri = '/songs/play/?file=' + path;

        audio.attr('src', uri);
        audio[0].play();

        playerTrack.text(song);
    }

});
