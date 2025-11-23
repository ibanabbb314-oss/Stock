import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'data', 'easystock.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS terms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      term TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      simple_explanation TEXT NOT NULL,
      detailed_explanation TEXT,
      example TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      sector TEXT,
      description TEXT,
      recommendation_reason TEXT,
      risk_level TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export function seedDatabase() {
  const terms = db.prepare('SELECT COUNT(*) as count FROM terms').get() as { count: number };
  
  if (terms.count === 0) {
    const insertTerm = db.prepare(`
      INSERT INTO terms (term, category, simple_explanation, detailed_explanation, example)
      VALUES (?, ?, ?, ?, ?)
    `);

    const sampleTerms = [
      {
        term: 'PER',
        category: '재무지표',
        simple_explanation: '주가를 주당 순이익으로 나눈 값으로, 주식이 얼마나 비싼지 보는 지표예요.',
        detailed_explanation: 'PER(Price Earnings Ratio)는 주가수익비율을 의미합니다. 주가를 주당 순이익(EPS)으로 나눈 값으로, 회사의 수익성 대비 주가가 적정한지 판단하는 지표입니다. 일반적으로 PER이 낮을수록 저평가된 것으로 볼 수 있지만, 업종과 성장성도 함께 고려해야 합니다.',
        example: 'A회사 주가가 10,000원이고 주당 순이익이 1,000원이면 PER은 10입니다. 같은 업종 평균 PER이 15라면 A회사는 상대적으로 저평가된 것으로 볼 수 있어요.'
      },
      {
        term: '배당',
        category: '기본용어',
        simple_explanation: '회사가 번 돈의 일부를 주주들에게 나눠주는 거예요.',
        detailed_explanation: '배당은 기업이 이익의 일부를 주주들에게 현금이나 주식의 형태로 지급하는 것을 말합니다. 배당률은 주가 대비 배당금의 비율을 나타내며, 안정적인 수익을 원하는 투자자들에게 중요한 요소입니다.',
        example: 'B회사가 주당 500원의 배당을 주고, 주가가 10,000원이면 배당률은 5%입니다. 100주를 가지고 있다면 매년 50,000원의 배당금을 받을 수 있어요.'
      },
      {
        term: '시가총액',
        category: '기본용어',
        simple_explanation: '회사의 전체 주식 가치를 나타내는 거예요.',
        detailed_explanation: '시가총액은 상장 주식 수에 현재 주가를 곱한 값으로, 해당 기업의 시장에서의 총 가치를 나타냅니다. 대형주, 중형주, 소형주를 구분하는 기준이 되기도 합니다.',
        example: 'C회사의 발행 주식 수가 1억 주이고 주가가 20,000원이면 시가총액은 2조 원입니다.'
      },
      {
        term: '주식',
        category: '기본용어',
        simple_explanation: '회사의 일부를 소유한다는 증서예요. 주식을 사면 그 회사의 주주가 됩니다.',
        detailed_explanation: '주식은 기업의 자본을 구성하는 단위로, 주식을 보유한 사람을 주주라고 합니다. 주주는 회사의 소유권을 일부 갖게 되며, 배당을 받을 권리와 주주총회에서 의결권을 행사할 수 있는 권리를 가집니다.',
        example: 'D회사의 주식을 100주 샀다면, 그 회사의 일부를 소유하게 된 거예요. 회사가 잘되면 주가가 오르고 배당도 받을 수 있어요.'
      },
      {
        term: '주가',
        category: '기본용어',
        simple_explanation: '주식 한 주의 가격이에요. 시장에서 거래되는 실제 가격입니다.',
        detailed_explanation: '주가는 주식 시장에서 실제로 거래되는 주식의 가격을 말합니다. 수요와 공급에 따라 실시간으로 변동하며, 회사의 실적, 업황, 시장 상황 등 다양한 요인에 영향을 받습니다.',
        example: 'E회사의 주가가 50,000원이면, 그 회사의 주식 한 주를 사려면 50,000원이 필요해요.'
      },
      {
        term: '상장',
        category: '기본용어',
        simple_explanation: '회사가 주식시장에 등록되어 주식을 거래할 수 있게 되는 거예요.',
        detailed_explanation: '상장은 기업이 주식시장(거래소)에 등록되어 일반 투자자들이 그 회사의 주식을 사고팔 수 있게 되는 것을 의미합니다. 상장을 하면 자금 조달이 쉬워지고 기업의 신뢰도도 높아집니다.',
        example: 'F회사가 코스피에 상장했다면, 이제 누구나 그 회사의 주식을 살 수 있어요.'
      },
      {
        term: '매수',
        category: '기본용어',
        simple_explanation: '주식을 사는 거예요.',
        detailed_explanation: '매수는 주식을 구매하는 행위를 말합니다. 주식을 매수하면 그 회사의 주주가 되며, 주가 상승 시 수익을 얻을 수 있습니다.',
        example: 'G회사 주식을 10주 매수했다면, 그 회사의 주식을 10주 샀다는 뜻이에요.'
      },
      {
        term: '매도',
        category: '기본용어',
        simple_explanation: '주식을 파는 거예요.',
        detailed_explanation: '매도는 보유하고 있는 주식을 판매하는 행위를 말합니다. 매수 가격보다 높은 가격에 매도하면 수익을 얻을 수 있습니다.',
        example: 'H회사 주식을 10,000원에 샀다가 15,000원에 매도하면 5,000원의 수익을 얻을 수 있어요.'
      },
      {
        term: '수익률',
        category: '기본용어',
        simple_explanation: '투자한 돈 대비 얼마나 벌었는지 보여주는 비율이에요.',
        detailed_explanation: '수익률은 투자 원금 대비 얻은 수익의 비율을 나타냅니다. 주가 상승으로 인한 수익과 배당으로 인한 수익을 모두 포함할 수 있습니다.',
        example: '100만원을 투자해서 10만원을 벌었다면 수익률은 10%예요.'
      },
      {
        term: '손실',
        category: '기본용어',
        simple_explanation: '투자한 돈보다 적게 받아서 잃은 금액이에요.',
        detailed_explanation: '손실은 투자 원금보다 낮은 가격에 매도하거나 주가가 하락하여 발생하는 금액을 말합니다. 모든 투자에는 손실 위험이 따릅니다.',
        example: '100만원에 산 주식을 80만원에 팔았다면 20만원의 손실이 발생한 거예요.'
      },
      {
        term: '포트폴리오',
        category: '기본용어',
        simple_explanation: '내가 가지고 있는 주식들의 모음이에요.',
        detailed_explanation: '포트폴리오는 투자자가 보유하고 있는 모든 주식과 투자 자산의 조합을 의미합니다. 여러 종목에 분산 투자하여 리스크를 줄이는 것이 중요합니다.',
        example: 'I회사 주식 10주, J회사 주식 5주, K회사 주식 20주를 가지고 있다면 이것이 내 포트폴리오예요.'
      },
      {
        term: '분산투자',
        category: '기본용어',
        simple_explanation: '여러 종목에 나눠서 투자하는 거예요. 한 곳에만 투자하면 위험하니까요.',
        detailed_explanation: '분산투자는 여러 종목이나 업종에 투자하여 리스크를 분산시키는 투자 전략입니다. 한 종목에 모든 자금을 투자하면 그 종목이 하락할 때 큰 손실을 볼 수 있으므로, 여러 종목에 나눠 투자하는 것이 안전합니다.',
        example: '100만원을 L회사에만 투자하는 것보다, L회사 30만원, M회사 30만원, N회사 40만원으로 나눠 투자하는 게 더 안전해요.'
      }
    ];

    const insertMany = db.transaction((terms) => {
      for (const term of terms) {
        insertTerm.run(
          term.term,
          term.category,
          term.simple_explanation,
          term.detailed_explanation,
          term.example
        );
      }
    });

    insertMany(sampleTerms);
  }

  const stocks = db.prepare('SELECT COUNT(*) as count FROM stocks').get() as { count: number };
  
  if (stocks.count === 0) {
    const insertStock = db.prepare(`
      INSERT INTO stocks (code, name, sector, description, recommendation_reason, risk_level)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const sampleStocks = [
      {
        code: 'AAPL',
        name: 'Apple Inc.',
        sector: 'Technology',
        description: '세계 최대 시가총액을 가진 기술 기업입니다. iPhone, iPad, Mac, Apple Watch 등 혁신적인 제품을 생산하며, 서비스 사업도 성장하고 있습니다.',
        recommendation_reason: '안정적인 대형주로 초보 투자자에게 적합합니다. 강력한 브랜드 파워와 지속적인 혁신으로 장기 성장 가능성이 높습니다.',
        risk_level: '낮음'
      },
      {
        code: 'MSFT',
        name: 'Microsoft Corporation',
        sector: 'Technology',
        description: '세계적인 소프트웨어 및 클라우드 기업입니다. Windows, Office, Azure 클라우드 서비스를 제공하며, AI 분야에서도 강세를 보이고 있습니다.',
        recommendation_reason: '클라우드 사업의 성장과 안정적인 수익 구조로 장기 투자에 적합한 종목입니다.',
        risk_level: '낮음'
      },
      {
        code: 'GOOGL',
        name: 'Alphabet Inc.',
        sector: 'Technology',
        description: '구글의 모회사로 검색 엔진, 광고, 클라우드, 유튜브 등 다양한 디지털 서비스를 제공합니다.',
        recommendation_reason: '디지털 광고 시장의 강자로 안정적인 수익을 보이며, AI와 클라우드 사업 성장 가능성이 높습니다.',
        risk_level: '낮음'
      },
      {
        code: 'AMZN',
        name: 'Amazon.com Inc.',
        sector: 'E-commerce/Cloud',
        description: '세계 최대 전자상거래 기업이자 클라우드 서비스(AWS) 제공업체입니다. 온라인 쇼핑, 스트리밍, 클라우드 등 다양한 사업을 운영합니다.',
        recommendation_reason: '전자상거래와 클라우드 사업의 성장으로 장기 투자 가치가 높은 종목입니다.',
        risk_level: '중간'
      },
      {
        code: 'NVDA',
        name: 'NVIDIA Corporation',
        sector: 'Technology',
        description: 'AI 반도체와 그래픽 칩의 선도 기업입니다. 데이터센터, 게이밍, 자율주행 등 다양한 분야에서 강세를 보이고 있습니다.',
        recommendation_reason: 'AI 시대의 핵심 기업으로 성장 가능성이 매우 높지만, 변동성이 큰 종목입니다.',
        risk_level: '높음'
      },
      {
        code: 'TSLA',
        name: 'Tesla Inc.',
        sector: 'Automotive/Energy',
        description: '전기차 제조 및 에너지 솔루션 기업입니다. 전기차 시장을 선도하며 자율주행 기술도 개발하고 있습니다.',
        recommendation_reason: '전기차 시장의 성장과 혁신적인 기술력으로 높은 성장 가능성을 보이지만, 변동성이 큽니다.',
        risk_level: '높음'
      },
      {
        code: 'META',
        name: 'Meta Platforms Inc.',
        sector: 'Technology',
        description: '페이스북, 인스타그램, 왓츠앱을 운영하는 소셜 미디어 플랫폼 기업입니다. 메타버스와 AI 분야에도 투자하고 있습니다.',
        recommendation_reason: '소셜 미디어 광고 시장의 강자로 안정적인 수익을 보이며, 메타버스 사업의 성장 가능성이 있습니다.',
        risk_level: '중간'
      },
      {
        code: 'JPM',
        name: 'JPMorgan Chase & Co.',
        sector: 'Financial Services',
        description: '미국 최대 은행 중 하나로 상업은행, 투자은행, 자산관리 등 다양한 금융 서비스를 제공합니다.',
        recommendation_reason: '안정적인 수익 구조와 강력한 자본력을 가진 금융 대형주로 배당도 꾸준히 지급합니다.',
        risk_level: '낮음'
      },
      {
        code: 'V',
        name: 'Visa Inc.',
        sector: 'Financial Services',
        description: '세계 최대 결제 네트워크 기업으로 전 세계 신용카드 및 직불카드 거래를 처리합니다.',
        recommendation_reason: '디지털 결제 시장의 성장과 안정적인 수익 모델로 장기 투자에 적합한 종목입니다.',
        risk_level: '낮음'
      },
      {
        code: 'JNJ',
        name: 'Johnson & Johnson',
        sector: 'Healthcare',
        description: '의약품, 의료기기, 소비자 건강 제품을 생산하는 글로벌 헬스케어 기업입니다.',
        recommendation_reason: '안정적인 수익과 꾸준한 배당으로 방어적 투자에 적합한 종목입니다.',
        risk_level: '낮음'
      },
      {
        code: 'WMT',
        name: 'Walmart Inc.',
        sector: 'Retail',
        description: '세계 최대 유통 기업으로 온라인과 오프라인 매장을 운영하며 일상용품을 판매합니다.',
        recommendation_reason: '안정적인 수익 구조와 꾸준한 성장으로 방어적 투자에 적합한 종목입니다.',
        risk_level: '낮음'
      },
      {
        code: 'PG',
        name: 'Procter & Gamble Co.',
        sector: 'Consumer Goods',
        description: '세계적인 소비재 기업으로 생활용품, 화장품, 건강용품 등을 생산합니다.',
        recommendation_reason: '안정적인 수익과 꾸준한 배당으로 방어적 투자에 적합한 종목입니다.',
        risk_level: '낮음'
      },
      {
        code: 'MA',
        name: 'Mastercard Inc.',
        sector: 'Financial Services',
        description: '세계 2위 결제 네트워크 기업으로 전 세계 신용카드 및 직불카드 거래를 처리합니다.',
        recommendation_reason: '디지털 결제 시장의 성장과 안정적인 수익 모델로 장기 투자에 적합합니다.',
        risk_level: '낮음'
      },
      {
        code: 'UNH',
        name: 'UnitedHealth Group Inc.',
        sector: 'Healthcare',
        description: '미국 최대 건강보험 회사로 건강보험, 의료 서비스, 제약 혜택 관리 등을 제공합니다.',
        recommendation_reason: '고령화와 헬스케어 수요 증가로 장기 성장 가능성이 높은 종목입니다.',
        risk_level: '중간'
      },
      {
        code: 'HD',
        name: 'The Home Depot Inc.',
        sector: 'Retail',
        description: '세계 최대 주택 개선 소매업체로 건축 자재, 도구, 가전제품 등을 판매합니다.',
        recommendation_reason: '주택 시장과 연관성이 높아 경제 상황에 따라 변동하지만, 안정적인 수익 구조를 가지고 있습니다.',
        risk_level: '중간'
      },
      {
        code: 'DIS',
        name: 'The Walt Disney Company',
        sector: 'Entertainment',
        description: '세계적인 엔터테인먼트 기업으로 영화, 테마파크, 스트리밍 서비스(Disney+)를 운영합니다.',
        recommendation_reason: '강력한 브랜드와 콘텐츠 포트폴리오로 장기 성장 가능성이 있지만, 변동성이 있습니다.',
        risk_level: '중간'
      },
      {
        code: 'NFLX',
        name: 'Netflix Inc.',
        sector: 'Entertainment',
        description: '세계 최대 스트리밍 서비스 제공업체로 영화, 드라마, 다큐멘터리 등을 제공합니다.',
        recommendation_reason: '글로벌 스트리밍 시장의 성장과 함께 성장 가능성이 높지만, 경쟁이 치열하고 변동성이 큽니다.',
        risk_level: '높음'
      },
      {
        code: 'AMD',
        name: 'Advanced Micro Devices',
        sector: 'Technology',
        description: '반도체 기업으로 CPU와 GPU를 생산하며, AI와 데이터센터 시장에서 성장하고 있습니다.',
        recommendation_reason: 'AI와 데이터센터 시장의 성장으로 높은 성장 가능성을 보이지만, 변동성이 큰 종목입니다.',
        risk_level: '높음'
      },
      {
        code: 'INTC',
        name: 'Intel Corporation',
        sector: 'Technology',
        description: '세계 최대 반도체 기업 중 하나로 CPU를 주로 생산하며, 데이터센터 사업도 운영합니다.',
        recommendation_reason: '안정적인 수익 구조를 가지고 있지만, 경쟁이 치열하여 변동성이 있습니다.',
        risk_level: '중간'
      },
      {
        code: 'COST',
        name: 'Costco Wholesale Corporation',
        sector: 'Retail',
        description: '대형 할인매장을 운영하는 유통 기업으로 회원제로 운영되며 다양한 상품을 판매합니다.',
        recommendation_reason: '안정적인 수익 구조와 꾸준한 성장으로 방어적 투자에 적합한 종목입니다.',
        risk_level: '낮음'
      }
    ];

    const insertMany = db.transaction((stocks) => {
      for (const stock of stocks) {
        insertStock.run(
          stock.code,
          stock.name,
          stock.sector,
          stock.description,
          stock.recommendation_reason,
          stock.risk_level
        );
      }
    });

    insertMany(sampleStocks);
  }

  const faqs = db.prepare('SELECT COUNT(*) as count FROM faqs').get() as { count: number };
  
  if (faqs.count === 0) {
    const insertFaq = db.prepare(`
      INSERT INTO faqs (question, answer, category)
      VALUES (?, ?, ?)
    `);

    const sampleFaqs = [
      {
        question: '주식 투자를 처음 시작하는데 어떻게 해야 하나요?',
        answer: '먼저 주식 용어를 학습하고, 자신의 투자 성향을 파악한 후 적합한 종목을 선택하는 것이 좋습니다. EasyStock의 프로필 진단 기능을 활용해보세요.',
        category: '기초'
      },
      {
        question: 'PER이 낮은 주식이 무조건 좋은 건가요?',
        answer: 'PER이 낮다고 무조건 좋은 것은 아닙니다. 업종 평균과 비교하고, 회사의 성장 가능성도 함께 고려해야 합니다. PER이 낮은 이유가 회사 경영 악화 때문일 수도 있어요.',
        category: '재무지표'
      },
      {
        question: '언제 주식을 팔아야 하나요?',
        answer: '투자 목적과 전략에 따라 다릅니다. 단기 투자라면 목표 수익률에 도달했을 때, 장기 투자라면 회사의 근본적인 가치가 변했을 때를 고려해보세요.',
        category: '투자전략'
      }
    ];

    const insertMany = db.transaction((faqs) => {
      for (const faq of faqs) {
        insertFaq.run(faq.question, faq.answer, faq.category);
      }
    });

    insertMany(sampleFaqs);
  }
}

export default db;

