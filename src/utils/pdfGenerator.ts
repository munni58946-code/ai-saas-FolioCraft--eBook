import { jsPDF } from 'jspdf';
import { Book } from '../types/book';
import { THEME_PALETTES } from '../data/themes';

export async function generateBookPDF(book: Book): Promise<void> {
  const theme = THEME_PALETTES[book.themeId] || THEME_PALETTES['deep-indigo'];
  const { rgb } = theme;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 20;
  const contentWidth = pageWidth - marginX * 2; // 170 mm
  const headerY = 14;
  const footerY = 285;
  const pageTopContentY = 25;
  const maxContentY = 275;

  let currentPageNum = 1;
  let totalPages = 1; // Will calculate / update

  // Helper to draw running header & footer
  const drawRunningHeaderFooter = (chapterLabel: string, pageNum: number) => {
    // Header
    doc.setFont('times', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(rgb.muted[0], rgb.muted[1], rgb.muted[2]);
    doc.text(book.title.toUpperCase(), marginX, headerY);
    doc.text(chapterLabel.toUpperCase(), pageWidth - marginX, headerY, { align: 'right' });
    
    // Header line
    doc.setDrawColor(rgb.boxBorder[0], rgb.boxBorder[1], rgb.boxBorder[2]);
    doc.setLineWidth(0.25);
    doc.line(marginX, headerY + 2.5, pageWidth - marginX, headerY + 2.5);

    // Footer line
    doc.line(marginX, footerY - 4, pageWidth - marginX, footerY - 4);
    
    // Footer text
    doc.setFontSize(8.5);
    doc.setTextColor(rgb.muted[0], rgb.muted[1], rgb.muted[2]);
    doc.text(`${book.edition} · ${book.author}`, marginX, footerY);
    doc.text(`Page ${pageNum}`, pageWidth - marginX, footerY, { align: 'right' });
  };

  // -------------------------------------------------------------
  // PAGE 1: COVER PAGE
  // -------------------------------------------------------------
  // Full-color cover background
  doc.setFillColor(rgb.primary[0], rgb.primary[1], rgb.primary[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Decorative border frames
  doc.setDrawColor(rgb.accent[0], rgb.accent[1], rgb.accent[2]);
  doc.setLineWidth(0.7);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.2);
  doc.rect(14.5, 14.5, pageWidth - 29, pageHeight - 29);

  // Top series label
  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(rgb.accent[0], rgb.accent[1], rgb.accent[2]);
  doc.text('F O L I O C R A F T   A R C H I V A L   E D I T I O N', pageWidth / 2, 34, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(220, 220, 220);
  doc.text(`${book.genre.toUpperCase()} · ${book.publicationYear}`, pageWidth / 2, 40, { align: 'center' });

  // Center geometric motif
  doc.setDrawColor(rgb.accent[0], rgb.accent[1], rgb.accent[2]);
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 25, 55, pageWidth / 2 + 25, 55);
  doc.rect(pageWidth / 2 - 2, 53, 4, 4);

  // Book Title
  doc.setFont('times', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  const titleLines = doc.splitTextToSize(book.title, 150);
  let titleY = 100;
  doc.text(titleLines, pageWidth / 2, titleY, { align: 'center', lineHeightFactor: 1.25 });
  titleY += titleLines.length * 11 + 6;

  // Thin accent line
  doc.setDrawColor(rgb.accent[0], rgb.accent[1], rgb.accent[2]);
  doc.setLineWidth(0.8);
  doc.line(pageWidth / 2 - 18, titleY, pageWidth / 2 + 18, titleY);
  titleY += 12;

  // Subtitle
  doc.setFont('times', 'italic');
  doc.setFontSize(12);
  doc.setTextColor(230, 230, 235);
  const subtitleLines = doc.splitTextToSize(book.subtitle, 140);
  doc.text(subtitleLines, pageWidth / 2, titleY, { align: 'center', lineHeightFactor: 1.35 });

  // Author & Credits (Bottom of Cover)
  const authorBoxY = 225;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(rgb.accent[0], rgb.accent[1], rgb.accent[2]);
  doc.text('A U T H O R E D   B Y', pageWidth / 2, authorBoxY, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text(book.author, pageWidth / 2, authorBoxY + 8, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 185, 195);
  doc.text(`${book.edition} · All Rights Reserved`, pageWidth / 2, authorBoxY + 16, { align: 'center' });

  // Retail Price on PDF cover
  const priceText = book.price === 0 ? 'OPEN ACCESS MONOGRAPH (FREE)' : `RETAIL PRICE: ${book.currency || '₹'}${book.price ?? 499}`;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(rgb.accent[0], rgb.accent[1], rgb.accent[2]);
  doc.text(priceText, pageWidth / 2, authorBoxY + 22, { align: 'center' });

  // -------------------------------------------------------------
  // PAGE 2: TABLE OF CONTENTS & DEMOGRAPHIC PERSONA
  // -------------------------------------------------------------
  doc.addPage();
  currentPageNum = 2;

  // Background tint for interior pages
  doc.setFillColor(rgb.paper[0], rgb.paper[1], rgb.paper[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  drawRunningHeaderFooter('Preliminary Brief & Contents', currentPageNum);

  let curY = pageTopContentY + 5;

  // Header
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(rgb.primary[0], rgb.primary[1], rgb.primary[2]);
  doc.text('Table of Contents', marginX, curY);
  curY += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(rgb.muted[0], rgb.muted[1], rgb.muted[2]);
  doc.text('STRUCTURAL CHAPTER BREAKDOWN & CORE THESIS', marginX, curY);
  curY += 10;

  // Chapters list
  book.chapters.forEach((ch, idx) => {
    // Row background
    doc.setFillColor(idx % 2 === 0 ? 255 : rgb.boxBg[0], idx % 2 === 0 ? 255 : rgb.boxBg[1], idx % 2 === 0 ? 255 : rgb.boxBg[2]);
    doc.rect(marginX, curY - 2, contentWidth, 14, 'F');
    doc.setDrawColor(rgb.boxBorder[0], rgb.boxBorder[1], rgb.boxBorder[2]);
    doc.setLineWidth(0.2);
    doc.rect(marginX, curY - 2, contentWidth, 14, 'S');

    // Number & Pill
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(rgb.accent[0], rgb.accent[1], rgb.accent[2]);
    doc.text(`CHAPTER 0${ch.number}`, marginX + 4, curY + 4);

    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(rgb.text[0], rgb.text[1], rgb.text[2]);
    doc.text(ch.title, marginX + 32, curY + 4);

    // Pill on right
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(rgb.muted[0], rgb.muted[1], rgb.muted[2]);
    doc.text(ch.pill, pageWidth - marginX - 4, curY + 4, { align: 'right' });

    // Subtitle preview
    doc.setFont('times', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(rgb.muted[0], rgb.muted[1], rgb.muted[2]);
    const cleanSub = ch.subheading.length > 60 ? ch.subheading.substring(0, 58) + '...' : ch.subheading;
    doc.text(cleanSub, marginX + 32, curY + 9);

    curY += 16;
  });

  curY += 6;

  // Demographic Persona Summary Box
  const personaBoxY = curY;
  const personaBoxHeight = 110;
  
  // Box shadow / tint
  doc.setFillColor(rgb.boxBg[0], rgb.boxBg[1], rgb.boxBg[2]);
  doc.roundedRect(marginX, personaBoxY, contentWidth, personaBoxHeight, 2, 2, 'F');
  
  doc.setDrawColor(rgb.accent[0], rgb.accent[1], rgb.accent[2]);
  doc.setLineWidth(0.6);
  doc.roundedRect(marginX, personaBoxY, contentWidth, personaBoxHeight, 2, 2, 'S');

  // Accent header strip
  doc.setFillColor(rgb.primary[0], rgb.primary[1], rgb.primary[2]);
  doc.roundedRect(marginX, personaBoxY, contentWidth, 10, 2, 2, 'F');
  doc.rect(marginX, personaBoxY + 6, contentWidth, 4, 'F'); // square bottom corners of strip

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('TARGET DEMOGRAPHIC PERSONA & STRATEGIC CONTEXT', marginX + 6, personaBoxY + 6.5);

  let pY = personaBoxY + 18;

  const renderPersonaField = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(rgb.accent[0], rgb.accent[1], rgb.accent[2]);
    doc.text(label.toUpperCase(), marginX + 6, pY);
    pY += 4.5;

    doc.setFont('times', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(rgb.text[0], rgb.text[1], rgb.text[2]);
    const lines = doc.splitTextToSize(value, contentWidth - 12);
    doc.text(lines, marginX + 6, pY, { lineHeightFactor: 1.25 });
    pY += lines.length * 4.5 + 4;
  };

  renderPersonaField('Target Audience & Demographics', `${book.demographic.targetAudience} (Typical Age: ${book.demographic.ageRange})`);
  renderPersonaField('Core Pain Point', book.demographic.corePainPoint);
  renderPersonaField('Desired Transformation', book.demographic.desiredTransformation);
  renderPersonaField('Recommended Reading Context', book.demographic.readingContext);

  // -------------------------------------------------------------
  // CHAPTERS 1 TO 4 (FORMATTED CHAPTERS)
  // -------------------------------------------------------------
  book.chapters.forEach((chapter) => {
    doc.addPage();
    currentPageNum++;

    // Background tint
    doc.setFillColor(rgb.paper[0], rgb.paper[1], rgb.paper[2]);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    drawRunningHeaderFooter(`Chapter 0${chapter.number} · ${chapter.title}`, currentPageNum);

    let chY = pageTopContentY + 6;

    const checkSpace = (neededHeight: number) => {
      if (chY + neededHeight > maxContentY) {
        doc.addPage();
        currentPageNum++;
        doc.setFillColor(rgb.paper[0], rgb.paper[1], rgb.paper[2]);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        drawRunningHeaderFooter(`Chapter 0${chapter.number} (Cont.)`, currentPageNum);
        chY = pageTopContentY + 6;
      }
    };

    // 1. Chapter Pill Badge
    doc.setFillColor(rgb.boxBg[0], rgb.boxBg[1], rgb.boxBg[2]);
    doc.setDrawColor(rgb.boxBorder[0], rgb.boxBorder[1], rgb.boxBorder[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(marginX, chY - 3, 72, 7, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(rgb.accent[0], rgb.accent[1], rgb.accent[2]);
    doc.text(`CHAPTER 0${chapter.number} · ${chapter.pill}`, marginX + 3, chY + 1.8);
    chY += 11;

    // 2. Chapter Title
    doc.setFont('times', 'bold');
    doc.setFontSize(21);
    doc.setTextColor(rgb.primary[0], rgb.primary[1], rgb.primary[2]);
    const titleLines = doc.splitTextToSize(chapter.title, contentWidth);
    doc.text(titleLines, marginX, chY, { lineHeightFactor: 1.2 });
    chY += titleLines.length * 8 + 4;

    // 3. Subheading
    doc.setFont('times', 'italic');
    doc.setFontSize(12);
    doc.setTextColor(rgb.muted[0], rgb.muted[1], rgb.muted[2]);
    const subLines = doc.splitTextToSize(chapter.subheading, contentWidth);
    doc.text(subLines, marginX, chY, { lineHeightFactor: 1.25 });
    chY += subLines.length * 5.5 + 6;

    // 4. Chapter Summary Box
    doc.setFont('times', 'normal');
    doc.setFontSize(9.5);
    const summaryLines = doc.splitTextToSize(chapter.summary, contentWidth - 14);
    const summaryBoxHeight = summaryLines.length * 4.8 + 10;

    checkSpace(summaryBoxHeight + 6);
    doc.setFillColor(rgb.boxBg[0], rgb.boxBg[1], rgb.boxBg[2]);
    doc.roundedRect(marginX, chY, contentWidth, summaryBoxHeight, 1.5, 1.5, 'F');
    doc.setDrawColor(rgb.accent[0], rgb.accent[1], rgb.accent[2]);
    doc.setLineWidth(0.6);
    doc.line(marginX, chY, marginX, chY + summaryBoxHeight);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(rgb.accent[0], rgb.accent[1], rgb.accent[2]);
    doc.text('CHAPTER THESIS SUMMARY', marginX + 6, chY + 5);

    doc.setFont('times', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(rgb.text[0], rgb.text[1], rgb.text[2]);
    doc.text(summaryLines, marginX + 6, chY + 10.5, { lineHeightFactor: 1.3 });
    chY += summaryBoxHeight + 8;

    // 5. Body Prose Paragraphs
    chapter.content.forEach((para, pIdx) => {
      doc.setFont('times', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(rgb.text[0], rgb.text[1], rgb.text[2]);
      const paraLines = doc.splitTextToSize(para, contentWidth);
      const paraHeight = paraLines.length * 5.2 + 5;

      checkSpace(paraHeight);

      // Drop cap on first paragraph
      if (pIdx === 0 && para.length > 0) {
        const firstLetter = para.charAt(0);
        const restOfFirstLine = para.slice(1);
        doc.setFont('times', 'bold');
        doc.setFontSize(28);
        doc.setTextColor(rgb.primary[0], rgb.primary[1], rgb.primary[2]);
        doc.text(firstLetter, marginX, chY + 6);

        // Print rest with indent for first 2 lines
        doc.setFont('times', 'normal');
        doc.setFontSize(10.5);
        doc.setTextColor(rgb.text[0], rgb.text[1], rgb.text[2]);
        const dropCapLines = doc.splitTextToSize(restOfFirstLine, contentWidth - 10);
        doc.text(dropCapLines[0], marginX + 10, chY);
        if (dropCapLines[1]) {
          doc.text(dropCapLines[1], marginX + 10, chY + 5.2);
        }
        if (dropCapLines.length > 2) {
          const remainingLines = dropCapLines.slice(2);
          doc.text(remainingLines, marginX, chY + 10.4, { lineHeightFactor: 1.35 });
        }
        chY += Math.max(dropCapLines.length * 5.2, 16) + 4;
      } else {
        doc.text(paraLines, marginX, chY, { lineHeightFactor: 1.35 });
        chY += paraHeight;
      }
    });

    // 6. Highlight Quote Box
    doc.setFont('times', 'italic');
    doc.setFontSize(11);
    const quoteLines = doc.splitTextToSize(`“${chapter.quote.text}”`, contentWidth - 16);
    const quoteBoxHeight = quoteLines.length * 5.5 + 14;

    checkSpace(quoteBoxHeight + 8);
    // Vertical left accent line
    doc.setDrawColor(rgb.accent[0], rgb.accent[1], rgb.accent[2]);
    doc.setLineWidth(1.2);
    doc.line(marginX + 4, chY + 2, marginX + 4, chY + quoteBoxHeight - 2);

    doc.setTextColor(rgb.primary[0], rgb.primary[1], rgb.primary[2]);
    doc.text(quoteLines, marginX + 10, chY + 7, { lineHeightFactor: 1.3 });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(rgb.muted[0], rgb.muted[1], rgb.muted[2]);
    doc.text(`— ${chapter.quote.author}`, marginX + 10, chY + quoteBoxHeight - 3);
    chY += quoteBoxHeight + 6;

    // 7. Key Takeaways / Bullet Points
    const bulletBoxNeeded = 14 + chapter.bulletPoints.length * 8;
    checkSpace(bulletBoxNeeded);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(rgb.accent[0], rgb.accent[1], rgb.accent[2]);
    doc.text('KEY STRATEGIC TAKEAWAYS & ACTION INVARIANTS', marginX, chY);
    chY += 5;

    chapter.bulletPoints.forEach((point) => {
      doc.setFont('times', 'normal');
      doc.setFontSize(9.5);
      const bLines = doc.splitTextToSize(point, contentWidth - 10);
      const bHeight = bLines.length * 4.6 + 3;

      checkSpace(bHeight);

      // Bullet dot
      doc.setFillColor(rgb.accent[0], rgb.accent[1], rgb.accent[2]);
      doc.circle(marginX + 2.5, chY - 1, 1, 'F');

      // Text
      doc.setTextColor(rgb.text[0], rgb.text[1], rgb.text[2]);
      doc.text(bLines, marginX + 7, chY, { lineHeightFactor: 1.25 });
      chY += bHeight;
    });
  });

  // Calculate actual total pages and save
  totalPages = doc.getNumberOfPages();

  // Save PDF
  const filename = `${book.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_FolioCraft.pdf`;
  doc.save(filename);
}
