import { Apple as AppleIcon, Google as GoogleIcon } from "@mui/icons-material";
import { Box } from "@mui/material";
import MyButton from "../../../components/common/Button";
import { API_BASE_URL } from "../../../config";

const SocialLoginButtons = () => {
  const onLoginWithGoogle = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 3 }}>
      <MyButton
        fullWidth
        colorScheme="grey"
        startIcon={<GoogleIcon />}
        sx={{ py: 0.9, borderRadius: 0, textTransform: "none", fontWeight: "regular" }}
        onClick={onLoginWithGoogle}
      >
        Sign in with Google
      </MyButton>

      <MyButton
        fullWidth
        colorScheme="grey"
        startIcon={<AppleIcon />}
        sx={{ py: 0.9, borderRadius: 0, textTransform: "none", fontWeight: "regular" }}
      >
        Sign in with Apple
      </MyButton>
    </Box>
  );
};

export default SocialLoginButtons;
