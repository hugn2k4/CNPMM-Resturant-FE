import BookmarkIcon from "@mui/icons-material/Bookmark";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { Box, Tab, Tabs } from "@mui/material";
import React, { useEffect, useState } from "react";
import voucherApi from "../../api/voucherApi";
import VoucherCard from "../../components/common/VoucherCard";
import { useSnackbar } from "../../hooks/useSnackbar";
import type { IVoucher } from "../../types/models/voucher";

const Vouchers: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [availableVouchers, setAvailableVouchers] = useState<IVoucher[]>([]);
  const [savedVouchers, setSavedVouchers] = useState<IVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    fetchVouchers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const [availableRes, savedRes] = await Promise.all([
        voucherApi.getAvailableVouchers(1, 100),
        voucherApi.getSavedVouchers(1, 100),
      ]);
      setAvailableVouchers(Array.isArray(availableRes.data.data) ? availableRes.data.data : []);
      setSavedVouchers(Array.isArray(savedRes.data.data) ? savedRes.data.data : []);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      showSnackbar("Không thể tải danh sách voucher", "error");
      setAvailableVouchers([]);
      setSavedVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVoucher = async (voucherId: string) => {
    try {
      const response = await voucherApi.toggleSaveVoucher(voucherId);
      showSnackbar(response.data.message, "success");
      fetchVouchers();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showSnackbar(error.response?.data?.message || "Có lỗi xảy ra", "error");
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showSnackbar("Đã sao chép mã voucher", "success");
  };

  const currentVouchers = activeTab === 0 ? availableVouchers : savedVouchers;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-3 mb-6">
          <LocalOfferIcon className="text-orange-500" fontSize="large" />
          <h1 className="text-3xl font-bold text-gray-800">Kho Voucher</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
            <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
              <Tab
                icon={<LocalOfferIcon />}
                iconPosition="start"
                label={`Tất cả voucher (${availableVouchers.length})`}
              />
              <Tab icon={<BookmarkIcon />} iconPosition="start" label={`Đã lưu (${savedVouchers.length})`} />
            </Tabs>
          </Box>

          {/* Voucher Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải...</p>
            </div>
          ) : currentVouchers.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {currentVouchers.map((voucher) => (
                <VoucherCard
                  key={voucher._id}
                  voucher={voucher}
                  onSave={handleSaveVoucher}
                  onApply={(v) => handleCopyCode(v.code)}
                  showActions={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <LocalOfferIcon className="text-gray-300" style={{ fontSize: 80 }} />
              <p className="text-gray-500 mt-4">
                {activeTab === 0 ? "Không có voucher khả dụng" : "Bạn chưa lưu voucher nào"}
              </p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-3">Cách sử dụng voucher</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">1.</span>
              <span>Chọn voucher phù hợp với đơn hàng của bạn</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">2.</span>
              <span>Lưu voucher để sử dụng sau hoặc sao chép mã voucher</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">3.</span>
              <span>Nhập mã voucher khi thanh toán để nhận ưu đãi</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">4.</span>
              <span>Mỗi voucher có giới hạn số lần sử dụng, hãy sử dụng sớm!</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Vouchers;
