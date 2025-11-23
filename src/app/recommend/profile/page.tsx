'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    purpose: '',
    risk: '',
    period: '',
    sector: '',
    amount: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/recommend/profile/result');
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">투자자 프로필 진단</h1>
        <p className="text-gray-800">
          간단한 질문에 답변하시면 나에게 맞는 종목을 추천해드립니다.
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900">진행률</span>
          <span className="text-sm font-medium text-gray-900">{step}/5</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border-2 border-gray-200 rounded-lg p-8">
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">투자 목적을 선택해주세요</h2>
            <div className="space-y-3">
              {['저축', '투자', '투기'].map((option) => (
                <label
                  key={option}
                  className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <input
                    type="radio"
                    name="purpose"
                    value={option}
                    checked={formData.purpose === option}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="mr-3"
                    required
                  />
                  <span className="text-lg text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">리스크 감수성을 선택해주세요</h2>
            <div className="space-y-3">
              {['보수', '중립', '공격'].map((option) => (
                <label
                  key={option}
                  className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <input
                    type="radio"
                    name="risk"
                    value={option}
                    checked={formData.risk === option}
                    onChange={(e) => setFormData({ ...formData, risk: e.target.value })}
                    className="mr-3"
                    required
                  />
                  <span className="text-lg text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">투자 기간을 선택해주세요</h2>
            <div className="space-y-3">
              {['단기 (1년 이하)', '중기 (1-3년)', '장기 (3년 이상)'].map((option) => (
                <label
                  key={option}
                  className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <input
                    type="radio"
                    name="period"
                    value={option}
                    checked={formData.period === option}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className="mr-3"
                    required
                  />
                  <span className="text-lg text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">관심 업종을 선택해주세요</h2>
            <div className="space-y-3">
              {['IT/전자', '금융', '바이오/제약', '에너지/화학', '소비재', '전체'].map((option) => (
                <label
                  key={option}
                  className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <input
                    type="radio"
                    name="sector"
                    value={option}
                    checked={formData.sector === option}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="mr-3"
                    required
                  />
                  <span className="text-lg text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">투자 가능 자금 규모를 선택해주세요</h2>
            <div className="space-y-3">
              {['100만원 이하', '100-500만원', '500-1000만원', '1000만원 이상'].map((option) => (
                <label
                  key={option}
                  className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <input
                    type="radio"
                    name="amount"
                    value={option}
                    checked={formData.amount === option}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="mr-3"
                    required
                  />
                  <span className="text-lg text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              이전
            </button>
          )}
          <div className="ml-auto">
            {step < 5 ? (
              <button
                type="button"
                onClick={() => {
                  const currentField = ['purpose', 'risk', 'period', 'sector', 'amount'][step - 1];
                  if (formData[currentField as keyof typeof formData]) {
                    setStep(step + 1);
                  }
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                다음
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                진단 완료
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

