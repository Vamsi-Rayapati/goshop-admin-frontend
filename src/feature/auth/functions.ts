// import jwt from 'jsonwebtoken'

import { ROUTE } from "feature/base/router/constants";

export function handleLogout() {
	localStorage.clear();
	if (window.navigate) window.navigate(ROUTE.LOGIN);
}

export function parseJWT() {
	const token = localStorage.getItem("token");
	if (!token) return;
	const base64Url = token.split(".")[1];

	// Replace characters to match base64 standard encoding
	const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

	// Decode the base64 string
	const jsonPayload = decodeURIComponent(
		atob(base64)
			.split("")
			.map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
			.join(""),
	);

	// Parse and return the JSON object
	const payload = JSON.parse(jsonPayload);
	return {
		email: payload.email,
		id: payload.sub,
	};
}
