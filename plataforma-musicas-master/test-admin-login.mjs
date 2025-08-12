import fetch from 'node-fetch';

const LOGIN_URL = 'http://localhost:3001/auth/sign-in';
const adminCredentials = {
  email: 'admin@nextor.com',
  password: 'admin123',
};

async function testAdminLogin() {
  try {
    const response = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminCredentials),
    });
    const data = await response.json();
    console.log('🔐 Resultado do login admin:');
    console.log('Status:', response.status);
    console.log('Resposta:', data);
  } catch (error) {
    console.error('Erro ao testar login admin:', error);
  }
}

testAdminLogin();
