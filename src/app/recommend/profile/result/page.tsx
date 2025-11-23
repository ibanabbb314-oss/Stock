'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowLeft } from 'lucide-react';

export default function ProfileResultPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="bg-white border-2 border-gray-200 rounded-lg p-8 text-center mb-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-4 text-gray-900">프로필 진단 완료!</h1>
        <p className="text-gray-800 mb-6">
          진단 결과를 바탕으로 맞춤형 종목을 추천해드립니다.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">당신의 투자자 페르소나</h2>
        <div className="space-y-2 text-gray-800">
          <p><strong>투자 스타일:</strong> 안정 추구형</p>
          <p><strong>추천 전략:</strong> 대형주 중심의 분산 투자</p>
          <p><strong>적합한 종목:</strong> 배당주, 대형 성장주</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Link
          href="/recommend/stocks"
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
        >
          추천 종목 보기
        </Link>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-gray-100 text-gray-900 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          다시 진단하기
        </button>
      </div>
    </div>
  );
}

