// src/pages/index.tsx
import { useState } from "react";
import type { Policy } from "./api/policies";
import Link from "next/link";

const REGIONS = ["전체", "전국"];
const STAGES = [
  "전체",
  "예비창업",
  "창업 1년 미만",
  "창업 1~3년",
  "창업 3년 이상",
];
const CATEGORIES = ["전체", "자금", "교육", "마케팅", "기타"];

const Home = () => {
  const [region, setRegion] = useState("전체");
  const [stage, setStage] = useState("전체");
  const [category, setCategory] = useState("전체");
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState(""); // 키워드 검색어
  const [sortOption, setSortOption] = useState<
    "default" | "title" | "provider"
  >("default");

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/policies");
      if (!res.ok) throw new Error("서버 요청에 실패했습니다.");
      const data: Policy[] = await res.json();
      setPolicies(data);
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const filteredPolicies = (() => {
    // 1) 필터링
    let list = policies.filter((p) => {
      const matchCategory =
        category === "전체" || (p.category && p.category.includes(category));

      // 🔍 키워드: 제목/내용/대상/기관명 통합 검사
      const lowerKeyword = keyword.trim().toLowerCase();
      const matchKeyword =
        lowerKeyword.length === 0 ||
        [p.title, p.benefit, p.target, p.provider]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(lowerKeyword));

      // region / stage 는 나중에 데이터에 맞춰 구현 가능
      return matchCategory && matchKeyword;
    });

    // 2) 정렬
    if (sortOption === "title") {
      list = [...list].sort((a, b) =>
        (a.title || "").localeCompare(b.title || "", "ko")
      );
    } else if (sortOption === "provider") {
      list = [...list].sort((a, b) =>
        (a.provider || "").localeCompare(b.provider || "", "ko")
      );
    }

    return list;
  })();

  return (
    <div className="page">
      {/* 상단 히어로 섹션 */}
      <header className="hero">
        <div className="hero-badge">소상공인 · 예비창업자 전용</div>
        <h1 className="hero-title">
          내가 받을 수 있는
          <br />
          정부지원 사업 한 번에 확인하기
        </h1>
        <p className="hero-subtitle">
          보조금24 공공서비스 API와 연동하여 실제 정부·지자체 지원사업 정보를
          가져옵니다.
          <br />
          복잡한 공고문 대신, 카드형으로 한 눈에 확인해 보세요.
        </p>

        <div className="hero-actions">
          <button
            className="hero-button"
            onClick={handleSearch}
            disabled={loading}>
            {loading
              ? "지원사업 불러오는 중..."
              : "지금 받을 수 있는 지원사업 보기"}
          </button>
          <span className="hero-hint">
            버튼 한 번으로 최신 지원사업 목록을 불러옵니다.
          </span>
        </div>
      </header>

      {/* 필터 바 */}
      <section className="filter-bar">
        <div className="filter-group">
          <label className="filter-label">지역</label>
          <select
            className="filter-select"
            value={region}
            onChange={(e) => setRegion(e.target.value)}>
            {REGIONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">사업 단계</label>
          <select
            className="filter-select"
            value={stage}
            onChange={(e) => setStage(e.target.value)}>
            {STAGES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">지원 유형</label>
          <select
            className="filter-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* 🔍 키워드 검색 */}
        <div className="filter-group">
          <label className="filter-label">키워드 검색</label>
          <input
            className="filter-input"
            placeholder="사업명 / 내용 / 대상 / 기관명"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        {/* ↕ 정렬 옵션 */}
        <div className="filter-group">
          <label className="filter-label">정렬</label>
          <select
            className="filter-select"
            value={sortOption}
            onChange={(e) =>
              setSortOption(e.target.value as "default" | "title" | "provider")
            }>
            <option value="default">기본 순서</option>
            <option value="title">사업명 가나다순</option>
            <option value="provider">기관명 가나다순</option>
          </select>
        </div>
      </section>

      {/* 오류 / 안내 메시지 */}
      <section className="status-area">
        {error && <p className="status-error">{error}</p>}

        {!loading && !error && policies.length === 0 && (
          <p className="status-hint">
            상단 버튼을 눌러 최신 소상공인·예비창업자 지원사업을 불러와 보세요.
          </p>
        )}
      </section>

      {/* 결과 카드 리스트 */}
      <main className="policy-list">
        {filteredPolicies.map((p) => (
          <Link
            key={p.id}
            href={`/policy/${p.id}`}
            className="policy-card-link">
            <article className="policy-card">
              <div className="policy-header">
                <h2 className="policy-title">{p.title}</h2>
                <span className="policy-badge">{p.category}</span>
              </div>

              <div className="policy-meta">
                <span>{p.provider}</span>
                <span className="policy-dot">·</span>
                <span>{p.region}</span>
              </div>

              <p className="policy-benefit">{p.benefit}</p>

              <p className="policy-target">
                <span className="policy-label">지원대상</span>
                {p.target}
              </p>

              <p className="policy-period">
                <span className="policy-label">신청기간</span>
                {p.period}
              </p>
            </article>
          </Link>
        ))}

        {!loading && filteredPolicies.length === 0 && policies.length > 0 && (
          <p className="status-hint">
            선택한 필터에 맞는 결과가 없습니다. 조건을 조금 넓게 조정해 보세요.
          </p>
        )}
      </main>

      <footer className="footer">
        <p>
          © {new Date().getFullYear()} 소상공인 정책 큐레이션 · Powered by
          KANOVII
        </p>
      </footer>
    </div>
  );
};

export default Home;
