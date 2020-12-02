const whiteSpaceChars = [' ', '\r', '\n', '\t', '\u000B', '\u000C', '\u0085', '\u2028', '\u2029', '\u00a0'];

export function countAll(text) {
	if (text.length === 0) {
		return {
			wordCount: 0,
			characterCount: 0,
			characterCountWithoutSpaces: 0
		};
	}

	// When the editor is "empty", it actually contains a single line feed character.
	// As soon as any other text is added, this is removed, so we likely shouldn't count this.
	if (text.length === 1 && text.charCodeAt(0) === 10) {
		return {
			wordCount: 0,
			characterCount: 0,
			characterCountWithoutSpaces: 0
		};
	}

	let charCount = 0;
	let wordCount = 0;
	for (let i = 0; i < text.length; i++) {
		if (!whiteSpaceChars.includes(text.charAt(i))) {
			charCount++;

			if (i === 0) wordCount++;

			continue;
		}

		if (i === 0 || whiteSpaceChars.includes(text.charAt(i - 1))) continue;

		wordCount++;
	}

	return {
		wordCount: wordCount,
		characterCount: text.length,
		characterCountWithoutSpaces: charCount
	};
}

export function countCharacters(text) {
	// When the editor is "empty", it actually contains a single line feed character.
	// As soon as any other text is added, this is removed, so we likely shouldn't count this.
	if (text.length === 1 && text.charCodeAt(0) === 10) return 0;
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
