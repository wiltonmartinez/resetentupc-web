const API_URL = import.meta.env.PUBLIC_API_URL;

export async function apiFetch(endpoint, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const url = API_URL + endpoint;

  const response = await fetch(url, {
    ...options,
    headers: defaultHeaders,
  });

  if (!response.ok) {
    throw new Error('Error en la peticion: ' + response.statusText);
  }

  return await response.json();
}
