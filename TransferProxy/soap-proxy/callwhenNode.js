const axios = require('axios');
let data = '<?xml version="1.0" encoding="utf-8"?>\n<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\nxmlns:xsd="http://www.w3.org/2001/XMLSchema"\nxmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\n    <soap:Body>\n        <getTrackInfo xmlns="http://tempuri.org/">\n            <userName>b11902154@g.ntu.edu.tw</userName>\n            <passWord>jqAscSgQ</passWord>\n        </getTrackInfo>\n    </soap:Body>\n</soap:Envelope>';

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://api.metro.taipei/metroapi/TrackInfo.asmx',
  headers: { 
    'Content-type': 'text/xml; charset=utf-8', 
    'Cookie': '__cf_bm=9JA6dbtFm7XVvz8wwYTZpwc8Wyibldws7vApkQVurCg-1725681008-1.0.1.1-2mMbAl9pnm8Mgs4jD6fm5DT1Z65pKbhXIePvuPBxz3BbP5M4PAFXV0VvY_QurbOwX4Is8uPApKFxTblu5DShgA; TS01232bc6=0110b39faef0fe298908e8464497b9ddc82198ea5cda05d1846b083859073ca31bc7fb81a9302558a566a1774491d34568fee32fd5'
  },
  data : data
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});

