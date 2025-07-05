export type Product = {
	id: string;
	name: string;
	description: string;
	category_id: number;
	category?: string;
	price: number;
	stock: number;
};

// Image upload types based on the API spec
export type ImageRequest = {
	is_primary: boolean;
	image_url: string;
	display_order: number;
};

export type PostImagesRequest = {
	images: ImageRequest[];
};

export type ImageResponse = {
	id: string;
	is_primary: boolean;
	image_url: string;
	display_order: number;
};

export type PostImagesResponse = {
	images: ImageResponse[];
};

export type GetImagesResponse = {
	images: ImageResponse[];
};

// S3 presigned URL types
export type UploadSignedUrlRequest = {
	key: string;
	file_name: string;
	content_type: string;
};

export type UploadSignedUrlResponse = {
	upload_url: string;
	path: string;
	public_url: string;
};
