/**
 * MarkdownView - Simple XSS-safe Markdown Renderer
 *
 * Lightweight markdown renderer for daily lesson content. Supports:
 * - # / ## / ### headings
 * - **bold** and *italic*
 * - `inline code`
 * - [text](url) and [[wikilink]] links
 * - - unordered list items
 * - Paragraphs and line breaks
 *
 * SECURITY: All input is HTML-escaped BEFORE markdown parsing. No
 * `dangerouslySetInnerHTML` is used. All output is React elements.
 *
 * This is intentionally NOT a full CommonMark renderer. It handles
 * the patterns that appear in our Language/ wiki pages.
 */

import { type ReactNode } from 'react';

// ============================================================================
// HTML Escaping (defense-in-depth)
// ============================================================================

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (c) => map[c]);
}

// ============================================================================
// Inline Parser
// ============================================================================

/**
 * Parse inline markdown: **bold**, *italic*, `code`, [link](url), [[wikilink]]
 *
 * Returns array of ReactNodes. Already-escaped text is split by markers.
 */
function parseInline(
  text: string,
  linkResolver?: (target: string) => string | null
): ReactNode[] {
  const nodes: ReactNode[] = [];

  // Order matters: code first (don't parse inside), then bold/italic, then links
  // Regex matches: `code`, **bold**, *italic*, [text](url), [[wikilink]]
  const pattern =
    /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[\[([^\]]+)\]\])|(\[[^\]]+\]\([^)]+\))/g;

  let lastIdx = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    // Push preceding plain text
    if (match.index > lastIdx) {
      nodes.push(escapeHtml(text.slice(lastIdx, match.index)));
    }

    const fullMatch = match[0];

    if (match[1]) {
      // `code`
      const codeContent = fullMatch.slice(1, -1);
      nodes.push(<code key={key++}>{escapeHtml(codeContent)}</code>);
    } else if (match[2]) {
      // **bold**
      const boldContent = fullMatch.slice(2, -2);
      nodes.push(<strong key={key++}>{parseInline(boldContent, linkResolver)}</strong>);
    } else if (match[3]) {
      // *italic*
      const italicContent = fullMatch.slice(1, -1);
      nodes.push(<em key={key++}>{parseInline(italicContent, linkResolver)}</em>);
    } else if (match[4]) {
      // [[wikilink]]
      const target = match[5];
      const resolved = linkResolver?.(target);
      const displayText = target.split('|')[0].trim();
      if (resolved) {
        nodes.push(
          <a key={key++} href={resolved} className="wikilink">
            {escapeHtml(displayText)}
          </a>
        );
      } else {
        // No resolver — render as styled span (broken link indicator)
        nodes.push(
          <span key={key++} className="wikilink wikilink--broken">
            {escapeHtml(displayText)}
          </span>
        );
      }
    } else if (match[6]) {
      // [text](url)
      const linkMatch = fullMatch.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        const linkText = linkMatch[1];
        const url = linkMatch[2];
        const isExternal = /^https?:\/\//.test(url);
        nodes.push(
          <a
            key={key++}
            href={url}
            className="md-link"
            {...(isExternal
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {})}
          >
            {escapeHtml(linkText)}
          </a>
        );
      }
    }

    lastIdx = match.index + fullMatch.length;
  }

  // Push remaining text
  if (lastIdx < text.length) {
    nodes.push(escapeHtml(text.slice(lastIdx)));
  }

  return nodes;
}

// ============================================================================
// Block Parser
// ============================================================================

type Block =
  | { type: 'h1' | 'h2' | 'h3'; level: 1 | 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'code'; text: string };

function parseBlocks(md: string): Block[] {
  const lines = md.split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Heading
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length as 1 | 2 | 3;
      blocks.push({ type: 'h' + level as 'h1' | 'h2' | 'h3', level, text: headingMatch[2] });
      i++;
      continue;
    }

    // Code block (```...```)
    if (trimmed.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'code', text: codeLines.join('\n') });
      i++; // skip closing ```
      continue;
    }

    // List item
    if (trimmed.match(/^[-*]\s+/)) {
      const items: string[] = [];
      while (i < lines.length) {
        const listLine = lines[i].trim();
        const listMatch = listLine.match(/^[-*]\s+(.+)$/);
        if (!listMatch) break;
        items.push(listMatch[1]);
        i++;
      }
      blocks.push({ type: 'list', items });
      continue;
    }

    // Paragraph (consume until blank line or special line)
    const paraLines: string[] = [];
    while (i < lines.length) {
      const l = lines[i].trim();
      if (
        !l ||
        l.startsWith('#') ||
        l.startsWith('```') ||
        l.match(/^[-*]\s+/)
      ) {
        break;
      }
      paraLines.push(l);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: 'paragraph', text: paraLines.join(' ') });
    }
  }

  return blocks;
}

// ============================================================================
// Main Component
// ============================================================================

export interface MarkdownViewProps {
  /** Markdown source text */
  source: string;
  /** Optional resolver for [[wikilink]] targets → URL (or null for broken) */
  linkResolver?: (target: string) => string | null;
  /** Additional CSS class */
  className?: string;
  /** Optional title to render above the markdown */
  title?: string;
}

export function MarkdownView({
  source,
  linkResolver,
  className,
  title,
}: MarkdownViewProps) {
  const blocks = parseBlocks(source);

  return (
    <div className={`markdown-view ${className ?? ''}`}>
      {title && <h2 className="markdown-view__title">{title}</h2>}
      {blocks.map((block, idx) => renderBlock(block, idx, linkResolver))}
    </div>
  );
}

function renderBlock(
  block: Block,
  key: number,
  linkResolver?: (target: string) => string | null
): ReactNode {
  switch (block.type) {
    case 'h1':
      return <h1 key={key}>{parseInline(block.text, linkResolver)}</h1>;
    case 'h2':
      return <h2 key={key}>{parseInline(block.text, linkResolver)}</h2>;
    case 'h3':
      return <h3 key={key}>{parseInline(block.text, linkResolver)}</h3>;
    case 'paragraph':
      return <p key={key}>{parseInline(block.text, linkResolver)}</p>;
    case 'list':
      return (
        <ul key={key}>
          {block.items.map((item, i) => (
            <li key={i}>{parseInline(item, linkResolver)}</li>
          ))}
        </ul>
      );
    case 'code':
      return (
        <pre key={key}>
          <code>{block.text}</code>
        </pre>
      );
  }
}
