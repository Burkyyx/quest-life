export async function onRequestPost(context) {
  const apiKey = context.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Clé API manquante (ANTHROPIC_API_KEY)' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let quote, author
  try {
    ;({ quote, author } = await context.request.json())
  } catch {
    return new Response(JSON.stringify({ error: 'Corps de requête invalide' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let response
  try {
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
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
  } catch (e) {
    return new Response(JSON.stringify({ error: `Erreur réseau : ${e.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!response.ok) {
    let detail = ''
    try {
      const err = await response.json()
      detail = err?.error?.message || JSON.stringify(err)
    } catch {
      detail = `HTTP ${response.status}`
    }
    return new Response(JSON.stringify({ error: `Erreur Anthropic : ${detail}` }), {
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
