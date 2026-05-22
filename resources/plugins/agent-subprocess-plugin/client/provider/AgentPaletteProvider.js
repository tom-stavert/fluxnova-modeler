'use strict';

const AgentUtil = require('../util/AgentUtil');

function AgentPaletteProvider(palette, create, elementFactory, bpmnFactory) {
  this._create = create;
  this._elementFactory = elementFactory;
  this._bpmnFactory = bpmnFactory;
  palette.registerProvider(this);
}

AgentPaletteProvider.$inject = ['palette', 'create', 'elementFactory', 'bpmnFactory'];

AgentPaletteProvider.prototype.getPaletteEntries = function() {
  const { _create: create, _elementFactory: elementFactory, _bpmnFactory: bpmnFactory } = this;

  const createAgenticSubprocess = (event) => {
    const shape = elementFactory.createShape({
      type: 'bpmn:AdHocSubProcess',
      isExpanded: true
    });

    AgentUtil.addAgentExtensions(shape.businessObject, bpmnFactory);
    create.start(event, shape);
  };

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
};

module.exports = AgentPaletteProvider;
