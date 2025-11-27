// src/pages/api/policies.ts

import type { NextApiRequest, NextApiResponse } from "next";

export type Policy = {
  id: string;
  title: string;
  provider: string;
  region: string;
  target: string;
  benefit: string;
  period: string;
  category: string;
};

const SERVICE_KEY = process.env.GOV_API_SERVICE_KEY;

async function fetchPoliciesFromGovAPI(): Promise<Policy[]> {
  if (!SERVICE_KEY) {
    console.error("GOV_API_SERVICE_KEY 환경변수가 없습니다.");
    return [];
  }

  const url = `https://api.odcloud.kr/api/gov24/v3/serviceList?page=1&perPage=20&serviceKey=${encodeURIComponent(
    SERVICE_KEY
  )}`;

  console.log("▶ 요청 URL:", url);

  const res = await fetch(url);
  console.log("▶ 상태:", res.status);
  if (!res.ok) {
    const text = await res.text();
    console.error("▶ API 오류 응답:", text);
    return [];
  }

  const json = await res.json();
  console.log("▶ 응답 예시:", JSON.stringify(json, null, 2).slice(0, 500));

  const rawList = json.data || [];

  const mapped: Policy[] = rawList.map((item: any, idx: number) => ({
    id: String(item["서비스ID"] || idx),
    title: item["서비스명"] || "정보 없음",
    provider: item["소관기관명"] || "기관 미상",
    region: "전국", // 지역 정보가 없으므로 일단 전국으로 처리
    target: item["지원대상"] || "대상 정보 없음",
    benefit: item["서비스목적요약"] || "지원 내용 정보 없음",
    period: item["신청기한"] || "상시 또는 별도 공고",
    category: item["지원유형"] || "기타",
  }));

  return mapped;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const list = await fetchPoliciesFromGovAPI();
    res.status(200).json(list);
  } catch (err) {
    console.error("▶ 서버 오류:", err);
    res.status(500).json({ error: "서버 오류" });
  }
}