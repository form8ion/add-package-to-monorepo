import {promptConstants as jsPromptConstants} from '@form8ion/javascript';
import {projectTypes} from '@form8ion/javascript-core';

import {describe, it, vi, expect} from 'vitest';
import {when} from 'vitest-when';
import any from '@travi/any';

import injectJavascriptAnswersIntoPrompt from './javascript-answers-prompt.js';

const {
  [jsPromptConstants.ids.BASE_DETAILS]: baseDetailsQuestionNames
} = jsPromptConstants.questionNames;

describe('javascript answers prompt', () => {
  it('should call the provided prompt handler for other prompts', async () => {
    const promptDetails = {...any.simpleObject(), id: any.word()};
    const prompt = vi.fn();
    const answers = any.simpleObject();
    when(prompt).calledWith(promptDetails).thenResolve(answers);

    expect(await injectJavascriptAnswersIntoPrompt(prompt, any.word())(promptDetails)).toEqual(answers);
  });

  it('should force the package type and detected package manager for base-details, deferring the rest', async () => {
    const packageManager = any.word();
    const otherQuestion = {name: any.word(), ...any.simpleObject()};
    const questions = [
      {name: baseDetailsQuestionNames.PROJECT_TYPE, ...any.simpleObject()},
      {name: baseDetailsQuestionNames.PACKAGE_MANAGER, ...any.simpleObject()},
      otherQuestion
    ];
    const promptDetails = {id: jsPromptConstants.ids.BASE_DETAILS, questions};
    const prompt = vi.fn();
    const answersFromCaller = any.simpleObject();
    when(prompt).calledWith({...promptDetails, questions: [otherQuestion]}).thenResolve(answersFromCaller);

    expect(await injectJavascriptAnswersIntoPrompt(prompt, packageManager)(promptDetails)).toEqual({
      ...answersFromCaller,
      [baseDetailsQuestionNames.PROJECT_TYPE]: projectTypes.PACKAGE,
      [baseDetailsQuestionNames.PACKAGE_MANAGER]: packageManager
    });
  });
});
