/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

const fireRestoreDraft = (editor: Editor): EditorEvent<{}> =>
  editor.dispatch('RestoreDraft');

const fireStoreDraft = (editor: Editor): EditorEvent<{}> =>
  editor.dispatch('StoreDraft');

const fireRemoveDraft = (editor: Editor): EditorEvent<{}> =>
  editor.dispatch('RemoveDraft');

export {
  fireRestoreDraft,
  fireStoreDraft,
  fireRemoveDraft
};
