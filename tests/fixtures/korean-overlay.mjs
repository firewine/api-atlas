import { stringify } from 'yaml';
import { CASE_SECTIONS_BY_LOCALE, caseMarkdown } from '../../src/lib/case-study.mjs';
import { sourceRevision } from '../../src/lib/translation-schema.mjs';
import { translatedGuideRecord } from '../../scripts/translation-content.mjs';
import { caseRecipe } from './case-recipe.mjs';

export const markdown = (data, body) => `---\n${stringify(data, { defaultStringType: 'QUOTE_DOUBLE' })}---\n\n${body}`;
export const escape = (text) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

export function koreanGuidePair() {
  const { sections, ...data } = caseRecipe();
  const body = caseMarkdown({ ...data, sections });
  const source = { id: data.caseStudy.slug, data, body, bytes: Buffer.from(markdown(data, body)) };
  const verificationNote = '합성 코드 검토 범위만 번역했으며 실제 API를 호출하지 않았습니다.';
  const translatedSections = [
    '수집 결과가 없는 경우 empty_page 오류를 명시해야 합니다.',
    '결과가 없는 상황과 정상 종료 조건이 섞이면 누락됩니다.',
    '빈 결과를 점검합니다.\n\n```python\nraise ValueError("empty_page")\n```',
    verificationNote,
    '이 합성 검토로 공급자의 실제 응답과 이용권을 확인할 수 없습니다.',
  ];
  const translation = { id: source.id, data: {
    locale: 'ko', sourceId: source.id, sourceRevision: sourceRevision(source.bytes), translationReviewedAt: '2026-10-16',
    title: 'Fixture API 빈 결과 처리: 오류를 명시하기', h1: 'Fixture API 빈 결과 처리: 오류를 명시하기',
    description: '비어 있는 응답을 명시적으로 거절하는 합성 예제의 번역과 확인 범위입니다.',
    summary: '원문의 증거를 상속하는 한국어 합성 테스트입니다.', verificationNote,
    linkLabel: 'Fixture API 비어 있는 응답 거절 사례',
  }, body: CASE_SECTIONS_BY_LOCALE.ko.map((heading, index) => `## ${heading}\n\n${translatedSections[index]}\n`).join('\n') };
  return { source, translation };
}

export function koreanGuideHtml(pair, canonical) {
  const guide = translatedGuideRecord(pair);
  const study = guide.caseStudy;
  const schema = [{ '@type': 'TechArticle', headline: guide.title, description: guide.description, inLanguage: 'ko',
    dateModified: guide.updatedAt, mainEntityOfPage: canonical,
    author: { '@type': study.review.authorType, name: study.review.author }, citation: study.evidence.map((item) => item.url) }];
  return `<html lang="ko"><head><title>${escape(guide.title)} · API Atlas</title><meta name="description" content="${escape(guide.description)}"><link rel="canonical" href="${canonical}"></head><body><h1>${escape(guide.h1)}</h1><p class="lede">${escape(guide.summary)}</p><span data-guide-author>${study.review.author}</span><time datetime="${guide.updatedAt}">${guide.updatedAt}</time><time datetime="${guide.translationReviewedAt}">${guide.translationReviewedAt}</time><div data-guide-body><h2>증상</h2><p>빈 결과</p><h2>원인</h2><p>종료 조건 확인</p><h2>안전한 해결</h2><pre><code>empty_page</code></pre><h2>검증</h2><p>${guide.verificationNote}</p><h2>한계</h2><p>실제 API 호출 없음</p></div><script type="application/ld+json">${JSON.stringify(schema)}</script></body></html>`;
}
