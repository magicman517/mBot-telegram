import Groq from 'npm:groq-sdk';

export default new Groq({
	apiKey: Deno.env.get('GROQ_API_KEY')!,
});
