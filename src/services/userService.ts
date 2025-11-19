import userApi, { type UpdateProfileRequest } from "../api/userApi";

export const userService = {
  getProfile: async () => {
    const res = await userApi.getProfile();
    return res;
  },

  updateProfile: async (data: UpdateProfileRequest) => {
    const res = await userApi.updateProfile(data);

    // Update localStorage with new user data
    if (res.success && res.data) {
      localStorage.setItem("user", JSON.stringify(res.data));
    }

    return res;
  },
};
