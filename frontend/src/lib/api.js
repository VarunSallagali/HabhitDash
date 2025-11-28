const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export async function api(path, opts = {}) {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(BASE + path, { ...opts, headers });
    const data = await res.json();
    
    if (!res.ok) {
      return { error: data.error || 'Server error', status: res.status };
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return { error: 'Network error - is the backend server running?' };
  }
}


