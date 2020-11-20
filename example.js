// #### Import
// remark-usage-ignore-next
import stubbedFs from 'mock-fs';
import {questionNames, scaffold} from './lib/index.cjs';

// remark-usage-ignore-next
stubbedFs();

// #### Execute

(async () => {
  await scaffold({decisions: {[questionNames.PROJECT_NAME]: 'foo'}});
})();
