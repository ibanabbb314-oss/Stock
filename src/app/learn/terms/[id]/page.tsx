'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Term {
  id: number;
  term: string;
  category: string;
  simple_explanation: string;
  detailed_explanation: string | null;
  example: string | null;
}

export default function TermDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [term, setTerm] = useState<Term | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/terms/${params.id}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Failed to fetch term');
          }
          return res.json();
        })
        .then((data) => {
          // 에러 응답이 아닌 경우에만 설정
          if (data && !data.error) {
            setTerm(data);
          } else {
            setTerm(null);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to fetch term:', err);
          setTerm(null);
          setLoading(false);
        });
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  if (!term) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-gray-700 mb-4">용어를 찾을 수 없습니다.</p>
          <Link href="/learn" className="text-blue-600 hover:underline">
            배우기 페이지로 돌아가기
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

      <div className="mb-4">
        <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
          {term.category}
        </span>
      </div>

      <h1 className="text-4xl font-bold mb-6 text-gray-900">{term.term}</h1>

      <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8 rounded-r-lg">
        <h2 className="text-xl font-semibold mb-3 text-blue-900">쉬운 설명</h2>
        <p className="text-lg text-gray-800">{term.simple_explanation}</p>
      </div>

      {term.detailed_explanation && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">상세 설명</h2>
          <p className="text-gray-800 leading-relaxed whitespace-pre-line">
            {term.detailed_explanation}
          </p>
        </div>
      )}

      {term.example && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-3 text-gray-900">예시</h2>
          <p className="text-gray-800 leading-relaxed whitespace-pre-line">{term.example}</p>
        </div>
      )}

      <div className="mt-8 pt-8 border-t">
        <Link
          href="/learn"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← 다른 용어 더 배우기
        </Link>
      </div>
    </div>
  );
}

