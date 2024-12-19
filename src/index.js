import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { HashRouter } from "react-router-dom";
import "font-awesome/css/font-awesome.min.css";
import { Toaster } from "react-hot-toast";
import { AppProvider } from "./Components/Context/AppContext";
import store from "./Store";
import { Provider } from "react-redux";

ReactDOM.render(
  <Provider store={store}>
    <HashRouter>
      <AppProvider>
        <Toaster position="top-center" reverseOrder={false} />
        <App />
      </AppProvider>
    </HashRouter>
  </Provider>,
  document.getElementById("root")
);
