//= require jquery.cookie
//= require lib/utils
//= require lib/key_codes
//= require lib/mediator
//= require dragtooltip
/*!
 * Abstracts SlickGrid away into oblivion!
 */

(function ($, window, document, undefined) {

    jQuery.event.special.drag.defaults.distance = 7;

    function Songlist(events_in) {
        var events = $.extend({
            onPlay : function () {}
        }, events_in);

        this.events = events;
        this.initializeSlickGrid(this.events);

        App.Mediator.subscribe(MediatorEvents.PLAYLIST_SHOW_CURRENT_SONG, function () {
            var row = this.dataView.getRowById(this.grid.playingSongId);
            this.grid.scrollRowIntoView(row);
        }.bind(this));
    }

    Songlist.prototype.initializeSlickGrid = function (events) {
        var initDone = false;

        var columns = [
            { id: 'np', resizable: false, width: 22 },
            { id: 'artist', name: 'Artist', field: 'artist', sortable: true },
            { id: 'tracknum', name: '', field: 'tracknum', sortable: false, resizable: false, cssClass: 'tracknum', width: 30 },
            { id: 'title', name: 'Title', field: 'title', sortable: true },
            { id: 'album', name: 'Album', field: 'album', sortable: true },
            { id: 'duration', name: 'Duration', field: 'nice_length', sortable: true, cssClass: 'duration', width: 30 },
            { id: 'path', name: '', field: 'path' }
        ];

        var seekbar = $('#seekbar-slider');

        var options = {
            editable: false,
            forceFitColumns: true,
            enableAutoTooltips: true,
            enableCellNavigation: true,
            enableColumnReorder: false,
            multiSelect: true,
            rowHeight: 22
        };

        var dataView = new Slick.Data.DataView({ inlineFilters: true });
        var grid = new Slick.Grid("#slickgrid", dataView, columns, options);
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

            if (e.keyCode == keyCode.A && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                var i = 1;
                var rows = [];
                while (dataView.getRowById(i) !== undefined) {
                    rows.push(dataView.getRowById(i));
                    i++;
                }
                grid.setSelectedRows(rows);
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
            // we're handling drags! Don't you come here knockin'!
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

            if (draggingSelectedRows === false) {
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

            if (drop_target === undefined || drop_target.parent().parent().hasClass('playlists') === false) {
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

            if (drop_target === undefined || drop_target.parent().hasClass('.playlists') === false) {
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

            if (row === undefined) {
                return; // song is not on the current list
            }

            var song = dataView.getItemById(id);

            events.onPlay(song);

            grid.playingSongId = song.id;

            // now playing icon
            grid.removeCellCssStyles('currentSong_playing');

            var np_cells = {}; np_cells[row] = { np: 'playing' };
            grid.addCellCssStyles('currentSong_playing', np_cells);

            grid.setSelectedRows([row]);
            grid.scrollRowIntoView(row);

            var arr = JSON.parse($.cookie('history')) || [];
            arr.push(id);

            // save song history in a cookie
            if (shuffle) {
                $.cookie('history', JSON.stringify(arr));
                $.cookie('isPlaying', true);
            }
        };

        grid.playSongAtRow = function (row) {
            var song = dataView.getItem(row); // getItem == getItemAtRow
            grid.playSong(song.id);
        };

        grid.prevSong = function (shuffle) {
            if (shuffle) {
                var arr = JSON.parse($.cookie('history'));
                var new_id;

                // extract last song from history (pop twice because current song is there also)
                new_id = arr.pop();
                if (grid.playingSongId !== null){
                    new_id = arr.pop();
                }

                if (!new_id) {
                    return;
                }

                $.cookie('history', JSON.stringify(arr));
                grid.playSong(new_id);
            } else {
                var number_of_rows = grid.getDataLength();
                var new_row = number_of_rows - 1;
                var current_row = dataView.getRowById(grid.playingSongId);

                if (current_row === undefined) {
                    // current song is not in the grid, stop playing
                    stop();
                    return;
                }

                if ((current_row - 1) >= 0) {
                    new_row = current_row - 1;
                }

                grid.playSongAtRow(new_row);
            }
        };

        grid.nextSong = function (shuffle, repeat, manual) {
            var number_of_rows = grid.getDataLength();
            var new_row = 0;
            var current_row = -1;

            if (grid.playingSongId !== null) {
                current_row = dataView.getRowById(grid.playingSongId);

                if (current_row === undefined) {
                    // current song is not in the grid, stop playing
                    stop();
                    return;
                }
            }

            if (shuffle) {
                new_row = randomToN(number_of_rows);
                while(new_row == current_row && number_of_rows > 1){
                    //reshuffles if same as previous and more than one song
                    new_row = randomToN(number_of_rows);
                }
            }
            else if ((current_row + 1) < number_of_rows) {
                // normal operation, move to next song
                new_row = current_row + 1;
            }
            else if ((manual === undefined || manual === false) && repeat === false) {
                // last song and not repeating -> stop playing
                stop();
                return;
            }
            else {
                // start at the top!
                new_row = 0;
            }

            grid.playSongAtRow(new_row);
        };

        // wire up model events to drive the grid
        dataView.onRowCountChanged.subscribe(function (e, args) {
            grid.updateRowCount();
            grid.render();

            // Start playing the last song that was playing on init
            if ($.cookie('isPlaying') == 'true' && !initDone) {
                grid.prevSong(true);  // FIXME: ugh, dirty hack
                initDone = true;
            }
        });

        dataView.onRowsChanged.subscribe(function (e, args) {
            grid.invalidateRows(args.rows);
            grid.render();
        });

        function myFilter(item, args) {
            if (args.searchString === "") {
                return true;
            }

            var searchStr = args.searchString.toLowerCase();

            searchStr = searchStr.split(' ');

            var match = true;

            for (var i = 0; i < searchStr.length; i++) {
                var str = searchStr[i];
                if ((item.title && item.title.toLowerCase().indexOf(str) != -1) ||
                    (item.artist && item.artist.toLowerCase().indexOf(str) != -1) ||
                    (item.album && item.album.toLowerCase().indexOf(str) != -1))
                {
                    match = true;
                }
                else {
                    return false;
                }
            }

            return match;
        }
        this.myFilter = myFilter;

        this.grid = grid;
        this.dataView = dataView;
    }

    Songlist.prototype.resizeCanvas = function () {
        this.grid.resizeCanvas();
    };

    Songlist.prototype.nextSong = function (shuffle, manual) {
        this.grid.nextSong(shuffle, manual);
    };

    Songlist.prototype.prevSong = function (shuffle) {
        this.grid.prevSong(shuffle);
    };

    Songlist.prototype.isPlaying = function () {
        return (this.grid.playingSongId !== null);
    };

    Songlist.prototype.resetPlaying = function () {
        this.grid.playingSongId = null;
    };

    Songlist.prototype.loadData = function (data) {
        // initialize data view model
        this.dataView.beginUpdate();
        this.dataView.setItems(data);
        this.dataView.setFilterArgs({
            searchString: ''
        });
        this.dataView.setFilter(this.myFilter);
        this.dataView.endUpdate();

        this.dataView.syncGridSelection(this.grid, false);
        this.dataView.syncGridCellCssStyles(this.grid, 'currentSong_playing');
    };

    Songlist.prototype.setFilter = function (filter) {
        this.dataView.setFilterArgs({
            searchString: filter
        });
        this.dataView.refresh();
    };

    window.Songlist = Songlist;

})(jQuery, window, document);
