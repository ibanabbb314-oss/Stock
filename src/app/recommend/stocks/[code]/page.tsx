'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart } from 'lucide-react';

interface Stock {
  id: number;
  code: string;
  name: string;
  sector: string | null;
  description: string | null;
  recommendation_reason: string | null;
  risk_level: string | null;
}

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [stock, setStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (params.code) {
      fetch(`/api/stocks/${params.code}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Failed to fetch stock');
          }
          return res.json();
        })
        .then((data) => {
          // 에러 응답이 아닌 경우에만 설정
          if (data && !data.error) {
            setStock(data);
          } else {
            setStock(null);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to fetch stock:', err);
          setStock(null);
          setLoading(false);
        });

      // 관심 종목에 이미 추가되어 있는지 확인
      fetch('/api/favorites')
        .then((res) => {
          if (!res.ok) {
            throw new Error('Failed to fetch favorites');
          }
          return res.json();
        })
        .then((favorites) => {
          // API 응답이 배열인지 확인
          if (Array.isArray(favorites)) {
            const isInFavorites = favorites.some((fav: { code: string }) => fav.code === params.code);
            setIsFavorite(isInFavorites);
          }
        })
        .catch((err) => {
          console.error('Failed to check favorites:', err);
        });
    }
  }, [params.code]);

  const getRiskColor = (risk: string | null) => {
    switch (risk) {
      case '낮음':
        return 'bg-green-100 text-green-700';
      case '중간':
        return 'bg-yellow-100 text-yellow-700';
      case '높음':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleAddToFavorites = async () => {
    if (!stock || isAdding) return;
    
    setIsAdding(true);
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: stock.code,
          name: stock.name,
        }),
      });

      if (response.ok) {
        setIsFavorite(true);
        alert('관심종목에 추가되었습니다!');
      } else if (response.status === 409) {
        alert('이미 관심종목에 추가된 종목입니다.');
        setIsFavorite(true);
      } else {
        alert('관심종목 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to add favorite:', error);
      alert('관심종목 추가에 실패했습니다.');
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-gray-700 mb-4">종목을 찾을 수 없습니다.</p>
          <Link href="/recommend" className="text-blue-600 hover:underline">
            추천받기 페이지로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-5 h-5" />
        뒤로 가기
      </button>

      <div className="bg-white border-2 border-gray-200 rounded-lg p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-gray-900">{stock.name}</h1>
            <p className="text-gray-700 text-lg font-medium">종목 코드: {stock.code}</p>
          </div>
          {stock.risk_level && (
            <span className={`text-sm px-3 py-1 rounded-full ${getRiskColor(stock.risk_level)}`}>
              리스크: {stock.risk_level}
            </span>
          )}
        </div>

        {stock.sector && (
          <div className="mb-4">
            <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
              {stock.sector}
            </span>
          </div>
        )}
      </div>

      {stock.description && (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-8 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">회사 소개</h2>
          <p className="text-gray-800 leading-relaxed whitespace-pre-line">
            {stock.description}
          </p>
        </div>
      )}

      {stock.recommendation_reason && (
        <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-8 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-blue-900">추천 이유</h2>
          <p className="text-gray-800 leading-relaxed whitespace-pre-line">
            {stock.recommendation_reason}
          </p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={handleAddToFavorites}
          disabled={isFavorite || isAdding}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
            isFavorite
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } ${isAdding ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          {isFavorite ? '이미 추가됨' : isAdding ? '추가 중...' : '관심종목에 추가'}
        </button>
        <Link
          href="/recommend"
          className="bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
        >
          다른 종목 보기
        </Link>
      </div>
    </div>
  );
}

