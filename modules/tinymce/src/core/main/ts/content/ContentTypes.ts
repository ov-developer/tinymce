/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import AstNode from '../api/html/Node';

export type Content = string | AstNode;
export type ContentFormat = 'raw' | 'text' | 'html' | 'tree';

export interface GetContentArgs {
  format: ContentFormat;
  get: boolean;
  getInner: boolean;
  no_events?: boolean;
  save?: boolean;
  source_view?: boolean;
  [key: string]: any;
}

export interface SetContentArgs {
  format: string;
  set: boolean;
  content: Content;
  no_events?: boolean;
  no_selection?: boolean;
  paste?: boolean;
}

export interface SetContentResult {
  readonly content: Content;
  readonly html: string;
}

export interface GetSelectionContentArgs extends GetContentArgs {
  selection?: boolean;
  contextual?: boolean;
}

export interface SetSelectionContentArgs extends SetContentArgs {
  content: string;
  selection?: boolean;
}

export interface InsertContentDetails {
  readonly paste?: boolean;
  readonly merge?: boolean;
  readonly data?: {
    readonly paste: boolean;
  };
}

export const isTreeNode = (content: unknown): content is AstNode =>
  content instanceof AstNode;
