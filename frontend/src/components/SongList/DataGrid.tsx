import { type Column, type Formatter, SlickGrid, SlickRowSelectionModel } from 'slickgrid';
import 'slickgrid/dist/styles/css/slick.grid.css';
import 'slickgrid/dist/styles/css/slick-alpine-theme.css';

import { useEvent } from 'hooks/useEvent';
import { useCallback, useEffect, useRef } from 'react';

type SortableColumn = 'artist' | 'track_num' | 'title' | 'album' | 'length';
type SongGridItem = Song & { nowplaying?: string };

const titleFormatter: Formatter<SongGridItem> = (_row, _cell, _value, _column, item) => item.title || item.nice_title;

export const DataGrid = ({
  activeRow,
  items,
  sort,
  sortDir,
  onActivateRow,
  onSort,
}: {
  /** Currently active row (= currently playing song) */
  activeRow: number | undefined;

  /** List of songs */
  items: Song[];

  sort: SortableColumn | null;
  sortDir: 'asc' | 'desc';

  /** Change active row (= currently playing song) */
  onActivateRow: (row: number) => void;

  /** Change sorting */
  onSort: (column: SortableColumn) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<SlickGrid<SongGridItem>>();
  const itemsRef = useRef(items);
  const activeRowRef = useRef(activeRow);
  const onActivateRowRef = useRef(onActivateRow);
  const onSortRef = useRef(onSort);
  const skipScrollToRowRef = useRef(false);
  const skipScrollTimerRef = useRef<number>();

  activeRowRef.current = activeRow;
  itemsRef.current = items;
  onActivateRowRef.current = onActivateRow;
  onSortRef.current = onSort;

  const activateRow = useCallback((row: number) => {
    skipScrollToRowRef.current = true;
    window.clearTimeout(skipScrollTimerRef.current);
    skipScrollTimerRef.current = window.setTimeout(() => {
      skipScrollToRowRef.current = false;
    }, 10);
    onActivateRowRef.current(row);
  }, []);

  const scrollToActiveRow = useCallback(() => {
    const grid = gridRef.current;
    const row = activeRowRef.current;
    if (grid && typeof row === 'number' && row >= 0 && row < grid.getDataLength() && !skipScrollToRowRef.current) {
      grid.scrollRowIntoView(row);
      grid.setSelectedRows([row]);
    }
  }, []);

  useEvent('show-nowplaying', scrollToActiveRow);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const columns: Column<SongGridItem>[] = [
      {
        id: 'nowplaying',
        field: 'nowplaying',
        name: '',
        width: 40,
        minWidth: 40,
        maxWidth: 40,
        resizable: false,
        formatter: (row) => (row === activeRowRef.current ? '▶' : ''),
      },
      { id: 'artist', field: 'artist', name: 'Artist', sortable: true, minWidth: 80 },
      { id: 'track_num', field: 'track_num', name: '#', sortable: true, width: 50, cssClass: 'tracknum' },
      { id: 'title', field: 'title', name: 'Title', sortable: true, minWidth: 80, formatter: titleFormatter },
      { id: 'album', field: 'album', name: 'Album', sortable: true, minWidth: 80 },
      { id: 'nice_length', field: 'nice_length', name: 'Duration', sortable: true, width: 120 },
    ];

    const grid = new SlickGrid<SongGridItem, Column<SongGridItem>>(container, itemsRef.current, columns, {
      defaultFormatter: (_row, _cell, value) => (value == null ? '' : String(value)),
      editable: false,
      enableCellNavigation: true,
      enableColumnReorder: false,
      enableHtmlRendering: false,
      forceFitColumns: true,
      multiSelect: true,
      rowHeight: 26,
    });
    grid.setSelectionModel(new SlickRowSelectionModel());
    grid.onDblClick.subscribe((_event, args) => activateRow(args.row));
    grid.onKeyDown.subscribe((event, args) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        activateRow(args.row);
      }
    });
    grid.onSort.subscribe((_event, args) => {
      if (!args.multiColumnSort) {
        const id = args.sortCol?.id;
        if (id && id !== 'nowplaying') {
          onSortRef.current(id === 'nice_length' ? 'length' : (id as SortableColumn));
        }
      }
    });

    const resizeObserver = new ResizeObserver(() => grid.resizeCanvas());
    resizeObserver.observe(container);
    gridRef.current = grid;

    return () => {
      window.clearTimeout(skipScrollTimerRef.current);
      resizeObserver.disconnect();
      grid.destroy(true);
      gridRef.current = undefined;
    };
  }, [activateRow]);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    grid.setData(items);
    grid.invalidateAllRows();
    grid.render();
  }, [items]);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    grid.setSortColumns(
      sort ? [{ columnId: sort === 'length' ? 'nice_length' : sort, sortAsc: sortDir === 'asc' }] : [],
    );
  }, [sort, sortDir]);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    grid.setCellCssStyles(
      'playing',
      typeof activeRow === 'number' && activeRow >= 0 ? { [activeRow]: { nowplaying: 'playing' } } : {},
    );
    grid.invalidateAllRows();
    grid.render();
    scrollToActiveRow();
  }, [activeRow, scrollToActiveRow]);

  return (
    // biome-ignore lint/a11y/useSemanticElements: SlickGrid requires a div host and populates its ARIA grid structure.
    <div aria-label="Songs" id="slickgrid" ref={containerRef} role="grid" />
  );
};
