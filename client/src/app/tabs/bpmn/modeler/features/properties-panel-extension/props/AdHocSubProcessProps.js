/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  CheckboxEntry,
  isCheckboxEntryEdited,
  isSelectEntryEdited,
  isTextFieldEntryEdited,
  SelectEntry,
  TextFieldEntry
} from '@bpmn-io/properties-panel';

import {
  useService
} from 'bpmn-js-properties-panel';


export function AdHocSubProcessProps(props) {
  const { element } = props;

  if (!is(element, 'bpmn:AdHocSubProcess')) {
    return [];
  }

  return [
    {
      id: 'adHocOrdering',
      component: Ordering,
      isEdited: isSelectEntryEdited
    },
    {
      id: 'adHocCancelRemainingInstances',
      component: CancelRemainingInstances,
      isEdited: isCheckboxEntryEdited
    },
    {
      id: 'adHocCompletionCondition',
      component: CompletionCondition,
      isEdited: isTextFieldEntryEdited
    }
  ];
}

function Ordering(props) {
  const { element } = props;

  const commandStack = useService('commandStack'),
        translate = useService('translate');

  const businessObject = getBusinessObject(element);

  const getValue = () => businessObject.get('ordering') || 'Parallel';

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: { ordering: value }
    });
  };

  const getOptions = () => [
    { label: translate('Parallel'), value: 'Parallel' },
    { label: translate('Sequential'), value: 'Sequential' }
  ];

  return SelectEntry({
    element,
    id: 'adHocOrdering',
    label: translate('Ordering'),
    getValue,
    setValue,
    getOptions
  });
}

function CancelRemainingInstances(props) {
  const { element } = props;

  const commandStack = useService('commandStack'),
        translate = useService('translate');

  const businessObject = getBusinessObject(element);

  const getValue = () => {
    const value = businessObject.get('cancelRemainingInstances');
    return value !== undefined ? value : true;
  };

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: { cancelRemainingInstances: value }
    });
  };

  return CheckboxEntry({
    element,
    id: 'adHocCancelRemainingInstances',
    label: translate('Cancel remaining instances'),
    getValue,
    setValue
  });
}

function CompletionCondition(props) {
  const { element } = props;

  const bpmnFactory = useService('bpmnFactory'),
        commandStack = useService('commandStack'),
        translate = useService('translate'),
        debounce = useService('debounceInput');

  const businessObject = getBusinessObject(element);

  const getValue = () => {
    const completionCondition = businessObject.get('completionCondition');
    return completionCondition && completionCondition.body;
  };

  const setValue = (value) => {
    const commands = [];

    let completionCondition = businessObject.get('completionCondition');

    if (!completionCondition) {
      completionCondition = bpmnFactory.create('bpmn:FormalExpression', {});
      completionCondition.$parent = businessObject;

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
          properties: { completionCondition }
        }
      });
    }

    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: completionCondition,
        properties: { body: value || undefined }
      }
    });

    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  return TextFieldEntry({
    element,
    id: 'adHocCompletionCondition',
    label: translate('Completion condition'),
    getValue,
    setValue,
    debounce
  });
}
