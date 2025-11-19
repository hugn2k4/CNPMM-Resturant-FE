import type { User } from "../types/models/user";
import axiosClient from "../utils/axiosClient";

export interface UpdateProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  image?: string;
}

export interface UserProfileResponse {
  success: boolean;
  message?: string;
  data?: User;
}

const userApi = {
  getProfile: (): Promise<UserProfileResponse> => axiosClient.get("/users/profile").then((response) => response.data),

  updateProfile: (data: UpdateProfileRequest): Promise<UserProfileResponse> =>
    axiosClient.put("/users/profile", data).then((response) => response.data),
};

export default userApi;
