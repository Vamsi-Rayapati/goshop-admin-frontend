import {
	CameraOutlined,
	EditOutlined,
	HomeOutlined,
	LoadingOutlined,
	UserOutlined,
} from "@ant-design/icons";
import {
	Avatar,
	Button,
	Card,
	Col,
	Flex,
	message,
	Row,
	Space,
	Spin,
	Tag,
	Typography,
	Upload,
	type UploadProps,
} from "antd";
import { useForm } from "antd/es/form/Form";
import type { RcFile } from "antd/es/upload";
import axios from "axios";
import useFetch from "feature/base/hooks/useFetch";
import UserForm from "feature/users/components/UserForm";
import { ROLE_COLORS, USERS_API } from "feature/users/constants";
import type { User } from "feature/users/types";
import { useEffect, useState } from "react";
import { AVATAR_API } from "./constants";

const { Title, Text } = Typography;
function Profile() {
	const [getUserRes, getUserReq] = useFetch<User>();
	const [form] = useForm();
	const [, getUploadUrlReq] = useFetch<{
		upload_url: string;
		path: string;
	}>();
	const [patchUserRes, patchUserReq] = useFetch<User>();
	const [openDialog, setOpenDialog] = useState(false);
	const [, saveAvatarReq] = useFetch();
	const [avatarUploading, setAvatarUploading] = useState(false);

	const user = getUserRes.data;

	useEffect(() => {
		getUserReq({
			url: USERS_API + "/me",
			method: "GET",
		});
	}, []);

	const props: UploadProps = {
		customRequest: async (options) => {
			const { file } = options;
			const rcFile = file as RcFile;
			setAvatarUploading(true);

			try {
				const response = await getUploadUrlReq({
					url: AVATAR_API + "/upload_url",
					method: "POST",
					data: {
						file_name: rcFile.name,
						content_type: rcFile.type,
					},
				});

				await axios({
					url: response.data.upload_url,
					method: "PUT",
					data: rcFile,
					headers: {
						"Content-Type": rcFile.type,
					},
				});

				await saveAvatarReq({
					url: AVATAR_API + "/" + user?.id,
					method: "POST",
					data: {
						avatar: response.data.path,
					},
				});

				// Refresh user data
				getUserReq({
					url: USERS_API + "/me",
					method: "GET",
				});

				message.success("Avatar updated successfully!");
			} catch (err) {
				console.error(err);
				message.error("Failed to update avatar");
			} finally {
				setAvatarUploading(false);
			}
		},
		showUploadList: false,
		accept: "image/*",
		maxCount: 1,
	};

	useEffect(() => {
		if (
			getUserRes.isSuccess &&
			getUserRes.data &&
			typeof getUserRes.data === "object" &&
			Object.keys(getUserRes.data).length > 0 &&
			getUserRes.data.id
		) {
			form.setFieldsValue(getUserRes.data);
		}
	}, [getUserRes, form]);

	const onClose = () => {
		setOpenDialog(false);
	};

	const onFinish = (payload: Partial<User>) => {
		patchUserReq({
			url: `${USERS_API}/${user?.id}`,
			method: "PATCH",
			data: payload,
		}).then(() => {
			onClose();
			getUserReq({
				url: USERS_API + "/me",
				method: "GET",
			});
			message.success("Profile updated successfully!");
		});
	};

	// Check if we have valid user data
	const hasValidUser =
		user && typeof user === "object" && Object.keys(user).length > 0 && user.id;

	if (getUserRes.isLoading || !getUserRes.isSuccess) {
		return (
			<Card>
				<Flex justify="center" align="center" style={{ minHeight: 200 }}>
					<Spin size="large" />
				</Flex>
			</Card>
		);
	}

	if (!hasValidUser) {
		return (
			<Card>
				<Flex justify="center" align="center" style={{ minHeight: 200 }}>
					<Text type="secondary">Failed to load profile</Text>
				</Flex>
			</Card>
		);
	}

	return (
		<div style={{ maxWidth: 1200, margin: "0 auto" }}>
			{/* Header Card */}
			<Card
				style={{
					marginBottom: 24,
					background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
					border: "none",
				}}
			>
				<Row gutter={[24, 24]} align="middle">
					<Col xs={24} sm={6} md={4}>
						<div style={{ position: "relative", display: "inline-block" }}>
							<Upload {...props}>
								<div style={{ position: "relative", cursor: "pointer" }}>
									<Avatar
										size={120}
										src={user?.avatar}
										icon={<UserOutlined />}
										style={{
											border: "4px solid white",
											boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
										}}
									/>
									{avatarUploading && (
										<div
											style={{
												position: "absolute",
												top: 0,
												left: 0,
												right: 0,
												bottom: 0,
												backgroundColor: "rgba(0,0,0,0.5)",
												borderRadius: "50%",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
											}}
										>
											<LoadingOutlined
												style={{ color: "white", fontSize: 24 }}
											/>
										</div>
									)}
									<div
										style={{
											position: "absolute",
											bottom: 8,
											right: 8,
											backgroundColor: "white",
											borderRadius: "50%",
											width: 32,
											height: 32,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
										}}
									>
										<CameraOutlined
											style={{ color: "#1890ff", fontSize: 16 }}
										/>
									</div>
								</div>
							</Upload>
						</div>
					</Col>
					<Col xs={24} sm={18} md={16}>
						<Space direction="vertical" size={8} style={{ width: "100%" }}>
							<Flex gap={12} align="center" wrap="wrap">
								<Title
									level={2}
									style={{
										margin: 0,
										color: "white",
										fontSize: "28px",
										fontWeight: 600,
									}}
								>
									{user?.full_name || "Unknown User"}
								</Title>
								<Tag
									color={ROLE_COLORS[user?.role || "USER"]}
									style={{
										fontSize: "14px",
										padding: "4px 12px",
										fontWeight: 500,
										border: "none",
									}}
								>
									{user?.role?.toUpperCase() || "USER"}
								</Tag>
							</Flex>
							<Text
								style={{
									color: "rgba(255, 255, 255, 0.8)",
									fontSize: "16px",
									fontWeight: 400,
								}}
							>
								@{user?.username || "unknown"}
							</Text>
						</Space>
					</Col>
					<Col xs={24} sm={24} md={4}>
						<Flex justify="end">
							<Button
								type="primary"
								size="large"
								onClick={() => setOpenDialog(true)}
								icon={<EditOutlined />}
								style={{
									backgroundColor: "white",
									color: "#1890ff",
									border: "none",
									fontWeight: 500,
									height: 44,
									borderRadius: 8,
								}}
							>
								Edit Profile
							</Button>
						</Flex>
					</Col>
				</Row>
			</Card>

			{/* Information Cards */}
			<Row gutter={[24, 24]}>
				<Col xs={24} lg={12}>
					<Card
						title={
							<Flex align="center" gap={8}>
								<UserOutlined />
								<span>Contact Information</span>
							</Flex>
						}
						style={{ height: "100%" }}
					>
						<Space direction="vertical" size={16} style={{ width: "100%" }}>
							{user?.primary_address ? (
								<Flex align="flex-start" gap={12}>
									<HomeOutlined
										style={{ color: "#1890ff", fontSize: 16, marginTop: 2 }}
									/>
									<div style={{ flex: 1 }}>
										<div
											style={{
												fontSize: 12,
												color: "#8c8c8c",
												marginBottom: 2,
											}}
										>
											Primary Address
										</div>
										<Text>{user.primary_address}</Text>
									</div>
								</Flex>
							) : (
								<Text type="secondary" style={{ fontStyle: "italic" }}>
									No contact information available
								</Text>
							)}
						</Space>
					</Card>
				</Col>

				<Col xs={24} lg={12}>
					<Card
						title={
							<Flex align="center" gap={8}>
								<UserOutlined />
								<span>Account Details</span>
							</Flex>
						}
						style={{ height: "100%" }}
					>
						<Space direction="vertical" size={16} style={{ width: "100%" }}>
							<div>
								<div
									style={{ fontSize: 12, color: "#8c8c8c", marginBottom: 2 }}
								>
									User ID
								</div>
								<Text code>{user?.id || "N/A"}</Text>
							</div>

							<div>
								<div
									style={{ fontSize: 12, color: "#8c8c8c", marginBottom: 2 }}
								>
									Full Name
								</div>
								<Text>
									{user?.first_name || ""} {user?.last_name || ""}
								</Text>
							</div>

							<div>
								<div
									style={{ fontSize: 12, color: "#8c8c8c", marginBottom: 2 }}
								>
									Username
								</div>
								<Text>@{user?.username || "unknown"}</Text>
							</div>

							<div>
								<div
									style={{ fontSize: 12, color: "#8c8c8c", marginBottom: 2 }}
								>
									Role
								</div>
								<Tag
									color={ROLE_COLORS[user?.role || "USER"]}
									style={{ margin: 0 }}
								>
									{user?.role?.toUpperCase() || "USER"}
								</Tag>
							</div>

							{user?.createdAt && (
								<div>
									<div
										style={{ fontSize: 12, color: "#8c8c8c", marginBottom: 2 }}
									>
										Member Since
									</div>
									<Text>{new Date(user.createdAt).toLocaleDateString()}</Text>
								</div>
							)}

							{user?.updatedAt && (
								<div>
									<div
										style={{ fontSize: 12, color: "#8c8c8c", marginBottom: 2 }}
									>
										Last Updated
									</div>
									<Text>{new Date(user.updatedAt).toLocaleString()}</Text>
								</div>
							)}
						</Space>
					</Card>
				</Col>
			</Row>

			{openDialog && (
				<UserForm
					userId={user?.id}
					submitResponse={patchUserRes}
					onSubmit={onFinish}
					onClose={onClose}
				/>
			)}
		</div>
	);
}

export default Profile;
