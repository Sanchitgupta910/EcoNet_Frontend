import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "./src/app/store"; // Your Redux store
import App from "./app"; // Import the App component

/**
 * main.jsx serves as the entry point for the React application.
 * It wraps the App component with the Redux Provider so that the store
 * is available to all components.
 */
createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
);
