/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Selections } from '@ephox/darwin';
import { Arr, Fun } from '@ephox/katamari';
import { SugarNode } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { Menu } from 'tinymce/core/api/ui/Ui';

import { getCellClassList, getTableBorderStyles, getTableBorderWidths, getTableBackgroundColorMap, getTableBorderColorMap, getTableClassList, hasTableGrid } from '../api/Settings';
import { Clipboard } from '../core/Clipboard';
import { SelectionTargets, LockedDisable } from '../selection/SelectionTargets';
import { verticalAlignValues } from './CellAlignValues';
import { applyTableCellStyle, changeColumnHeader, changeRowHeader, filterNoneItem, buildColorMenu, buildMenuItems } from './UiUtils';

interface AddMenuSpec {
  text: string;
  command: string;
  icon?: string;
  onSetup: (api: Menu.MenuItemInstanceApi) => () => void;
}

const addMenuItems = (editor: Editor, selections: Selections, selectionTargets: SelectionTargets, clipboard: Clipboard): void => {
  const cmd = (command: string) => () => editor.execCommand(command);

  // TODO TINY-8172: unwind this before merging the feature branch
  const addMenuIfRegistered = (name: string, spec: AddMenuSpec) => {
    if (editor.editorCommands.hasCustomCommand(spec.command)) {
      editor.ui.registry.addMenuItem(name, {
        ...spec,
        onAction: cmd(spec.command)
      });
      return true;
    } else {
      return false;
    }
  };

  const insertTableAction = (data: { numRows: number; numColumns: number }) => {
    editor.execCommand('mceInsertTable', false, {
      rows: data.numRows,
      columns: data.numColumns
    });
  };

  const hasRowMenuItems = [
    addMenuIfRegistered('tableinsertrowbefore', {
      text: 'Insert row before',
      icon: 'table-insert-row-above',
      command: 'mceTableInsertRowBefore',
      onSetup: selectionTargets.onSetupCellOrRow
    }),
    addMenuIfRegistered('tableinsertrowafter', {
      text: 'Insert row after',
      icon: 'table-insert-row-after',
      command: 'mceTableInsertRowAfter',
      onSetup: selectionTargets.onSetupCellOrRow
    }),
    addMenuIfRegistered('tabledeleterow', {
      text: 'Delete row',
      icon: 'table-delete-row',
      command: 'mceTableDeleteRow',
      onSetup: selectionTargets.onSetupCellOrRow
    }),
    addMenuIfRegistered('tablerowprops', {
      text: 'Row properties',
      icon: 'table-row-properties',
      command: 'mceTableRowProps',
      onSetup: selectionTargets.onSetupCellOrRow
    }),

    addMenuIfRegistered('tablecutrow', {
      text: 'Cut row',
      icon: 'cut-row',
      command: 'mceTableCutRow',
      onSetup: selectionTargets.onSetupCellOrRow
    }),
    addMenuIfRegistered('tablecopyrow', {
      text: 'Copy row',
      icon: 'duplicate-row',
      command: 'mceTableCopyRow',
      onSetup: selectionTargets.onSetupCellOrRow
    }),
    addMenuIfRegistered('tablepasterowbefore', {
      text: 'Paste row before',
      icon: 'paste-row-before',
      command: 'mceTablePasteRowBefore',
      onSetup: selectionTargets.onSetupPasteable(clipboard.getRows)
    }),
    addMenuIfRegistered('tablepasterowafter', {
      text: 'Paste row after',
      icon: 'paste-row-after',
      command: 'mceTablePasteRowAfter',
      onSetup: selectionTargets.onSetupPasteable(clipboard.getRows)
    }),
  ];

  const hasColumnMenuItems = [
    addMenuIfRegistered('tableinsertcolumnbefore', {
      text: 'Insert column before',
      icon: 'table-insert-column-before',
      command: 'mceTableInsertColBefore',
      onSetup: selectionTargets.onSetupColumn(LockedDisable.onFirst)
    }),
    addMenuIfRegistered('tableinsertcolumnafter', {
      text: 'Insert column after',
      icon: 'table-insert-column-after',
      command: 'mceTableInsertColAfter',
      onSetup: selectionTargets.onSetupColumn(LockedDisable.onLast)
    }),
    addMenuIfRegistered('tabledeletecolumn', {
      text: 'Delete column',
      icon: 'table-delete-column',
      command: 'mceTableDeleteCol',
      onSetup: selectionTargets.onSetupColumn(LockedDisable.onAny)
    }),

    addMenuIfRegistered('tablecutcolumn', {
      text: 'Cut column',
      icon: 'cut-column',
      command: 'mceTableCutCol',
      onSetup: selectionTargets.onSetupColumn(LockedDisable.onAny)
    }),
    addMenuIfRegistered('tablecopycolumn', {
      text: 'Copy column',
      icon: 'duplicate-column',
      command: 'mceTableCopyCol',
      onSetup: selectionTargets.onSetupColumn(LockedDisable.onAny)
    }),
    addMenuIfRegistered('tablepastecolumnbefore', {
      text: 'Paste column before',
      icon: 'paste-column-before',
      command: 'mceTablePasteColBefore',
      onSetup: selectionTargets.onSetupPasteableColumn(clipboard.getColumns, LockedDisable.onFirst)
    }),
    addMenuIfRegistered('tablepastecolumnafter', {
      text: 'Paste column after',
      icon: 'paste-column-after',
      command: 'mceTablePasteColAfter',
      onSetup: selectionTargets.onSetupPasteableColumn(clipboard.getColumns, LockedDisable.onLast)
    }),
  ];

  const hasCellMenuItems = [
    addMenuIfRegistered('tablecellprops', {
      text: 'Cell properties',
      icon: 'table-cell-properties',
      command: 'mceTableCellProps',
      onSetup: selectionTargets.onSetupCellOrRow
    }),
    addMenuIfRegistered('tablemergecells', {
      text: 'Merge cells',
      icon: 'table-merge-cells',
      command: 'mceTableMergeCells',
      onSetup: selectionTargets.onSetupMergeable
    }),
    addMenuIfRegistered('tablesplitcells', {
      text: 'Split cell',
      icon: 'table-split-cells',
      command: 'mceTableSplitCells',
      onSetup: selectionTargets.onSetupUnmergeable
    }),
  ];

  if (hasTableGrid(editor) === false) {
    editor.ui.registry.addMenuItem('inserttable', {
      text: 'Table',
      icon: 'table',
      onAction: cmd('mceInsertTable')
    });
  } else {
    editor.ui.registry.addNestedMenuItem('inserttable', {
      text: 'Table',
      icon: 'table',
      getSubmenuItems: () => [{ type: 'fancymenuitem', fancytype: 'inserttable', onAction: insertTableAction }]
    });
  }

  // TINY-3636: We want a way to use the dialog even when tablegrid true.
  // If tablegrid false then inserttable and inserttabledialog are the same,
  // but that's preferrable to breaking things at this point.
  editor.ui.registry.addMenuItem('inserttabledialog', {
    text: 'Insert table',
    icon: 'table',
    onAction: cmd('mceInsertTable')
  });

  addMenuIfRegistered('tableprops', {
    text: 'Table properties',
    onSetup: selectionTargets.onSetupTable,
    command: 'mceTableProps'
  });
  addMenuIfRegistered('deletetable', {
    text: 'Delete table',
    icon: 'table-delete-table',
    onSetup: selectionTargets.onSetupTable,
    command: 'mceTableDelete'
  });

  // if any of the row menu items returned true
  if (Arr.contains(hasRowMenuItems, true)) {
    editor.ui.registry.addNestedMenuItem('row', {
      type: 'nestedmenuitem',
      text: 'Row',
      getSubmenuItems: Fun.constant('tableinsertrowbefore tableinsertrowafter tabledeleterow tablerowprops | tablecutrow tablecopyrow tablepasterowbefore tablepasterowafter')
    });
  }

  if (Arr.contains(hasColumnMenuItems, true)) {
    editor.ui.registry.addNestedMenuItem('column', {
      type: 'nestedmenuitem',
      text: 'Column',
      getSubmenuItems: Fun.constant('tableinsertcolumnbefore tableinsertcolumnafter tabledeletecolumn | tablecutcolumn tablecopycolumn tablepastecolumnbefore tablepastecolumnafter')
    });
  }

  if (Arr.contains(hasCellMenuItems, true)) {
    editor.ui.registry.addNestedMenuItem('cell', {
      type: 'nestedmenuitem',
      text: 'Cell',
      getSubmenuItems: Fun.constant('tablecellprops tablemergecells tablesplitcells')
    });
  }

  editor.ui.registry.addContextMenu('table', {
    update: () => {
      // context menu fires before node change, so check the selection here first
      selectionTargets.resetTargets();
      // ignoring element since it's monitored elsewhere
      return selectionTargets.targets().fold(Fun.constant(''), (targets) => {
        // If clicking in a caption, then we shouldn't show the cell/row/column options
        if (SugarNode.name(targets.element) === 'caption') {
          return 'tableprops deletetable';
        } else {
          return 'cell row column | advtablesort | tableprops deletetable';
        }
      });
    }
  });

  const tableClassList = filterNoneItem(getTableClassList(editor));
  if (tableClassList.length !== 0 && editor.editorCommands.hasCustomCommand('mceTableToggleClass')) {
    editor.ui.registry.addNestedMenuItem('tableclass', {
      icon: 'table-classes',
      text: 'Table styles',
      getSubmenuItems: () => buildMenuItems(
        editor,
        selections,
        tableClassList,
        'tableclass',
        (value) => editor.execCommand('mceTableToggleClass', false, value)
      ),
      onSetup: selectionTargets.onSetupTable
    });
  }

  const tableCellClassList = filterNoneItem(getCellClassList(editor));
  if (tableCellClassList.length !== 0 && editor.editorCommands.hasCustomCommand('mceTableCellToggleClass')) {
    editor.ui.registry.addNestedMenuItem('tablecellclass', {
      icon: 'table-cell-classes',
      text: 'Cell styles',
      getSubmenuItems: () => buildMenuItems(
        editor,
        selections,
        tableCellClassList,
        'tablecellclass',
        (value) => editor.execCommand('mceTableCellToggleClass', false, value)
      ),
      onSetup: selectionTargets.onSetupCellOrRow
    });
  }

  // TODO TINY-8172: unwind this before merging the feature branch
  if (editor.editorCommands.hasCustomCommand('mceTableApplyCellStyle')) {
    editor.ui.registry.addNestedMenuItem('tablecellvalign', {
      icon: 'vertical-align',
      text: 'Vertical align',
      getSubmenuItems: () => buildMenuItems(
        editor,
        selections,
        verticalAlignValues,
        'tablecellverticalalign',
        applyTableCellStyle(editor, 'vertical-align')
      ),
      onSetup: selectionTargets.onSetupCellOrRow
    });

    editor.ui.registry.addNestedMenuItem('tablecellborderwidth', {
      icon: 'border-width',
      text: 'Border width',
      getSubmenuItems: () => buildMenuItems(
        editor,
        selections,
        getTableBorderWidths(editor),
        'tablecellborderwidth',
        applyTableCellStyle(editor, 'border-width')
      ),
      onSetup: selectionTargets.onSetupCellOrRow
    });

    editor.ui.registry.addNestedMenuItem('tablecellborderstyle', {
      icon: 'border-style',
      text: 'Border style',
      getSubmenuItems: () => buildMenuItems(
        editor,
        selections,
        getTableBorderStyles(editor),
        'tablecellborderstyle',
        applyTableCellStyle(editor, 'border-style')
      ),
      onSetup: selectionTargets.onSetupCellOrRow
    });

    editor.ui.registry.addNestedMenuItem('tablecellbackgroundcolor', {
      icon: 'cell-background-color',
      text: 'Background color',
      getSubmenuItems: () => buildColorMenu(editor, getTableBackgroundColorMap(editor), 'background-color'),
      onSetup: selectionTargets.onSetupCellOrRow
    });

    editor.ui.registry.addNestedMenuItem('tablecellbordercolor', {
      icon: 'cell-border-color',
      text: 'Border color',
      getSubmenuItems: () => buildColorMenu(editor, getTableBorderColorMap(editor), 'border-color'),
      onSetup: selectionTargets.onSetupCellOrRow
    });
  }

  // TODO TINY-8172: unwind this before merging the feature branch
  if (editor.editorCommands.hasCustomCommand('mceTableToggleCaption')) {
    editor.ui.registry.addToggleMenuItem('tablecaption', {
      icon: 'table-caption',
      text: 'Table caption',
      onAction: cmd('mceTableToggleCaption'),
      onSetup: selectionTargets.onSetupTableWithCaption
    });
  }

  // TODO TINY-8172: unwind this before merging the feature branch
  if (editor.editorCommands.hasCustomCommand('mceTableRowType')) {
    editor.ui.registry.addToggleMenuItem('tablerowheader', {
      text: 'Row header',
      icon: 'table-top-header',
      onAction: changeRowHeader(editor),
      onSetup: selectionTargets.onSetupTableRowHeaders
    });
  }

  // TODO TINY-8172: unwind this before merging the feature branch
  if (editor.editorCommands.hasCustomCommand('mceTableColType')) {
    editor.ui.registry.addToggleMenuItem('tablecolheader', {
      text: 'Column header',
      icon: 'table-left-header',
      onAction: changeColumnHeader(editor),
      onSetup: selectionTargets.onSetupTableColumnHeaders
    });
  }
};

export {
  addMenuItems
};
