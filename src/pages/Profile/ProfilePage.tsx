import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SaveIcon from "@mui/icons-material/Save";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobal } from "../../hooks/useGlobal";
import { useSnackbar } from "../../hooks/useSnackbar";
import { userService } from "../../services/userService";
import type { User } from "../../types/models/user";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, setGlobal, isLogin } = useGlobal();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<User>({
    email: "",
    fullName: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: undefined,
    image: "",
  });

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userService.getProfile();
      if (response.success && response.data) {
        setFormData({
          email: response.data.email || "",
          fullName: response.data.fullName || "",
          phoneNumber: response.data.phoneNumber || "",
          dateOfBirth: response.data.dateOfBirth ? response.data.dateOfBirth.split("T")[0] : "",
          gender: response.data.gender,
          image: response.data.image || response.data.avatar || "",
        });
        setGlobal({ user: response.data });
      }
    } catch {
      showSnackbar("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  }, [setGlobal, showSnackbar]);

  useEffect(() => {
    if (!isLogin) {
      navigate("/signin");
      return;
    }

    // Load user data from global state or fetch from API
    if (user) {
      setFormData({
        email: user.email || "",
        fullName: user.fullName || "",
        phoneNumber: user.phoneNumber || "",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
        gender: user.gender,
        image: user.image || user.avatar || "",
      });
    } else {
      // Fetch profile if not in global state
      loadProfile();
    }
  }, [user, isLogin, navigate, loadProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName?.trim()) {
      showSnackbar("Full name is required", "error");
      return;
    }

    try {
      setLoading(true);
      const response = await userService.updateProfile({
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        image: formData.image,
      });

      if (response.success && response.data) {
        setGlobal({ user: response.data });
        showSnackbar("Profile updated successfully!", "success");
      } else {
        showSnackbar(response.message || "Failed to update profile", "error");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isLogin) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card sx={{ boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <AccountCircleIcon sx={{ fontSize: 40, mr: 2, color: "var(--color-primary)" }} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              My Profile
            </Typography>
          </Box>

          {/* Avatar Section */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
            <Avatar
              src={formData.image}
              alt={formData.fullName}
              sx={{
                width: 120,
                height: 120,
                bgcolor: "var(--color-primary)",
                fontSize: "3rem",
              }}
            >
              {formData.fullName?.charAt(0)?.toUpperCase() || "U"}
            </Avatar>
          </Box>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Email (Read-only) */}
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                disabled
                helperText="Email cannot be changed"
              />

              {/* Full Name */}
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                placeholder="Enter your full name"
              />

              {/* Phone Number and Date of Birth - side by side */}
              <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                />

                <TextField
                  fullWidth
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              {/* Gender */}
              <FormControl component="fieldset">
                <FormLabel component="legend">Gender</FormLabel>
                <RadioGroup row name="gender" value={formData.gender || ""} onChange={handleInputChange}>
                  <FormControlLabel value="MALE" control={<Radio />} label="Male" />
                  <FormControlLabel value="FEMALE" control={<Radio />} label="Female" />
                  <FormControlLabel value="OTHER" control={<Radio />} label="Other" />
                </RadioGroup>
              </FormControl>

              {/* Avatar URL */}
              <TextField
                fullWidth
                label="Avatar URL"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="Enter avatar image URL"
                helperText="Paste a URL to your profile picture"
              />

              {/* Submit Button */}
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}>
                <Button variant="outlined" onClick={() => navigate("/")} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={loading}
                  sx={{
                    bgcolor: "var(--color-primary)",
                    "&:hover": {
                      bgcolor: "var(--color-primary-dark)",
                    },
                  }}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ProfilePage;
