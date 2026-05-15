const API_URL =
  window.location.protocol === 'file:'
    ? 'http://localhost:5000'
    : 'http://localhost:5000';

export default API_URL;