import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../../types/models/product";
import ProductCard from "../../components/common/ProductCard";
import PageHeader from "../../components/layout/PageHeader";
import wishlistService from "../../services/wishlistService";
import { useSnackbar } from "../../hooks/useSnackbar";
import { useGlobal } from "../../hooks/useGlobal";

export default function MyFavoritesPage() {
  const { isLogin } = useGlobal();
  const { showSnackbar } = useSnackbar();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLogin) {
      setLoading(false);
      return;
    }

    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const data = await wishlistService.getWishlistWithProducts({ page: 1, limit: 50 });
        setFavorites(data.products);
      } catch (error) {
        console.error("Error fetching favorites:", error);
        showSnackbar("Không thể tải danh sách yêu thích", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [isLogin, showSnackbar]);

  if (!isLogin) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Bạn cần đăng nhập</h1>
        <p className="text-gray-600 mb-6">Vui lòng đăng nhập để xem danh sách sản phẩm yêu thích của bạn.</p>
        <Link
          to="/signin"
          className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          Đăng nhập
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-orange-500"></div>
        <p className="mt-4 text-gray-600">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <PageHeader title="Sản phẩm yêu thích" />

        {favorites.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Chưa có sản phẩm yêu thích</h2>
            <p className="text-gray-600 mb-6">Hãy thêm sản phẩm vào danh sách yêu thích để xem lại sau!</p>
            <Link
              to="/products"
              className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Xem sản phẩm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
