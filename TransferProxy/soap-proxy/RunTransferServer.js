const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const xml2js = require('xml2js'); // Import xml2js for XML parsing
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/track-info', (req, res) => {
    let stationName = req.query.stationName;  // Get station name from the query parameter
    let data = '<?xml version="1.0" encoding="utf-8"?>\n<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\nxmlns:xsd="http://www.w3.org/2001/XMLSchema"\nxmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\n    <soap:Body>\n        <getTrackInfo xmlns="http://tempuri.org/">\n            <userName>b11902154@g.ntu.edu.tw</userName>\n            <passWord>jqAscSgQ</passWord>\n        </getTrackInfo>\n    </soap:Body>\n</soap:Envelope>';

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api.metro.taipei/metroapi/TrackInfo.asmx',
      headers: { 
        'Content-type': 'text/xml; charset=utf-8',
        'Cookie': '__cf_bm=9JA6dbtFm7XVvz8wwYTZpwc8Wyibldws7vApkQVurCg-1725681008-1.0.1.1-2mMbAl9pnm8Mgs4jD6fm5DT1Z65pKbhXIePvuPBxz3BbP5M4PAFXV0VvY_QurbOwX4Is8uPApKFxTblu5DShgA; TS01232bc6=0110b39faef0fe298908e8464497b9ddc82198ea5cda05d1846b083859073ca31bc7fb81a9302558a566a1774491d34568fee32fd5'
      },
      data: data
    };

    // Make the API request to get the SOAP response
    axios.request(config)
  .then((response) => {
    // Log the raw response to inspect its structure
    console.log('Raw API Response:', response.data);

    // Find the position of the last closing bracket "]"
    const jsonEndIndex = response.data.indexOf(']') + 1;

    // Extract the JSON part from the response string
    const jsonString = response.data.slice(0, jsonEndIndex);
    //console.log('JSON String:', jsonString);
    try {
      // Parse the JSON string
      const trackInfoList = JSON.parse(jsonString);

      // Filter results by station name
      let matchingStations = trackInfoList.filter(item => item.StationName === stationName);
      console.log('Matching Stations:', matchingStations);
    
      if (matchingStations.length > 0) {
        // Return all results that match the station name
        res.json(matchingStations);
      } else {
        res.json({ error: `No results found for station: ${stationName}` });
      }
    } catch (err) {
      console.error('Error parsing JSON:', err);
      res.status(500).json({ error: 'Failed to parse JSON' });
    }
  })
  .catch((error) => {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Error fetching data from API' });
  });

  
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
