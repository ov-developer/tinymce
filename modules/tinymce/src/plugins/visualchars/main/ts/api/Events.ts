/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

const fireVisualChars = (editor: Editor, state: boolean): EditorEvent<{ state: boolean }> => {
  return editor.dispatch('VisualChars', { state });
};

export {
  fireVisualChars
};
