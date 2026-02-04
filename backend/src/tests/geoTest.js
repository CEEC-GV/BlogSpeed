import http from 'http';

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/trends/discover?category=all',
  method: 'GET',
  headers: {
    'Accept-Language': 'en-IN,en;q=0.9'
  }
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', err => {
  console.error('Error:', err.message);
});

req.end();
