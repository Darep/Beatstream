//= require helpers
//= require store.min
//= require slick.grid

$(document).ready(function () {

    resizeMain();

    $(window).resize(function () {
        resizeMain();
    });

    // resize the main-area to correct height
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

    
    // init:

    var grid = null;
    var audio = $('#player audio');
    audio.css('display', 'none');

    var playerTrack = $('#player-song .track');
    var playPause = $('#play-pause');
    var prevButton = $('#prev');
    var nextButton = $('#next');
    var elapsed = $('#player-time .elapsed');
    var duration = $('#player-time .duration');

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

        if (grid.currentSongId == null) {
            grid.nextSong();
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
        grid.nextSong();
    });

    prevButton.click(function (e) {
        e.preventDefault();
        grid.prevSong();
    });


    // audio player events

    audio.bind('play', function() {
        playPause.removeClass('paused');
    });

    audio.bind('pause', function() {
        playPause.addClass('paused');
    });

    audio.bind('ended', function () {
        grid.nextSong();
    });

    audio.bind('timeupdate', function () {
        var elaps = parseInt(audio[0].currentTime);

        elapsedTimeChanged(elaps);

        if (!user_is_seeking) {
            seekbar.slider('option', 'value', elaps);
        }
    });

    audio.bind('durationchange', function () {
        var dur = parseInt(audio[0].duration);
        durationChanged(dur);
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

    var dataView = new Slick.Data.DataView({ inlineFilters: true });

    $.getJSON('/songs/index', function(data) {
        grid = new Slick.Grid("#slickgrid", dataView, columns, options);
        grid.setSelectionModel(new Slick.RowSelectionModel());

        // remove 'path' column
        grid.setColumns(columns.slice(0, -1));

        console.log(grid);

        // events:

        // double-click => play song
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

        grid.onSelectedRowsChanged.subscribe(function (e) {
            var row = grid.getSelectedRows()[0];
        });

        grid.onSort.subscribe(function (e, args) {
            dataView.sort(comparer, args.sortAsc);
        });

        // own extensions:

        grid.currentSongId = null;

        grid.playSong = function (id) {
            var row = dataView.getRowById(id);

            if (row == undefined) {
                return; // song is not on the current list
            }

            var song = dataView.getItemById(id);

            playSong(song.nice_title, song.path);
            grid.currentSongId = song.id;

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
            var current_row = dataView.getRowById(grid.currentSongId);

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

        grid.nextSong = function () {
            var number_of_rows = grid.getDataLength();
            var new_row = 0;
            var current_row = -1;

            if (grid.currentSongId != null) {
                current_row = dataView.getRowById(grid.currentSongId);

                if (current_row == undefined) {
                    // current song is not in the grid, stop playing
                    stop();
                    return;
                }
            }

            if (shuffle) {
                new_row = randomToN(number_of_rows);
            }
            else if ((current_row + 1) < number_of_rows) {
                new_row = current_row + 1;
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

            if ((item["title"] && item["title"].toLowerCase().indexOf(searchStr) != -1)
                || (item["artist"] && item["artist"].toLowerCase().indexOf(searchStr) != -1)
                || (item["album"] && item["album"].toLowerCase().indexOf(searchStr) != -1)) {
                return true;
            }

            return false;
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
    });

    // enable buttons
    $('#player-buttons button').removeAttr('disabled');

    function playSong(song, path) {
        var uri = '/songs/play/?file=' + path;

        audio.attr('src', uri);
        audio[0].play();

        playerTrack.text(song);
    }

    function stop() {
        if (!audio[0].paused) {
            audio[0].pause();
            audio[0].src = '';
        }
        grid.currentSongId = null;
        
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
    }

});

function comparer(a, b) {
  var x = a[sortcol], y = b[sortcol];
  return (x == y ? 0 : (x > y ? 1 : -1));
}
