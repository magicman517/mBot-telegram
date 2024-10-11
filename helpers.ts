const shouldBeEscaped = '_*[]()~`>#+-=|{}.!';

// i dont think this code is effective, but i have no idea how to do it better
export function escapeMarkdown(s: string): string {
	const result: string[] = [];
	let escaped = false;
	let inCodeBlock = false;
	let inInlineCode = false;
	let asteriskCount = 0;

	for (let i = 0; i < s.length; i++) {
		const r = s[i];

		if (r === '`' && s[i + 1] === '`' && s[i + 2] === '`') {
			inCodeBlock = !inCodeBlock;
			result.push('```');
			i += 2;
			continue;
		}

		if (
			r === '`' && !inCodeBlock &&
			!(s[i + 1] === '`' && s[i + 2] === '`') &&
			!(s[i - 1] === '`' && s[i - 2] === '`')
		) {
			inInlineCode = !inInlineCode;
			result.push(r);
			continue;
		}

		if (inCodeBlock || inInlineCode) {
			result.push(r);
			continue;
		}

		if (r === '\\') {
			escaped = !escaped;
			result.push(r);
			continue;
		}

		if (r === '*') {
			const nextChar = s[i + 1];

			if (nextChar === '*' && !escaped) {
				asteriskCount++;
				if (asteriskCount === 1) {
					result.push('**');
					i++;
					continue;
				} else {
					asteriskCount = 0;
					result.push('**');
					i++;
					continue;
				}
			} else if (!escaped && shouldBeEscaped.includes(r)) {
				result.push('\\');
			}
		} else if (shouldBeEscaped.includes(r) && !escaped) {
			result.push('\\');
		}

		escaped = false;
		result.push(r);
	}

	return result.join('');
}
