const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path'); // Import path module to handle directory paths
const app = express();
const PORT = 3001;

// Enable CORS
app.use(cors());

// Serve the static HTML file from the /public folder
app.use(express.static(path.join(__dirname, '../public')));

// Route to handle the SOAP API request
app.get('/track-info', (req, res) => {
  const stationName = req.query.stationName; // Get station name from query parameters
  
  if (!stationName) {
    return res.status(400).json({ error: "Station name is required" });
  }
  
  let data = `<?xml version="1.0" encoding="utf-8"?>\r\n<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\r\nxmlns:xsd="http://www.w3.org/2001/XMLSchema"\r\nxmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\r\n <soap:Body>\r\n <getLockerMRTSationName xmlns="http://tempuri.org/">\r\n <userName>b11902154@g.ntu.edu.tw</userName>\r\n <passWord>jqAscSgQ</passWord>\r\n <SationName>${stationName}</SationName>\r\n </getLockerMRTSationName>\r\n </soap:Body>\r\n</soap:Envelope>\r\n`;
  
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api.metro.taipei/metroapi/locker.asmx',
    headers: { 
      'Content-type': 'text/xml; charset=utf-8', 
      'Cookie': '__cf_bm=M4zUDWG0gxBum.cXlvL45rgdUqvBblllHzqElKffUUQ-1725693572-1.0.1.1-qSo5_5bAKubwvaUTyDghOhQE1AWX5xqqpp5ouEXONpkIM5D32q_mncgkP4CNr_9bHxo27kwOhr2YBKA0mlfnXw; TS01232bc6=0110b39fae268352c113b497e8f3d1aa3b465b225504fc88857520a4ebdcef220e9fa06d4d91708668a5ba3f3d5512b5e7bfb7a66b'
    },
    data : data
  };

  // Make the API request
  axios.request(config)
    .then((response) => {
      // Send the SOAP response to the frontend
      res.json(response.data);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
