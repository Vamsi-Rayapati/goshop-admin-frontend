// import jwt from 'jsonwebtoken'

export function handleLogout() {
    localStorage.clear();
    if(window.navigate) window.navigate('/auth/login');
}

export function parseJWT() {
  const token = localStorage.getItem('token');
  if(!token) return;
  const base64Url = token.split('.')[1];
  
  // Replace characters to match base64 standard encoding
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  
  // Decode the base64 string
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  // Parse and return the JSON object
  const payload = JSON.parse(jsonPayload);
  return {
    email: payload.email,
    id: payload.sub
  };
    
}