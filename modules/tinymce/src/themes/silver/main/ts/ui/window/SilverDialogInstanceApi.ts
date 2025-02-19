/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, AlloyTriggers, Composing, Disabling, Focusing, Form, Reflecting, Representing, TabSection } from '@ephox/alloy';
import { StructureSchema } from '@ephox/boulder';
import { Dialog, DialogManager } from '@ephox/bridge';
import { Cell, Merger, Obj, Optional, Type } from '@ephox/katamari';

import { formBlockEvent, formCloseEvent, formUnblockEvent } from '../general/FormEvents';
import { bodyChannel, dialogChannel, footerChannel, titleChannel } from './DialogChannels';
import { FooterState } from './SilverDialogFooter';

const getCompByName = (access: DialogAccess, name: string): Optional<AlloyComponent> => {
  // TODO: Add API to alloy to find the inner most component of a Composing chain.
  const root = access.getRoot();
  // This is just to avoid throwing errors if the dialog closes before this. We should take it out
  // while developing (probably), and put it back in for the real thing.
  if (root.getSystem().isConnected()) {
    const form = Composing.getCurrent(access.getFormWrapper()).getOr(access.getFormWrapper());
    return Form.getField(form, name).orThunk(() => {
      const footer = access.getFooter();
      const footerState: Optional<FooterState> = Reflecting.getState(footer).get();
      return footerState.bind((f) => f.lookupByName(name));
    });
  } else {
    return Optional.none();
  }
};

const validateData = <T>(access: DialogAccess, data) => {
  const root = access.getRoot();
  return Reflecting.getState(root).get().map((dialogState: DialogManager.DialogInit<T>) => StructureSchema.getOrDie(
    StructureSchema.asRaw('data', dialogState.dataValidator, data)
  )).getOr(data);
};

export interface DialogAccess {
  getId: () => string;
  getRoot: () => AlloyComponent;
  getBody: () => AlloyComponent;
  getFooter: () => AlloyComponent;
  getFormWrapper: () => AlloyComponent;
}

const getDialogApi = <T extends Dialog.DialogData>(
  access: DialogAccess,
  doRedial: (newConfig: Dialog.DialogSpec<T>) => DialogManager.DialogInit<T>,
  menuItemStates: Record<string, Cell<Boolean>>
): Dialog.DialogInstanceApi<T> => {
  const withRoot = (f: (r: AlloyComponent) => void): void => {
    const root = access.getRoot();
    if (root.getSystem().isConnected()) {
      f(root);
    }
  };

  const getData = (): T => {
    const root = access.getRoot();
    const valueComp = root.getSystem().isConnected() ? access.getFormWrapper() : root;
    const representedValues = Representing.getValue(valueComp);
    const menuItemCurrentState = Obj.map(menuItemStates, (cell) => cell.get());
    return {
      ...representedValues,
      ...menuItemCurrentState
    };
  };

  const setData = (newData) => {
    // Currently, the decision is to ignore setData calls that fire after the dialog is closed
    withRoot((_) => {
      const prevData = instanceApi.getData();
      const mergedData = Merger.deepMerge(prevData, newData);
      const newInternalData = validateData(access, mergedData);
      const form = access.getFormWrapper();
      Representing.setValue(form, newInternalData);
      Obj.each(menuItemStates, (v, k) => {
        if (Obj.has(mergedData, k)) {
          v.set(mergedData[ k ]);
        }
      });
    });
  };

  const setEnabled = (name: string, state: boolean) => {
    getCompByName(access, name).each(state ? Disabling.enable : Disabling.disable);
  };

  const focus = (name: string) => {
    getCompByName(access, name).each(Focusing.focus);
  };

  const block = (message: string) => {
    if (!Type.isString(message)) {
      throw new Error('The dialogInstanceAPI.block function should be passed a blocking message of type string as an argument');
    }
    withRoot((root) => {
      AlloyTriggers.emitWith(root, formBlockEvent, { message });
    });
  };

  const unblock = () => {
    withRoot((root) => {
      AlloyTriggers.emit(root, formUnblockEvent);
    });
  };

  const showTab = (name: string) => {
    withRoot((_) => {
      const body = access.getBody();
      const bodyState = Reflecting.getState(body);
      if (bodyState.get().exists((b) => b.isTabPanel())) {
        Composing.getCurrent(body).each((tabSection) => {
          TabSection.showTab(tabSection, name);
        });
      }
    });
  };

  const redial = (d: Dialog.DialogSpec<T>): void => {
    withRoot((root) => {
      const id = access.getId();
      const dialogInit = doRedial(d);
      root.getSystem().broadcastOn([ `${dialogChannel}-${id}` ], dialogInit);

      root.getSystem().broadcastOn([ `${titleChannel}-${id}` ], dialogInit.internalDialog);
      root.getSystem().broadcastOn([ `${bodyChannel}-${id}` ], dialogInit.internalDialog);
      root.getSystem().broadcastOn([ `${footerChannel}-${id}` ], dialogInit.internalDialog);

      instanceApi.setData(dialogInit.initialData);
    });
  };

  const close = () => {
    withRoot((root) => {
      AlloyTriggers.emit(root, formCloseEvent);
    });
  };

  const instanceApi = {
    getData,
    setData,
    setEnabled,
    focus,
    block,
    unblock,
    showTab,
    redial,
    close
  };

  return instanceApi;
};

export {
  getDialogApi
};
