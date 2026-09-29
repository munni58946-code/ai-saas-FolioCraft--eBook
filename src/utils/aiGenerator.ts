import { GoogleGenAI } from '@google/genai';
import { Book, ThemePaletteId } from '../types/book';

export async function generateBookWithAI(topic: string, genre: string, themeId: ThemePaletteId): Promise<Book> {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (window as any).__GEMINI_API_KEY__;

  // If no API key or in browser-only sandbox without injected key, generate rich structured book template
  if (!apiKey) {
    return generateCuratedBookTemplate(topic, genre, themeId);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a world-class book editor and author.
Generate a structured, authoritative 4-chapter monograph about "${topic}" in the genre "${genre}".

Return strictly valid JSON with this exact schema (no markdown fences, no preamble):
{
  "title": "Compelling Title",
  "subtitle": "Authoritative, insightful subtitle",
  "author": "Distinguished Author Name",
  "edition": "First Archival Edition",
  "publicationYear": "2026",
  "demographic": {
    "targetAudience": "Specific professional or intellectual profile",
    "ageRange": "25-50",
    "corePainPoint": "Exact friction or challenge they face",
    "desiredTransformation": "Measurable shift in capability or perspective",
    "readingContext": "Optimal setting and state of mind for reading"
  },
  "chapters": [
    {
      "number": 1,
      "pill": "CAPS CATEGORY BADGE",
      "title": "Chapter Title",
      "summary": "2-3 sentence thesis summary",
      "subheading": "Section Heading",
      "content": [
        "First long-form analytical paragraph.",
        "Second insightful paragraph developing the thesis.",
        "Third paragraph providing synthesis and implications."
      ],
      "quote": {
        "text": "Memorable aphorism or quotation",
        "author": "Speaker or Author"
      },
      "bulletPoints": [
        "First actionable takeaway or invariant.",
        "Second actionable takeaway.",
        "Third actionable takeaway.",
        "Fourth actionable takeaway."
      ]
    },
    {
      "number": 2,
      "pill": "CAPS CATEGORY BADGE",
      "title": "Chapter Title",
      "summary": "2-3 sentence thesis summary",
      "subheading": "Section Heading",
      "content": [
        "First long-form analytical paragraph.",
        "Second insightful paragraph developing the thesis.",
        "Third paragraph providing synthesis and implications."
      ],
      "quote": {
        "text": "Memorable aphorism or quotation",
        "author": "Speaker or Author"
      },
      "bulletPoints": [
        "First actionable takeaway.",
        "Second actionable takeaway.",
        "Third actionable takeaway.",
        "Fourth actionable takeaway."
      ]
    },
    {
      "number": 3,
      "pill": "CAPS CATEGORY BADGE",
      "title": "Chapter Title",
      "summary": "2-3 sentence thesis summary",
      "subheading": "Section Heading",
      "content": [
        "First long-form analytical paragraph.",
        "Second insightful paragraph developing the thesis.",
        "Third paragraph providing synthesis and implications."
      ],
      "quote": {
        "text": "Memorable aphorism or quotation",
        "author": "Speaker or Author"
      },
      "bulletPoints": [
        "First actionable takeaway.",
        "Second actionable takeaway.",
        "Third actionable takeaway.",
        "Fourth actionable takeaway."
      ]
    },
    {
      "number": 4,
      "pill": "CAPS CATEGORY BADGE",
      "title": "Chapter Title",
      "summary": "2-3 sentence thesis summary",
      "subheading": "Section Heading",
      "content": [
        "First long-form analytical paragraph.",
        "Second insightful paragraph developing the thesis.",
        "Third paragraph providing synthesis and implications."
      ],
      "quote": {
        "text": "Memorable aphorism or quotation",
        "author": "Speaker or Author"
      },
      "bulletPoints": [
        "First actionable takeaway.",
        "Second actionable takeaway.",
        "Third actionable takeaway.",
        "Fourth actionable takeaway."
      ]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (!parsed.title || !parsed.chapters || parsed.chapters.length < 4) {
      throw new Error('Incomplete structure');
    }

    return {
      id: `book-${Date.now()}`,
      title: parsed.title,
      subtitle: parsed.subtitle || `A Critical Monograph on ${topic}`,
      author: parsed.author || 'FolioCraft Scholar in Residence',
      edition: parsed.edition || 'First Archival Edition',
      publicationYear: parsed.publicationYear || '2026',
      genre: genre || 'Strategy & Philosophy',
      themeId,
      demographic: parsed.demographic || {
        targetAudience: 'Executives and Practitioners',
        ageRange: '28-55',
        corePainPoint: 'Navigating complexity in an evolving domain.',
        desiredTransformation: 'Developing systematic mastery and clear strategic foresight.',
        readingContext: 'Focused study and strategic planning.',
      },
      chapters: parsed.chapters.slice(0, 4).map((c: any, idx: number) => ({
        id: `ch-${Date.now()}-${idx + 1}`,
        number: idx + 1,
        pill: c.pill || `MODULE 0${idx + 1}`,
        title: c.title || `Chapter 0${idx + 1}`,
        summary: c.summary || 'Summary of key insights and core structural principles.',
        subheading: c.subheading || 'Analytical Framework',
        content: Array.isArray(c.content) ? c.content : [c.content || 'Content analysis.'],
        quote: c.quote || { text: 'Clarity precedes mastery.', author: 'Classical Axiom' },
        bulletPoints: Array.isArray(c.bulletPoints) ? c.bulletPoints : ['First key takeaway.', 'Second key takeaway.'],
      })) as [any, any, any, any],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn('AI generation fell back to template:', err);
    return generateCuratedBookTemplate(topic, genre, themeId);
  }
}

/**
 * Intelligent deterministic generator when AI API key is unavailable or fallback needed
 */
export function generateCuratedBookTemplate(topic: string, genre: string, themeId: ThemePaletteId): Book {
  const cleanTopic = topic.trim() || 'Modern Strategic Architecture';
  const cleanGenre = genre || 'Strategy & Leadership';

  return {
    id: `book-${Date.now()}`,
    title: cleanTopic,
    subtitle: `Systems, Invariants, and Enduring Frameworks for ${cleanTopic}`,
    author: 'Julian Sterling & Associates',
    edition: 'First Archival Edition',
    publicationYear: '2026',
    genre: cleanGenre,
    themeId,
    demographic: {
      targetAudience: `Founders, Senior Architects, and Specialists within ${cleanTopic}`,
      ageRange: '26 – 54 years old',
      corePainPoint: `Fragmented frameworks, rapid disruption, and the absence of unified mental models for ${cleanTopic}.`,
      desiredTransformation: `Achieving sovereign conceptual clarity, measurable leverage, and high-conviction execution.`,
      readingContext: 'Deep weekend analytical reading, strategy retreats, or uninterrupted morning blocks.',
    },
    chapters: [
      {
        id: `ch-${Date.now()}-1`,
        number: 1,
        pill: 'FOUNDATIONAL PRINCIPLES',
        title: `The Architecture of ${cleanTopic}`,
        summary: `Deconstructing the underlying invariants of ${cleanTopic} to establish an unshakeable analytical foundation.`,
        subheading: 'Mapping the Unseen Topology',
        content: [
          `To understand ${cleanTopic} at a masterclass level, one must first discard the transient tactical advice that populates popular discourse. Surface-level strategies change with every seasonal cycle, but the underlying thermodynamic and systemic forces remain remarkably constant.`,
          `When practitioners struggle to scale their effectiveness, the root cause is rarely a lack of effort; it is an unexamined misalignment between their operational mental models and actual structural reality. We must isolate what does not change before optimizing what shifts daily.`,
          `By anchoring your architecture in clear boundary conditions and provable invariants, you liberate your cognitive bandwidth for high-conviction decision making under conditions of extreme ambiguity.`
        ],
        quote: {
          text: `The strength of a structure is never tested in calm weather; it is verified when external assumptions collapse.`,
          author: `Julian Sterling, "Foundations of Form"`
        },
        bulletPoints: [
          `Identify the non-negotiable constraints that define the operating environment of ${cleanTopic}.`,
          `Distinguish between cosmetic activity and systemic momentum.`,
          `Establish verifiable feedback metrics that cannot be gamed by short-term incentives.`,
          `Protect uninterrupted deep work blocks dedicated to foundational design.`
        ]
      },
      {
        id: `ch-${Date.now()}-2`,
        number: 2,
        pill: 'SYSTEMIC EXECUTION',
        title: 'Asymmetric Leverage & Velocity',
        summary: 'Decoupling operational effort from compounding results through disciplined workflow modularity.',
        subheading: 'Eliminating Coordination Drag',
        content: [
          `Every growing system naturally accumulates operational drag. Meetings multiply, consensus requirements expand, and the time elapsed between an insight and its realization elongates into weeks. This entropy is the silent killer of strategic momentum.`,
          `High-performing operators counter this by designing modular subsystems. Rather than centralizing coordination, they establish explicit interfaces and verifiable contracts. Each unit operates with complete autonomy within bounded loss thresholds.`,
          `When execution is decoupled from continuous manual synchronization, the velocity of the overall system increases by an order of magnitude without increasing burnout.`
        ],
        quote: {
          text: 'Velocity is not hurrying; velocity is the total absence of unnecessary friction.',
          author: 'Sterling & Co. Monographs'
        },
        bulletPoints: [
          'Replace synchronous approval meetings with transparent asynchronous state machines.',
          'Define bounded blast radiuses so autonomous experiments can fail safely.',
          'Automate routine verification tasks to preserve human creative capital.',
          'Audit operational processes every quarter and prune legacy obligations.'
        ]
      },
      {
        id: `ch-${Date.now()}-3`,
        number: 3,
        pill: 'EQUILIBRIUM & RESILIENCE',
        title: 'Antifragility Under Stress',
        summary: 'Designing protocols that gain strength from volatility, market shifts, and external shocks.',
        subheading: 'Beyond Simple Robustness',
        content: [
          'A robust system withstands stress and remains unchanged; an antifragile system actually improves when subjected to turbulence. In the realm of ${cleanTopic}, stability is an illusion maintained only through continuous adaptation.',
          'By deliberately incorporating micro-stressors and stress-testing edge cases, organizations discover hidden fragilities before market forces exploit them. Failure is embraced early at negligible cost rather than late at catastrophic expense.',
          'The goal is not to predict the future with supernatural precision, but to build an architecture capable of flourishing regardless of which scenario unfolds.'
        ],
        quote: {
          text: 'The wind extinguishes a candle and energizes fire. Be the fire and wish for the wind.',
          author: 'Philosophical Axiom'
        },
        bulletPoints: [
          'Schedule regular chaos drills to expose unspoken dependencies.',
          'Maintain strategic reserves of capital, attention, and computational capacity.',
          'Design redundant pathways for critical operational deliverables.',
          'Turn post-mortem analyses into automated guardrails and durable documentation.'
        ]
      },
      {
        id: `ch-${Date.now()}-4`,
        number: 4,
        pill: 'THE LONG HORIZON',
        title: 'Compounding Institutional Memory',
        summary: 'Building durable repositories of craft and insight that transcend individual contributors and cycles.',
        subheading: 'Passing the Sovereign Baton',
        content: [
          'The ultimate test of any architectural masterpiece is whether it can survive the departure of its original creator. If an organization depends entirely on the tacit, unwritten intuition of a single individual, it is not an enterprise—it is a performance art troupe.',
          'Lasting greatness requires turning artisanal wisdom into clear, teachable canons. Documentation must not be an administrative chore, but a revered act of stewardship.',
          'When future leaders look back at your work decades from now, they should see not merely a commercial artifact, but a benchmark of integrity, proportion, and enduring craftsmanship.'
        ],
        quote: {
          text: 'What we write into the stone survives; what we leave to memory evaporates in the wind.',
          author: 'Julian Sterling'
        },
        bulletPoints: [
          'Codify institutional playbooks in clear, accessible, open repositories.',
          'Cultivate apprentices through direct mentorship on high-stakes projects.',
          'Celebrate quiet craftsmanship and precision over superficial vanity metrics.',
          'Commit to a standard of quality that respects both your predecessors and posterity.'
        ]
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
