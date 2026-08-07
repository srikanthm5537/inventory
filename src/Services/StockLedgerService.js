const itemOptions = ['Steel Rods', 'Copper Wire', 'Plastic Sheets', 'Lubricant Oil', 'Packaging Box'];
const locationOptions = ['Warehouse A', 'Warehouse B', 'Retail Outlet', 'Dispatch Center'];
const transactionTypes = ['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT'];

function getRandomDate(offsetDays) {
  const date = new Date();
  date.setDate(date.getDate() - offsetDays);
  return date.toISOString().slice(0, 10);
}

export async function fetchStockTransactions() {
  const [postsResponse, usersResponse] = await Promise.all([
    fetch('https://jsonplaceholder.typicode.com/posts?_limit=25'),
    fetch('https://jsonplaceholder.typicode.com/users'),
  ]);

  if (!postsResponse.ok || !usersResponse.ok) {
    throw new Error('Unable to load stock ledger data');
  }

  const [posts, users] = await Promise.all([postsResponse.json(), usersResponse.json()]);

  return posts.map((post, index) => {
    const item = itemOptions[index % itemOptions.length];
    const location = locationOptions[index % locationOptions.length];
    const transactionType = transactionTypes[index % transactionTypes.length];
    const user = users[index % users.length]?.name || `User ${index + 1}`;
    const offsetDays = (index * 3) % 90;

    return {
      id: post.id,
      date: getRandomDate(offsetDays),
      item,
      location,
      transactionType,
      user,
      quantity: ((index % 7) + 1) * 5,
      reference: `REF-${1000 + post.id}`,
      note: post.body.slice(0, 80),
    };
  });
}
