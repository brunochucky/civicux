const axios = require('axios');

async function testDou() {
    try {
        console.log('Testing GET /api/dou...');
        const response = await axios.get('http://localhost:3000/api/dou');
        console.log('Status:', response.status);
        console.log('Highlights found:', response.data.length);
        if (response.data.length > 0) {
            console.log('First highlight:', response.data[0]);
        } else {
            console.log('No highlights found. Check selector or page structure.');
        }
    } catch (error) {
        console.error('Error testing /api/dou:', error.message);
    }
}

testDou();
