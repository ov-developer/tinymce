/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloyTriggers, Behaviour, Disabling, Focusing, FormField as AlloyFormField, GuiFactory, Keying, Memento,
  NativeEvents, SimpleSpec, Tabstopping, Unselecting
} from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Fun, Optional } from '@ephox/katamari';
import { Checked } from '@ephox/sugar';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as ReadOnly from '../../ReadOnly';
import { ComposingConfigs } from '../alien/ComposingConfigs';
import { RepresentingConfigs } from '../alien/RepresentingConfigs';
import * as Icons from '../icons/Icons';
import { formChangeEvent } from './FormEvents';

type CheckboxSpec = Omit<Dialog.Checkbox, 'type'>;

export const renderCheckbox = (spec: CheckboxSpec, providerBackstage: UiFactoryBackstageProviders, initialData: Optional<boolean>): SimpleSpec => {
  const toggleCheckboxHandler = (comp: AlloyComponent) => {
    comp.element.dom.click();
    return Optional.some(true);
  };

  const pField = AlloyFormField.parts.field({
    factory: { sketch: Fun.identity },
    dom: {
      tag: 'input',
      classes: [ 'tox-checkbox__input' ],
      attributes: {
        type: 'checkbox'
      }
    },

    behaviours: Behaviour.derive([
      ComposingConfigs.self(),
      Disabling.config({
        disabled: () => !spec.enabled || providerBackstage.isDisabled()
      }),
      Tabstopping.config({}),
      Focusing.config({ }),
      RepresentingConfigs.withElement(initialData, Checked.get, Checked.set),
      Keying.config({
        mode: 'special',
        onEnter: toggleCheckboxHandler,
        onSpace: toggleCheckboxHandler,
        stopSpaceKeyup: true
      }),
      AddEventsBehaviour.config('checkbox-events', [
        AlloyEvents.run(NativeEvents.change(), (component, _) => {
          AlloyTriggers.emitWith(component, formChangeEvent, { name: spec.name } );
        })
      ])
    ])
  });

  const pLabel = AlloyFormField.parts.label({
    dom: {
      tag: 'span',
      classes: [ 'tox-checkbox__label' ]
    },
    components: [
      GuiFactory.text(providerBackstage.translate(spec.label))
    ],
    behaviours: Behaviour.derive([
      Unselecting.config({})
    ])
  });

  const makeIcon = (className: string) => {
    const iconName = className === 'checked' ? 'selected' : 'unselected';
    return Icons.render(iconName, { tag: 'span', classes: [ 'tox-icon', 'tox-checkbox-icon__' + className ] }, providerBackstage.icons);
  };

  const memIcons = Memento.record(
    {
      dom: {
        tag: 'div',
        classes: [ 'tox-checkbox__icons' ]
      },
      components: [
        makeIcon('checked'),
        makeIcon('unchecked')
      ]
    }
  );

  return AlloyFormField.sketch({
    dom: {
      tag: 'label',
      classes: [ 'tox-checkbox' ]
    },
    components: [
      pField,
      memIcons.asSpec(),
      pLabel
    ],
    fieldBehaviours: Behaviour.derive([
      Disabling.config({
        disabled: () => !spec.enabled || providerBackstage.isDisabled(),
        disableClass: 'tox-checkbox--disabled',
        onDisabled: (comp) => {
          AlloyFormField.getField(comp).each(Disabling.disable);
        },
        onEnabled: (comp) => {
          AlloyFormField.getField(comp).each(Disabling.enable);
        }
      }),
      ReadOnly.receivingConfig()
    ])
  });
};
