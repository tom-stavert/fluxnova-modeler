'use strict';

function getAgentConfig(bo) {
  var extensionElements = bo.get('extensionElements');
  if (!extensionElements) return null;
  return extensionElements.get('values')
    .find(function(v) { return v.$type === 'agent:Config'; }) || null;
}

function getAgentContext(bo) {
  var extensionElements = bo.get('extensionElements');
  if (!extensionElements) return null;
  return extensionElements.get('values')
    .find(function(v) { return v.$type === 'agent:Context'; }) || null;
}

function isAgenticSubprocess(bo) {
  return !!getAgentConfig(bo);
}

function getContextVariables(bo) {
  var context = getAgentContext(bo);
  return context ? (context.get('variables') || []) : [];
}

function updateModdle(element, bo, modeling) {
  modeling.updateModdleProperties(element, bo, {
    extensionElements: bo.get('extensionElements')
  });
}

function addAgentExtensions(bo, bpmnFactory) {
  var extensionElements = bo.get('extensionElements');
  if (!extensionElements) {
    extensionElements = bpmnFactory.create('bpmn:ExtensionElements', { values: [] });
    extensionElements.$parent = bo;
    bo.extensionElements = extensionElements;
  }

  if (!getAgentConfig(bo)) {
    var config = bpmnFactory.create('agent:Config', {
      provider: '', model: '', systemPrompt: ''
    });
    config.$parent = extensionElements;
    extensionElements.get('values').push(config);
  }

  if (!getAgentContext(bo)) {
    var context = bpmnFactory.create('agent:Context', { variables: [] });
    context.$parent = extensionElements;
    extensionElements.get('values').push(context);
  }
}

function removeAgentExtensions(bo) {
  var extensionElements = bo.get('extensionElements');
  if (!extensionElements) return;
  var values = extensionElements.get('values');
  for (var i = values.length - 1; i >= 0; i--) {
    if (values[i].$type === 'agent:Config' || values[i].$type === 'agent:Context') {
      values.splice(i, 1);
    }
  }
}

module.exports = {
  isAgenticSubprocess: isAgenticSubprocess,
  getAgentConfig: getAgentConfig,
  getAgentContext: getAgentContext,
  getContextVariables: getContextVariables,
  updateModdle: updateModdle,
  addAgentExtensions: addAgentExtensions,
  removeAgentExtensions: removeAgentExtensions
};
