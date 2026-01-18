
const jwt = require('jsonwebtoken');
const http = require('http');

const SECRET = '709f05a934621b79cfac9ea7640bca498e6021f8462053e2a18bf10fb1e41e51'; // From .env
const USER_ID = '696878c5e9a51dc8cd08b537'; // Virendra ID from DB
const EMAIL = 'virendraidealittechno@gmail.com';

const token = jwt.sign(
    { id: USER_ID, email: EMAIL, role: 'admin' },
    SECRET,
    { expiresIn: '1h' }
);

console.log('Minted Token:', token);

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/candidates',
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('RESPONSE BODY:');
        console.log(data);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
