/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as CaretContainerInput from '../caret/CaretContainerInput';
import * as Rtc from '../Rtc';
import * as ArrowKeys from './ArrowKeys';
import * as Autocompleter from './Autocompleter';
import * as BoundarySelection from './BoundarySelection';
import * as DeleteBackspaceKeys from './DeleteBackspaceKeys';
import * as EnterKey from './EnterKey';
import * as HomeEndKeys from './HomeEndKeys';
import * as InputKeys from './InputKeys';
import * as PageUpDownKeys from './PageUpDownKeys';
import * as SpaceKey from './SpaceKey';
import * as TabKey from './TabKey';

const setup = (editor: Editor): Cell<Text> => {
  editor.addShortcut('Meta+P', '', 'mcePrint');
  Autocompleter.setup(editor);

  if (Rtc.isRtc(editor)) {
    return Cell(null);
  } else {
    const caret = BoundarySelection.setupSelectedState(editor);

    CaretContainerInput.setup(editor);
    ArrowKeys.setup(editor, caret);
    DeleteBackspaceKeys.setup(editor, caret);
    EnterKey.setup(editor);
    SpaceKey.setup(editor);
    InputKeys.setup(editor);
    TabKey.setup(editor);
    HomeEndKeys.setup(editor, caret);
    PageUpDownKeys.setup(editor, caret);

    return caret;
  }
};

export {
  setup
};
