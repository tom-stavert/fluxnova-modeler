/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

import { Group } from '@bpmn-io/properties-panel';
import { AdHocSubProcessProps } from './AdHocSubProcessProps';
import translate from 'diagram-js/lib/i18n/translate/translate';


export function createAdHocSubProcessGroup(element) {

  const group = {
    id: 'ad_hoc_subprocess',
    label: translate('Ad-hoc'),
    component: Group,
    entries: [
      ...AdHocSubProcessProps({ element })
    ]
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}
