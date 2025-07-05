import { Breadcrumb } from "antd";
import { Link, Outlet, useLocation } from "react-router-dom";

const breadcrumbNameMap: Record<string, string> = {
	"/console": "Console",
	"/console/products": "Products",
	"/console/products/add": "Add Product",
	"/console/products/edit": "Edit Product",
};

function Products() {
	const location = useLocation();
	const pathSnippets = location.pathname.split("/").filter((i) => i);
	const urlList = pathSnippets.map(
		(_, idx) => `/${pathSnippets.slice(0, idx + 1).join("/")}`,
	);

	const breadcrumbItems = urlList
		.map((url, idx) => {
			let name = breadcrumbNameMap[url];

			if (!name) return null; // Skip if no name
			return (
				<Breadcrumb.Item key={url}>
					{idx === urlList.length - 1 ? name : <Link to={url}>{name}</Link>}
				</Breadcrumb.Item>
			);
		})
		.filter(Boolean);

	return (
		<div>
			<Breadcrumb style={{ marginBottom: 16 }}>{breadcrumbItems}</Breadcrumb>
			<Outlet />
		</div>
	);
}

export default Products;
