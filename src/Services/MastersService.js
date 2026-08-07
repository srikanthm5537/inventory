const locationTypes = ['STORE', 'SHOP_FLOOR', 'FG_WAREHOUSE', 'QUARANTINE'];

export async function fetchLocations() {
  const response = await fetch('https://jsonplaceholder.typicode.com/users');
  if (!response.ok) {
    throw new Error('Unable to load location data');
  }

  const users = await response.json();
  return users.slice(0, 6).map((user, index) => ({
    id: user.id,
    code: `LOC-${100 + user.id}`,
    name: user.company?.name || `Location ${user.id}`,
    type: locationTypes[index % locationTypes.length],
    stock: index % 3 === 0 ? 0 : 10 + index * 5,
    active: index % 3 !== 0,
  }));
}

export async function fetchSuppliers() {
  const response = await fetch('https://jsonplaceholder.typicode.com/users');
  if (!response.ok) {
    throw new Error('Unable to load supplier data');
  }

  const users = await response.json();
  return users.slice(0, 6).map((user) => ({
    id: user.id,
    code: `SUP-${200 + user.id}`,
    name: user.name,
    contact: user.username,
    phone: user.phone.split(' ')[0],
    email: user.email,
    gstin: `27AABCU9603R1Z${user.id % 10}`,
  }));
}

export async function createLocation(location) {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(location),
  });

  if (!response.ok) {
    throw new Error('Failed to create location');
  }

  const data = await response.json();
  return { ...location, id: data.id || Date.now() };
}

export async function updateLocation(location) {
  const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${location.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(location),
  });

  if (!response.ok) {
    throw new Error('Failed to update location');
  }

  return location;
}

export async function deactivateLocation(location) {
  if (location.stock > 0) {
    throw new Error('Cannot deactivate a location with non-zero stock');
  }

  const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${location.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ active: false }),
  });

  if (!response.ok) {
    throw new Error('Failed to deactivate location');
  }

  return { ...location, active: false };
}

export async function createSupplier(supplier) {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(supplier),
  });

  if (!response.ok) {
    throw new Error('Failed to create supplier');
  }

  const data = await response.json();
  return { ...supplier, id: data.id || Date.now() };
}

export async function updateSupplier(supplier) {
  const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${supplier.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(supplier),
  });

  if (!response.ok) {
    throw new Error('Failed to update supplier');
  }

  return supplier;
}

export { locationTypes };
