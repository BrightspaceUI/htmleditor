const whiteSpaceChars = [' ', '\r', '\n', '\t', '\u000B', '\u000C', '\u0085', '\u2028', '\u2029', '\u00a0'];

export function countAll(text) {
	if (text.length === 0) {
		return {
			wordCount: 0,
			characterCount: 0,
			characterCountWithoutSpaces: 0
		};
	}

	let charCount = 0;
	let wordCount = 0;
	for (let i = 0; i < text.length; i++) {
		if (whiteSpaceChars.includes(text.charAt(i))) continue;

		if (i === 0 || whiteSpaceChars.includes(text.charAt(i - 1))) wordCount++;
		charCount++;
	}

	return {
		wordCount: wordCount,
		characterCount: text.length,
		characterCountWithoutSpaces: charCount
	};
}

export function countCharacters(text) {
	return text.length;
}

export function countWords(text) {
	if (text.length === 0) return 0;

	let wordCount = 0;
	for (let i = 0; i < text.length; i++) {
		if (whiteSpaceChars.includes(text.charAt(i))) continue;

		if (i === 0 || whiteSpaceChars.includes(text.charAt(i - 1))) wordCount++;
	}

	return wordCount;
}
