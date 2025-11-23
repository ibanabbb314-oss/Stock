'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, TrendingUp } from 'lucide-react';

export default function MyStocksPage() {
  const [favorites] = useState<Array<{ code: string; name: string }>>([]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3 text-gray-900">
          <Heart className="w-10 h-10 text-red-500" />
          내 관심종목
        </h1>
        <p className="text-gray-800 text-lg">
          관심 있는 종목을 저장하고 관리하세요.
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-12 text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2 text-gray-900">아직 관심종목이 없습니다</h2>
          <p className="text-gray-800 mb-6">
            추천받기에서 관심 있는 종목을 찾아 추가해보세요.
          </p>
          <Link
            href="/recommend"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <TrendingUp className="w-5 h-5" />
            추천받기로 이동
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((stock) => (
            <Link
              key={stock.code}
              href={`/my-stocks/${stock.code}`}
              className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900">{stock.name}</h3>
              <p className="text-sm text-gray-700 font-medium">코드: {stock.code}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

