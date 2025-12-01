import axios, {
	Axios,
	type AxiosError,
	type AxiosInstance,
	type AxiosRequestConfig,
	type AxiosResponse,
	type InternalAxiosRequestConfig,
} from "axios";

class ApiService {
	instance: AxiosInstance;
	constructor() {
		this.instance = axios.create({});
		this.instance.interceptors.request.use(this.requestInterceptor);
		this.instance.interceptors.response.use(
			this.responseInterceptor,
			this.responseErrorHandler,
		);
	}

	private async requestInterceptor(
		config: InternalAxiosRequestConfig,
	): Promise<InternalAxiosRequestConfig> {
		// if (config.url?.includes('refresh-token')) {

		//     return config;
		// }

		if (config.url?.includes("tenor.googleapis.com")) {
			return config;
		}

		const token = localStorage.getItem("token");

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		return config;
	}

	private responseInterceptor(response: AxiosResponse): AxiosResponse {
		if (response.config.url?.includes("/auth/api/v1")) {
			console.log(response);
			localStorage.setItem("token", response.data.token);
			localStorage.setItem("refreshToken", response.data.refresh_token);
		}
		return response;
	}

	private async responseErrorHandler(error: AxiosError): Promise<any> {
		const originalRequest = error.config as InternalAxiosRequestConfig & {
			_retry?: boolean;
		};

		if (error?.response?.status === 401 && !originalRequest._retry) {
			console.log("Request Failed", "Unauthorised");
			originalRequest._retry = true;

			try {
				const resp = await this.instance.request({
					url: "/auth/api/v1/token/refresh",
					method: "POST",
					data: {
						refresh_token: localStorage.getItem("refreshToken"),
						token: localStorage.getItem("token"),
					},
					headers: {
						"Content-Type": "application/json",
					},
				});

				if (resp.status === 200) {
					// Store the new tokens
					localStorage.setItem("token", resp.data.token);
					localStorage.setItem("refreshToken", resp.data.refresh_token);

					// Update the authorization header with the new token
					originalRequest.headers.Authorization = `Bearer ${resp.data.token}`;

					console.log("Retrying Request ......");

					return this.instance.request(originalRequest);
				}
			} catch (refreshError) {
				console.log("Token refresh failed", refreshError);
				// Handle refresh token failure (redirect to login, etc.)
				localStorage.clear();
				if (window.location.pathname !== "/auth/login") {
					window.location.href = "/console/auth/login";
				}
				return Promise.reject(refreshError);
			}
		}

		return Promise.reject(error);
	}

	async request<T = any, R = AxiosResponse<T, any>, D = any>(
		config: AxiosRequestConfig<D>,
	): Promise<R> {
		const newConfig = {
			headers: {
				"Content-Type": "application/json",
			},
			...config,
		};
		try {
			// Make the request and return the response
			return await this.instance.request(newConfig);
		} catch (error) {
			// Handle and display the error
			if (axios.isAxiosError(error)) {
				// Handle Axios-specific errors
				console.error("Axios error:", error);
				// You can also access error.response if needed
			} else {
				// Handle non-Axios errors
				console.error("Error:", error);
			}
			// Optionally, rethrow the error if you want to propagate it
			throw error;
		}
	}
}

const apiService = new ApiService();
export default apiService;
