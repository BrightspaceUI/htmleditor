import { countAll, countCharacters, countWords } from '../wordcount.js';
import { expect } from '@open-wc/testing';
import { testCases } from './testcases.js';

describe('d2l-wordcount', () => {

	describe('all counts', () => {
		it('should count words and characters correctly', async() => {
			testCases.forEach((testCase) => {
				const actualCounts = countAll(testCase.text);

				expect(actualCounts.wordCount).to.equal(
					testCase.expectedCounts.wordCount,
					`Word counts don't match for text: '${testCase.name}'`
				);

				expect(actualCounts.characterCount).to.equal(
					testCase.expectedCounts.characterCount,
					`Character counts don't match for test case: '${testCase.name}'`
				);

				expect(actualCounts.characterCountWithoutSpaces).to.equal(
					testCase.expectedCounts.characterCountWithoutSpaces,
					`Character counts (with spaces) don't match for text: '${testCase.name}'`
				);
			});
		});
	});

	describe('word count', () => {
		it('should count words correctly', async() => {
			testCases.forEach((testCase) => {
				const actualWordCount = countWords(testCase.text);
				expect(actualWordCount).to.equal(
					testCase.expectedCounts.wordCount,
					`Word counts don't match for text: '${testCase.name}'`
				);
			});
		});
	});

	describe('character count', () => {
		it('should count characters correctly', () => {
			testCases.forEach((testCase) => {
				const actualCharacterCount = countCharacters(testCase.text);
				expect(actualCharacterCount).to.equal(
					testCase.expectedCounts.characterCount,
					`Character counts don't match for test case: '${testCase.name}'`
				);
			});
		});
	});
});
