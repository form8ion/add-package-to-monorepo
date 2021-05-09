import remark from 'remark';
import find from 'unist-util-find';
import zone from 'mdast-zone';
import {Then} from '@cucumber/cucumber';
import {promises as fs} from 'fs';
import {assert} from 'chai';
import fromEntries from 'object.fromentries';

if (!Object.fromEntries) {
  fromEntries.shim();
}

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
  assert.isDefined(find(tree, {
    type: 'html',
    value: `<!--${badgeSection}-badges start -->`
  }));
}

function assertGroupContainsBadge(badgeGroup, references, badgeDetails) {
  const badgeFromGroup = badgeGroup[badgeDetails.link ? badgeDetails.label : badgeDetails.imageReferenceLabel];
  const imageReference = badgeDetails.link ? badgeFromGroup.children[0] : badgeFromGroup;

  assert.equal(imageReference.type, 'imageReference');
  assert.equal(imageReference.label, badgeDetails.imageReferenceLabel);
  assert.equal(imageReference.alt, badgeDetails.imageAltText);
  assert.equal(references[badgeDetails.label], badgeDetails.link ? badgeDetails.link : undefined);
  assert.equal(references[badgeDetails.imageReferenceLabel], badgeDetails.imageSrc);
}

function extractReferences(nodes) {
  return Object.fromEntries(nodes
    .filter(node => 'definition' === node.type)
    .map(node => ([node.label, node.url])));
}

function groupBadges(tree) {
  const groups = {};

  ['status', 'consumer', 'contribution'].forEach(badgeGroupName => {
    zone(tree, `${badgeGroupName}-badges`, (start, nodes, end) => {
      const badges = nodes.map(node => node.children).reduce((acc, badgeList) => ([...acc, ...badgeList]), []);
      groups[badgeGroupName] = Object.fromEntries(badges.map(badge => ([badge.label, badge])));

      return [start, nodes, end];
    });
  });

  return groups;
}

Then('a README is created for the new package', async function () {
  const readmeContents = await fs.readFile(`${process.cwd()}/packages/${this.projectName}/README.md`, 'utf8');
  const readmeTree = remark().parse(readmeContents);
  const references = extractReferences(readmeTree.children);
  const badgeGroups = groupBadges(readmeTree);

  assertTitleIsIncluded(readmeTree, this.projectName);
  assertDescriptionIsIncluded(readmeTree, this.projectDescription);
  assertBadgesSectionExists(readmeTree, 'status');
  assertBadgesSectionExists(readmeTree, 'consumer');
  assertBadgesSectionExists(readmeTree, 'contribution');

  // assertGroupContainsBadge(
  //   badgeGroups.consumer,
  //   references,
  //   {
  //     label: 'npm-link',
  //     imageReferenceLabel: 'npm-badge',
  //     imageAltText: 'npm',
  //     imageSrc: `https://img.shields.io/npm/v/${this.packageName}.svg`,
  //     link: `https://www.npmjs.com/package/${this.packageName}`
  //   }
  // );

  assertGroupContainsBadge(
    badgeGroups.contribution,
    references,
    {
      label: 'semantic-release-link',
      imageReferenceLabel: 'semantic-release-badge',
      imageAltText: 'semantic-release',
      imageSrc: 'https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg',
      link: 'https://github.com/semantic-release/semantic-release'
    }
  );
});
