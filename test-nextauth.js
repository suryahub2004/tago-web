const axios = require('axios');

async function test() {
  try {
    const nextAuthUrl = 'http://localhost:3000/api/auth/callback/credentials';
    
    // Simulate credentials login POST
    const res = await axios.post(nextAuthUrl, {
      email: 'admin@tago.io',
      password: 'ChangeMeImmediately123!'
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: () => true
    });
    
    const cookies = res.headers['set-cookie'];
    if (!cookies) {
      console.log("No cookies returned:", res.status, res.data);
      return;
    }
    
    // Fetch session using the cookie
    const sessionRes = await axios.get('http://localhost:3000/api/auth/session', {
      headers: {
        'Cookie': cookies.join('; ')
      }
    });
    
    console.log("Session payload:", JSON.stringify(sessionRes.data, null, 2));
    
  } catch (e) {
    console.error("Error:", e.message);
  }
}

test();
