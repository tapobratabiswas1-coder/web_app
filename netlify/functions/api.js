exports.handler = async function(event) {
    // Frontend theke kon API dorkar (search naki forecast) ar kon city (q) seta nilam
    const endpoint = event.queryStringParameters.endpoint; 
    const q = event.queryStringParameters.q;
    
    // Netlify-er theke gopon API key ta nilam
    const API_KEY = process.env.WEATHER_API_KEY; 

    // Secure bhabe URL toiri kora holo (Frontend e eta keu dekhbe na)
    let url = `https://api.weatherapi.com/v1/${endpoint}?key=${API_KEY}&q=${q}`;
    if (endpoint === 'forecast.json') {
        url += '&days=7&aqi=yes';
    }

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // Frontend ke data pathiye dilam
        return { 
            statusCode: 200, 
            body: JSON.stringify(data) 
        };
    } catch (error) {
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: 'Failed fetching data' }) 
        };
    }
}