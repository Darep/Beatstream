import { CompactSelection, type GridSelection } from '@glideapps/glide-data-grid';

export const selectionForRow = (
  row: number | undefined,
  totalColumns: number,
): GridSelection => ({
  current:
    typeof row === 'number'
      ? {
          cell: [0, row],
          range: { height: 1, width: totalColumns, x: 0, y: row },
          rangeStack: [],
        }
      : undefined,
  columns: CompactSelection.empty(),
  rows:
    typeof row === 'number'
      ? CompactSelection.fromSingleSelection(row)
      : CompactSelection.empty(),
});
