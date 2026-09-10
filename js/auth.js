const SESSION_KEY = "qc_logistic_session";
const ADMIN = { username: "admin", password: "qc12345" };

export function isLoggedIn() { return localStorage.getItem(SESSION_KEY) === ADMIN.username; }
export function login(username, password) {
  if (username === ADMIN.username && password === ADMIN.password) {
    localStorage.setItem(SESSION_KEY, username);
    return true;
  }
  return false;
}
export function logout() { localStorage.removeItem(SESSION_KEY); }
export function currentUser() { return localStorage.getItem(SESSION_KEY) || ""; }
