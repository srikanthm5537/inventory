export async function loginUser(username, password) {
  const response = await fetch('https://jsonplaceholder.typicode.com/users/1');

  if (!response.ok) {
    throw new Error('Failed to reach authentication service.');
  }

  const data = await response.json();

  if (!data || !data.id) {
    throw new Error('Login failed. Please try again.');
  }

  return data;
}
