import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ConfigProvider, theme } from "antd";
import App from "feature/base/app";
import { RouterProvider } from "react-router-dom";
import router from "./feature/base/router";

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement,
);

root.render(<App />);
