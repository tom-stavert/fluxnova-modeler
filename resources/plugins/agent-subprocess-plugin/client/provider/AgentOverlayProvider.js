'use strict';

const domify  = require('domify');
const AgentUtil = require('../util/AgentUtil');
const TEMPLATES = require('../templates');

function AgentOverlayProvider(eventBus, overlays, elementRegistry) {
  this._overlays = overlays;

  eventBus.on(['import.done', 'element.changed'], (e) => {
    const element = e.element || null;
    if (!element || element.type !== 'bpmn:AdHocSubProcess') return;

    const bo = element.businessObject;
    if (AgentUtil.isAgenticSubprocess(bo)) {
      removeAiOverlay(element, overlays);
      setTimeout(() => addAiOverlay(element, overlays), 50);
    }
  });

  eventBus.on('import.done', () => {
    setTimeout(() => {
      elementRegistry.getAll().forEach((el) => {
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
    const badge = domify(TEMPLATES.aiBadge);

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
    overlays.remove({ element, type: 'agent-ai-badge' });
  } catch (err) {}
}

module.exports = AgentOverlayProvider;
