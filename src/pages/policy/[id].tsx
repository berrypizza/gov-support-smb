// src/pages/policy/[id].tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { Policy } from "../api/policies";
import Link from "next/link";

const PolicyDetail = () => {
  const router = useRouter();
  const { id } = router.query; // URL에서 /policy/[id] 의 id 읽기

  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // id가 준비되면 /api/policies 에서 전체 목록을 가져와서
  // id가 같은 정책을 찾는다.
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/policies");
        if (!res.ok) throw new Error("서버 요청 실패");

        const list: Policy[] = await res.json();
        const found = list.find((p) => String(p.id) === String(id));

        if (!found) {
          setError("해당 지원사업 정보를 찾을 수 없습니다.");
        } else {
          setPolicy(found);
        }
      } catch (e: any) {
        console.error(e);
        setError(e.message ?? "알 수 없는 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return (
    <div className="page">
      <div className="policy-detail">
        <div className="policy-detail-top">
          <Link href="/" className="back-link">
            ← 목록으로 돌아가기
          </Link>
        </div>

        {loading && <p className="status-hint">지원사업 정보를 불러오는 중입니다...</p>}

        {error && !loading && (
          <p className="status-error">{error}</p>
        )}

        {!loading && !error && policy && (
          <article className="policy-detail-card">
            <div className="policy-detail-header">
              <h1 className="policy-detail-title">{policy.title}</h1>
              <span className="policy-badge">{policy.category}</span>
            </div>

            <div className="policy-detail-meta">
              <span>{policy.provider}</span>
              <span className="policy-dot">·</span>
              <span>{policy.region}</span>
            </div>

            <section className="policy-detail-section">
              <h2>지원 내용</h2>
              <p>{policy.benefit}</p>
            </section>

            <section className="policy-detail-section">
              <h2>지원 대상</h2>
              <p>{policy.target}</p>
            </section>

            <section className="policy-detail-section">
              <h2>신청 기간</h2>
              <p>{policy.period}</p>
            </section>

            {/* 추후: 상세조회URL 같은 필드가 생기면 여기 버튼 추가 */}
            <div className="policy-detail-footer">
              <p className="detail-note">
                실제 신청은 각 기관의 공식 홈페이지 또는 정부24/보조금24에서 진행해야 합니다.
              </p>
            </div>
          </article>
        )}
      </div>
    </div>
  );
};

export default PolicyDetail;