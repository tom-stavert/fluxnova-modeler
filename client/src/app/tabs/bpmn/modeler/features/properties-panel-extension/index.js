import JobExecutionExtensionProvider from './JobExecutionExtensionProvider';
import AdHocSubProcessPropertiesProvider from './AdHocSubProcessPropertiesProvider';

export default {
  __init__: [ 'bpmnJobExecutionExtensionProvider', 'bpmnAdHocSubProcessPropertiesProvider' ],
  bpmnJobExecutionExtensionProvider: [ 'type', JobExecutionExtensionProvider ],
  bpmnAdHocSubProcessPropertiesProvider: [ 'type', AdHocSubProcessPropertiesProvider ]
};
