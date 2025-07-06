export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { image } = req.body;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [{
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: 'Analyze this Flightradar24 screenshot and extract flight information. Return ONLY valid JSON with these exact fields: airline, aircraft_type, registration, flight_number, departure_airport, arrival_airport. If information is not visible, use empty string.'
                        },
                        {
                            type: 'image_url',
                            image_url: { url: image }
                        }
                    ]
                }],
                max_tokens: 500,
                temperature: 0
            })
        });

        const result = await response.json();
        const content = result.choices[0].message.content;
        
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const data = JSON.parse(jsonMatch[0]);
        
        res.json({ success: true, data });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Analysis failed' });
    }
} 