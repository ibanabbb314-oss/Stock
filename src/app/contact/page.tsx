'use client';

import { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    type: 'general',
    title: '',
    content: '',
    email: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({ type: 'general', title: '', content: '', email: '' });
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('제출에 실패했습니다. 다시 시도해주세요.');
    }
  };

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4 text-green-800">제출 완료!</h2>
          <p className="text-gray-800 mb-6">
            소중한 의견 감사합니다. 검토 후 답변드리겠습니다.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            새 문의 작성하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3 text-gray-900">
          <MessageCircle className="w-10 h-10 text-blue-600" />
          문의하기
        </h1>
        <p className="text-gray-800 text-lg">
          서비스 개선 의견이나 질문이 있으시면 언제든지 알려주세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border-2 border-gray-200 rounded-lg p-8">
        <div className="mb-6">
          <label htmlFor="type" className="block text-sm font-semibold mb-2 text-gray-900">
            문의 유형
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="general">일반 문의</option>
            <option value="feature">기능 개선 제안</option>
            <option value="bug">버그 신고</option>
            <option value="stock">종목 관련 질문</option>
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-semibold mb-2 text-gray-900">
            제목
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="content" className="block text-sm font-semibold mb-2 text-gray-900">
            내용
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="email" className="block text-sm font-semibold mb-2 text-gray-900">
            이메일 (선택)
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="답변을 받고 싶으시면 입력해주세요"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          제출하기
        </button>
      </form>
    </div>
  );
}

