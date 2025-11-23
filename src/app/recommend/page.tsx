'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, ArrowRight, Search } from 'lucide-react';

interface Stock {
  id: number;
  code: string;
  name: string;
  sector: string | null;
  description: string | null;
  recommendation_reason: string | null;
  risk_level: string | null;
}

export default function RecommendPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/stocks')
      .then((res) => res.json())
      .then((data) => setStocks(data))
      .catch((err) => console.error('Failed to fetch stocks:', err));
  }, []);

  const filteredStocks = stocks.filter((stock) =>
    stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.code.includes(searchQuery)
  );

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

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3 text-gray-900">
          <TrendingUp className="w-10 h-10 text-blue-600" />
          추천받기
        </h1>
        <p className="text-gray-800 text-lg mb-6">
          나에게 맞는 종목을 추천받아보세요. 간단한 설문으로 투자 성향을 파악하고 맞춤형 추천을 받을 수 있습니다.
        </p>
        <Link
          href="/recommend/profile"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          프로필 진단 시작하기
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="종목명 또는 종목 코드로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">추천 종목</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStocks.length > 0 ? (
            filteredStocks.map((stock) => (
              <Link
                key={stock.id}
                href={`/recommend/stocks/${stock.code}`}
                className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-semibold mb-1 text-gray-900">{stock.name}</h3>
                    <p className="text-sm text-gray-700 font-medium">코드: {stock.code}</p>
                  </div>
                  {stock.risk_level && (
                    <span className={`text-xs px-2 py-1 rounded ${getRiskColor(stock.risk_level)}`}>
                      {stock.risk_level}
                    </span>
                  )}
                </div>
                {stock.sector && (
                  <p className="text-sm text-gray-800 mb-2 font-medium">업종: {stock.sector}</p>
                )}
                {stock.description && (
                  <p className="text-gray-800 text-sm line-clamp-2">{stock.description}</p>
                )}
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-700">
              {searchQuery ? '검색 결과가 없습니다.' : '종목을 불러오는 중...'}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <Link
          href="/recommend/inquiry"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          특정 종목에 대해 문의하기 →
        </Link>
      </div>
    </div>
  );
}

