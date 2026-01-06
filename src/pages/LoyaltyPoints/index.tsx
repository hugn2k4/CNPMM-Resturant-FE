import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import HistoryIcon from "@mui/icons-material/History";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import loyaltyApi from "../../api/loyaltyApi";
import { LoyaltyTier, PointTransactionType } from "../../types/enums/voucher";
import type { ILoyaltyAccount, IPointTransaction } from "../../types/models/voucher";

const LoyaltyPoints: React.FC = () => {
  const [account, setAccount] = useState<ILoyaltyAccount | null>(null);
  const [transactions, setTransactions] = useState<IPointTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const fetchLoyaltyData = async () => {
    try {
      setLoading(true);
      const [accountRes, transactionsRes] = await Promise.all([
        loyaltyApi.getLoyaltyAccount(),
        loyaltyApi.getTransactionHistory({}, 1, 50),
      ]);
      setAccount(accountRes.data.data);
      setTransactions(transactionsRes.data.data);
    } catch (error) {
      console.error("Error fetching loyalty data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: LoyaltyTier) => {
    const colors = {
      BRONZE: "#CD7F32",
      SILVER: "#C0C0C0",
      GOLD: "#FFD700",
      PLATINUM: "#E5E4E2",
    };
    return colors[tier] || colors.BRONZE;
  };

  const getTierIcon = (tier: LoyaltyTier) => {
    return <EmojiEventsIcon style={{ color: getTierColor(tier), fontSize: 40 }} />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionTypeLabel = (type: PointTransactionType) => {
    const labels = {
      EARN: "Tích điểm",
      REDEEM: "Đổi điểm",
      EXPIRED: "Hết hạn",
      ADMIN_ADJUSTMENT: "Điều chỉnh",
    };
    return labels[type] || type;
  };

  const getTransactionTypeColor = (type: PointTransactionType) => {
    const colors = {
      EARN: "success",
      REDEEM: "warning",
      EXPIRED: "error",
      ADMIN_ADJUSTMENT: "info",
    };
    return colors[type] || "default";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Không thể tải thông tin điểm tích lũy</p>
      </div>
    );
  }

  const tierProgress = account.nextTier
    ? ((account.lifetimePoints - (account.nextTier.requiredPoints - account.nextTier.pointsNeeded)) /
        account.nextTier.pointsNeeded) *
      100
    : 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Điểm Tích Lũy</h1>

        {/* Account Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Available Points Card */}
          <Card className="bg-gradient-to-br from-orange-400 to-orange-600 text-white">
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <Typography variant="h6" className="font-semibold">
                  Điểm khả dụng
                </Typography>
                <TrendingUpIcon fontSize="large" />
              </div>
              <Typography variant="h3" className="font-bold mb-2">
                {account.availablePoints.toLocaleString()}
              </Typography>
              <Typography variant="body2" className="opacity-90">
                ≈ {formatCurrency(account.availablePoints * account.conversionRate.currencyPerPoint)}
              </Typography>
            </CardContent>
          </Card>

          {/* Tier Card */}
          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <Typography variant="h6" className="font-semibold">
                  Hạng thành viên
                </Typography>
                {getTierIcon(account.tier)}
              </div>
              <Chip
                label={account.tierBenefits.description}
                style={{ backgroundColor: getTierColor(account.tier), color: "white" }}
                className="font-semibold"
              />
              <Typography variant="body2" className="text-gray-600 mt-2">
                Tích điểm x{account.tierBenefits.pointsMultiplier}
              </Typography>
            </CardContent>
          </Card>

          {/* Lifetime Points Card */}
          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <Typography variant="h6" className="font-semibold">
                  Tổng điểm tích lũy
                </Typography>
                <HistoryIcon fontSize="large" className="text-gray-400" />
              </div>
              <Typography variant="h3" className="font-bold text-gray-800">
                {account.lifetimePoints.toLocaleString()}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Điểm tích lũy suốt đời
              </Typography>
            </CardContent>
          </Card>
        </div>

        {/* Tier Progress */}
        {account.nextTier && (
          <Card className="mb-6">
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <Typography variant="h6" className="font-semibold">
                  Tiến độ lên hạng {account.nextTier.tier}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Còn {account.nextTier.pointsNeeded.toLocaleString()} điểm
                </Typography>
              </div>
              <LinearProgress
                variant="determinate"
                value={tierProgress}
                className="h-3 rounded-full"
                sx={{
                  backgroundColor: "#e0e0e0",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: getTierColor(account.nextTier.tier),
                  },
                }}
              />
              <Typography variant="body2" className="text-gray-600 mt-2">
                {account.lifetimePoints.toLocaleString()} / {account.nextTier.requiredPoints.toLocaleString()} điểm
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Conversion Rate Info */}
        <Card className="mb-6 bg-blue-50 border border-blue-200">
          <CardContent>
            <Typography variant="h6" className="font-semibold mb-2 text-blue-800">
              Quy đổi điểm
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Typography variant="body2" className="text-blue-600">
                  Tích điểm: {account.conversionRate.pointsPerCurrency} điểm / 1,000đ
                </Typography>
              </div>
              <div>
                <Typography variant="body2" className="text-blue-600">
                  Đổi điểm: 1 điểm = {formatCurrency(account.conversionRate.currencyPerPoint)}
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
              <Tab label="Lịch sử giao dịch" />
              <Tab label="Cách tích điểm" />
            </Tabs>
          </Box>

          {/* Transaction History */}
          {activeTab === 0 && (
            <CardContent>
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Loại</TableCell>
                      <TableCell>Mô tả</TableCell>
                      <TableCell align="right">Điểm</TableCell>
                      <TableCell align="right">Số dư sau</TableCell>
                      <TableCell>Thời gian</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.length > 0 ? (
                      transactions.map((transaction) => (
                        <TableRow key={transaction._id}>
                          <TableCell>
                            <Chip
                              label={getTransactionTypeLabel(transaction.type)}
                              color={
                                getTransactionTypeColor(transaction.type) as
                                  | "default"
                                  | "primary"
                                  | "secondary"
                                  | "error"
                                  | "info"
                                  | "success"
                                  | "warning"
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell
                            align="right"
                            className={
                              transaction.type === PointTransactionType.EARN
                                ? "text-green-600 font-semibold"
                                : "text-red-600 font-semibold"
                            }
                          >
                            {transaction.type === PointTransactionType.EARN ? "+" : "-"}
                            {transaction.points}
                          </TableCell>
                          <TableCell align="right">{transaction.balanceAfter.toLocaleString()}</TableCell>
                          <TableCell className="text-gray-600 text-sm">{formatDate(transaction.createdAt)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" className="text-gray-500">
                          Chưa có giao dịch nào
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          )}

          {/* How to Earn */}
          {activeTab === 1 && (
            <CardContent>
              <div className="space-y-4">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <Typography variant="h6" className="font-semibold mb-2 text-orange-800">
                    Tích điểm từ đơn hàng
                  </Typography>
                  <Typography variant="body2" className="text-gray-700">
                    Nhận {account.conversionRate.pointsPerCurrency} điểm cho mỗi 1,000đ chi tiêu. Điểm tích được nhân
                    với hệ số hạng thành viên (x{account.tierBenefits.pointsMultiplier}).
                  </Typography>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <Typography variant="h6" className="font-semibold mb-2 text-blue-800">
                    Sử dụng điểm
                  </Typography>
                  <Typography variant="body2" className="text-gray-700">
                    Đổi điểm để giảm giá đơn hàng. 1 điểm = {formatCurrency(account.conversionRate.currencyPerPoint)}.
                    Tối thiểu 100 điểm để đổi.
                  </Typography>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <Typography variant="h6" className="font-semibold mb-2 text-green-800">
                    Hạng thành viên
                  </Typography>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">🥉 Bronze:</span>
                      <span>0 - 1,999 điểm (x1)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">🥈 Silver:</span>
                      <span>2,000 - 4,999 điểm (x1.2)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">🥇 Gold:</span>
                      <span>5,000 - 9,999 điểm (x1.5)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">💎 Platinum:</span>
                      <span>10,000+ điểm (x2)</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default LoyaltyPoints;
