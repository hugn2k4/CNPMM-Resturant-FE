import { LocalOffer, LocalShipping, Payment, ShoppingCart, Stars } from "@mui/icons-material";
import {
  Alert,
  Box,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import loyaltyApi from "../../api/loyaltyApi";
import ApplyVoucherDialog from "../../components/common/ApplyVoucherDialog";
import Button from "../../components/common/Button";
import { useGlobal } from "../../hooks/useGlobal";
import { useSnackbar } from "../../hooks/useSnackbar";
import cartService from "../../services/cartService";
import orderService from "../../services/orderService";
import type { Cart } from "../../types/models/cart";
import type { CreateOrderRequest, ShippingAddress } from "../../types/models/order";
import type { ILoyaltyAccount, IVoucher } from "../../types/models/voucher";
import { formatVND } from "../../utils/format";

type CheckoutFormData = ShippingAddress;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { user } = useGlobal();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Voucher & Loyalty states
  const [voucherDialogOpen, setVoucherDialogOpen] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<{ voucher: Partial<IVoucher>; discountAmount: number } | null>(
    null
  );
  const [loyaltyAccount, setLoyaltyAccount] = useState<ILoyaltyAccount | null>(null);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [potentialPoints, setPotentialPoints] = useState(0);

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
    fetchLoyaltyAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) {
      setValue("fullName", user.fullName || "");
      setValue("phoneNumber", user.phoneNumber || "");
    }
  }, [user, setValue]);

  useEffect(() => {
    if (cart) {
      calculatePotentialPoints();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, appliedVoucher, pointsToUse]);

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

  const fetchLoyaltyAccount = async () => {
    try {
      const response = await loyaltyApi.getLoyaltyAccount();
      setLoyaltyAccount(response.data.data);
    } catch (error) {
      console.error("Error fetching loyalty account:", error);
    }
  };

  const calculatePotentialPoints = async () => {
    if (!cart) return;

    try {
      const finalAmount = calculateFinalAmount();
      const response = await loyaltyApi.calculatePotentialPoints({ orderAmount: finalAmount });
      setPotentialPoints(response.data.data.potentialPoints);
    } catch (error) {
      console.error("Error calculating potential points:", error);
    }
  };

  const handleApplyVoucher = (voucher: IVoucher, discountAmount: number) => {
    setAppliedVoucher({ voucher, discountAmount });
    showSnackbar(`Đã áp dụng mã ${voucher.code || "giảm giá"}`, "success");
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    showSnackbar("Đã xóa mã giảm giá", "info");
  };

  const handlePointsChange = (_: Event, value: number | number[]) => {
    setPointsToUse(value as number);
  };

  const getPointsDiscount = () => {
    if (!loyaltyAccount || !loyaltyAccount.conversionRate || pointsToUse === 0) return 0;
    return pointsToUse * loyaltyAccount.conversionRate.currencyPerPoint;
  };

  const calculateFinalAmount = () => {
    if (!cart) return 0;
    const subtotal = cart.totalAmount + shippingFee;
    const voucherDiscount = appliedVoucher?.discountAmount || 0;
    const pointsDiscount = getPointsDiscount();
    return Math.max(0, subtotal - voucherDiscount - pointsDiscount);
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
        voucherCode: appliedVoucher?.voucher?.code,
        pointsToUse: pointsToUse > 0 ? pointsToUse : undefined,
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

  const subtotal = cart.totalAmount + shippingFee;
  const voucherDiscount = appliedVoucher?.discountAmount || 0;
  const pointsDiscount = getPointsDiscount();
  const finalAmount = calculateFinalAmount();
  const maxPointsToUse =
    loyaltyAccount && loyaltyAccount.conversionRate
      ? Math.min(loyaltyAccount.availablePoints, Math.floor(subtotal / loyaltyAccount.conversionRate.currencyPerPoint))
      : 0;

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

                {/* Voucher Section */}
                <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <LocalOffer className="text-orange-600" fontSize="small" />
                      <Typography variant="body2" className="font-semibold text-orange-800">
                        Mã giảm giá
                      </Typography>
                    </div>
                  </div>

                  {appliedVoucher ? (
                    <div className="bg-white p-2 rounded border border-orange-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <Chip
                            label={appliedVoucher.voucher?.code || "N/A"}
                            color="warning"
                            size="small"
                            className="font-mono font-bold"
                          />
                          <Typography variant="caption" className="text-gray-600 block mt-1">
                            Giảm {formatVND(appliedVoucher.discountAmount)}
                          </Typography>
                        </div>
                        <Button size="sm" variant="outline" onClick={handleRemoveVoucher}>
                          Xóa
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      fullWidth
                      variant="outline"
                      size="sm"
                      onClick={() => setVoucherDialogOpen(true)}
                      className="border-orange-300 text-orange-600 hover:bg-orange-50"
                    >
                      Chọn hoặc nhập mã
                    </Button>
                  )}
                </div>

                {/* Loyalty Points Section */}
                {loyaltyAccount && loyaltyAccount.availablePoints > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Stars className="text-blue-600" fontSize="small" />
                        <Typography variant="body2" className="font-semibold text-blue-800">
                          Điểm tích lũy
                        </Typography>
                      </div>
                      <Chip label={`${loyaltyAccount.availablePoints} điểm`} color="primary" size="small" />
                    </div>

                    <div className="bg-white p-3 rounded border border-blue-300">
                      <Typography variant="caption" className="text-gray-600 block mb-2">
                        Sử dụng điểm: {pointsToUse} điểm = {formatVND(pointsDiscount)}
                      </Typography>
                      <Slider
                        value={pointsToUse}
                        onChange={handlePointsChange}
                        min={0}
                        max={maxPointsToUse}
                        step={10}
                        marks={[
                          { value: 0, label: "0" },
                          { value: maxPointsToUse, label: maxPointsToUse.toString() },
                        ]}
                        valueLabelDisplay="auto"
                        sx={{
                          color: "#2196f3",
                          "& .MuiSlider-thumb": {
                            backgroundColor: "#2196f3",
                          },
                          "& .MuiSlider-track": {
                            backgroundColor: "#2196f3",
                          },
                          "& .MuiSlider-rail": {
                            backgroundColor: "#bbdefb",
                          },
                        }}
                      />
                      <Typography variant="caption" className="text-gray-500">
                        Tối đa: {maxPointsToUse} điểm
                      </Typography>
                    </div>
                  </div>
                )}

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
                  {voucherDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <Typography>Giảm giá voucher:</Typography>
                      <Typography className="font-medium">-{formatVND(voucherDiscount)}</Typography>
                    </div>
                  )}
                  {pointsDiscount > 0 && (
                    <div className="flex justify-between text-blue-600">
                      <Typography>Giảm từ điểm:</Typography>
                      <Typography className="font-medium">-{formatVND(pointsDiscount)}</Typography>
                    </div>
                  )}
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

                {/* Potential Points Info */}
                {potentialPoints > 0 && (
                  <Alert severity="success" className="mt-3" icon={<Stars />}>
                    <Typography variant="caption">
                      Bạn sẽ nhận được <strong>{potentialPoints} điểm</strong> từ đơn hàng này!
                    </Typography>
                  </Alert>
                )}

                <Typography variant="caption" className="text-gray-500 text-center block mt-3">
                  Bằng việc đặt hàng, bạn đồng ý với Điều khoản sử dụng của chúng tôi
                </Typography>
              </Paper>
            </div>
          </div>
        </form>

        {/* Voucher Dialog */}
        {cart && (
          <ApplyVoucherDialog
            open={voucherDialogOpen}
            onClose={() => setVoucherDialogOpen(false)}
            onApply={handleApplyVoucher}
            orderData={{
              subtotal: cart.totalAmount,
              items: cart.items.map((item) => ({
                product: typeof item.productId === "string" ? item.productId : item.productId._id,
                quantity: item.quantity,
                price: item.price,
              })),
            }}
          />
        )}
      </div>
    </div>
  );
}
