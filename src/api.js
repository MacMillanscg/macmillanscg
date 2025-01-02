// export const url = "http://localhost:5000";
export const url =
  process.env.REACT_APP_BACKEND_URL ||
  "https://testing-app2-production.up.railway.app";
export const eShipperUrl = process.env.REACT_APP_ESHIPPER_URL;
export const eShipperUsername = process.env.REACT_APP_ESHIPPER_USERNAME; // Avoid in frontend
export const eShipperPassword = process.env.REACT_APP_ESHIPPER_PASSWORD; // Avoid in frontend
