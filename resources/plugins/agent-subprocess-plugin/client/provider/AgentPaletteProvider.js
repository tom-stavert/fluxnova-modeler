'use strict';

var AgentUtil = require('../util/AgentUtil');

function AgentPaletteProvider(palette, create, elementFactory, bpmnFactory) {
  this._create = create;
  this._elementFactory = elementFactory;
  this._bpmnFactory = bpmnFactory;
  palette.registerProvider(this);
}

AgentPaletteProvider.$inject = ['palette', 'create', 'elementFactory', 'bpmnFactory'];

AgentPaletteProvider.prototype.getPaletteEntries = function() {
  var create = this._create;
  var elementFactory = this._elementFactory;
  var bpmnFactory = this._bpmnFactory;

  return {
    'create.agentic-subprocess': {
      group: 'activity',
      className: 'bpmn-icon-agent-subprocess',
      title: 'Create Agentic Subprocess',
      action: {
        dragstart: createAgenticSubprocess,
        click: createAgenticSubprocess
      }
    }
  };

  function createAgenticSubprocess(event) {
    var shape = elementFactory.createShape({
      type: 'bpmn:AdHocSubProcess',
      isExpanded: true
    });

    AgentUtil.addAgentExtensions(shape.businessObject, bpmnFactory);
    create.start(event, shape);
  }
};

module.exports = AgentPaletteProvider;
