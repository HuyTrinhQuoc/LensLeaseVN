/** Lấy userId từ JWT (payload `userId` — khớp backend Nest). */
export function getUserIdFromToken(): string | null {
  const t = localStorage.getItem('token') || localStorage.getItem('accessToken');
  if (!t || t.split('.').length !== 3) return null;
  try {
    const payload = JSON.parse(atob(t.split('.')[1])) as { userId?: string; sub?: string };
    return payload.userId ?? payload.sub ?? null;
  } catch {
    return null;
  }
}

export function getRoleFromToken(): string | null {
  const t = localStorage.getItem('token') || localStorage.getItem('accessToken');
  if (!t || t.split('.').length !== 3) return null;
  try {
    const payload = JSON.parse(atob(t.split('.')[1])) as { role?: string };
    return payload.role ?? null; 
  } catch {
    return null;
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem('token') || localStorage.getItem('accessToken');
}
