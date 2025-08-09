export function isTokenExpired(token) {
  if (!token) return true;
  try {
    const base64 = token.split('.')[1];
    const payload = JSON.parse(atob(base64));
    return payload.exp < Math.floor(Date.now() / 1000);
  } catch { return true; }
}
export function saveToken(t) { if (t) localStorage.setItem('token', t); }
export function getToken() { return localStorage.getItem('token'); }
export function logout(navigate) { localStorage.removeItem('token'); if (navigate) navigate('/'); }
