'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, TrendingUp, Heart, MessageCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4 text-gray-900">
          주식 투자, 이제 어렵지 않아요
        </h1>
        <p className="text-xl text-gray-800 mb-8 max-w-2xl mx-auto">
          EasyStock과 함께 주식 투자의 첫걸음을 시작하세요.<br />
          핵심 용어부터 맞춤형 종목 추천까지, 초보자도 쉽게 이해할 수 있습니다.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/recommend"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            추천받기 시작하기
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/learn"
            className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            용어 배우기
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <Link
          href="/learn"
          className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all"
        >
          <BookOpen className="w-12 h-12 text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-gray-900">배우기</h3>
          <p className="text-gray-800">
            주식 용어를 쉽고 재미있게 학습하세요. 초보자도 이해하기 쉬운 설명과 예시를 제공합니다.
          </p>
        </Link>

        <Link
          href="/recommend"
          className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all"
        >
          <TrendingUp className="w-12 h-12 text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-gray-900">추천받기</h3>
          <p className="text-gray-800">
            간단한 설문으로 나에게 맞는 종목을 추천받으세요. 투자 성향에 맞춘 맞춤형 추천을 제공합니다.
          </p>
        </Link>

        <Link
          href="/my-stocks"
          className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all"
        >
          <Heart className="w-12 h-12 text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-gray-900">내 관심종목</h3>
          <p className="text-gray-800">
            관심 있는 종목을 저장하고 관리하세요. 차트와 정보를 한눈에 확인할 수 있습니다.
          </p>
        </Link>

        <Link
          href="/contact"
          className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all"
        >
          <MessageCircle className="w-12 h-12 text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-gray-900">문의하기</h3>
          <p className="text-gray-800">
            궁금한 점이나 개선 의견을 알려주세요. 여러분의 소중한 피드백을 기다립니다.
          </p>
        </Link>
      </section>

      <section className="bg-blue-50 rounded-lg p-8 border-2 border-blue-100">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">EasyStock이 특별한 이유</h2>
        <ul className="space-y-3 text-gray-800">
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">✓</span>
            <span>초보자도 이해하기 쉬운 쉬운 언어로 설명</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">✓</span>
            <span>개인 맞춤형 학습과 종목 추천</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">✓</span>
            <span>검증된 정보만 제공하는 신뢰성</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">✓</span>
            <span>실제 돈 없이 안전하게 학습할 수 있는 환경</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

