export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { topic, type, framework } = req.body;
  if (!topic) return res.status(400).json({ error: 'Topic is required' });

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  let prompt = '';
  let maxTokens = 500;

  if (type === 'framework') {
    prompt = `Topic: "${topic}"\n\nChoose the single best speaking framework for this topic. Pick from any framework you know — PREP, STAR, BLUF, Monroe's Motivated Sequence, The Rule of Three, What-So What-Now What, FAB, SBAR, Pyramid Principle, SOAR, PEE, PEEL, Hook-Meat-Payoff, The 5 Ws, Problem-Solution-Benefit, TED structure, AIDA, SCQA, Situation-Complication-Resolution, and others.\n\nFor each step, write a short instruction that is specific to this exact topic, not generic.\n\nReturn ONLY this JSON with no markdown:\n{"name":"FRAMEWORK NAME","why":"One plain sentence explaining why this structure fits this topic.","steps":[{"letter":"X","title":"Step name","desc":"What to actually say or do for this specific topic in this step, 8-14 words"}]}`;
    maxTokens = 500;

  } else if (type === 'example') {
    const stepNames = framework?.steps?.map(s => s.title).join(', ') || '';
    prompt = `Topic: "${topic}"\nFramework: ${framework?.name} (steps: ${stepNames})\n\nWrite a SHORT spoken example on this topic using this framework. This is a scaffold to help the speaker think, not a script to memorise.\n\nFor each section write exactly 2 sentences:\n- key: The first sentence. The core point of this section. Bright and direct.\n- text: The second sentence only. A brief supporting detail. Do NOT repeat the key sentence.\n\nRules:\n- Simple everyday words, nothing fancy\n- No words like chaos, pivotal, profound, embarked, delve, journey, testament\n- No location or country references\n- First person throughout\n- Keep it tight — 2 sentences per section, no more\n\nReturn ONLY this JSON with no markdown:\n{"sections":[{"label":"Step label matching the framework","key":"First sentence — the core point","text":"Second sentence only — one supporting detail, do not repeat the key"}]}`;
    maxTokens = 600;

  } else if (type === 'eval') {
    const ev = req.body.eval || {};
    prompt = `A speaker just completed a 60-second impromptu speaking session on this topic: "${topic}"\n\nTheir self-assessment:\n- Did they answer the topic: ${ev.q1}\n- Filler words used: ${ev.q2}\n- Confidence level: ${ev.q3} out of 5\n\nWrite ONE coaching tip. Make it specific to their answers AND the topic. Write like a real speaking coach. Plain conversational language. No buzzwords. Two sentences maximum. Do not start with "You".\n\nReturn ONLY this JSON with no markdown:\n{"tip":"Your coaching tip here"}`;
    maxTokens = 200;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        system: 'You are a speaking coach. Respond ONLY with valid JSON. No markdown, no code blocks, no explanation.',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate tip', message: err.message });
  }
}
