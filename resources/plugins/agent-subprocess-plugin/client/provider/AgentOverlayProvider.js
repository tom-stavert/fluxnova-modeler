'use strict';

var domify = require('domify');
var AgentUtil = require('../util/AgentUtil');
var TEMPLATES = require('../templates');

function AgentOverlayProvider(eventBus, overlays, elementRegistry) {
  this._overlays = overlays;

  eventBus.on(['import.done', 'element.changed'], function(e) {
    var element = e.element || null;
    if (!element || element.type !== 'bpmn:AdHocSubProcess') return;

    var bo = element.businessObject;
    if (AgentUtil.isAgenticSubprocess(bo)) {
      removeAiOverlay(element, overlays);
      setTimeout(function() { addAiOverlay(element, overlays); }, 50);
    }
  });

  eventBus.on('import.done', function() {
    setTimeout(function() {
      elementRegistry.getAll().forEach(function(el) {
        if (el.type === 'bpmn:AdHocSubProcess' && AgentUtil.isAgenticSubprocess(el.businessObject)) {
          addAiOverlay(el, overlays);
        }
      });
    }, 200);
  });
}

AgentOverlayProvider.$inject = ['eventBus', 'overlays', 'elementRegistry'];

function addAiOverlay(element, overlays) {
  if (!overlays) return;

  try {
    removeAiOverlay(element, overlays);
    var badge = domify(TEMPLATES.aiBadge);

    overlays.add(element, 'agent-ai-badge', {
      position: { top: 4, left: 4 },
      html: badge
    });
  } catch (err) {
    console.log('[Agent Subprocess Plugin] Error adding overlay:', err.message);
  }
}

function removeAiOverlay(element, overlays) {
  if (!overlays) return;
  try {
    overlays.remove({ element: element, type: 'agent-ai-badge' });
  } catch (err) {}
}

module.exports = AgentOverlayProvider;
