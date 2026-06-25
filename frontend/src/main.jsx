// import React from "react";
// import ReactDOM from "react-dom/client";
// import "react-toastify/dist/ReactToastify.css";

// import { Provider } from "react-redux";

// import App from "./App";

// import "./index.css";

// import store from "./app/store";

// ReactDOM.createRoot(document.getElementById("root")).render(
//   <React.StrictMode>
//     <Provider store={store}>
//       <App />
//     </Provider>
//   </React.StrictMode>,
// );

import React from "react";
import ReactDOM from "react-dom/client";

import { Provider } from "react-redux";

import { ToastContainer } from "react-toastify";

import App from "./App";
import "./index.css";

import store from "./app/store";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />

      <ToastContainer position="top-right" autoClose={3000} />
    </Provider>
  </React.StrictMode>,
);
