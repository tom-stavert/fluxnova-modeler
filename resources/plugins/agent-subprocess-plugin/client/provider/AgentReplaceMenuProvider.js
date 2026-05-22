'use strict';

const domify    = require('domify');
const AgentUtil = require('../util/AgentUtil');
const TEMPLATES = require('../templates');

function AgentReplaceMenuProvider(popupMenu, modeling, bpmnFactory, bpmnReplace, overlays) {
  this._modeling    = modeling;
  this._bpmnFactory = bpmnFactory;
  this._bpmnReplace = bpmnReplace;
  this._overlays    = overlays;
  popupMenu.registerProvider('bpmn-replace', this);
}

AgentReplaceMenuProvider.$inject = ['popupMenu', 'modeling', 'bpmnFactory', 'bpmnReplace', 'overlays'];

AgentReplaceMenuProvider.prototype.getPopupMenuEntries = function(element) {
  const { _modeling: modeling, _bpmnFactory: bpmnFactory, _bpmnReplace: bpmnReplace, _overlays: overlays } = this;
  const bo = element.businessObject;

  const isSubProcess = element.type === 'bpmn:SubProcess';
  const isAdHoc      = element.type === 'bpmn:AdHocSubProcess';

  if (!isSubProcess && !isAdHoc) {
    return {};
  }

  // Only offer the revert when the element is already a proper agentic
  // ad-hoc subprocess (correct type AND extensions present).
  //
  // bpmn-js copies extensionElements when doing a standard type change, so a
  // plain SubProcess can end up with agent:Config already attached. Showing
  // the revert option there would hide the "Agentic Subprocess" promote path.
  // Always show "Agentic Subprocess" for SubProcess regardless of extensions.
  if (isAdHoc && AgentUtil.isAgenticSubprocess(bo)) {
    return {
      'replace-with-adhoc-subprocess': {
        label: 'Ad-Hoc Subprocess',
        className: 'bpmn-icon-subprocess-expanded',
        action: () => {
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
      action: () => {
        let target = element;

        if (isSubProcess) {
          target = bpmnReplace.replaceElement(element, { type: 'bpmn:AdHocSubProcess' });
        }

        // addAgentExtensions is idempotent: it checks before creating, so
        // extensions copied across by bpmnReplace are not duplicated.
        AgentUtil.addAgentExtensions(target.businessObject, bpmnFactory);
        AgentUtil.updateModdle(target, target.businessObject, modeling);
        setTimeout(() => addAgentOverlay(target, overlays), 100);
      }
    }
  };
};

function addAgentOverlay(element, overlays) {
  if (!overlays) return;
  try {
    removeAgentOverlay(element, overlays);
    const badge = domify(TEMPLATES.aiBadge);
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
    overlays.remove({ element, type: 'agent-ai-badge' });
  } catch (err) {}
}

module.exports = AgentReplaceMenuProvider;
