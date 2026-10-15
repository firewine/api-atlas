// Isolated synthetic data for tests only. Never generated into the site's content tree.
import { createHash } from 'node:crypto';

export const codeSnapshot = 'def collect(page):\n    if not page:\n        raise ValueError("empty_page")\n    return page\n';
export const docSnapshot = 'Synthetic fixture: an empty_page must be reported, not silently accepted. No live API calls or SDK versions were verified.\n';
const digest = (value) => createHash('sha256').update(value).digest('hex');

export function caseRecipe() {
  return {
    title: 'Fixture API 빈 페이지 누락: empty_page 감지',
    h1: 'Fixture API 빈 페이지 누락: empty_page 감지',
    description: '합성 페이지 수집기에서 빈 응답을 명시적으로 거절하는 예제와 검증 한계를 살펴봅니다.',
    summary: '이 페이지는 실제 공급자 장애를 주장하지 않는 격리 테스트용 합성 사례입니다.',
    order: 100, updatedAt: '2026-10-15', tags: ['fixture'],
    caseStudy: {
      slug: 'fixture-empty-page', problemId: 'fixture-empty-page',
      titleParts: { api: 'Fixture API', problem: '빈 페이지 누락', solution: 'empty_page 감지' },
      linkLabel: 'Fixture API 빈 페이지 누락과 명시적 거절 사례', providers: ['openai'],
      searchIntent: {
        primary: { term: '빈 페이지 수집 누락', sourcePhrase: 'empty_page', evidenceIds: ['fixture-code'] },
        related: ['empty_page 처리', '빈 응답 검증', '수집 종료 조건'].map((term) => ({ term, sourcePhrase: 'empty_page', evidenceIds: ['fixture-doc'] })),
        status: 'keyword-candidate',
      },
      evidence: [
        { id: 'fixture-code', kind: 'code', url: 'https://example.com/synthetic/code', checkedAt: '2026-10-15', snapshot: 'case-studies/evidence/fixture-code.txt', sha256: digest(codeSnapshot), excerpt: codeSnapshot.trim() },
        { id: 'fixture-doc', kind: 'documentation', url: 'https://example.com/synthetic/docs', checkedAt: '2026-10-15', snapshot: 'case-studies/evidence/fixture-doc.txt', sha256: digest(docSnapshot), excerpt: docSnapshot.trim() },
      ],
      technicalDetails: [{ kind: 'field', value: 'empty_page', evidenceId: 'fixture-code' }],
      verification: { level: 'source-review', note: '합성 코드만 검토했으며 실제 공급자를 호출하지 않았습니다.', evidenceIds: ['fixture-code'] },
      review: { author: 'Synthetic Test Author', authorType: 'Person', checkedAt: '2026-10-15', titleMatchesBody: true, distinctProblem: '격리 테스트의 빈 페이지 거절 동작만 다룹니다.', noInventedResults: true },
    },
    sections: {
      symptoms: '합성 수집기가 빈 페이지를 정상 수집으로 오해하는 상황을 구성합니다.',
      cause: '종료 상태와 empty_page 오류를 구분하지 않는 것이 이 합성 예제의 원인입니다.',
      solution: 'empty_page를 명시적으로 드러냅니다.\n\n```python\n' + codeSnapshot + '```',
      verification: '합성 코드만 검토했으며 실제 공급자를 호출하지 않았습니다. 실패 대조군은 빈 목록이고 정상 대조군은 한 행입니다.',
      limitations: '실제 SDK 버전과 공급자 응답, 운영 성공 여부는 확인하지 않았습니다.',
    },
  };
}
