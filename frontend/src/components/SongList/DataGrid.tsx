import {
  DataEditor,
  type DataEditorRef,
  type GridCell,
  GridCellKind,
  type GridColumn,
  type GridMouseEventArgs,
  type GridSelection,
  type Item,
} from '@glideapps/glide-data-grid';
import '@glideapps/glide-data-grid/dist/index.css';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useEvent } from 'hooks/useEvent';

import { THEME_LIGHT } from './theme';
import { selectionForRow } from './util';

type SortableColumn = 'artist' | 'track_num' | 'title' | 'album' | 'length';

type SongGridColumn = GridColumn & {
  id: 'nowplaying' | 'artist' | 'track_num' | 'title' | 'album' | 'nice_length';
};

const DOUBLE_CLICK_LATENCY_MS = 300;

const COLUMNS: SongGridColumn[] = [
  { id: 'nowplaying', title: '', width: 40 },
  { id: 'artist', title: 'Artist', grow: 1 },
  { id: 'track_num', title: '#', width: 50 },
  { id: 'title', title: 'Title', grow: 1 },
  { id: 'album', title: 'Album', grow: 1 },
  { id: 'nice_length', title: 'Duration', width: 120 },
];

export const DataGrid = ({
  activeRow,
  items,
  // sort,
  // sortDir,
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
  const ref = useRef<DataEditorRef>(null);
  const skipScrollToRowRef = useRef(false);
  const [columnSizes, setColumnSizes] = useState<Record<string, number>>({});
  const [hoverRow, setHoverRow] = useState<number | undefined>(undefined);
  const theme = THEME_LIGHT;

  const columns: SongGridColumn[] = COLUMNS.map((col) => ({
    ...col,
    grow: typeof columnSizes[col.id] === 'number' ? undefined : col.grow,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    width: columnSizes[col.id] ?? col.width,
  }));

  const [selection, setSelection] = useState<GridSelection>(selectionForRow(activeRow, columns.length));

  // holds double-click related state
  const doubleClickRef = useRef<{
    count: number;
    row: null | number;
    timer: number | null;
  }>({
    count: 0,
    row: null,
    timer: null,
  });

  const getCellContent = useCallback(
    (cell: Item): GridCell => {
      const [col, row] = cell;
      const dataRow = items[row];
      const columnKey = COLUMNS[col]?.id;

      if (!columnKey || !dataRow) {
        return {
          allowOverlay: false,
          data: 'ERROR',
          displayData: 'ERROR',
          kind: GridCellKind.Text,
          readonly: true,
        };
      }

      if (columnKey === 'nowplaying') {
        return {
          allowOverlay: false,
          data: '',
          displayData: row === activeRow ? '▶️' : '',
          kind: GridCellKind.Text,
          readonly: true,
        };
      }

      const data = columnKey === 'title' ? dataRow.title || dataRow.nice_title : (dataRow[columnKey]?.toString() ?? '');

      return {
        allowOverlay: false,
        allowWrapping: false,
        contentAlign: columnKey === 'track_num' ? 'right' : undefined,
        data,
        displayData: data,
        kind: GridCellKind.Text,
        readonly: true,
      };
    },
    [activeRow, items],
  );

  const handleActivateRow = useCallback(
    (row: number) => {
      skipScrollToRowRef.current = true;
      onActivateRow(row);

      // reset flag after a short delay
      setTimeout(() => {
        skipScrollToRowRef.current = false;
      }, 10);
    },
    [onActivateRow],
  );

  const scrollToActiveRow = useCallback(() => {
    if (typeof activeRow !== 'number' || skipScrollToRowRef.current) {
      return;
    }

    ref.current?.scrollTo(0, activeRow, 'vertical', undefined, undefined, {
      vAlign: 'center',
    });

    setTimeout(() => {
      setSelection(selectionForRow(activeRow, columns.length));
    }, 50);
  }, [activeRow, setSelection, columns.length]);

  useEvent('show-nowplaying', scrollToActiveRow);

  // TODO: scroll to playing row on mount, or if user is idle, or active is not visible, or active is not already selected?
  useEffect(() => {
    scrollToActiveRow();
  }, [scrollToActiveRow]);

  return (
    <DataEditor
      cellActivationBehavior="double-click"
      columns={columns}
      columnSelect="multi"
      getCellContent={getCellContent}
      gridSelection={selection}
      headerHeight={26}
      height="100%"
      maxColumnWidth={window.screen.width}
      rangeSelect="none"
      ref={ref}
      rowHeight={26}
      rows={items.length}
      rowSelect="multi"
      verticalBorder={false}
      width="100%"
      onCellClicked={useCallback(
        (cell: Item) => {
          const [, row] = cell;

          if (doubleClickRef.current.row !== row) {
            doubleClickRef.current.row = row;
            doubleClickRef.current.count = 1;
            clearTimeout(doubleClickRef.current.timer as number);
            return;
          }

          doubleClickRef.current.count += 1;

          if (doubleClickRef.current.count === 2) {
            handleActivateRow(row);
          } else {
            doubleClickRef.current.timer = window.setTimeout(() => {
              doubleClickRef.current.count = 0;
            }, DOUBLE_CLICK_LATENCY_MS);
          }
        },
        [handleActivateRow],
      )}
      onCellActivated={useCallback(
        (cell: Item) => {
          const [, row] = cell;
          handleActivateRow(row);
        },
        [handleActivateRow],
      )}
      onColumnResize={useCallback((col: GridColumn, _newSize: number, _index: number, newSizeWithGrow: number) => {
        if (col.id && col.id !== 'nowplaying') {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          setColumnSizes((prev) => ({ ...prev, [col.id]: newSizeWithGrow }));
        }
      }, [])}
      onGridSelectionChange={useCallback(
        (sel: GridSelection) => {
          const [, row] = sel.current?.cell || [];

          if (typeof row !== 'number') {
            // should not happen, hehe
            return;
          }

          setSelection(selectionForRow(row, columns.length));
        },
        [columns.length],
      )}
      onHeaderClicked={useCallback(
        (colIndex: number) => {
          const col = columns[colIndex];
          if (!col || col.id === 'nowplaying') {
            return;
          }

          onSort(col.id === 'nice_length' ? 'length' : col.id);
        },
        [columns, onSort],
      )}
      onItemHovered={useCallback((args: GridMouseEventArgs) => {
        const [, row] = args.location;
        setHoverRow(args.kind !== 'cell' ? undefined : row);
      }, [])}
      getRowThemeOverride={(row) => ({
        bgCell: row === hoverRow ? theme.bgCellHover : row % 2 === 0 ? theme.bgCellEven : theme.bgCellOdd,
      })}
      theme={{
        // selected cell border color
        accentColor: theme.accentColor,
        // selected row color
        accentLight: theme.accentLight,

        borderColor: 'transparent',
        cellHorizontalPadding: 10,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif',
        // textDark: theme.textDark,
      }}
    />
  );
};
