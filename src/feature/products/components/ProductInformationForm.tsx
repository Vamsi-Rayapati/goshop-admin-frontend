import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
	Button,
	Card,
	Form,
	type FormInstance,
	Input,
	InputNumber,
	Select,
	Spin,
	Typography,
} from "antd";
import { useEffect } from "react";
import useFetch from "../../base/hooks/useFetch";
import { CATEGORIES_API } from "../../categories/constants";
import type { Category } from "../../categories/types";
import type { Product } from "../types";

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface ProductInformationFormProps {
	mode: "add" | "edit";
	form: FormInstance;
	initialProduct?: Product;
	isProductSaved: boolean;
	isFormValid: boolean;
	isLoading: boolean;
	onFormChange: () => void;
	onSubmit: (values: Omit<Product, "id">) => Promise<void>;
}

function ProductInformationForm({
	mode,
	form,
	initialProduct,
	isProductSaved,
	isFormValid,
	isLoading,
	onFormChange,
	onSubmit,
}: ProductInformationFormProps) {
	// Use the useFetch hook for categories
	const [getCategoriesRes, getCategoriesReq] = useFetch<{
		categories: Category[];
		total: number;
	}>();

	// Fetch categories on component mount
	useEffect(() => {
		getCategoriesReq({
			url: CATEGORIES_API,
			method: "GET",
			params: {
				page_no: 1,
				page_size: 100, // Get all categories
			},
		});
	}, []);

	// Set initial form values
	useEffect(() => {
		if (mode === "edit" && initialProduct) {
			const formValues = {
				name: initialProduct.name,
				description: initialProduct.description,
				category_id: initialProduct.category_id,
				price: initialProduct.price,
				stock: initialProduct.stock,
			};
			form.setFieldsValue(formValues);
		}
	}, [mode, initialProduct, form]);

	const shouldDisableForm = isProductSaved && mode === "add";

	return (
		<Card
			title={
				<div className="flex items-center space-x-2">
					{mode === "add" ? (
						<PlusOutlined className="text-blue-500" />
					) : (
						<EditOutlined className="text-blue-500" />
					)}
					<span>Product Information</span>
					{isProductSaved && (
						<Text type="success" className="text-sm ml-2">
							✅ {mode === "add" ? "Created" : "Updated"}
						</Text>
					)}
				</div>
			}
			className={`shadow-lg transition-all duration-300 ${
				shouldDisableForm ? "opacity-70 border-green-200" : "hover:shadow-xl"
			}`}
			bodyStyle={{ padding: "24px" }}
		>
			<Form
				form={form}
				layout="vertical"
				onFinish={onSubmit}
				onValuesChange={onFormChange}
				size="large"
				disabled={shouldDisableForm}
			>
				<Form.Item
					label="Product Name"
					name="name"
					rules={[{ required: true, message: "Please enter product name" }]}
				>
					<Input placeholder="Enter product name" className="rounded-lg" />
				</Form.Item>

				<Form.Item
					label="Category"
					name="category_id"
					rules={[
						{ required: true, message: "Please select a category" },
						{
							validator: (_, value) => {
								if (!value || value === 0 || value === "0") {
									return Promise.reject(
										new Error("Please select a valid category"),
									);
								}
								return Promise.resolve();
							},
						},
					]}
				>
					<Select
						placeholder="Select a category"
						className="rounded-lg"
						loading={getCategoriesRes.isLoading}
						showSearch
						filterOption={(input, option) =>
							(option?.children as unknown as string)
								?.toLowerCase()
								.includes(input.toLowerCase())
						}
						notFoundContent={
							getCategoriesRes.isLoading ? (
								<Spin size="small" />
							) : (
								"No categories found"
							)
						}
					>
						{getCategoriesRes.data?.categories?.map((category) => (
							<Option key={category.id} value={category.id}>
								{category.name}
							</Option>
						))}
					</Select>
				</Form.Item>

				<Form.Item label="Description" name="description">
					<TextArea
						rows={4}
						placeholder="Enter product description"
						className="rounded-lg"
					/>
				</Form.Item>

				<div className="grid grid-cols-2 gap-4">
					<Form.Item
						label="Price ($)"
						name="price"
						rules={[
							{ required: true, message: "Please enter price" },
							{
								type: "number",
								min: 0,
								message: "Price must be positive",
							},
						]}
					>
						<InputNumber
							placeholder="0.00"
							className="w-full rounded-lg"
							precision={2}
							min={0}
						/>
					</Form.Item>

					<Form.Item
						label="Stock Quantity"
						name="stock"
						rules={[
							{ required: true, message: "Please enter stock quantity" },
							{
								type: "number",
								min: 0,
								message: "Stock must be non-negative",
							},
						]}
					>
						<InputNumber
							placeholder="0"
							className="w-full rounded-lg"
							min={0}
						/>
					</Form.Item>
				</div>

				<Form.Item className="mb-0">
					<Button
						type="primary"
						htmlType="submit"
						size="large"
						className="w-full rounded-lg bg-blue-500 hover:bg-blue-600 border-blue-500"
						disabled={!isFormValid || shouldDisableForm}
						loading={isLoading}
					>
						{isProductSaved && mode === "add"
							? "Product Created Successfully ✅"
							: isLoading
								? `${mode === "add" ? "Adding" : "Updating"} Product...`
								: `${mode === "add" ? "Add" : "Update"} Product`}
					</Button>
				</Form.Item>
			</Form>
		</Card>
	);
}

export default ProductInformationForm;
