'use strict';

const domify = require('domify');
const AgentUtil = require('../util/AgentUtil');
const TEMPLATES = require('../templates');

function AgentOverlayProvider(eventBus, overlays, elementRegistry) {
  const syncOverlay = (element) => {
    if (!element || element.type !== 'bpmn:AdHocSubProcess') {
      return;
    }

    if (AgentUtil.isAgenticSubprocess(element.businessObject)) {
      addAiOverlay(element, overlays);
    } else {
      removeAiOverlay(element, overlays);
    }
  };

  eventBus.on('import.done', () => {
    elementRegistry.getAll().forEach(syncOverlay);
  });

  eventBus.on('element.changed', (e) => {
    syncOverlay(e.element || null);
  });

  eventBus.on('elements.changed', (e) => {
    const elements = e.elements || [];

    elements.forEach(syncOverlay);
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
      html: badge,
    });
  } catch (err) {}
}

function removeAiOverlay(element, overlays) {
  if (!overlays) return;
  try {
    overlays.remove({ element, type: 'agent-ai-badge' });
  } catch (err) {}
}

module.exports = AgentOverlayProvider;
