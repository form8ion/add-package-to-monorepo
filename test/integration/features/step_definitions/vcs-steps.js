import {Given} from '@cucumber/cucumber';
import any from '@travi/any';

Given('the project is versioned on GitHub', async function () {
  this.repoName = any.word();
  this.repoOwner = any.word();
  this.vcsHost = 'GitHub';
});
