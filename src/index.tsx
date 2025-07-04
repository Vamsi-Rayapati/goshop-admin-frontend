import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ConfigProvider, theme } from "antd";
import { RouterProvider } from "react-router-dom";
import router from "./feature/base/router";
import App from "feature/base/app";

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement,
);

root.render(<App />);
