/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import AddOnManager from './AddOnManager';
import Editor from './Editor';

export interface Plugin {
  getMetadata?: () => { name: string; url: string };
  init?: (editor: Editor, url: string) => void;

  // Allow custom apis
  [key: string]: any;
}

type PluginManager = AddOnManager<void | Plugin>;
const PluginManager: PluginManager = AddOnManager.PluginManager;

export default PluginManager;
