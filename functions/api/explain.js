export async function onRequestPost(context) {
  const { quote, author } = await context.request.json()

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': context.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: `Tu es un guide de sagesse philosophique. Explique cette citation en français de manière concise, profonde et accessible (4-5 phrases max). Relie-la à la vie quotidienne moderne.

Citation : "${quote}"
Auteur : ${author}`,
        },
      ],
    }),
  })

  if (!response.ok) {
    return new Response(JSON.stringify({ error: 'Erreur API' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const data = await response.json()
  return new Response(
    JSON.stringify({ explanation: data.content[0].text }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}
