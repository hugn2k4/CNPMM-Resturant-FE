import CloseIcon from "@mui/icons-material/Close";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { Alert, Dialog, DialogContent, DialogTitle, IconButton, TextField } from "@mui/material";
import React, { useState } from "react";
import voucherApi from "../../api/voucherApi";
import type { IVoucher } from "../../types/models/voucher";
import Button from "../common/Button";
import VoucherCard from "../common/VoucherCard";

interface ApplyVoucherDialogProps {
  open: boolean;
  onClose: () => void;
  onApply: (voucher: IVoucher, discountAmount: number) => void;
  orderData: {
    subtotal: number;
    items: Array<{
      product: string;
      quantity: number;
      price: number;
    }>;
  };
}

const ApplyVoucherDialog: React.FC<ApplyVoucherDialogProps> = ({ open, onClose, onApply, orderData }) => {
  const [voucherCode, setVoucherCode] = useState("");
  const [availableVouchers, setAvailableVouchers] = useState<IVoucher[]>([]);
  const [savedVouchers, setSavedVouchers] = useState<IVoucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"available" | "saved">("available");

  React.useEffect(() => {
    if (open) {
      fetchVouchers();
    }
  }, [open]);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const [availableRes, savedRes] = await Promise.all([
        voucherApi.getAvailableVouchers(1, 50),
        voucherApi.getSavedVouchers(1, 50),
      ]);
      setAvailableVouchers(Array.isArray(availableRes.data.data) ? availableRes.data.data : []);
      setSavedVouchers(Array.isArray(savedRes.data.data) ? savedRes.data.data : []);
    } catch (err: unknown) {
      console.error("Error fetching vouchers:", err);
      setAvailableVouchers([]);
      setSavedVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyByCode = async () => {
    if (!voucherCode.trim()) {
      setError("Vui lòng nhập mã voucher");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await voucherApi.validateVoucher({
        code: voucherCode,
        orderData,
      });

      onApply(response.data.data.voucher as IVoucher, response.data.data.discountAmount);
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Mã voucher không hợp lệ");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyVoucher = async (voucher: IVoucher) => {
    try {
      setLoading(true);
      setError("");

      const response = await voucherApi.validateVoucher({
        code: voucher.code,
        orderData,
      });

      onApply(response.data.data.voucher as IVoucher, response.data.data.discountAmount);
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Không thể áp dụng voucher này");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVoucher = async (voucherId: string) => {
    try {
      await voucherApi.toggleSaveVoucher(voucherId);
      fetchVouchers();
    } catch (err) {
      console.error("Error saving voucher:", err);
    }
  };

  const currentVouchers = activeTab === "available" ? availableVouchers : savedVouchers;

  const isVoucherActiveNow = (v: IVoucher) => {
    const now = new Date();
    const isExpired = v.endDate ? new Date(v.endDate) < now : false;
    const isNotStarted = v.startDate ? new Date(v.startDate) > now : false;
    const isMaxUsage = v.maxUsage && v.usageCount >= v.maxUsage;
    return !isExpired && !isNotStarted && !isMaxUsage && v.canUse;
  };

  const eligibleVouchers = Array.isArray(currentVouchers)
    ? currentVouchers.filter((v) => isVoucherActiveNow(v) && orderData.subtotal >= (v.minOrderAmount || 0))
    : [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <LocalOfferIcon className="text-orange-500" />
          <span className="font-bold text-xl">Chọn Voucher</span>
        </div>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent className="p-6">
        {/* Input voucher code */}
        <div className="mb-6">
          <div className="flex gap-2">
            <TextField
              fullWidth
              placeholder="Nhập mã voucher"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              size="small"
              disabled={loading}
            />
            <Button onClick={handleApplyByCode} disabled={loading} className="whitespace-nowrap">
              Áp dụng
            </Button>
          </div>
          {error && (
            <Alert severity="error" className="mt-2">
              {error}
            </Alert>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-4">
          <button
            className={`flex-1 py-2 font-semibold transition-colors ${
              activeTab === "available"
                ? "text-orange-500 border-b-2 border-orange-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("available")}
          >
            Có thể dùng ({eligibleVouchers.length})
          </button>
          <button
            className={`flex-1 py-2 font-semibold transition-colors ${
              activeTab === "saved"
                ? "text-orange-500 border-b-2 border-orange-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("saved")}
          >
            Đã lưu ({savedVouchers.length})
          </button>
        </div>

        {/* Voucher list */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {/* Voucher list */}
          {loading ? (
            <div className="text-center py-8 text-gray-500">Đang tải...</div>
          ) : eligibleVouchers.length > 0 ? (
            eligibleVouchers.map((voucher) => (
              <VoucherCard
                key={voucher._id}
                voucher={voucher}
                onApply={handleApplyVoucher}
                onSave={handleSaveVoucher}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {activeTab === "available" ? "Không có voucher khả dụng" : "Bạn chưa lưu voucher nào"}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyVoucherDialog;
