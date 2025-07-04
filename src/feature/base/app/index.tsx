import { MoonFilled, SunFilled } from "@ant-design/icons";
import { ConfigProvider, FloatButton, theme } from "antd";
import { useState } from "react";
import { RouterProvider } from "react-router-dom";
import router from "../router";

function App() {
	const [darkMode, setDarkMode] = useState(false);

	const toggleTheme = () => {
		setDarkMode((prev) => !prev);
	};
	return (
		<ConfigProvider
			theme={{
				algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
			}}
		>
			<RouterProvider router={router} />
			<FloatButton
				icon={
					darkMode ? (
						<SunFilled style={{ color: "orange" }} />
					) : (
						<MoonFilled style={{ color: "skyblue" }} />
					)
				}
				onClick={toggleTheme}
			/>
		</ConfigProvider>
	);
}

export default App;
