/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider';

import { is } from 'bpmn-js/lib/util/ModelUtil';


/**
 * Surfaces the BPMN parse-time constraint that start events and end events
 * are not allowed inside ad-hoc subprocesses.
 *
 * Note: sequence flows are allowed (Decision 8).
 */
export default class AdHocSubProcessRules extends RuleProvider {

  constructor(eventBus) {
    super(eventBus);
  }

  init() {
    this.addRule('shape.create', 1500, ({ shape, target }) => {
      if (!isStartOrEndEvent(shape)) {
        return;
      }

      if (isAdHocSubProcess(target)) {
        return false;
      }
    });

    this.addRule('shape.append', 1500, ({ element, shape }) => {
      if (!isStartOrEndEvent(shape)) {
        return;
      }

      if (isAdHocSubProcess(element.parent)) {
        return false;
      }
    });
  }
}

AdHocSubProcessRules.$inject = [ 'eventBus' ];


// helpers ///////////////////

function isAdHocSubProcess(element) {
  return element && is(element, 'bpmn:AdHocSubProcess');
}

function isStartOrEndEvent(shape) {
  return is(shape, 'bpmn:StartEvent') || is(shape, 'bpmn:EndEvent');
}
