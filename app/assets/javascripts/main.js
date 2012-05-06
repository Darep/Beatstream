//= require helpers
//= require store.min
//= require jquery.ba-hashchange.min
//= require slick.grid
//= require routing
//= require lastfm
//= require pretty-numbers
//= require audio-modules/html5audio
//= require audio-modules/soundmanager2

var keyCode = {
    ENTER: 13
};

soundManager.url = '/swf/';
soundManager.flashVersion = 9; // optional: shiny features (default = 8)
soundManager.useFlashBlock = false; // optionally, enable when you're ready to dive in
soundManager.useHTML5Audio = true;

$(document).ready(function () {
soundManager.onready(function() {


    // resize the main-area to correct height
    resizeMain();
    $(window).resize(function () { resizeMain(); });

    function resizeMain() {
        var h = $(window).height() - $('#wrap > header').outerHeight() - $('#player').outerHeight();
        var w = $(window).width() - $('#sidebar').outerWidth();
        $('#main').css('height', h);
        $('#content-wrap').css('width', w);

        var h2 = h - $('.page-header').innerHeight();
        $('.grid-container').css('height', h2);

        if (grid) {
            grid.resizeCanvas();
        }
    }


    // ::: USER MENU :::

    $(window).hashchange(function () {
        Routing.ResolveCurrent();
    });
    

    // ::: INIT SONGLIST / GRID OMG SO BIG SECTION :::

    var grid = null;
    var dataView = new Slick.Data.DataView({ inlineFilters: true });

    var playerTrack = $('#player-song .track');
    var playPause = $('#play-pause');
    var prevButton = $('#prev');
    var nextButton = $('#next');
    var elapsed = $('#player-time .elapsed');
    var duration = $('#player-time .duration');
    var volume_label = $('#player-volume-label');
    var seekbar = $('#seekbar-slider');

    // init audio player
    var error_counter = 0;

    var eventHandlers = {
        onPlay: function () {
            playPause.addClass('playing');
        },
        onPaused: function () {
            playPause.removeClass('playing');
        },
        onSongEnd: function () {
            grid.nextSong();
        },
        onTimeChange: function (elaps) {
            elapsedTimeChanged(elaps);

            if (!user_is_seeking) {
                seekbar.slider('option', 'value', elaps);
            }
        },
        onDurationParsed: function (duration_in_seconds) {
            durationChanged(duration_in_seconds);
            seekbar.slider('option', 'disabled', false);
        },
        onError: function () {
            if (error_counter > 2) {
                BeatAudio.pause();
                error_counter = 0;
                return;
            }

            grid.nextSong();
            error_counter = error_counter + 1;
        }
    };

    var BeatAudio = null;
    if (location.search == '?a=sm2') {
        BeatAudio = new SM2Audio(eventHandlers);
    }
    else {
        BeatAudio = new HTML5Audio(eventHandlers);   
    }


    // volume slider
    var volume = 20;

    if (store.get('volume')) {
        volume = parseFloat(store.get('volume'));
    }

    if (volume >= 0 && volume <= 100) {
        BeatAudio.setVolume(volume);
        volume_label.attr('title', volume);
    }

    $('#player-volume-slider').slider({
        orientation: 'horizontal',
        value: volume,
        max: 100,
        min: 0,
        range: 'min',
        slide: function (event, ui) {
            BeatAudio.setVolume(ui.value);
            volume_label.attr('title', ui.value);
        },
        stop: function (event, ui) {
            store.set('volume', ui.value);
        }
    });

    // seekbar
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
            BeatAudio.seekTo(ui.value);
            user_is_seeking = false;
        }
    });

    // playback buttons
    playPause.click(function (e) {
        e.preventDefault();

        // if not playing anything, start playing the first song on the playlist
        if (grid.playingSongId == null) {
            grid.nextSong();
            return;
        }

        BeatAudio.togglePause();
    });

    nextButton.click(function (e) {
        e.preventDefault();
        grid.nextSong(true);
    });

    prevButton.click(function (e) {
        e.preventDefault();
        grid.prevSong();
    });

    playerTrack.dblclick(function (e) {
        e.preventDefault();
        
        var row = dataView.getRowById(grid.playingSongId);
        grid.scrollRowIntoView(row);
    });


    // repeat & shuffle buttons

    var repeatButton = $('#repeat'),
        shuffleButton = $('#shuffle'),
        shuffle = false,
        repeat = false

    function newToggleButton(button, key, value) {
        if (store.get(key)) {
            value = store.get(key);
        }
        
        if (value) {
            button.addClass('enabled');
        }

        button.click(function (e) {
            e.preventDefault();

            value = !value;
            store.set(key, value);

            $(this).toggleClass('enabled');
        });
    }

    newToggleButton(repeatButton, 'repeat', repeat);
    newToggleButton(shuffleButton, 'shuffle', shuffle);

    function storeGet(key) {
        if (key && store.get(key)) {
            return store.get(key);
        }
        
        return false;
    }

    function getShuffle() {
        return storeGet('shuffle');
    }

    function getRepeat() {
        return storeGet('repeat');
    }


    // sidebar drag & drop

    jQuery.event.special.drag.defaults.distance = 7;


    // SlickGrid

    var columns = [
        { id: 'np', resizable: false, width: 22 },
        { id: 'artist', name: 'Artist', field: 'artist', sortable: true },
        { id: 'tracknum', name: '', field: 'tracknum', sortable: false, resizable: false, cssClass: 'tracknum', width: 30 },
        { id: 'title', name: 'Title', field: 'title', sortable: true },
        { id: 'album', name: 'Album', field: 'album', sortable: true },
        { id: 'duration', name: 'Duration', field: 'nice_length', sortable: true, cssClass: 'duration', width: 30 },
        { id: 'path', name: '', field: 'path' }
    ];

    var options = {
        editable: false,
        forceFitColumns: true,
        enableAutoTooltips: true,
        enableCellNavigation: true,
        enableColumnReorder: false,
        multiSelect: true,
        rowHeight: 22
    };

    $.ajax({
        url: '/songs/index',
        dataType: 'json',
        error: function (xhr, status, error) {
            /*
            console.log(xhr);
            console.log(status);
            console.log(error);
            */
        },
        success: function(data) {

            // update song count on sidebar
            var count = commify( parseInt(data.length) );
            $('.medialibrary.count').text(count);

            grid = new Slick.Grid("#slickgrid", dataView, columns, options);
            grid.setSelectionModel(new Slick.RowSelectionModel());

            // remove 'path' column
            grid.setColumns(columns.slice(0, -1));


            // events:

            grid.onClick.subscribe(function (e) {
                var cell = grid.getCellFromEvent(e);
                grid.setSelectedRows([cell.row]);
            });

            grid.onDblClick.subscribe(function (e) {
                var cell = grid.getCellFromEvent(e);
                var dataItem = grid.getDataItem(cell.row);

                grid.playSong(dataItem.id);

                e.stopPropagation();
            });

            grid.onKeyDown.subscribe(function (e) {
                if (e.keyCode == keyCode.ENTER) {
                    
                    var rows = grid.getSelectedRows();
                    if (!rows || rows.length <= 0) {
                        return;
                    }

                    var dataItem = grid.getDataItem(rows[0]);
                    
                    grid.playSong(dataItem.id);

                    e.stopPropagation();
                }
            });

            grid.onSelectedRowsChanged.subscribe(function (e) {
                //var row = grid.getSelectedRows()[0];
            });

            grid.onSort.subscribe(function (e, args) {
                var sortcol = args.sortCol.field;

                function comparer(a, b) {
                    var x = a[sortcol],
                        y = b[sortcol];

                    if (!x) { return -1; }
                    if (!y) { return 1; }

                    if (sortcol == 'album') {
                        x = a['album'] + ' ' + a['tracknum'];
                        y = b['album'] + ' ' + b['tracknum'];
                    }
                    else if (sortcol == 'artist') {
                        x = a['artist'] + ' ' + a['album'] + ' ' + a['tracknum'];
                        y = b['artist'] + ' ' + b['album'] + ' ' + b['tracknum'];
                    }

                    return naturalsort(x, y);
                }

                dataView.sort(comparer, args.sortAsc);
            });

            // dragging

            grid.onDragInit.subscribe(function (e, dd) {
                // we're handling drags
                e.stopImmediatePropagation();
            });

            grid.onDragStart.subscribe(function (e, dd) {

                var cell = grid.getCellFromEvent(e);
                var data = {};
                var song_count = 0;

                // check if dragging selected rows
                var rows = grid.getSelectedRows();
                var draggingSelectedRows = false;

                for (var i = 0; i < rows.length; i++) {
                    var dataItem = grid.getDataItem(rows[i]);
                    data[i] = dataItem;
                    if (rows[i] == cell.row) {
                        draggingSelectedRows = true;
                    }
                    song_count++;
                }

                if (draggingSelectedRows == false) {
                    var dataItem = grid.getDataItem(cell.row);
                    data = {};
                    data[0] = dataItem;
                    song_count = 1;
                }

                dd.bestDataEver = data;

                DragTooltip.show(dd.startX, dd.startY, song_count + ' song');

                if (song_count != 1) {
                    DragTooltip.append('s');
                }

                // make playlists hilight
                $('#sidebar .playlists li').addClass('targeted');

                // tell grid that we're handling drags!
                e.stopImmediatePropagation();
            });

            grid.onDrag.subscribe(function (e, dd) {
                DragTooltip.update(e.clientX, e.clientY);

                var drop_target = $(document.elementFromPoint(e.clientX, e.clientY));

                if (drop_target == undefined || drop_target.parent().parent().hasClass('playlists') == false) {
                    // these are not the drops you are looking for
                    $('#sidebar .playlists li').removeClass('hover');
                    return;
                }

                $('#sidebar .playlists li').removeClass('hover');
                drop_target.parent().addClass('hover');
            });

            grid.onDragEnd.subscribe(function (e, dd) {
                DragTooltip.hide();

                $('#sidebar .playlists li').removeClass('targeted').removeClass('hover');

                var drop_target = $(document.elementFromPoint(e.clientX, e.clientY));

                if (drop_target == undefined || drop_target.parent().hasClass('.playlists') == false) {
                    // these are not the drops you are looking for
                    return;
                }

                // TODO: add dragged things into playlist (if things can be added)
            });


            // own extensions:

            grid.playingSongId = null;

            grid.getPlayingSong = function () {
                if (grid.playingSongId === null) {
                    return null;
                }
                else {
                    return dataView.getItemById(grid.playingSongId);
                }
            };

            grid.playSong = function (id) {
                var row = dataView.getRowById(id);

                if (row == undefined) {
                    return; // song is not on the current list
                }

                var song = dataView.getItemById(id);

                var uri = '/songs/play/?file=' + encodeURIComponent(song.path);
                BeatAudio.play(uri);

                playerTrack.text(song.nice_title);
                lastfm.newSong(song);

                grid.playingSongId = song.id;

                // now playing icon
                grid.removeCellCssStyles('currentSong_playing');

                var np_cells = {}; np_cells[row] = { np: 'playing' };
                grid.addCellCssStyles('currentSong_playing', np_cells);

                grid.setSelectedRows([row]);
                grid.scrollRowIntoView(row);
            };

            grid.playSongAtRow = function (row) {
                var song = dataView.getItem(row); // getItem == getItemAtRow
                grid.playSong(song.id);
            };

            grid.prevSong = function () {
                var number_of_rows = grid.getDataLength();
                var new_row = number_of_rows - 1;
                var current_row = dataView.getRowById(grid.playingSongId);

                if (current_row == undefined) {
                    // current song is not in the grid, stop playing
                    stop();
                    return;
                }

                if ((current_row - 1) >= 0) {
                    new_row = current_row - 1;
                }

                grid.playSongAtRow(new_row);
            };

            grid.nextSong = function (manual) {
                var number_of_rows = grid.getDataLength();
                var new_row = 0;
                var current_row = -1;

                if (grid.playingSongId != null) {
                    current_row = dataView.getRowById(grid.playingSongId);

                    if (current_row == undefined) {
                        // current song is not in the grid, stop playing
                        stop();
                        return;
                    }
                }

                var shuffle = getShuffle();

                if (shuffle) {
                    new_row = randomToN(number_of_rows);
                }
                else if ((current_row + 1) < number_of_rows) {
                    new_row = current_row + 1;
                }
                else if (!manual && getRepeat() == false) {
                    // automatic advance, at the last song and not repeating -> stop playing
                    stop();
                    return;
                }

                grid.playSongAtRow(new_row);
            };

            // wire up model events to drive the grid
            dataView.onRowCountChanged.subscribe(function (e, args) {
                grid.updateRowCount();
                grid.render();
            });

            dataView.onRowsChanged.subscribe(function (e, args) {
                grid.invalidateRows(args.rows);
                grid.render();
            });

            var searchString = '';

            function myFilter(item, args) {
                if (args.searchString == "") {
                    return true;
                }

                var searchStr = args.searchString.toLowerCase();

                searchStr = searchStr.split(' ');

                var match = true;

                for (var i = 0; i < searchStr.length; i++) {
                    var str = searchStr[i];
                    if ((item["title"] && item["title"].toLowerCase().indexOf(str) != -1)
                        || (item["artist"] && item["artist"].toLowerCase().indexOf(str) != -1)
                        || (item["album"] && item["album"].toLowerCase().indexOf(str) != -1)) {
                        match = true;
                    }
                    else {
                        return false;
                    }
                }

                return match;
            }

            // wire up the search textbox to apply the filter to the model
            $('#search').keyup(function (e) {
                // clear on Esc
                if (e.which == 27) {
                    this.value = "";
                }

                searchString = this.value;
                updateFilter();
            });

            $('.search .clear').click(function (e) {
                $('#search').val('');
                searchString = '';
                updateFilter();

                e.preventDefault();
                e.stopPropagation();
            });

            function updateFilter() {
                dataView.setFilterArgs({
                    searchString: searchString
                });
                dataView.refresh();
            }

            // initialize data view model after events have been hooked up
            dataView.beginUpdate();
            dataView.setItems(data);
            dataView.setFilterArgs({
                searchString: searchString
            });
            dataView.setFilter(myFilter);
            dataView.endUpdate();

            dataView.syncGridSelection(grid, false);
            dataView.syncGridCellCssStyles(grid, 'currentSong_playing');

            // update playlist meta
            var count = commify( parseInt(data.length) );

            $('.medialibrary.count').text(count);
            $('.page-header .count').text(count);

            if (data.length == 1) {
                $('.page-header .text').html('song');
            }
            else {
                $('.page-header .text').html('songs');
            }

        }
    }); /* end $.ajax */

    // enable buttons
    $('#player-buttons button').removeAttr('disabled');

    function stop() {
        BeatAudio.stop();
        grid.playingSongId = null;
        
        // TODO: hide now playing icon from slickgrid

        elapsedTimeChanged(0);
        durationChanged(0);
        seekbar.slider('value', 0);
        seekbar.slider('option', 'disabled', true);
        playerTrack.text('None');
    }

    function durationChanged(dur) {
        var mins = Math.floor(dur/60, 10),
            secs = dur - mins*60;

        duration.text((mins > 9 ? mins : '0' + mins) + ':' + (secs > 9 ? secs : '0' + secs));

        seekbar.slider('option', 'max', dur);
    }

    function elapsedTimeChanged(elaps) {
        var mins = Math.floor(elaps/60, 10),
            secs = elaps - mins*60;

        elapsed.text((mins > 9 ? mins : '0' + mins) + ':' + (secs > 9 ? secs : '0' + secs));

        lastfm.scrobble(elaps);
    }

});
});
