const http = require('http');

const payload = JSON.stringify({
  skills: ["C#", "React", "Node.js"]
});

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/JobSeeker/skills',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': payload.length
  }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Response:', res.statusCode, data));
});

req.on('error', e => console.error(e));
req.write(payload);
req.end();
