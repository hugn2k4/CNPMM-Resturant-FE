import React from "react";
import { VoucherDiscountType } from "../../types/enums/voucher";
import type { IVoucher } from "../../types/models/voucher";
import Button from "../common/Button";

interface VoucherCardProps {
  voucher: IVoucher;
  onSave?: (voucherId: string) => void;
  onApply?: (voucher: IVoucher) => void;
  onDelete?: (voucherId: string) => void;
  showActions?: boolean;
  isAdmin?: boolean;
}

const VoucherCard: React.FC<VoucherCardProps> = ({
  voucher,
  onSave,
  onApply,
  onDelete,
  showActions = true,
  isAdmin = false,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getDiscountText = () => {
    if (voucher.discountType === VoucherDiscountType.PERCENTAGE) {
      return `Giảm ${voucher.discountValue}%`;
    } else {
      return `Giảm ${formatCurrency(voucher.discountValue)}`;
    }
  };

  const isExpired = new Date(voucher.endDate) < new Date();
  const isNotStarted = new Date(voucher.startDate) > new Date();
  const isMaxUsage = voucher.maxUsage && voucher.usageCount >= voucher.maxUsage;

  return (
    <div
      className={`relative bg-white rounded-lg shadow-md overflow-hidden border-2 transition-all hover:shadow-lg ${
        isExpired || isNotStarted || isMaxUsage || !voucher.canUse ? "border-gray-300 opacity-60" : "border-orange-400"
      }`}
    >
      {/* Voucher status badge */}
      {(isExpired || isNotStarted || isMaxUsage || !voucher.canUse) && (
        <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
          {isExpired ? "Hết hạn" : isNotStarted ? "Chưa bắt đầu" : isMaxUsage ? "Hết lượt" : "Đã dùng hết"}
        </div>
      )}

      {voucher.isSaved && (
        <div className="absolute top-2 left-2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
          Đã lưu
        </div>
      )}

      <div className="flex">
        {/* Left side - Discount */}
        <div className="w-32 bg-gradient-to-br from-orange-400 to-orange-600 flex flex-col items-center justify-center text-white p-4 relative">
          <div className="text-2xl font-bold">{getDiscountText()}</div>
          {voucher.maxDiscountAmount && (
            <div className="text-xs mt-1">Tối đa {formatCurrency(voucher.maxDiscountAmount)}</div>
          )}
          {/* Semicircle cutouts */}
          <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gray-50 rounded-full"></div>
        </div>

        {/* Right side - Details */}
        <div className="flex-1 p-4">
          <h3 className="font-bold text-lg text-gray-800 mb-1">{voucher.name}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{voucher.description}</p>

          <div className="space-y-1 text-xs text-gray-500 mb-3">
            <div className="flex items-center">
              <span className="font-semibold mr-2">Mã:</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">{voucher.code}</span>
            </div>
            <div>
              <span className="font-semibold">Đơn tối thiểu:</span> {formatCurrency(voucher.minOrderAmount)}
            </div>
            <div>
              <span className="font-semibold">HSD:</span> {formatDate(voucher.startDate)} -{" "}
              {formatDate(voucher.endDate)}
            </div>
            {voucher.userUsageCount !== undefined && (
              <div>
                <span className="font-semibold">Đã dùng:</span> {voucher.userUsageCount}/{voucher.maxUsagePerUser}
              </div>
            )}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2">
              {!isAdmin && onApply && voucher.canUse && !isExpired && !isNotStarted && (
                <Button onClick={() => onApply(voucher)} variant="primary" size="sm" className="flex-1">
                  Áp dụng
                </Button>
              )}

              {!isAdmin && onSave && (
                <Button
                  onClick={() => onSave(voucher._id)}
                  variant={voucher.isSaved ? "secondary" : "outline"}
                  size="sm"
                  className="flex-1"
                >
                  {voucher.isSaved ? "Bỏ lưu" : "Lưu"}
                </Button>
              )}

              {isAdmin && onDelete && (
                <Button onClick={() => onDelete(voucher._id)} variant="danger" size="sm" className="flex-1">
                  Xóa
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoucherCard;
