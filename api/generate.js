export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, framework } = req.body;

    const frameworkNames = {
      html: 'HTML + CSS',
      react: 'React component'
    };

    const prompt = `Analyze this UI screenshot and generate ${frameworkNames[framework]} code that recreates the UI.

Requirements:
- Clean and readable code
- Semantic HTML structure
- Responsive layout
- Match colors, spacing, and typography as closely as possible
- Include all visible elements and text
${framework === 'react' ? '- Create a functional React component with proper hooks if needed\n- Use inline styles or CSS modules for styling' : ''}
${framework === 'html' ? '- Include inline CSS or a <style> tag' : ''}

Return ONLY the code without any explanation or markdown formatting.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: image
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 8192,
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', data);
      return res.status(response.status).json({ 
        error: data.error?.message || 'Failed to generate code' 
      });
    }

    // Extract text from Gemini response
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!generatedText) {
      return res.status(500).json({ error: 'No code generated' });
    }

    return res.status(200).json({ 
      code: generatedText 
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}