//= require helpers
//= require dragtooltip
//= require slick.grid
/*!
 * Abstracts SlickGrid away into oblivion!
 */

(function (Beatstream, $, window, document, undefined) {

    // set jQuery.event.drag plugin's default drag start distance
    jQuery.event.special.drag.defaults.distance = 7;

    function Songlist(events_in) {

        var events = $.extend({
            onPlay : function (song) {},
            onStop : function () {},
            onDragStart : function (e, dd) {},
            onDrag: function (e, dd) {},
            onDragEnd: function (e, dd) {}
        }, events_in);

        this.events = events;

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

            /*
             * Add the songs (that we are dragging) into the event object
             */

            var cell = grid.getCellFromEvent(e);
            var data = [];
            var song_count = 0;

            // check if dragging selected rows
            var rows = grid.getSelectedRows();
            var draggingSelectedRows = false;

            for (var i = 0; i < rows.length; i++) {
                var dataItem = grid.getDataItem(rows[i]);
                data[i] = dataItem;
                if (rows[i] === cell.row) {
                    draggingSelectedRows = true;
                }
                song_count++;
            }

            if (draggingSelectedRows === false) {
                var dataItem = grid.getDataItem(cell.row);
                data = [];
                data[0] = dataItem;
                song_count = 1;
            }

            dd.draggedSongs = data;

            events.onDragStart(e, dd);

            // tell grid that we're handling drags!
            e.stopImmediatePropagation();
        });

        grid.onDrag.subscribe(events.onDrag);
        grid.onDragEnd.subscribe(events.onDragEnd);


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
        };

        grid.playSongAtRow = function (row) {
            var song = dataView.getItem(row); // getItem == getItemAtRow
            grid.playSong(song.id);
        };

        grid.prevSong = function () {
            var number_of_rows = grid.getDataLength();
            var new_row = number_of_rows - 1;
            var current_row = dataView.getRowById(grid.playingSongId);

            if (current_row === undefined) {
                // current song is not in the grid, stop playing
                events.onStop();
                return;
            }

            if ((current_row - 1) >= 0) {
                new_row = current_row - 1;
            }

            grid.playSongAtRow(new_row);
        };

        grid.nextSong = function (shuffle, repeat, manual) {
            var number_of_rows = grid.getDataLength();
            var new_row = 0;
            var current_row = -1;

            if (grid.playingSongId !== null) {
                current_row = dataView.getRowById(grid.playingSongId);

                if (current_row === undefined) {
                    // current song is not in the grid, stop playing
                    events.onStop();
                    return;
                }
            }

            if (shuffle) {
                new_row = randomToN(number_of_rows);
            }
            else if ((current_row + 1) < number_of_rows) {
                // normal operation, move to next song
                new_row = current_row + 1;
            }
            else if ((manual === undefined || manual === false) && repeat === false) {
                // last song and not repeating -> stop playing
                events.onStop();
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
        });

        dataView.onRowsChanged.subscribe(function (e, args) {
            grid.invalidateRows(args.rows);
            grid.render();
        });

        var searchString = '';

        function myFilter(item, args) {
            if (args.searchString === "") {
                return true;
            }

            var searchStr = args.searchString.toLowerCase();

            searchStr = searchStr.split(' ');

            var match = true;

            for (var i = 0; i < searchStr.length; i++) {
                var str = searchStr[i];

                if (str[0] === '"') {
                    if (str[str.length - 1] !== '"') {
                        for (var j = i + 1; j < searchStr.length; j++) {
                            var nextStr = searchStr[j];
                            str = str + " " + nextStr;
                            if (nextStr[nextStr.length - 1] === '"') {
                                i = j;
                                break;
                            }
                        }
                    }
                    if (str[str.length - 1] === '"') {
                        str = str.substr(1, str.length - 2);
                    }
                    else {
                        str = str.substr(1, str.length - 1);
                    }
                }

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

        this.grid = grid;
        this.dataView = dataView;
        this.searchString = searchString;
    }

    Songlist.prototype.resizeCanvas = function () {
        this.grid.resizeCanvas();
    };

    Songlist.prototype.scrollNowPlayingIntoView = function () {
        var row = this.dataView.getRowById(this.grid.playingSongId);
        this.grid.scrollRowIntoView(row);
    };

    Songlist.prototype.nextSong = function (shuffle, manual) {
        this.grid.nextSong(shuffle, manual);
    };

    Songlist.prototype.prevSong = function () {
        this.grid.prevSong();
    };

    Songlist.prototype.isPlaying = function () {
        return (this.grid.playingSongId !== null);
    };

    Songlist.prototype.resetPlaying = function () {
        this.grid.playingSongId = null;
    };

    Songlist.prototype.loadPlaylist = function (data) {

        this.grid.removeCellCssStyles('currentSong_playing');

        // initialize data view model
        this.dataView.beginUpdate();
        this.dataView.setItems(data);
        this.dataView.setFilterArgs({
            searchString: this.searchString
        });
        this.dataView.setFilter(this.myFilter);
        this.dataView.endUpdate();

        this.dataView.syncGridSelection(this.grid, false);
        this.dataView.syncGridCellCssStyles(this.grid, 'currentSong_playing');
    };

    Beatstream.Songlist = Songlist;

})(window.Beatstream = window.Beatstream || {}, jQuery, window, document);
