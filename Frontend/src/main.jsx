import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { VideoCallProvider } from "./context/VideoCallContext";
import "./main.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <VideoCallProvider>
      <App />
    </VideoCallProvider>
  </Provider>
);
