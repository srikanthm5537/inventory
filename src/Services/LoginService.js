// export async function loginUser(username, password) {
//   const response = await fetch('https://jsonplaceholder.typicode.com/users/1');

//   if (!response.ok) {
//     throw new Error('Failed to reach authentication service.');
//   }

//   const data = await response.json();

//   if (!data || !data.id) {
//     throw new Error('Login failed. Please try again.');
//   }

//   return data;
// }

/**
 * Login Service handling authentication according to FR-01 through FR-05 requirements.
 */

/**
 * Login Service handling custom credentials verification
 * Requirements:
 * - Username: test
 * - Password: 1234
 * - Generates mock JWT token valid for 8 hours (FR-01)
 */

export async function loginUser(username, password) {
  // Simulate a brief network request delay (500ms)
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Trim whitespace input
  const cleanUsername = username ? username.trim() : '';
  const cleanPassword = password ? password.trim() : '';

  // Check strict test credentials
  if (cleanUsername === 'test' && cleanPassword === '1234') {
    
    // Create a mock JWT Token payload
    const payload = {
      sub: 'user-test-01',
      username: 'test',
      role: 'MANAGER', // or 'STORE_OPERATOR'
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60, // 8 hours validity
    };

    // Encoded mock JWT string structure (Header.Payload.Signature)
    const base64Payload = btoa(JSON.stringify(payload));
    const mockJwtToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${base64Payload}.mock_signature_key_98765`;

    return {
      token: mockJwtToken,
      role: payload.role,
      username: 'test',
      expiresIn: '8h'
    };
  } else {
    // Throw an error if credentials do not match
    throw new Error('Invalid username or password.');
  }
}

/**
 * Helper function to retrieve authorization headers for API requests
 */
export function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
}