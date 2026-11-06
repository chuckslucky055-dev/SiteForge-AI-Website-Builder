import { ai, router, json, error } from '@appdeploy/sdk';

const routes = {
  'POST /api/generate-site': [
    async ({ body }: { body: unknown }) => {
      const input = body as { prompt?: string };
      if (!input.prompt?.trim()) return error('Prompt is required', 400);
      try {
        const result = await ai.generate({
          system:
            'You are a website design assistant. Return ONLY valid JSON with keys name, accent, and sections. sections must be an array of 4 objects with id, type, title, text, button. Create concise, polished website copy. accent must be a hex color.',
          prompt: input.prompt,
          schema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              accent: { type: 'string' },
              sections: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    type: { type: 'string' },
                    title: { type: 'string' },
                    text: { type: 'string' },
                    button: { type: 'string' },
                  },
                  required: ['id', 'type', 'title', 'text', 'button'],
                },
              },
            },
            required: ['name', 'accent', 'sections'],
          },
          maxTokens: 1400,
          temperature: 0.7,
          thinkingMode: 'FAST',
        });
        let site: unknown;
        try {
          site = JSON.parse(result.text);
        } catch {
          return error('AI returned invalid site data', 502);
        }
        return json({ site });
      } catch (err) {
        console.error('site generation failed', err);
        return error('Unable to generate the site right now', 502);
      }
    },
  ],
};

export const handler = router(routes);
