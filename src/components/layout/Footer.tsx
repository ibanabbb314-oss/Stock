'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">EasyStock</h3>
            <p className="text-sm text-gray-800">
              주식 투자 초보자를 위한 핵심 용어 학습 및 종목 추천 서비스
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4 text-gray-900">빠른 링크</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/learn" className="text-gray-800 hover:text-gray-900 font-medium">
                  배우기
                </Link>
              </li>
              <li>
                <Link href="/recommend" className="text-gray-800 hover:text-gray-900 font-medium">
                  추천받기
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-800 hover:text-gray-900 font-medium">
                  문의하기
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4 text-gray-900">문의</h4>
            <p className="text-sm text-gray-800">
              서비스 개선 의견이나 질문이 있으시면<br />
              문의하기 페이지를 이용해주세요.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-800">
          <p>© 2025 EasyStock. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

