'use strict';

var AgentUtil = require('../util/AgentUtil');

function AgentReplaceMenuProvider(popupMenu, modeling, bpmnFactory, overlays) {
  this._modeling = modeling;
  this._bpmnFactory = bpmnFactory;
  this._overlays = overlays;
  popupMenu.registerProvider('bpmn-replace', this);
}

AgentReplaceMenuProvider.$inject = ['popupMenu', 'modeling', 'bpmnFactory', 'overlays'];

AgentReplaceMenuProvider.prototype.getPopupMenuEntries = function(element) {
  var modeling = this._modeling;
  var bpmnFactory = this._bpmnFactory;
  var overlays = this._overlays;
  var bo = element.businessObject;

  if (element.type !== 'bpmn:SubProcess' && element.type !== 'bpmn:AdHocSubProcess') {
    return {};
  }

  if (AgentUtil.isAgenticSubprocess(bo)) {
    return {
      'replace-with-adhoc-subprocess': {
        label: 'Ad-Hoc Subprocess',
        className: 'bpmn-icon-subprocess-expanded',
        action: function() {
          AgentUtil.removeAgentExtensions(bo);
          AgentUtil.updateModdle(element, bo, modeling);
          removeAgentOverlay(element, overlays);
        }
      }
    };
  }

  return {
    'replace-with-agentic-subprocess': {
      label: 'Agentic Subprocess',
      className: 'bpmn-icon-agent-subprocess',
      action: function() {
        AgentUtil.addAgentExtensions(bo, bpmnFactory);
        AgentUtil.updateModdle(element, bo, modeling);
        setTimeout(function() {
          addAgentOverlay(element, overlays);
        }, 100);
      }
    }
  };
};

function addAgentOverlay(element, overlays) {
  var domify = require('domify');
  var TEMPLATES = require('../templates');

  if (!overlays) return;
  try {
    removeAgentOverlay(element, overlays);
    var badge = domify(TEMPLATES.aiBadge);
    overlays.add(element, 'agent-ai-badge', {
      position: { top: 4, left: 4 },
      html: badge
    });
  } catch (err) {
    console.log('[Agent Subprocess Plugin] Error adding overlay:', err.message);
  }
}

function removeAgentOverlay(element, overlays) {
  if (!overlays) return;
  try {
    overlays.remove({ element: element, type: 'agent-ai-badge' });
  } catch (err) {}
}

module.exports = AgentReplaceMenuProvider;
