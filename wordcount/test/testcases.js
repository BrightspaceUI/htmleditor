const simpleText = 'Some test text here';
const textWithExtraWhiteSpace = `Some  
	  test  
	  text  
	  here`;
const textWithLeadingAndTrailingWhiteSpace = `  
	   Some test text here  
	   `;
const textWithNoCharacters = '';
const textWithOnlyMultipleWhiteSpaceCharacters = `
	`;
const textWithOnlySingleCharacter = 'a';
const textWithOnlySingleWhiteSpaceCharacter = ' ';

class Counts {
	constructor(wordCount, characterCount, characterCountWithoutSpaces) {
		this.wordCount = wordCount;
		this.characterCount = characterCount;
		this.characterCountWithoutSpaces = characterCountWithoutSpaces;
	}
}

export const testCases = [
	{
		name: 'Simple text',
		text: simpleText,
		expectedCounts: new Counts(4, 19, 16)
	},
	{
		name: 'Text with extra whitespace',
		text: textWithExtraWhiteSpace,
		expectedCounts: new Counts(4, 34, 16)
	},
	{
		name: 'Text with leading and trailing whitespace',
		text: textWithLeadingAndTrailingWhiteSpace,
		expectedCounts: new Counts(4, 33, 16)
	},
	{
		name: 'Text with no characters',
		text: textWithNoCharacters,
		expectedCounts: new Counts(0, 0, 0)
	},
	{
		name: 'Text with only multiple whitespace characters',
		text: textWithOnlyMultipleWhiteSpaceCharacters,
		expectedCounts: new Counts(0, 2, 0)
	},
	{
		name: 'Text with only a single character',
		text: textWithOnlySingleCharacter,
		expectedCounts: new Counts(1, 1, 1)
	},
	{
		name: 'Text with only a single whitespace character',
		text: textWithOnlySingleWhiteSpaceCharacter,
		expectedCounts: new Counts(0, 1, 0)
	}
];
