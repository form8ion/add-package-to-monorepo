import * as javascriptScaffolder from '@travi/javascript-scaffolder';
import {projectTypes} from '@form8ion/javascript-core';
import {assert} from 'chai';
import sinon from 'sinon';
import any from '@travi/any';
import {questionNames} from './question-names';
import scaffold from './scaffold';

suite('scaffold', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(process, 'cwd');
    sandbox.stub(javascriptScaffolder, 'scaffold');
  });

  teardown(() => sandbox.restore());

  test('that the package is scaffolded in the packages/ directory', async () => {
    const monorepoRoot = any.simpleObject();
    const scaffoldResults = any.simpleObject();
    const projectName = any.word();
    const options = {...any.simpleObject(), decisions: {[questionNames.PROJECT_NAME]: projectName}};
    javascriptScaffolder.scaffold
      .withArgs({
        ...options,
        projectRoot: `${monorepoRoot}/packages/${projectName}`,
        projectName,
        visibility: 'Public',
        license: 'MIT',
        decisions: {...options.decisions, [javascriptScaffolder.questionNames.PROJECT_TYPE]: projectTypes.PACKAGE}
      })
      .resolves(scaffoldResults);
    process.cwd.returns(monorepoRoot);

    assert.deepEqual(await scaffold(options), scaffoldResults);
  });
});
