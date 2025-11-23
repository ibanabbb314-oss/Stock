'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Search } from 'lucide-react';

interface Term {
  id: number;
  term: string;
  category: string;
  simple_explanation: string;
}

export default function LearnPage() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');

  useEffect(() => {
    fetch('/api/terms')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch terms');
        }
        return res.json();
      })
      .then((data) => {
        // API 응답이 배열인지 확인
        if (Array.isArray(data)) {
          setTerms(data);
        } else {
          console.error('Invalid response format:', data);
          setTerms([]);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch terms:', err);
        setTerms([]);
      });
  }, []);

  const categories = ['전체', ...Array.from(new Set(terms.map((t) => t.category)))];
  const filteredTerms = terms.filter((term) => {
    const matchesSearch = term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.simple_explanation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === '전체' || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3 text-gray-900">
          <BookOpen className="w-10 h-10 text-blue-600" />
          배우기
        </h1>
        <p className="text-gray-800 text-lg">
          주식 투자에 필요한 핵심 용어를 쉽고 재미있게 학습하세요.
        </p>
      </div>

      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="용어 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTerms.length > 0 ? (
          filteredTerms.map((term) => (
            <Link
              key={term.id}
              href={`/learn/terms/${term.id}`}
              className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all"
            >
              <div className="mb-2">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {term.category}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">{term.term}</h3>
              <p className="text-gray-800 text-sm line-clamp-2">{term.simple_explanation}</p>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-700">
            {searchQuery ? '검색 결과가 없습니다.' : '용어를 불러오는 중...'}
          </div>
        )}
      </div>
    </div>
  );
}

