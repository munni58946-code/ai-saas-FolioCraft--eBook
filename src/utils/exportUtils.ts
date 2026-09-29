import { Book } from '../types/book';

/**
 * Generates and downloads Markdown (.md) representation of the book
 */
export function exportToMarkdown(book: Book): void {
  const mdContent = `---
title: "${book.title}"
subtitle: "${book.subtitle}"
author: "${book.author}"
edition: "${book.edition}"
year: "${book.publicationYear}"
genre: "${book.genre}"
theme: "${book.themeId}"
targetAudience: "${book.demographic.targetAudience}"
ageRange: "${book.demographic.ageRange}"
---

# ${book.title}
*${book.subtitle}*

**Authored by:** ${book.author}  
**Edition:** ${book.edition} (${book.publicationYear})  
**Genre:** ${book.genre}

---

## Demographic Persona Brief

- **Target Audience:** ${book.demographic.targetAudience}
- **Age Range:** ${book.demographic.ageRange}
- **Core Pain Point:** ${book.demographic.corePainPoint}
- **Desired Transformation:** ${book.demographic.desiredTransformation}
- **Reading Context:** ${book.demographic.readingContext}

---

## Table of Contents

${book.chapters.map((ch) => `${ch.number}. [Chapter 0${ch.number}: ${ch.title}](#chapter-0${ch.number}) — *${ch.pill}*`).join('\n')}

---

${book.chapters
  .map(
    (ch) => `
## <a id="chapter-0${ch.number}"></a>Chapter 0${ch.number}: ${ch.title}
*Category: ${ch.pill}*

> **Chapter Summary:**  
> ${ch.summary}

### ${ch.subheading}

${ch.content.join('\n\n')}

> “${ch.quote.text}”  
> — *${ch.quote.author}*

#### Key Takeaways
${ch.bulletPoints.map((b) => `- ${b}`).join('\n')}
`
  )
  .join('\n\n---\n\n')}

---
*Exported from FolioCraft Publishing Studio on ${new Date().toLocaleDateString()}*
`;

  downloadFile(
    `${book.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.md`,
    'text/markdown;charset=utf-8',
    mdContent
  );
}

/**
 * Generates and downloads formatted plain text (.txt)
 */
export function exportToPlainText(book: Book): void {
  const lineDivider = '='.repeat(72);
  const thinDivider = '-'.repeat(72);

  const txtContent = `${lineDivider}
${book.title.toUpperCase()}
${book.subtitle}
${lineDivider}

Author: ${book.author}
Edition: ${book.edition} | Year: ${book.publicationYear}
Genre: ${book.genre}

${thinDivider}
DEMOGRAPHIC PERSONA & STRATEGIC CONTEXT
${thinDivider}
Target Audience: ${book.demographic.targetAudience} (Age: ${book.demographic.ageRange})
Core Pain Point: ${book.demographic.corePainPoint}
Desired Transformation: ${book.demographic.desiredTransformation}
Reading Context: ${book.demographic.readingContext}

${thinDivider}
TABLE OF CONTENTS
${thinDivider}
${book.chapters.map((ch) => `[0${ch.number}] ${ch.title.toUpperCase()} (${ch.pill})`).join('\n')}

${book.chapters
  .map(
    (ch) => `
${lineDivider}
CHAPTER 0${ch.number}: ${ch.title.toUpperCase()}
[${ch.pill}]
${lineDivider}

THESIS SUMMARY:
${ch.summary}

SECTION: ${ch.subheading}

${ch.content.join('\n\n')}

QUOTE:
"${ch.quote.text}"
  -- ${ch.quote.author}

KEY TAKEAWAYS:
${ch.bulletPoints.map((b, i) => `  ${i + 1}. ${b}`).join('\n')}
`
  )
  .join('\n')}

${lineDivider}
End of Book - Exported via FolioCraft
`;

  downloadFile(
    `${book.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`,
    'text/plain;charset=utf-8',
    txtContent
  );
}

/**
 * Exports full JSON backup
 */
export function exportToJSON(book: Book): void {
  const jsonContent = JSON.stringify(book, null, 2);
  downloadFile(
    `${book.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_backup.json`,
    'application/json;charset=utf-8',
    jsonContent
  );
}

/**
 * Generic browser download trigger
 */
function downloadFile(filename: string, mimeType: string, content: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
