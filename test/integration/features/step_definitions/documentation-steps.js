import remark from 'remark';
import find from 'unist-util-find';
import {Then} from '@cucumber/cucumber';
import {promises as fs} from 'fs';
import {assert} from 'chai';

function assertTitleIsIncluded(readmeTree, projectName) {
  const title = readmeTree.children[0];
  const titleText = title.children[0];

  assert.equal(title.type, 'heading');
  assert.equal(title.depth, 1);
  assert.equal(titleText.type, 'text');
  assert.equal(titleText.value, projectName);
}

function assertDescriptionIsIncluded(readmeTree, projectDescription) {
  const description = readmeTree.children[1];
  const descriptionText = description.children[0];

  assert.equal(description.type, 'paragraph');
  assert.equal(descriptionText.type, 'text');
  assert.equal(descriptionText.value, projectDescription);
}

function assertBadgesSectionExists(tree, badgeSection) {
  assert.isDefined(find(tree, {type: 'html', value: `<!--${badgeSection}-badges start -->`}));
}

Then('a README is created for the new pacakge', async function () {
  const readmeContents = await fs.readFile(`${process.cwd()}/packages/${this.projectName}/README.md`, 'utf8');
  const readmeTree = remark().parse(readmeContents);

  assertTitleIsIncluded(readmeTree, this.projectName);
  assertDescriptionIsIncluded(readmeTree, this.projectDescription);
  assertBadgesSectionExists(readmeTree, 'status');
  assertBadgesSectionExists(readmeTree, 'consumer');
  assertBadgesSectionExists(readmeTree, 'contribution');
});
