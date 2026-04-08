/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

import { createAdHocSubProcessGroup as defaultCreateAdHocSubProcessGroup } from './props/AdHocSubProcessGroup';


export default class AdHocSubProcessPropertiesProvider {

  constructor(propertiesPanel, createAdHocSubProcessGroup = defaultCreateAdHocSubProcessGroup) {
    propertiesPanel.registerProvider(500, this);
    this.createAdHocSubProcessGroup = createAdHocSubProcessGroup;
  }

  getGroups(element) {
    return groups => {
      groups = groups.slice();

      const adHocGroup = this.createAdHocSubProcessGroup(element);
      if (adHocGroup) {
        groups.push(adHocGroup);
      }

      return groups;
    };
  }
}

AdHocSubProcessPropertiesProvider.$inject = [ 'propertiesPanel' ];
