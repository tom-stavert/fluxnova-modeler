'use strict';

var registerBpmnJSPlugin = require('camunda-modeler-plugin-helpers').registerBpmnJSPlugin;
var registerBpmnJSModdleExtension = require('camunda-modeler-plugin-helpers').registerBpmnJSModdleExtension;

var AgentPaletteProvider = require('./provider/AgentPaletteProvider');
var AgentReplaceMenuProvider = require('./provider/AgentReplaceMenuProvider');
var AgentPropertiesProvider = require('./provider/AgentPropertiesProvider');
var AgentOverlayProvider = require('./provider/AgentOverlayProvider');

console.log('[Agent Subprocess Plugin] client.js loaded');

registerBpmnJSModdleExtension({
  name: 'agent',
  prefix: 'agent',
  uri: 'http://fluxnova.finos.org/schema/1.0/ai/agent',
  xml: { tagAlias: 'lowerCase' },
  types: [
    {
      name: 'Config',
      superClass: ['Element'],
      properties: [
        { name: 'provider', isAttr: true, type: 'String' },
        { name: 'model', isAttr: true, type: 'String' },
        { name: 'systemPrompt', isAttr: true, type: 'String' }
      ]
    },
    {
      name: 'Context',
      superClass: ['Element'],
      properties: [
        { name: 'variables', type: 'agent:Variable', isMany: true }
      ]
    },
    {
      name: 'Variable',
      superClass: ['Element'],
      properties: [
        { name: 'name', isAttr: true, type: 'String' }
      ]
    }
  ]
});

registerBpmnJSPlugin({
  __init__: [
    'agentPaletteProvider',
    'agentReplaceMenuProvider',
    'agentPropertiesProvider',
    'agentOverlayProvider'
  ],
  agentPaletteProvider: ['type', AgentPaletteProvider],
  agentReplaceMenuProvider: ['type', AgentReplaceMenuProvider],
  agentPropertiesProvider: ['type', AgentPropertiesProvider],
  agentOverlayProvider: ['type', AgentOverlayProvider]
});

console.log('[Agent Subprocess Plugin] Plugin registered');
