import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'data', 'easystock.db');
const dbDir = path.dirname(dbPath);

// 데이터 디렉토리가 없으면 생성
if (!fs.existsSync(dbDir)) {
  try {
    fs.mkdirSync(dbDir, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

// 데이터베이스 연결 (에러 처리 포함)
let db: ReturnType<typeof Database>;
try {
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
} catch (error) {
  console.error('Error initializing database:', error);
  throw error;
}

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
      region TEXT DEFAULT '해외',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    -- 기존 테이블에 region 컬럼이 없으면 추가
    PRAGMA table_info(stocks);

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

    CREATE TABLE IF NOT EXISTS favorite_stocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export function seedDatabase() {
  try {
    // 기존 "재무지표" 카테고리를 "고급용어"로 업데이트 (존재하는 경우에만)
    try {
      const updateCategory = db.prepare('UPDATE terms SET category = ? WHERE category = ?');
      updateCategory.run('고급용어', '재무지표');
    } catch (error) {
      // 에러가 발생해도 계속 진행
      console.log('Category update skipped:', error);
    }
    
    // stocks 테이블에 region 컬럼이 없으면 추가
    try {
      db.exec('ALTER TABLE stocks ADD COLUMN region TEXT DEFAULT "해외"');
    } catch (error: any) {
      // 컬럼이 이미 존재하는 경우 무시
      if (error && error.message && !error.message.includes('duplicate column name') && !error.message.includes('duplicate column')) {
        console.error('Error adding region column:', error);
      }
    }
    
    // 기존 해외 종목들에 region 필드 업데이트 (없는 경우)
    try {
      const updateRegion = db.prepare('UPDATE stocks SET region = ? WHERE region IS NULL OR region = ""');
      updateRegion.run('해외');
    } catch (error) {
      // 에러가 발생해도 계속 진행
      console.log('Region update skipped:', error);
    }
  } catch (error) {
    console.error('Error in seedDatabase setup:', error);
  }
  
  let terms;
  try {
    terms = db.prepare('SELECT COUNT(*) as count FROM terms').get() as { count: number };
  } catch (error) {
    console.error('Error checking terms count:', error);
    terms = { count: 0 };
  }
  
  if (terms.count === 0) {
    const insertTerm = db.prepare(`
      INSERT INTO terms (term, category, simple_explanation, detailed_explanation, example)
      VALUES (?, ?, ?, ?, ?)
    `);

    const sampleTerms = [
      {
        term: 'PER',
        category: '고급용어',
        simple_explanation: '주가를 주당 순이익으로 나눈 값으로, 주식이 얼마나 비싼지 보는 지표예요.',
        detailed_explanation: 'PER(Price Earnings Ratio)는 주가수익비율을 의미하며, 주가를 주당 순이익(EPS)으로 나눈 값으로 회사의 수익성 대비 주가가 적정한지 판단하는 가장 널리 사용되는 지표입니다. 일반적으로 PER이 낮을수록 저평가된 것으로 볼 수 있지만, 업종별 평균 PER과 비교하고 회사의 성장성, 수익성, 재무 안정성도 함께 고려해야 합니다. 성장주는 PER이 높을 수 있고, 성숙한 기업은 PER이 낮을 수 있습니다. 또한 PER은 과거 실적을 기반으로 하므로 미래 성장 가능성을 반영하지 못할 수 있어, 다른 지표와 함께 종합적으로 판단하는 것이 중요합니다.',
        example: 'A회사 주가가 10,000원이고 주당 순이익이 1,000원이면 PER은 10입니다. 같은 업종 평균 PER이 15라면 A회사는 상대적으로 저평가된 것으로 볼 수 있어요. 만약 A회사의 성장 가능성이 높다면 더욱 매력적인 투자처가 될 수 있습니다. 반대로 PER이 30인 회사는 주가가 수익 대비 높게 평가된 것이지만, 높은 성장률을 보인다면 합리적일 수 있습니다.'
      },
      {
        term: '배당',
        category: '기본용어',
        simple_explanation: '회사가 번 돈의 일부를 주주들에게 나눠주는 거예요.',
        detailed_explanation: '배당은 기업이 이익의 일부를 주주들에게 현금이나 주식의 형태로 지급하는 것을 말합니다. 배당은 일반적으로 분기별 또는 연간으로 지급되며, 배당 정책은 회사의 재무 상태와 성장 전략에 따라 달라집니다. 배당률은 주가 대비 배당금의 비율을 나타내며, 안정적인 수익을 원하는 투자자들에게 중요한 요소입니다. 높은 배당률을 가진 종목은 배당주라고 불리며, 장기 투자자들에게 인기가 높습니다. 다만, 배당을 많이 주는 회사는 성장 투자보다는 안정적인 수익 추구에 집중하는 경우가 많으므로, 투자 목적에 맞게 선택하는 것이 중요합니다.',
        example: 'B회사가 주당 500원의 배당을 주고, 주가가 10,000원이면 배당률은 5%입니다. 100주를 가지고 있다면 매년 50,000원의 배당금을 받을 수 있어요. 만약 이 배당이 매년 지급된다면, 10년 후에는 원금의 50%에 해당하는 배당금을 받게 됩니다.'
      },
      {
        term: '시가총액',
        category: '기본용어',
        simple_explanation: '회사의 전체 주식 가치를 나타내는 거예요.',
        detailed_explanation: '시가총액은 상장 주식 수에 현재 주가를 곱한 값으로, 해당 기업의 시장에서의 총 가치를 나타냅니다. 시가총액은 기업의 규모를 나타내는 중요한 지표이며, 대형주(시가총액 1조원 이상), 중형주(시가총액 1천억원~1조원), 소형주(시가총액 1천억원 미만)를 구분하는 기준이 되기도 합니다. 시가총액이 큰 기업일수록 일반적으로 안정적이지만 성장률은 낮을 수 있고, 시가총액이 작은 기업은 성장 가능성이 높지만 변동성도 큽니다. 시가총액은 주가 변동에 따라 실시간으로 변하며, 기업의 실제 자산 가치와는 다를 수 있습니다.',
        example: 'C회사의 발행 주식 수가 1억 주이고 주가가 20,000원이면 시가총액은 2조 원입니다. 만약 주가가 25,000원으로 오르면 시가총액은 2.5조 원이 되고, 주가가 15,000원으로 내리면 시가총액은 1.5조 원이 됩니다.'
      },
      {
        term: '주식',
        category: '기본용어',
        simple_explanation: '회사의 일부를 소유한다는 증서예요. 주식을 사면 그 회사의 주주가 됩니다.',
        detailed_explanation: '주식은 기업의 자본을 구성하는 단위로, 주식을 보유한 사람을 주주라고 합니다. 주주는 회사의 소유권을 일부 갖게 되며, 배당을 받을 권리와 주주총회에서 의결권을 행사할 수 있는 권리를 가집니다. 주식은 보통주와 우선주로 나뉘며, 보통주는 의결권을 가지고 배당을 받을 수 있고, 우선주는 배당을 우선적으로 받지만 의결권이 제한적일 수 있습니다. 주식을 보유하면 회사의 성장에 따라 주가가 상승하여 자본 이득을 얻을 수 있고, 배당을 통해 정기적인 수익을 얻을 수도 있습니다.',
        example: 'D회사의 주식을 100주 샀다면, 그 회사의 일부를 소유하게 된 거예요. 회사가 잘되면 주가가 오르고 배당도 받을 수 있어요. 만약 주가가 10,000원에서 15,000원으로 오르면 50만원의 수익을 얻을 수 있고, 매년 배당을 받으면 추가 수익도 얻을 수 있습니다.'
      },
      {
        term: '주가',
        category: '기본용어',
        simple_explanation: '주식 한 주의 가격이에요. 시장에서 거래되는 실제 가격입니다.',
        detailed_explanation: '주가는 주식 시장에서 실제로 거래되는 주식의 가격을 말합니다. 주가는 수요와 공급에 따라 실시간으로 변동하며, 회사의 실적, 업황, 시장 상황, 경제 정책, 글로벌 이슈 등 다양한 요인에 영향을 받습니다. 주가는 시가(시작가), 고가(최고가), 저가(최저가), 종가(마감가)로 구분되며, 일일 변동폭이 제한되어 있습니다. 주가가 상승하면 보유 주식의 가치가 증가하고, 하락하면 손실이 발생할 수 있습니다.',
        example: 'E회사의 주가가 50,000원이면, 그 회사의 주식 한 주를 사려면 50,000원이 필요해요. 만약 10주를 산다면 50만원이 필요하고, 주가가 60,000원으로 오르면 보유 주식의 가치는 60만원이 되어 10만원의 수익을 얻을 수 있습니다.'
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
      },
      {
        term: 'PBR',
        category: '고급용어',
        simple_explanation: '주가를 주당 순자산으로 나눈 값으로, 회사의 자산 대비 주가가 적정한지 보는 지표예요.',
        detailed_explanation: 'PBR(Price to Book Ratio)는 주가순자산비율을 의미합니다. 주가를 주당 순자산(BPS)으로 나눈 값으로, 회사의 장부가치 대비 주가가 얼마나 높은지 나타냅니다. PBR이 1보다 낮으면 주가가 순자산보다 낮다는 의미로 저평가로 볼 수 있지만, 회사의 수익성과 성장 가능성도 함께 고려해야 합니다.',
        example: 'O회사 주가가 5,000원이고 주당 순자산이 10,000원이면 PBR은 0.5입니다. 이는 주가가 순자산의 절반 수준이라는 의미예요.'
      },
      {
        term: 'ROE',
        category: '고급용어',
        simple_explanation: '자기자본으로 얼마나 이익을 냈는지 보여주는 수익성 지표예요.',
        detailed_explanation: 'ROE(Return on Equity)는 자기자본이익률을 의미합니다. 당기순이익을 자기자본으로 나눈 값으로, 주주가 투자한 자본으로 얼마나 효율적으로 이익을 창출했는지 나타냅니다. ROE가 높을수록 자본 효율성이 좋은 회사로 평가되며, 일반적으로 15% 이상이면 양호한 수준입니다.',
        example: 'P회사가 자기자본 100억원으로 20억원의 순이익을 냈다면 ROE는 20%입니다. 이는 투자한 자본의 20%를 이익으로 돌려줬다는 의미예요.'
      },
      {
        term: 'EPS',
        category: '고급용어',
        simple_explanation: '발행된 주식 한 주당 얼마의 순이익이 발생했는지 보여주는 지표예요.',
        detailed_explanation: 'EPS(Earnings Per Share)는 주당순이익을 의미합니다. 당기순이익을 발행주식수로 나눈 값으로, 주주 한 명당 얼마의 이익이 배분되는지 나타냅니다. EPS가 높을수록 주주에게 돌아가는 이익이 많다는 의미이며, 주가와 함께 PER을 계산하는 데 사용됩니다.',
        example: 'Q회사가 100억원의 순이익을 냈고 발행주식수가 1,000만 주라면 EPS는 1,000원입니다. 주주 한 명당 1,000원의 이익이 발생한 거예요.'
      },
      {
        term: '베타',
        category: '고급용어',
        simple_explanation: '시장 대비 주식의 변동성을 나타내는 위험 지표예요.',
        detailed_explanation: '베타(Beta)는 특정 주식의 가격 변동성이 전체 시장 대비 얼마나 큰지를 나타내는 지표입니다. 베타가 1이면 시장과 같은 수준의 변동성을, 1보다 크면 시장보다 변동성이 크고, 1보다 작으면 시장보다 변동성이 작다는 의미입니다. 베타가 높을수록 위험도가 높지만 수익 기대치도 높아질 수 있습니다.',
        example: 'R회사 주식의 베타가 1.5라면, 시장이 10% 오를 때 이 주식은 평균적으로 15% 오르고, 시장이 10% 내릴 때는 평균적으로 15% 내립니다.'
      },
      {
        term: 'PEG',
        category: '고급용어',
        simple_explanation: 'PER을 성장률로 나눈 값으로, 성장성을 고려한 주가 평가 지표예요.',
        detailed_explanation: 'PEG(Price Earnings to Growth)는 PER을 연평균 성장률로 나눈 값으로, 회사의 성장성을 고려한 주가 평가 지표입니다. PEG가 1보다 낮으면 성장 대비 저평가된 것으로 볼 수 있으며, 성장주를 평가할 때 유용한 지표입니다. 단순히 PER만 보는 것보다 더 정확한 평가가 가능합니다.',
        example: 'S회사의 PER이 20이고 연평균 성장률이 30%라면 PEG는 약 0.67입니다. 이는 성장률 대비 주가가 저평가되었다는 의미예요.'
      },
      {
        term: 'EV/EBITDA',
        category: '고급용어',
        simple_explanation: '기업가치를 EBITDA로 나눈 값으로, 업종 간 비교에 유용한 밸류에이션 지표예요.',
        detailed_explanation: 'EV/EBITDA는 기업가치(Enterprise Value)를 EBITDA(이자, 세금, 감가상각 전 이익)로 나눈 값입니다. 부채와 세금 구조가 다른 기업들을 비교할 때 유용하며, 업종 간 비교에도 적합합니다. 이 지표가 낮을수록 저평가된 것으로 볼 수 있지만, 업종 평균과 비교하는 것이 중요합니다.',
        example: 'T회사의 기업가치가 1,000억원이고 EBITDA가 100억원이면 EV/EBITDA는 10입니다. 같은 업종 평균이 15라면 상대적으로 저평가된 것으로 볼 수 있어요.'
      },
      {
        term: '듀폰 분석',
        category: '고급용어',
        simple_explanation: 'ROE를 여러 요소로 분해하여 회사의 수익성 원인을 분석하는 방법이에요.',
        detailed_explanation: '듀폰 분석(DuPont Analysis)은 ROE를 매출이익률, 자산회전율, 자기자본비율로 분해하여 회사의 수익성이 어디서 나오는지 분석하는 방법입니다. ROE = 매출이익률 × 자산회전율 × 자기자본비율로 나타낼 수 있으며, 어떤 요소가 ROE에 기여하는지 파악할 수 있습니다.',
        example: 'U회사의 ROE가 20%인데, 이는 매출이익률 10%, 자산회전율 1.5회, 자기자본비율 1.33의 곱으로 이루어져 있습니다. 이를 통해 수익성의 원인을 파악할 수 있어요.'
      },
      {
        term: '현금흐름표',
        category: '고급용어',
        simple_explanation: '회사의 현금 유입과 유출을 보여주는 재무제표예요.',
        detailed_explanation: '현금흐름표(Cash Flow Statement)는 일정 기간 동안 회사의 현금이 어떻게 들어오고 나갔는지를 보여주는 재무제표입니다. 영업활동, 투자활동, 재무활동으로 구분하여 현금의 흐름을 파악할 수 있으며, 회사의 실제 자금 조달 능력과 안정성을 평가하는 데 중요합니다.',
        example: 'V회사가 영업활동에서 50억원의 현금을 벌어들였지만, 투자활동에서 100억원을 사용했다면 자금 조달이 필요할 수 있어요.'
      },
      {
        term: '밸류에이션',
        category: '고급용어',
        simple_explanation: '회사의 내재가치를 계산하여 주가가 적정한지 평가하는 방법이에요.',
        detailed_explanation: '밸류에이션(Valuation)은 회사의 내재가치를 산정하여 현재 주가가 적정한지 평가하는 과정입니다. DCF(현금흐름할인), 상대가치평가(PER, PBR 등), 자산가치평가 등 다양한 방법이 있으며, 여러 방법을 종합하여 평가하는 것이 중요합니다.',
        example: 'W회사의 내재가치를 DCF 방법으로 계산한 결과 주당 15,000원인데, 현재 주가가 10,000원이라면 저평가된 것으로 볼 수 있어요.'
      }
    ];

    try {
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
    } catch (error) {
      console.error('Error inserting terms:', error);
      // 에러가 발생해도 계속 진행
    }
  } else {
    // 기존 데이터가 있는 경우, 고급용어가 없으면 추가
    const advancedTerms = db.prepare('SELECT COUNT(*) as count FROM terms WHERE category = ?').get('고급용어') as { count: number };
    
    if (advancedTerms.count === 0 || advancedTerms.count === 1) {
      // PER만 있거나 고급용어가 없는 경우 추가 고급용어 삽입
      const insertTerm = db.prepare(`
        INSERT OR IGNORE INTO terms (term, category, simple_explanation, detailed_explanation, example)
        VALUES (?, ?, ?, ?, ?)
      `);

      const newAdvancedTerms = [
        {
          term: 'PBR',
          category: '고급용어',
          simple_explanation: '주가를 주당 순자산으로 나눈 값으로, 회사의 자산 대비 주가가 적정한지 보는 지표예요.',
          detailed_explanation: 'PBR(Price to Book Ratio)는 주가순자산비율을 의미합니다. 주가를 주당 순자산(BPS)으로 나눈 값으로, 회사의 장부가치 대비 주가가 얼마나 높은지 나타냅니다. PBR이 1보다 낮으면 주가가 순자산보다 낮다는 의미로 저평가로 볼 수 있지만, 회사의 수익성과 성장 가능성도 함께 고려해야 합니다.',
          example: 'O회사 주가가 5,000원이고 주당 순자산이 10,000원이면 PBR은 0.5입니다. 이는 주가가 순자산의 절반 수준이라는 의미예요.'
        },
        {
          term: 'ROE',
          category: '고급용어',
          simple_explanation: '자기자본으로 얼마나 이익을 냈는지 보여주는 수익성 지표예요.',
          detailed_explanation: 'ROE(Return on Equity)는 자기자본이익률을 의미합니다. 당기순이익을 자기자본으로 나눈 값으로, 주주가 투자한 자본으로 얼마나 효율적으로 이익을 창출했는지 나타냅니다. ROE가 높을수록 자본 효율성이 좋은 회사로 평가되며, 일반적으로 15% 이상이면 양호한 수준입니다.',
          example: 'P회사가 자기자본 100억원으로 20억원의 순이익을 냈다면 ROE는 20%입니다. 이는 투자한 자본의 20%를 이익으로 돌려줬다는 의미예요.'
        },
        {
          term: 'EPS',
          category: '고급용어',
          simple_explanation: '발행된 주식 한 주당 얼마의 순이익이 발생했는지 보여주는 지표예요.',
          detailed_explanation: 'EPS(Earnings Per Share)는 주당순이익을 의미합니다. 당기순이익을 발행주식수로 나눈 값으로, 주주 한 명당 얼마의 이익이 배분되는지 나타냅니다. EPS가 높을수록 주주에게 돌아가는 이익이 많다는 의미이며, 주가와 함께 PER을 계산하는 데 사용됩니다.',
          example: 'Q회사가 100억원의 순이익을 냈고 발행주식수가 1,000만 주라면 EPS는 1,000원입니다. 주주 한 명당 1,000원의 이익이 발생한 거예요.'
        },
        {
          term: '베타',
          category: '고급용어',
          simple_explanation: '시장 대비 주식의 변동성을 나타내는 위험 지표예요.',
          detailed_explanation: '베타(Beta)는 특정 주식의 가격 변동성이 전체 시장 대비 얼마나 큰지를 나타내는 지표입니다. 베타가 1이면 시장과 같은 수준의 변동성을, 1보다 크면 시장보다 변동성이 크고, 1보다 작으면 시장보다 변동성이 작다는 의미입니다. 베타가 높을수록 위험도가 높지만 수익 기대치도 높아질 수 있습니다.',
          example: 'R회사 주식의 베타가 1.5라면, 시장이 10% 오를 때 이 주식은 평균적으로 15% 오르고, 시장이 10% 내릴 때는 평균적으로 15% 내립니다.'
        },
        {
          term: 'PEG',
          category: '고급용어',
          simple_explanation: 'PER을 성장률로 나눈 값으로, 성장성을 고려한 주가 평가 지표예요.',
          detailed_explanation: 'PEG(Price Earnings to Growth)는 PER을 연평균 성장률로 나눈 값으로, 회사의 성장성을 고려한 주가 평가 지표입니다. PEG가 1보다 낮으면 성장 대비 저평가된 것으로 볼 수 있으며, 성장주를 평가할 때 유용한 지표입니다. 단순히 PER만 보는 것보다 더 정확한 평가가 가능합니다.',
          example: 'S회사의 PER이 20이고 연평균 성장률이 30%라면 PEG는 약 0.67입니다. 이는 성장률 대비 주가가 저평가되었다는 의미예요.'
        },
        {
          term: 'EV/EBITDA',
          category: '고급용어',
          simple_explanation: '기업가치를 EBITDA로 나눈 값으로, 업종 간 비교에 유용한 밸류에이션 지표예요.',
          detailed_explanation: 'EV/EBITDA는 기업가치(Enterprise Value)를 EBITDA(이자, 세금, 감가상각 전 이익)로 나눈 값입니다. 부채와 세금 구조가 다른 기업들을 비교할 때 유용하며, 업종 간 비교에도 적합합니다. 이 지표가 낮을수록 저평가된 것으로 볼 수 있지만, 업종 평균과 비교하는 것이 중요합니다.',
          example: 'T회사의 기업가치가 1,000억원이고 EBITDA가 100억원이면 EV/EBITDA는 10입니다. 같은 업종 평균이 15라면 상대적으로 저평가된 것으로 볼 수 있어요.'
        },
        {
          term: '듀폰 분석',
          category: '고급용어',
          simple_explanation: 'ROE를 여러 요소로 분해하여 회사의 수익성 원인을 분석하는 방법이에요.',
          detailed_explanation: '듀폰 분석(DuPont Analysis)은 ROE를 매출이익률, 자산회전율, 자기자본비율로 분해하여 회사의 수익성이 어디서 나오는지 분석하는 방법입니다. ROE = 매출이익률 × 자산회전율 × 자기자본비율로 나타낼 수 있으며, 어떤 요소가 ROE에 기여하는지 파악할 수 있습니다.',
          example: 'U회사의 ROE가 20%인데, 이는 매출이익률 10%, 자산회전율 1.5회, 자기자본비율 1.33의 곱으로 이루어져 있습니다. 이를 통해 수익성의 원인을 파악할 수 있어요.'
        },
        {
          term: '현금흐름표',
          category: '고급용어',
          simple_explanation: '회사의 현금 유입과 유출을 보여주는 재무제표예요.',
          detailed_explanation: '현금흐름표(Cash Flow Statement)는 일정 기간 동안 회사의 현금이 어떻게 들어오고 나갔는지를 보여주는 재무제표입니다. 영업활동, 투자활동, 재무활동으로 구분하여 현금의 흐름을 파악할 수 있으며, 회사의 실제 자금 조달 능력과 안정성을 평가하는 데 중요합니다.',
          example: 'V회사가 영업활동에서 50억원의 현금을 벌어들였지만, 투자활동에서 100억원을 사용했다면 자금 조달이 필요할 수 있어요.'
        },
        {
          term: '밸류에이션',
          category: '고급용어',
          simple_explanation: '회사의 내재가치를 계산하여 주가가 적정한지 평가하는 방법이에요.',
          detailed_explanation: '밸류에이션(Valuation)은 회사의 내재가치를 산정하여 현재 주가가 적정한지 평가하는 과정입니다. DCF(현금흐름할인), 상대가치평가(PER, PBR 등), 자산가치평가 등 다양한 방법이 있으며, 여러 방법을 종합하여 평가하는 것이 중요합니다.',
          example: 'W회사의 내재가치를 DCF 방법으로 계산한 결과 주당 15,000원인데, 현재 주가가 10,000원이라면 저평가된 것으로 볼 수 있어요.'
        }
      ];

      try {
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

        insertMany(newAdvancedTerms);
      } catch (error) {
        console.error('Error inserting advanced terms:', error);
        // 에러가 발생해도 계속 진행
      }
    }
  }

  const stocks = db.prepare('SELECT COUNT(*) as count FROM stocks').get() as { count: number };
  
  if (stocks.count === 0) {
    const insertStock = db.prepare(`
      INSERT INTO stocks (code, name, sector, description, recommendation_reason, risk_level, region)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const sampleStocks = [
      {
        code: 'AAPL',
        name: 'Apple Inc.',
        sector: 'Technology',
        description: 'Apple은 세계 최대 시가총액을 가진 기술 기업으로, 혁신적인 제품과 서비스로 전 세계 소비자들의 사랑을 받고 있습니다. iPhone, iPad, Mac, Apple Watch 등 하드웨어 제품뿐만 아니라 App Store, iCloud, Apple Music, Apple TV+ 등 다양한 서비스 사업을 통해 안정적인 수익원을 확보하고 있습니다. 특히 iPhone은 전 세계 스마트폰 시장에서 프리미엄 시장을 선도하며, 높은 마진율을 유지하고 있습니다. Apple의 강력한 생태계는 고객 유지율을 높이고 장기적인 수익성을 보장합니다.',
        recommendation_reason: 'Apple은 안정적인 대형주로 초보 투자자에게 매우 적합한 종목입니다. 강력한 브랜드 파워와 지속적인 혁신으로 장기 성장 가능성이 높으며, 높은 현금 보유량과 꾸준한 배당 정책으로 방어적 투자에도 적합합니다. 특히 서비스 사업의 성장으로 하드웨어 의존도를 낮추고 있으며, 이는 더욱 안정적인 수익 구조를 만들어줍니다. 다만, 제품 출시 주기에 따른 변동성은 존재하므로 장기 투자 관점에서 접근하는 것이 좋습니다.',
        risk_level: '낮음',
        region: '해외'
      },
      {
        code: 'MSFT',
        name: 'Microsoft Corporation',
        sector: 'Technology',
        description: 'Microsoft는 세계적인 소프트웨어 및 클라우드 기업으로, Windows, Office, Azure 등 다양한 제품과 서비스를 제공하고 있습니다. Azure 클라우드 서비스는 아마존 AWS와 함께 세계 시장을 양분하고 있으며, 지속적인 성장세를 보이고 있습니다. Office 365와 Microsoft 365는 기업과 개인 사용자들에게 필수적인 생산성 도구로 자리잡았으며, 안정적인 구독 수익을 창출하고 있습니다. 최근에는 AI 분야에 대규모 투자를 하며 ChatGPT와의 파트너십을 통해 AI 시대의 선도 기업으로 부상하고 있습니다.',
        recommendation_reason: 'Microsoft는 클라우드 사업의 지속적인 성장과 안정적인 수익 구조로 장기 투자에 매우 적합한 종목입니다. Azure의 성장세와 Office 구독 모델의 안정성, 그리고 AI 분야의 투자로 미래 성장 동력이 확보되어 있습니다. 다만, 클라우드 경쟁이 치열하므로 지속적인 혁신이 필요합니다.',
        risk_level: '낮음',
        region: '해외'
      },
      {
        code: 'GOOGL',
        name: 'Alphabet Inc.',
        sector: 'Technology',
        description: 'Alphabet은 구글의 모회사로, 검색 엔진, 디지털 광고, 클라우드, 유튜브 등 다양한 디지털 서비스를 제공하는 글로벌 기술 기업입니다. 구글 검색은 전 세계 검색 시장의 대부분을 차지하고 있으며, 이를 기반으로 한 광고 사업이 주요 수익원입니다. 유튜브는 세계 최대의 동영상 플랫폼으로 성장했으며, 구글 클라우드는 AWS, Azure에 이어 세계 3위의 클라우드 서비스 제공업체입니다. 최근에는 AI 분야에 집중 투자하며 Gemini 등 자체 AI 모델을 개발하고 있습니다.',
        recommendation_reason: 'Alphabet은 디지털 광고 시장의 강자로 안정적인 수익을 보이며, AI와 클라우드 사업의 성장 가능성이 높습니다. 다만, 규제 리스크와 광고 시장 경쟁 심화에 주의가 필요합니다.',
        risk_level: '낮음',
        region: '해외'
      },
      {
        code: 'AMZN',
        name: 'Amazon.com Inc.',
        sector: 'E-commerce/Cloud',
        description: 'Amazon은 세계 최대 전자상거래 기업이자 클라우드 서비스(AWS) 제공업체로, 다양한 사업을 운영하고 있습니다. AWS는 세계 최대의 클라우드 서비스 제공업체로, 기업들의 디지털 전환 수요 증가와 함께 지속적인 성장을 보이고 있습니다. 전자상거래 사업은 북미와 유럽 시장에서 강세를 보이며, 프라임 멤버십을 통해 고객 유지율을 높이고 있습니다. Amazon Prime Video와 Kindle 등 콘텐츠 사업도 확대하고 있으며, 물류 네트워크의 효율성은 주요 경쟁력입니다.',
        recommendation_reason: 'Amazon은 전자상거래와 클라우드 사업의 성장으로 장기 투자 가치가 높은 종목입니다. AWS의 높은 수익성과 전자상거래의 안정적인 성장이 강점입니다. 다만, 경쟁 심화와 규제 리스크에 주의가 필요합니다.',
        risk_level: '중간',
        region: '해외'
      },
      {
        code: 'NVDA',
        name: 'NVIDIA Corporation',
        sector: 'Technology',
        description: 'NVIDIA는 AI 반도체와 그래픽 칩의 선도 기업으로, 데이터센터, 게이밍, 자율주행 등 다양한 분야에서 강세를 보이고 있습니다. GPU 기술은 AI 학습과 추론에 필수적이며, 데이터센터용 GPU는 급성장하는 AI 시장의 핵심 부품입니다. 게이밍 GPU 시장에서도 압도적인 점유율을 보유하고 있으며, 자율주행과 로보틱스 분야에도 적극 투자하고 있습니다. 최근에는 AI 칩 수요 급증으로 높은 성장률을 보이고 있습니다.',
        recommendation_reason: 'NVIDIA는 AI 시대의 핵심 기업으로 성장 가능성이 매우 높습니다. AI 칩 시장의 급성장이 주요 성장 동력이지만, 경쟁 심화와 업황 변동성에 주의가 필요합니다.',
        risk_level: '높음',
        region: '해외'
      },
      {
        code: 'TSLA',
        name: 'Tesla Inc.',
        sector: 'Automotive/Energy',
        description: 'Tesla는 전기차 제조 및 에너지 솔루션 기업으로, 전기차 시장을 선도하고 있습니다. 모델 3, 모델 Y 등 대중형 전기차의 성공으로 전 세계 전기차 시장에서 높은 점유율을 보유하고 있으며, 자율주행 기술 개발에도 집중하고 있습니다. 에너지 저장 사업과 태양광 사업도 운영하고 있으며, 글로벌 공장 확장을 통해 생산 역량을 높이고 있습니다.',
        recommendation_reason: 'Tesla는 전기차 시장의 성장과 혁신적인 기술력으로 높은 성장 가능성을 보이지만, 경쟁 심화와 경영진 관련 변동성에 주의가 필요합니다.',
        risk_level: '높음',
        region: '해외'
      },
      {
        code: 'META',
        name: 'Meta Platforms Inc.',
        sector: 'Technology',
        description: 'Meta는 페이스북, 인스타그램, 왓츠앱을 운영하는 소셜 미디어 플랫폼 기업으로, 전 세계 수십억 명의 사용자를 보유하고 있습니다. 디지털 광고 사업이 주요 수익원이며, 인스타그램과 페이스북의 광고 플랫폼은 강력한 수익성을 보이고 있습니다. 메타버스와 VR/AR 분야에 대규모 투자를 하고 있으며, AI 분야에도 집중하고 있습니다.',
        recommendation_reason: 'Meta는 소셜 미디어 광고 시장의 강자로 안정적인 수익을 보이며, 메타버스 사업의 장기 성장 가능성이 있습니다. 다만, 규제 리스크와 경쟁 심화에 주의가 필요합니다.',
        risk_level: '중간',
        region: '해외'
      },
      {
        code: 'JPM',
        name: 'JPMorgan Chase & Co.',
        sector: 'Financial Services',
        description: 'JPMorgan Chase는 미국 최대 은행 중 하나로, 상업은행, 투자은행, 자산관리 등 다양한 금융 서비스를 제공하고 있습니다. 강력한 자본력과 리스크 관리 역량을 보유하고 있으며, 글로벌 금융 시장에서 중요한 역할을 하고 있습니다. 디지털 뱅킹과 핀테크 분야에도 적극 투자하고 있습니다.',
        recommendation_reason: 'JPMorgan Chase는 안정적인 수익 구조와 강력한 자본력을 가진 금융 대형주로 배당도 꾸준히 지급합니다. 다만, 금리 변동과 경제 상황에 민감하게 반응합니다.',
        risk_level: '낮음',
        region: '해외'
      },
      {
        code: 'V',
        name: 'Visa Inc.',
        sector: 'Financial Services',
        description: 'Visa는 세계 최대 결제 네트워크 기업으로, 전 세계 신용카드 및 직불카드 거래를 처리하고 있습니다. 거래 수수료 기반의 안정적인 수익 모델을 가지고 있으며, 디지털 결제 시장의 성장과 함께 지속적인 성장을 보이고 있습니다. 전 세계 수십억 명의 카드 보유자와 수백만 개의 가맹점을 보유하고 있어 강력한 네트워크 효과를 가지고 있습니다.',
        recommendation_reason: 'Visa는 디지털 결제 시장의 성장과 안정적인 수익 모델로 장기 투자에 적합한 종목입니다. 네트워크 효과와 높은 마진율이 강점입니다.',
        risk_level: '낮음',
        region: '해외'
      },
      {
        code: 'JNJ',
        name: 'Johnson & Johnson',
        sector: 'Healthcare',
        description: 'Johnson & Johnson은 의약품, 의료기기, 소비자 건강 제품을 생산하는 글로벌 헬스케어 기업입니다. 다양한 사업 포트폴리오로 안정적인 수익을 창출하고 있으며, 특히 의약품 사업에서 강세를 보이고 있습니다. 전 세계 시장에서 브랜드 인지도가 높으며, R&D 투자를 통해 지속적인 신제품 개발에 집중하고 있습니다.',
        recommendation_reason: 'Johnson & Johnson은 안정적인 수익과 꾸준한 배당으로 방어적 투자에 적합한 종목입니다. 다만, 규제 리스크와 제품 책임 소송에 주의가 필요합니다.',
        risk_level: '낮음',
        region: '해외'
      },
      {
        code: 'WMT',
        name: 'Walmart Inc.',
        sector: 'Retail',
        description: 'Walmart는 세계 최대 유통 기업으로, 온라인과 오프라인 매장을 운영하며 일상용품을 판매하고 있습니다. 전 세계 수천 개의 매장을 운영하며, 효율적인 공급망 관리로 낮은 가격을 유지하고 있습니다. 최근에는 전자상거래 사업을 확대하며 Amazon과 경쟁하고 있으며, 식품 유통에서 강세를 보이고 있습니다.',
        recommendation_reason: 'Walmart는 안정적인 수익 구조와 꾸준한 성장으로 방어적 투자에 적합한 종목입니다. 다만, 전자상거래 경쟁과 임금 상승 압력에 주의가 필요합니다.',
        risk_level: '낮음',
        region: '해외'
      },
      {
        code: 'PG',
        name: 'Procter & Gamble Co.',
        sector: 'Consumer Goods',
        description: 'Procter & Gamble은 세계적인 소비재 기업으로, 생활용품, 화장품, 건강용품 등을 생산하고 있습니다. Pampers, Tide, Gillette 등 전 세계적으로 인지도가 높은 브랜드를 보유하고 있으며, 안정적인 수익 구조를 가지고 있습니다. 신흥 시장에서의 성장세도 두드러지고 있습니다.',
        recommendation_reason: 'Procter & Gamble은 안정적인 수익과 꾸준한 배당으로 방어적 투자에 적합한 종목입니다. 강력한 브랜드 포트폴리오가 주요 강점입니다.',
        risk_level: '낮음',
        region: '해외'
      },
      {
        code: 'MA',
        name: 'Mastercard Inc.',
        sector: 'Financial Services',
        description: 'Mastercard는 세계 2위 결제 네트워크 기업으로, 전 세계 신용카드 및 직불카드 거래를 처리하고 있습니다. Visa와 함께 글로벌 결제 시장을 양분하고 있으며, 거래 수수료 기반의 안정적인 수익 모델을 가지고 있습니다. 디지털 결제와 모바일 결제 시장의 성장과 함께 지속적인 성장을 보이고 있습니다.',
        recommendation_reason: 'Mastercard는 디지털 결제 시장의 성장과 안정적인 수익 모델로 장기 투자에 적합합니다. 네트워크 효과와 높은 마진율이 강점입니다.',
        risk_level: '낮음',
        region: '해외'
      },
      {
        code: 'UNH',
        name: 'UnitedHealth Group Inc.',
        sector: 'Healthcare',
        description: 'UnitedHealth Group은 미국 최대 건강보험 회사로, 건강보험, 의료 서비스, 제약 혜택 관리 등을 제공하고 있습니다. 고령화와 헬스케어 수요 증가로 지속적인 성장을 보이고 있으며, 의료 서비스 사업도 확대하고 있습니다. 안정적인 수익 구조와 높은 현금 흐름을 보유하고 있습니다.',
        recommendation_reason: 'UnitedHealth Group은 고령화와 헬스케어 수요 증가로 장기 성장 가능성이 높은 종목입니다. 다만, 규제 변화와 의료비 상승에 주의가 필요합니다.',
        risk_level: '중간',
        region: '해외'
      },
      {
        code: 'HD',
        name: 'The Home Depot Inc.',
        sector: 'Retail',
        description: 'The Home Depot은 세계 최대 주택 개선 소매업체로, 건축 자재, 도구, 가전제품 등을 판매하고 있습니다. 미국 전역에 수천 개의 매장을 운영하며, DIY 시장과 전문 건축업자 시장 모두에서 강세를 보이고 있습니다. 주택 시장과 밀접한 연관이 있어 주택 건설 증가 시 수익이 증가합니다.',
        recommendation_reason: 'The Home Depot은 주택 시장과 연관성이 높아 경제 상황에 따라 변동하지만, 안정적인 수익 구조를 가지고 있습니다. 주택 시장 회복 시 성장 가능성이 높습니다.',
        risk_level: '중간',
        region: '해외'
      },
      {
        code: 'DIS',
        name: 'The Walt Disney Company',
        sector: 'Entertainment',
        description: 'The Walt Disney Company는 세계적인 엔터테인먼트 기업으로, 영화, 테마파크, 스트리밍 서비스(Disney+)를 운영하고 있습니다. Marvel, Star Wars, Pixar 등 강력한 IP를 보유하고 있으며, Disney+는 글로벌 스트리밍 시장에서 빠르게 성장하고 있습니다. 테마파크 사업도 주요 수익원이며, 콘텐츠 제작 역량이 뛰어납니다.',
        recommendation_reason: 'Disney는 강력한 브랜드와 콘텐츠 포트폴리오로 장기 성장 가능성이 있지만, 스트리밍 경쟁과 테마파크 수익 변동성에 주의가 필요합니다.',
        risk_level: '중간',
        region: '해외'
      },
      {
        code: 'NFLX',
        name: 'Netflix Inc.',
        sector: 'Entertainment',
        description: 'Netflix는 세계 최대 스트리밍 서비스 제공업체로, 영화, 드라마, 다큐멘터리 등을 제공하고 있습니다. 전 세계 수억 명의 구독자를 보유하고 있으며, 자체 제작 콘텐츠에 집중 투자하고 있습니다. 다만, Disney+, Amazon Prime Video, HBO Max 등과의 경쟁이 치열하며, 구독자 증가율 둔화에 직면하고 있습니다.',
        recommendation_reason: 'Netflix는 글로벌 스트리밍 시장의 성장과 함께 성장 가능성이 높지만, 경쟁이 치열하고 구독자 증가율 둔화로 변동성이 큽니다.',
        risk_level: '높음',
        region: '해외'
      },
      {
        code: 'AMD',
        name: 'Advanced Micro Devices',
        sector: 'Technology',
        description: 'AMD는 반도체 기업으로 CPU와 GPU를 생산하며, AI와 데이터센터 시장에서 성장하고 있습니다. 인텔과 경쟁하며 CPU 시장 점유율을 높이고 있으며, 엔비디아와 경쟁하며 GPU 시장에서도 강세를 보이고 있습니다. 데이터센터용 반도체 수요 증가로 높은 성장률을 보이고 있습니다.',
        recommendation_reason: 'AMD는 AI와 데이터센터 시장의 성장으로 높은 성장 가능성을 보이지만, 반도체 업황 변동성과 경쟁 심화에 주의가 필요합니다.',
        risk_level: '높음',
        region: '해외'
      },
      {
        code: 'INTC',
        name: 'Intel Corporation',
        sector: 'Technology',
        description: 'Intel은 세계 최대 반도체 기업 중 하나로, CPU를 주로 생산하며 데이터센터 사업도 운영하고 있습니다. PC와 서버용 프로세서 시장에서 강세를 보이고 있지만, AMD와의 경쟁이 치열하며 제조 공정 지연으로 어려움을 겪고 있습니다. 최근에는 제조 역량 강화와 신제품 개발에 집중하고 있습니다.',
        recommendation_reason: 'Intel은 안정적인 수익 구조를 가지고 있지만, 경쟁이 치열하고 제조 공정 지연으로 변동성이 있습니다. 제조 역량 강화가 성공 여부의 핵심입니다.',
        risk_level: '중간',
        region: '해외'
      },
      {
        code: 'COST',
        name: 'Costco Wholesale Corporation',
        sector: 'Retail',
        description: 'Costco는 대형 할인매장을 운영하는 유통 기업으로, 회원제 운영 모델을 통해 안정적인 수익을 창출하고 있습니다. 다양한 상품을 대량으로 판매하여 낮은 마진율로도 높은 매출을 실현하며, 회원 수수료는 순이익의 상당 부분을 차지합니다. 전 세계적으로 확장 중이며, 특히 아시아 시장에서의 성장세가 두드러집니다.',
        recommendation_reason: '안정적인 수익 구조와 꾸준한 성장으로 방어적 투자에 적합한 종목입니다. 회원제 모델의 안정성과 글로벌 확장 가능성이 장점입니다.',
        risk_level: '낮음',
        region: '해외'
      },
      {
        code: '005930',
        name: '삼성전자',
        sector: '반도체/전자',
        description: '삼성전자는 세계 최대의 반도체 및 스마트폰 제조 기업으로, 메모리 반도체 시장에서 압도적인 점유율을 보유하고 있습니다. D램과 낸드플래시 분야에서 세계 1위를 유지하며, 시스템 반도체 사업도 확대하고 있습니다. 스마트폰 부문에서는 갤럭시 시리즈로 프리미엄 시장을 공략하고 있으며, 디스플레이 사업에서도 OLED 기술로 시장을 선도하고 있습니다. 최근에는 AI 반도체, 자동차 반도체 등 미래 성장 동력에 집중 투자하고 있어 장기 성장 가능성이 높습니다.',
        recommendation_reason: '삼성전자는 한국 대표 대형주로 안정적인 투자처입니다. 반도체 업황에 따라 변동성이 있지만, 기술력과 시장 지위가 견고하여 장기 투자에 적합합니다. 특히 메모리 반도체의 회복세와 시스템 반도체의 성장 가능성이 긍정적입니다. 다만, 반도체 사이클의 영향을 받으므로 단기 변동성은 감수해야 합니다.',
        risk_level: '중간',
        region: '국내'
      },
      {
        code: '000660',
        name: 'SK하이닉스',
        sector: '반도체',
        description: 'SK하이닉스는 세계 2위의 메모리 반도체 기업으로, D램과 낸드플래시를 생산하고 있습니다. 특히 고용량 D램과 고성능 낸드플래시 기술에서 경쟁력을 보유하고 있으며, AI와 데이터센터 수요 증가로 인한 장기 성장 가능성이 높습니다. HBM(고대역폭메모리) 분야에서 강세를 보이며, AI 반도체 시장의 핵심 부품 공급업체로 부상하고 있습니다.',
        recommendation_reason: 'SK하이닉스는 AI 시대의 핵심 기업으로 성장 가능성이 매우 높습니다. HBM 시장의 급성장과 데이터센터 수요 증가가 주요 성장 동력입니다. 다만, 반도체 업황에 민감하게 반응하므로 변동성이 큽니다.',
        risk_level: '높음',
        region: '국내'
      },
      {
        code: '005380',
        name: '현대차',
        sector: '자동차',
        description: '현대자동차는 한국 최대의 자동차 제조 기업으로, 전 세계 시장에서 경쟁력을 보유하고 있습니다. 전기차와 수소차 분야에서 기술력을 인정받고 있으며, 특히 아이오닉 시리즈와 넥쏘 등으로 전기차 시장에서 입지를 강화하고 있습니다. 프리미엄 브랜드 제네시스의 성공과 SUV 시장에서의 강세도 주요 강점입니다.',
        recommendation_reason: '현대차는 전기차 전환 시대에 적극 대응하고 있어 장기 성장 가능성이 있습니다. 제네시스 브랜드의 성공과 전기차 기술력이 긍정적입니다. 다만, 자동차 산업의 경쟁이 치열하고 경기 변동에 민감합니다.',
        risk_level: '중간',
        region: '국내'
      },
      {
        code: '066570',
        name: 'LG전자',
        sector: '전자',
        description: 'LG전자는 가전, TV, 모바일 등 다양한 전자제품을 생산하는 글로벌 기업입니다. OLED TV 시장에서 세계 1위를 유지하고 있으며, 가전 부문에서도 프리미엄 제품 라인업으로 경쟁력을 확보하고 있습니다. 자동차 부품 사업도 확대 중이며, 전기차 부품 시장에서 성장 가능성을 보이고 있습니다.',
        recommendation_reason: 'LG전자는 OLED TV와 프리미엄 가전에서의 강세가 지속되고 있어 안정적인 수익을 기대할 수 있습니다. 자동차 부품 사업의 성장도 긍정적입니다.',
        risk_level: '중간',
        region: '국내'
      },
      {
        code: '035420',
        name: 'NAVER',
        sector: '인터넷/IT',
        description: 'NAVER는 한국 최대의 인터넷 포털 기업으로, 검색, 쇼핑, 클라우드, 핀테크 등 다양한 사업을 운영하고 있습니다. 라인(LINE)을 통해 일본과 동남아시아 시장에서도 강세를 보이고 있으며, 클라우드와 AI 사업에 집중 투자하고 있습니다. 특히 쇼핑몰과 결제 서비스에서 높은 성장률을 보이고 있습니다.',
        recommendation_reason: 'NAVER는 한국 인터넷 시장의 강자로 안정적인 수익 구조를 가지고 있습니다. 클라우드와 AI 사업의 성장 가능성이 높으며, 해외 사업 확장도 긍정적입니다.',
        risk_level: '중간',
        region: '국내'
      },
      {
        code: '035720',
        name: '카카오',
        sector: '인터넷/IT',
        description: '카카오는 카카오톡을 기반으로 한 플랫폼 기업으로, 메신저, 게임, 금융, 모빌리티 등 다양한 사업을 운영하고 있습니다. 카카오뱅크와 카카오페이를 통해 핀테크 시장에서 강세를 보이고 있으며, 콘텐츠 사업도 확대하고 있습니다. 특히 카카오톡의 높은 사용자 기반을 활용한 다양한 서비스 확장이 주요 성장 동력입니다.',
        recommendation_reason: '카카오는 강력한 플랫폼을 기반으로 다양한 사업을 확장하고 있어 성장 가능성이 높습니다. 다만, 규제 리스크와 경쟁 심화에 주의가 필요합니다.',
        risk_level: '중간',
        region: '국내'
      },
      {
        code: '051910',
        name: 'LG화학',
        sector: '화학',
        description: 'LG화학은 배터리 소재, 석유화학, 첨단소재 등 다양한 화학 사업을 운영하는 기업입니다. 특히 전기차 배터리 소재 분야에서 세계적인 경쟁력을 보유하고 있으며, 글로벌 배터리 제조사들의 주요 공급업체입니다. 전기차 시장의 성장과 함께 배터리 소재 수요가 급증하면서 높은 성장률을 보이고 있습니다.',
        recommendation_reason: 'LG화학은 전기차 배터리 소재 시장의 성장과 함께 높은 성장 가능성을 보이고 있습니다. 다만, 원자재 가격 변동과 경쟁 심화에 주의가 필요합니다.',
        risk_level: '중간',
        region: '국내'
      },
      {
        code: '028260',
        name: '삼성물산',
        sector: '건설/유통',
        description: '삼성물산은 건설, 유통, 패션 등 다양한 사업을 운영하는 대기업입니다. 건설 부문에서는 해외 프로젝트와 국내 인프라 사업을 수행하고 있으며, 유통 부문에서는 이마트를 통해 안정적인 수익을 창출하고 있습니다.',
        recommendation_reason: '삼성물산은 다양한 사업 포트폴리오로 안정적인 수익을 기대할 수 있습니다. 다만, 건설 사업의 변동성에 주의가 필요합니다.',
        risk_level: '중간',
        region: '국내'
      },
      {
        code: '006400',
        name: '삼성SDI',
        sector: '배터리',
        description: '삼성SDI는 전기차 배터리와 전자재료를 생산하는 기업입니다. 전기차 배터리 시장에서 글로벌 시장 점유율을 확대하고 있으며, 특히 프리미엄 전기차 제조사들의 공급업체로 성장하고 있습니다. 배터리 기술력과 생산 역량이 인정받고 있어 장기 성장 가능성이 높습니다.',
        recommendation_reason: '삼성SDI는 전기차 시장의 성장과 함께 높은 성장 가능성을 보이고 있습니다. 배터리 기술력이 강점이지만, 경쟁이 치열하고 변동성이 큽니다.',
        risk_level: '높음',
        region: '국내'
      },
      {
        code: '003670',
        name: '포스코홀딩스',
        sector: '철강',
        description: '포스코홀딩스는 세계적인 철강 기업으로, 고품질 철강 제품을 생산하고 있습니다. 최근에는 친환경 철강과 배터리 소재 사업으로 사업 다각화를 추진하고 있으며, 수소 경제에 대비한 투자도 확대하고 있습니다.',
        recommendation_reason: '포스코홀딩스는 철강 업황 회복과 친환경 사업 전환으로 장기 성장 가능성이 있습니다. 다만, 철강 업황에 민감하게 반응합니다.',
        risk_level: '중간',
        region: '국내'
      },
      {
        code: '096770',
        name: 'SK이노베이션',
        sector: '에너지/화학',
        description: 'SK이노베이션은 정유, 화학, 배터리 사업을 운영하는 에너지 기업입니다. 전기차 배터리 사업을 확대하고 있으며, 특히 배터리 셀 제조와 배터리 소재 사업에서 경쟁력을 보유하고 있습니다. 정유 사업의 안정적인 수익과 배터리 사업의 성장이 주요 특징입니다.',
        recommendation_reason: 'SK이노베이션은 배터리 사업의 성장 가능성이 높지만, 정유 업황과 배터리 경쟁에 주의가 필요합니다.',
        risk_level: '중간',
        region: '국내'
      },
      {
        code: '017670',
        name: 'SK텔레콤',
        sector: '통신',
        description: 'SK텔레콤은 한국의 주요 통신사로, 이동통신, 인터넷, 미디어 사업을 운영하고 있습니다. 5G 네트워크 구축과 클라우드 사업 확대에 집중하고 있으며, 안정적인 통신 수익과 함께 새로운 사업 영역을 모색하고 있습니다.',
        recommendation_reason: 'SK텔레콤은 안정적인 통신 수익 구조를 가지고 있어 방어적 투자에 적합합니다. 다만, 통신 시장의 성숙화로 성장률은 제한적입니다.',
        risk_level: '낮음',
        region: '국내'
      },
      {
        code: '030200',
        name: 'KT',
        sector: '통신',
        description: 'KT는 한국의 주요 통신사로, 이동통신, 인터넷, 미디어 사업을 운영하고 있습니다. 5G 네트워크와 클라우드 사업에 투자하고 있으며, B2B 사업 확대에도 집중하고 있습니다.',
        recommendation_reason: 'KT는 안정적인 통신 수익 구조를 가지고 있어 방어적 투자에 적합합니다. 다만, 통신 시장의 성숙화로 성장률은 제한적입니다.',
        risk_level: '낮음',
        region: '국내'
      },
      {
        code: '032830',
        name: '삼성생명',
        sector: '금융',
        description: '삼성생명은 한국 최대의 생명보험사로, 안정적인 수익 구조를 가지고 있습니다. 보험 사업의 안정성과 자산운용 역량이 강점이며, 배당 정책도 일관성 있게 유지하고 있습니다.',
        recommendation_reason: '삼성생명은 안정적인 수익 구조와 높은 배당률로 방어적 투자에 적합합니다. 다만, 저금리 환경에서 수익성 압박이 있을 수 있습니다.',
        risk_level: '낮음',
        region: '국내'
      },
      {
        code: '055550',
        name: '신한지주',
        sector: '금융',
        description: '신한지주는 신한은행을 중심으로 한 금융지주회사로, 은행, 증권, 카드 등 다양한 금융 서비스를 제공하고 있습니다. 안정적인 은행 수익과 함께 디지털 금융 서비스 확대에 집중하고 있습니다.',
        recommendation_reason: '신한지주는 안정적인 은행 수익 구조를 가지고 있어 방어적 투자에 적합합니다. 다만, 금리 변동과 부실채권에 주의가 필요합니다.',
        risk_level: '낮음',
        region: '국내'
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
          stock.risk_level,
          stock.region || '해외'
        );
      }
    });

    insertMany(sampleStocks);
  } else {
    // 기존 데이터가 있는 경우, 국내 종목이 없으면 추가
    const domesticStocks = db.prepare('SELECT COUNT(*) as count FROM stocks WHERE region = ?').get('국내') as { count: number };
    
    if (domesticStocks.count === 0) {
      const insertStock = db.prepare(`
        INSERT OR IGNORE INTO stocks (code, name, sector, description, recommendation_reason, risk_level, region)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const koreanStocks = [
        {
          code: '005930',
          name: '삼성전자',
          sector: '반도체/전자',
          description: '삼성전자는 세계 최대의 반도체 및 스마트폰 제조 기업으로, 메모리 반도체 시장에서 압도적인 점유율을 보유하고 있습니다. D램과 낸드플래시 분야에서 세계 1위를 유지하며, 시스템 반도체 사업도 확대하고 있습니다. 스마트폰 부문에서는 갤럭시 시리즈로 프리미엄 시장을 공략하고 있으며, 디스플레이 사업에서도 OLED 기술로 시장을 선도하고 있습니다. 최근에는 AI 반도체, 자동차 반도체 등 미래 성장 동력에 집중 투자하고 있어 장기 성장 가능성이 높습니다.',
          recommendation_reason: '삼성전자는 한국 대표 대형주로 안정적인 투자처입니다. 반도체 업황에 따라 변동성이 있지만, 기술력과 시장 지위가 견고하여 장기 투자에 적합합니다. 특히 메모리 반도체의 회복세와 시스템 반도체의 성장 가능성이 긍정적입니다. 다만, 반도체 사이클의 영향을 받으므로 단기 변동성은 감수해야 합니다.',
          risk_level: '중간',
          region: '국내'
        },
        {
          code: '000660',
          name: 'SK하이닉스',
          sector: '반도체',
          description: 'SK하이닉스는 세계 2위의 메모리 반도체 기업으로, D램과 낸드플래시를 생산하고 있습니다. 특히 고용량 D램과 고성능 낸드플래시 기술에서 경쟁력을 보유하고 있으며, AI와 데이터센터 수요 증가로 인한 장기 성장 가능성이 높습니다. HBM(고대역폭메모리) 분야에서 강세를 보이며, AI 반도체 시장의 핵심 부품 공급업체로 부상하고 있습니다.',
          recommendation_reason: 'SK하이닉스는 AI 시대의 핵심 기업으로 성장 가능성이 매우 높습니다. HBM 시장의 급성장과 데이터센터 수요 증가가 주요 성장 동력입니다. 다만, 반도체 업황에 민감하게 반응하므로 변동성이 큽니다.',
          risk_level: '높음',
          region: '국내'
        },
        {
          code: '005380',
          name: '현대차',
          sector: '자동차',
          description: '현대자동차는 한국 최대의 자동차 제조 기업으로, 전 세계 시장에서 경쟁력을 보유하고 있습니다. 전기차와 수소차 분야에서 기술력을 인정받고 있으며, 특히 아이오닉 시리즈와 넥쏘 등으로 전기차 시장에서 입지를 강화하고 있습니다. 프리미엄 브랜드 제네시스의 성공과 SUV 시장에서의 강세도 주요 강점입니다.',
          recommendation_reason: '현대차는 전기차 전환 시대에 적극 대응하고 있어 장기 성장 가능성이 있습니다. 제네시스 브랜드의 성공과 전기차 기술력이 긍정적입니다. 다만, 자동차 산업의 경쟁이 치열하고 경기 변동에 민감합니다.',
          risk_level: '중간',
          region: '국내'
        },
        {
          code: '066570',
          name: 'LG전자',
          sector: '전자',
          description: 'LG전자는 가전, TV, 모바일 등 다양한 전자제품을 생산하는 글로벌 기업입니다. OLED TV 시장에서 세계 1위를 유지하고 있으며, 가전 부문에서도 프리미엄 제품 라인업으로 경쟁력을 확보하고 있습니다. 자동차 부품 사업도 확대 중이며, 전기차 부품 시장에서 성장 가능성을 보이고 있습니다.',
          recommendation_reason: 'LG전자는 OLED TV와 프리미엄 가전에서의 강세가 지속되고 있어 안정적인 수익을 기대할 수 있습니다. 자동차 부품 사업의 성장도 긍정적입니다.',
          risk_level: '중간',
          region: '국내'
        },
        {
          code: '035420',
          name: 'NAVER',
          sector: '인터넷/IT',
          description: 'NAVER는 한국 최대의 인터넷 포털 기업으로, 검색, 쇼핑, 클라우드, 핀테크 등 다양한 사업을 운영하고 있습니다. 라인(LINE)을 통해 일본과 동남아시아 시장에서도 강세를 보이고 있으며, 클라우드와 AI 사업에 집중 투자하고 있습니다. 특히 쇼핑몰과 결제 서비스에서 높은 성장률을 보이고 있습니다.',
          recommendation_reason: 'NAVER는 한국 인터넷 시장의 강자로 안정적인 수익 구조를 가지고 있습니다. 클라우드와 AI 사업의 성장 가능성이 높으며, 해외 사업 확장도 긍정적입니다.',
          risk_level: '중간',
          region: '국내'
        },
        {
          code: '035720',
          name: '카카오',
          sector: '인터넷/IT',
          description: '카카오는 카카오톡을 기반으로 한 플랫폼 기업으로, 메신저, 게임, 금융, 모빌리티 등 다양한 사업을 운영하고 있습니다. 카카오뱅크와 카카오페이를 통해 핀테크 시장에서 강세를 보이고 있으며, 콘텐츠 사업도 확대하고 있습니다. 특히 카카오톡의 높은 사용자 기반을 활용한 다양한 서비스 확장이 주요 성장 동력입니다.',
          recommendation_reason: '카카오는 강력한 플랫폼을 기반으로 다양한 사업을 확장하고 있어 성장 가능성이 높습니다. 다만, 규제 리스크와 경쟁 심화에 주의가 필요합니다.',
          risk_level: '중간',
          region: '국내'
        },
        {
          code: '051910',
          name: 'LG화학',
          sector: '화학',
          description: 'LG화학은 배터리 소재, 석유화학, 첨단소재 등 다양한 화학 사업을 운영하는 기업입니다. 특히 전기차 배터리 소재 분야에서 세계적인 경쟁력을 보유하고 있으며, 글로벌 배터리 제조사들의 주요 공급업체입니다. 전기차 시장의 성장과 함께 배터리 소재 수요가 급증하면서 높은 성장률을 보이고 있습니다.',
          recommendation_reason: 'LG화학은 전기차 배터리 소재 시장의 성장과 함께 높은 성장 가능성을 보이고 있습니다. 다만, 원자재 가격 변동과 경쟁 심화에 주의가 필요합니다.',
          risk_level: '중간',
          region: '국내'
        },
        {
          code: '028260',
          name: '삼성물산',
          sector: '건설/유통',
          description: '삼성물산은 건설, 유통, 패션 등 다양한 사업을 운영하는 대기업입니다. 건설 부문에서는 해외 프로젝트와 국내 인프라 사업을 수행하고 있으며, 유통 부문에서는 이마트를 통해 안정적인 수익을 창출하고 있습니다.',
          recommendation_reason: '삼성물산은 다양한 사업 포트폴리오로 안정적인 수익을 기대할 수 있습니다. 다만, 건설 사업의 변동성에 주의가 필요합니다.',
          risk_level: '중간',
          region: '국내'
        },
        {
          code: '006400',
          name: '삼성SDI',
          sector: '배터리',
          description: '삼성SDI는 전기차 배터리와 전자재료를 생산하는 기업입니다. 전기차 배터리 시장에서 글로벌 시장 점유율을 확대하고 있으며, 특히 프리미엄 전기차 제조사들의 공급업체로 성장하고 있습니다. 배터리 기술력과 생산 역량이 인정받고 있어 장기 성장 가능성이 높습니다.',
          recommendation_reason: '삼성SDI는 전기차 시장의 성장과 함께 높은 성장 가능성을 보이고 있습니다. 배터리 기술력이 강점이지만, 경쟁이 치열하고 변동성이 큽니다.',
          risk_level: '높음',
          region: '국내'
        },
        {
          code: '003670',
          name: '포스코홀딩스',
          sector: '철강',
          description: '포스코홀딩스는 세계적인 철강 기업으로, 고품질 철강 제품을 생산하고 있습니다. 최근에는 친환경 철강과 배터리 소재 사업으로 사업 다각화를 추진하고 있으며, 수소 경제에 대비한 투자도 확대하고 있습니다.',
          recommendation_reason: '포스코홀딩스는 철강 업황 회복과 친환경 사업 전환으로 장기 성장 가능성이 있습니다. 다만, 철강 업황에 민감하게 반응합니다.',
          risk_level: '중간',
          region: '국내'
        },
        {
          code: '096770',
          name: 'SK이노베이션',
          sector: '에너지/화학',
          description: 'SK이노베이션은 정유, 화학, 배터리 사업을 운영하는 에너지 기업입니다. 전기차 배터리 사업을 확대하고 있으며, 특히 배터리 셀 제조와 배터리 소재 사업에서 경쟁력을 보유하고 있습니다. 정유 사업의 안정적인 수익과 배터리 사업의 성장이 주요 특징입니다.',
          recommendation_reason: 'SK이노베이션은 배터리 사업의 성장 가능성이 높지만, 정유 업황과 배터리 경쟁에 주의가 필요합니다.',
          risk_level: '중간',
          region: '국내'
        },
        {
          code: '017670',
          name: 'SK텔레콤',
          sector: '통신',
          description: 'SK텔레콤은 한국의 주요 통신사로, 이동통신, 인터넷, 미디어 사업을 운영하고 있습니다. 5G 네트워크 구축과 클라우드 사업 확대에 집중하고 있으며, 안정적인 통신 수익과 함께 새로운 사업 영역을 모색하고 있습니다.',
          recommendation_reason: 'SK텔레콤은 안정적인 통신 수익 구조를 가지고 있어 방어적 투자에 적합합니다. 다만, 통신 시장의 성숙화로 성장률은 제한적입니다.',
          risk_level: '낮음',
          region: '국내'
        },
        {
          code: '030200',
          name: 'KT',
          sector: '통신',
          description: 'KT는 한국의 주요 통신사로, 이동통신, 인터넷, 미디어 사업을 운영하고 있습니다. 5G 네트워크와 클라우드 사업에 투자하고 있으며, B2B 사업 확대에도 집중하고 있습니다.',
          recommendation_reason: 'KT는 안정적인 통신 수익 구조를 가지고 있어 방어적 투자에 적합합니다. 다만, 통신 시장의 성숙화로 성장률은 제한적입니다.',
          risk_level: '낮음',
          region: '국내'
        },
        {
          code: '032830',
          name: '삼성생명',
          sector: '금융',
          description: '삼성생명은 한국 최대의 생명보험사로, 안정적인 수익 구조를 가지고 있습니다. 보험 사업의 안정성과 자산운용 역량이 강점이며, 배당 정책도 일관성 있게 유지하고 있습니다.',
          recommendation_reason: '삼성생명은 안정적인 수익 구조와 높은 배당률로 방어적 투자에 적합합니다. 다만, 저금리 환경에서 수익성 압박이 있을 수 있습니다.',
          risk_level: '낮음',
          region: '국내'
        },
        {
          code: '055550',
          name: '신한지주',
          sector: '금융',
          description: '신한지주는 신한은행을 중심으로 한 금융지주회사로, 은행, 증권, 카드 등 다양한 금융 서비스를 제공하고 있습니다. 안정적인 은행 수익과 함께 디지털 금융 서비스 확대에 집중하고 있습니다.',
          recommendation_reason: '신한지주는 안정적인 은행 수익 구조를 가지고 있어 방어적 투자에 적합합니다. 다만, 금리 변동과 부실채권에 주의가 필요합니다.',
          risk_level: '낮음',
          region: '국내'
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
            stock.risk_level,
            stock.region
          );
        }
      });

      insertMany(koreanStocks);
    }
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

