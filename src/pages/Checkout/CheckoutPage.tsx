import { LocalShipping, Payment, ShoppingCart } from "@mui/icons-material";
import {
  Box,
  Divider,
  FormControl,
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { useGlobal } from "../../hooks/useGlobal";
import { useSnackbar } from "../../hooks/useSnackbar";
import cartService from "../../services/cartService";
import orderService from "../../services/orderService";
import type { Cart } from "../../types/models/cart";
import type { CreateOrderRequest, ShippingAddress } from "../../types/models/order";
import { formatVND } from "../../utils/format";

type CheckoutFormData = ShippingAddress;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { user } = useGlobal();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CheckoutFormData>({
    defaultValues: {
      fullName: user?.fullName || "",
      phoneNumber: user?.phoneNumber || "",
      address: "",
      ward: "",
      district: "",
      city: "",
      note: "",
    },
  });

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) {
      setValue("fullName", user.fullName || "");
      setValue("phoneNumber", user.phoneNumber || "");
    }
  }, [user, setValue]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await cartService.getCart();
      if (!data || !data.items || data.items.length === 0) {
        showSnackbar("Giỏ hàng trống, vui lòng thêm sản phẩm", "warning");
        navigate("/cart");
        return;
      }
      setCart(data);
    } catch (error) {
      console.error("Error fetching cart:", error);
      showSnackbar("Không thể tải giỏ hàng", "error");
      navigate("/cart");
    } finally {
      setLoading(false);
    }
  };

  const shippingFee = 30000; // Phí ship cố định 30k

  const onSubmit = async (data: CheckoutFormData) => {
    if (!cart || !cart.items || cart.items.length === 0) {
      showSnackbar("Giỏ hàng trống", "error");
      return;
    }

    try {
      setSubmitting(true);

      const orderRequest: CreateOrderRequest = {
        items: cart.items.map((item) => ({
          productId: typeof item.productId === "string" ? item.productId : item.productId._id,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: {
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
          address: data.address,
          ward: data.ward,
          district: data.district,
          city: data.city,
          note: data.note,
        },
        paymentMethod: "COD",
        totalAmount: cart.totalAmount,
        shippingFee: shippingFee,
        note: data.note,
      };

      const order = await orderService.createOrder(orderRequest);

      if (order) {
        showSnackbar("Đặt hàng thành công!", "success");
        // Clear cart after successful order
        await cartService.clearCart();
        navigate(`/order-success/${order._id}`);
      } else {
        showSnackbar("Không thể tạo đơn hàng", "error");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      const apiError = error as { response?: { data?: { message?: string } } };
      showSnackbar(apiError.response?.data?.message || "Có lỗi xảy ra khi đặt hàng", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-orange-500"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return null;
  }

  const finalAmount = cart.totalAmount + shippingFee;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <Typography variant="h4" className="mb-6 font-bold text-gray-800">
          Thanh toán
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Shipping Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <Paper elevation={2} className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <LocalShipping className="text-orange-600" />
                  <Typography variant="h6" className="font-semibold">
                    Thông tin giao hàng
                  </Typography>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="fullName"
                    control={control}
                    rules={{ required: "Vui lòng nhập họ tên" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Họ và tên"
                        fullWidth
                        error={!!errors.fullName}
                        helperText={errors.fullName?.message}
                        required
                      />
                    )}
                  />

                  <Controller
                    name="phoneNumber"
                    control={control}
                    rules={{
                      required: "Vui lòng nhập số điện thoại",
                      pattern: {
                        value: /^[0-9]{10,11}$/,
                        message: "Số điện thoại không hợp lệ",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Số điện thoại"
                        fullWidth
                        error={!!errors.phoneNumber}
                        helperText={errors.phoneNumber?.message}
                        required
                      />
                    )}
                  />

                  <Controller
                    name="address"
                    control={control}
                    rules={{ required: "Vui lòng nhập địa chỉ" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Địa chỉ cụ thể"
                        fullWidth
                        className="md:col-span-2"
                        error={!!errors.address}
                        helperText={errors.address?.message}
                        required
                      />
                    )}
                  />

                  <Controller
                    name="ward"
                    control={control}
                    render={({ field }) => <TextField {...field} label="Phường/Xã" fullWidth />}
                  />

                  <Controller
                    name="district"
                    control={control}
                    render={({ field }) => <TextField {...field} label="Quận/Huyện" fullWidth />}
                  />

                  <Controller
                    name="city"
                    control={control}
                    rules={{ required: "Vui lòng nhập tỉnh/thành phố" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Tỉnh/Thành phố"
                        fullWidth
                        error={!!errors.city}
                        helperText={errors.city?.message}
                        required
                      />
                    )}
                  />

                  <Controller
                    name="note"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Ghi chú (tùy chọn)"
                        fullWidth
                        multiline
                        rows={3}
                        className="md:col-span-2"
                        placeholder="Ghi chú cho người giao hàng..."
                      />
                    )}
                  />
                </div>
              </Paper>

              {/* Payment Method */}
              <Paper elevation={2} className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Payment className="text-orange-600" />
                  <Typography variant="h6" className="font-semibold">
                    Phương thức thanh toán
                  </Typography>
                </div>

                <FormControl component="fieldset">
                  <RadioGroup value="COD" row>
                    <FormControlLabel
                      value="COD"
                      control={<Radio sx={{ color: "orange", "&.Mui-checked": { color: "orange" } }} />}
                      label={
                        <Box>
                          <Typography className="font-medium">Thanh toán khi nhận hàng (COD)</Typography>
                          <Typography variant="caption" className="text-gray-500">
                            Thanh toán bằng tiền mặt khi nhận hàng
                          </Typography>
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>
              </Paper>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <Paper elevation={2} className="p-6 sticky top-4">
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingCart className="text-orange-600" />
                  <Typography variant="h6" className="font-semibold">
                    Đơn hàng ({cart.totalItems} sản phẩm)
                  </Typography>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
                  {cart.items.map((item) => {
                    const product = typeof item.productId === "object" ? item.productId : null;
                    const productImage = product?.listProductImage?.[0]?.url || "/placeholder.jpg";
                    const productName = product?.name || "Sản phẩm";

                    return (
                      <div key={item._id} className="flex gap-3 pb-3 border-b">
                        <img src={productImage} alt={productName} className="w-16 h-16 object-cover rounded" />
                        <div className="flex-1">
                          <Typography variant="body2" className="font-medium line-clamp-2">
                            {productName}
                          </Typography>
                          <Typography variant="caption" className="text-gray-600">
                            Số lượng: {item.quantity}
                          </Typography>
                          <Typography variant="body2" className="text-orange-600 font-semibold">
                            {formatVND(item.price * item.quantity)}
                          </Typography>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Divider className="my-4" />

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <Typography className="text-gray-600">Tạm tính:</Typography>
                    <Typography className="font-medium">{formatVND(cart.totalAmount)}</Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography className="text-gray-600">Phí vận chuyển:</Typography>
                    <Typography className="font-medium">{formatVND(shippingFee)}</Typography>
                  </div>
                </div>

                <Divider className="my-4" />

                <div className="flex justify-between mb-6">
                  <Typography variant="h6" className="font-bold">
                    Tổng cộng:
                  </Typography>
                  <Typography variant="h6" className="font-bold text-orange-600">
                    {formatVND(finalAmount)}
                  </Typography>
                </div>

                <Button type="submit" fullWidth disabled={submitting} className="h-12">
                  {submitting ? "Đang xử lý..." : "Đặt hàng"}
                </Button>

                <Typography variant="caption" className="text-gray-500 text-center block mt-3">
                  Bằng việc đặt hàng, bạn đồng ý với Điều khoản sử dụng của chúng tôi
                </Typography>
              </Paper>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
