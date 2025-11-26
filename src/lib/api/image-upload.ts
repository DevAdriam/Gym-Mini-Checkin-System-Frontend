import axios from "axios";
import { API_BASE_URL } from "../axios-config";

// Image upload response
export interface ImageUploadResponse {
  url: string;
  imageUrl: string;
  id?: string;
}

// Image type enum
export type ImageType = "PROFILE" | "PAYMENT_SCREENSHOT";

// Upload image file for a member
// Note: This requires a member ID. For registration, we may need to upload after member is created,
// or use a temporary upload endpoint if available.
export const uploadImage = async (
  memberId: string,
  file: File,
  type: ImageType,
  description?: string
): Promise<ImageUploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);
  if (description) {
    formData.append("description", description);
  }

  const response = await axios.post(
    `${API_BASE_URL}/members/${memberId}/images`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  // Extract URL from response
  const data = response.data._data?.data || response.data.data || response.data;
  return {
    url: data.url || data.imageUrl || data.path,
    imageUrl: data.url || data.imageUrl || data.path,
    id: data.id,
  };
};

// Upload image using imageUrl (alternative to file upload)
export const uploadImageByUrl = async (
  memberId: string,
  imageUrl: string,
  type: ImageType,
  description?: string
): Promise<ImageUploadResponse> => {
  const formData = new FormData();
  formData.append("imageUrl", imageUrl);
  formData.append("type", type);
  if (description) {
    formData.append("description", description);
  }

  const response = await axios.post(
    `${API_BASE_URL}/members/${memberId}/images`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  const data = response.data._data?.data || response.data.data || response.data;
  return {
    url: data.url || data.imageUrl || data.path,
    imageUrl: data.url || data.imageUrl || data.path,
    id: data.id,
  };
};

// Upload multiple images for a member
export const uploadImages = async (
  memberId: string,
  files: File[],
  type: ImageType,
  descriptions?: string[]
): Promise<ImageUploadResponse[]> => {
  const uploadPromises = files.map((file, index) =>
    uploadImage(memberId, file, type, descriptions?.[index])
  );
  return Promise.all(uploadPromises);
};
