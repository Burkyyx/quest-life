export async function onRequestPost(context) {
  const apiKey = context.env.GEMINI_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Clé API manquante (GEMINI_API_KEY)' }), {
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

  const prompt = `Tu es un guide de sagesse philosophique. Explique cette citation en français de manière concise, profonde et accessible (4-5 phrases max). Relie-la à la vie quotidienne moderne.

Citation : "${quote}"
Auteur : ${author}`

  let response
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 400 },
        }),
      }
    )
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
    return new Response(JSON.stringify({ error: `Erreur Gemini : ${detail}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const data = await response.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  return new Response(
    JSON.stringify({ explanation: text }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}
