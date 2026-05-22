'use strict';

var domify = require('domify');
var AgentUtil = require('../util/AgentUtil');
var TEMPLATES = require('../templates');

var moddle = null;

function AgentPropertiesProvider(eventBus, modeling, bpmnFactory) {
  moddle = bpmnFactory;
  var currentElement = null;

  eventBus.on('selection.changed', function(e) {
    removeCustomPanel();
    var newSelection = e.newSelection;

    if (newSelection && newSelection.length === 1) {
      currentElement = newSelection[0];
      var bo = currentElement.businessObject;
      if (currentElement.type === 'bpmn:AdHocSubProcess' && AgentUtil.isAgenticSubprocess(bo)) {
        setTimeout(function() { injectCustomPanel(currentElement, modeling); }, 200);
      }
    } else {
      currentElement = null;
    }
  });

  eventBus.on('elements.changed', function(e) {
    if (currentElement && e.elements.some(function(el) { return el.id === currentElement.id; })) {
      if (AgentUtil.isAgenticSubprocess(currentElement.businessObject) && !document.getElementById('agent-custom-properties')) {
        setTimeout(function() { injectCustomPanel(currentElement, modeling); }, 200);
      }
    }
  });
}

AgentPropertiesProvider.$inject = ['eventBus', 'modeling', 'bpmnFactory'];

function removeCustomPanel() {
  var existing = document.getElementById('agent-custom-properties');
  if (existing) existing.remove();
}

function injectCustomPanel(element, modeling) {
  removeCustomPanel();

  var container = document.querySelector('.bio-properties-panel-scroll-container') ||
    document.querySelector('[class*="properties-panel"]');

  if (!container) return;

  var bo = element.businessObject;
  var agentConfig = AgentUtil.getAgentConfig(bo);
  if (!agentConfig) return;

  var panel = domify(TEMPLATES.panel);
  var fieldsContainer = panel.querySelector('.agent-fields-container');

  fieldsContainer.appendChild(createInputField(
    { label: 'Provider', prop: 'provider', placeholder: 'e.g. anthropic' },
    element, agentConfig, modeling
  ));

  fieldsContainer.appendChild(createInputField(
    { label: 'Model', prop: 'model', placeholder: 'e.g. claude-sonnet-4-6' },
    element, agentConfig, modeling
  ));

  fieldsContainer.appendChild(createTextareaField(
    { label: 'System Prompt', prop: 'systemPrompt', placeholder: 'Instructions for the LLM agent...' },
    element, agentConfig, modeling
  ));

  fieldsContainer.appendChild(createVariablesList(element, bo, modeling));

  container.insertBefore(panel, container.firstChild);
}

function createInputField(field, element, agentConfig, modeling) {
  var row = domify(TEMPLATES.inputField);
  var label = row.querySelector('label');
  var input = row.querySelector('input');

  label.textContent = field.label;
  input.value = agentConfig.get(field.prop) || '';
  input.placeholder = field.placeholder || '';

  input.addEventListener('change', function(e) {
    var update = {};
    update[field.prop] = e.target.value;
    modeling.updateModdleProperties(element, agentConfig, update);
  });

  return row;
}

function createTextareaField(field, element, agentConfig, modeling) {
  var row = domify(TEMPLATES.textareaField);
  var label = row.querySelector('label');
  var textarea = row.querySelector('textarea');

  label.textContent = field.label;
  textarea.value = agentConfig.get(field.prop) || '';
  textarea.placeholder = field.placeholder || '';

  textarea.addEventListener('change', function(e) {
    var update = {};
    update[field.prop] = e.target.value;
    modeling.updateModdleProperties(element, agentConfig, update);
  });

  return row;
}

function createVariablesList(element, bo, modeling) {
  var container = domify(TEMPLATES.variablesContainer);
  var addBtn = container.querySelector('.agent-btn-add');
  var listContainer = container.querySelector('.agent-variables-list');

  function render() {
    listContainer.innerHTML = '';
    var variables = AgentUtil.getContextVariables(bo);

    if (variables.length === 0) {
      listContainer.appendChild(domify(TEMPLATES.emptyVariables));
      return;
    }

    variables.forEach(function(variable, index) {
      var row = domify(TEMPLATES.variableRow);
      var nameInput = row.querySelector('.agent-variable-name');
      var removeBtn = row.querySelector('.agent-btn-remove');

      nameInput.value = variable.name || '';
      nameInput.addEventListener('change', function(e) {
        variable.name = e.target.value;
        AgentUtil.updateModdle(element, bo, modeling);
      });

      removeBtn.addEventListener('click', function() {
        variables.splice(index, 1);
        AgentUtil.updateModdle(element, bo, modeling);
        render();
      });

      listContainer.appendChild(row);
    });
  }

  addBtn.addEventListener('click', function() {
    var context = AgentUtil.getAgentContext(bo);
    if (!context) {
      var extensionElements = bo.get('extensionElements');
      context = moddle.create('agent:Context', { variables: [] });
      context.$parent = extensionElements;
      extensionElements.get('values').push(context);
    }

    var newVar = moddle.create('agent:Variable', { name: '' });
    newVar.$parent = context;
    context.get('variables').push(newVar);

    AgentUtil.updateModdle(element, bo, modeling);
    render();
  });

  render();
  return container;
}

module.exports = AgentPropertiesProvider;
