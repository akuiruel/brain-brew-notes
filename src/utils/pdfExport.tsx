import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

interface ContentItem {
  id: string;
  type: 'text' | 'math' | 'code';
  content: string;
  title?: string;
  color?: string;
}

interface CheatSheetData {
  title: string;
  description?: string;
  category: string;
  customCategory?: string;
  content: {
    items: ContentItem[];
  };
}

export type PdfColumnCount = 2 | 3;

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
    fontFamily: 'Helvetica',
    fontSize: 12,
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#ffffff',
    lineHeight: 1.2,
  },
  description: {
    fontSize: 12,
    color: '#f8fafc',
    marginBottom: 6,
    lineHeight: 1.3,
  },
  category: {
    fontSize: 10,
    backgroundColor: '#1e3a8a',
    color: '#ffffff',
    padding: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    fontWeight: 'bold',
  },
  columnsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  column: {
    flex: 1,
    paddingHorizontal: 5,
  },
  section: {
    marginBottom: 12,
    padding: 0,
    backgroundColor: 'transparent',
    borderRadius: 6,
    breakInside: 'avoid',
    orphans: 2,
    widows: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#0f172a',
    backgroundColor: '#eff6ff',
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
    lineHeight: 1.2,
  },
  contentBox: {
    backgroundColor: '#fefefe',
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 3,
  },
  textContent: {
    fontSize: 11,
    lineHeight: 1.5,
    color: '#1f2937',
    marginBottom: 3,
  },
  codeContent: {
    fontSize: 10,
    fontFamily: 'Courier',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    lineHeight: 1.4,
    padding: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginBottom: 3,
  },
  mathContent: {
    fontSize: 11,
    lineHeight: 1.4,
    backgroundColor: '#fef3e2',
    color: '#d97706',
    padding: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#fed7aa',
    marginBottom: 3,
  },
  pageBreak: {
    marginTop: 15,
    marginBottom: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 15,
  },
  continuationHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 15,
    textAlign: 'center',
    lineHeight: 1.2,
  },
});

const getPdfPalette = (category: string): { headerBg: string; badgeBg: string; accent: string } => {
  switch (category) {
    case 'mathematics':
      return { headerBg: '#2563eb', badgeBg: '#1e3a8a', accent: '#3b82f6' };
    case 'coding':
      return { headerBg: '#059669', badgeBg: '#065f46', accent: '#10b981' };
    case 'software':
      return { headerBg: '#7c3aed', badgeBg: '#4c1d95', accent: '#a78bfa' };
    case 'study':
      return { headerBg: '#d97706', badgeBg: '#92400e', accent: '#f59e0b' };
    default:
      return { headerBg: '#334155', badgeBg: '#0f172a', accent: '#64748b' };
  }
};

// Helper function to parse HTML and extract formatted content
const parseHtmlContent = (html: string): Array<{ text: string; bold?: boolean; italic?: boolean; color?: string }> => {
  const segments: Array<{ text: string; bold?: boolean; italic?: boolean; color?: string }> = [];
  
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  const processNode = (node: Node, parentBold = false, parentItalic = false): void => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        segments.push({ text, bold: parentBold, italic: parentItalic });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const style = element.getAttribute('style');
      const tagName = element.tagName.toUpperCase();
      
      let color: string | undefined;
      let isBold = parentBold;
      let isItalic = parentItalic;
      
      // Check for bold styling
      if (tagName === 'B' || tagName === 'STRONG' || 
          (style && (style.includes('font-weight: bold') || style.includes('font-weight:bold')))) {
        isBold = true;
      }
      
      // Check for italic styling
      if (tagName === 'I' || tagName === 'EM' || 
          (style && (style.includes('font-style: italic') || style.includes('font-style:italic')))) {
        isItalic = true;
      }
      
      // Extract color from inline style
      if (style) {
        const colorMatch = style.match(/color:\s*([^;]+)/i);
        if (colorMatch) {
          color = colorMatch[1].trim();
          // Convert hex colors to RGB if needed
          if (color.startsWith('#')) {
            const hex = color.slice(1);
            if (hex.length === 6) {
              const r = parseInt(hex.slice(0, 2), 16);
              const g = parseInt(hex.slice(2, 4), 16);
              const b = parseInt(hex.slice(4, 6), 16);
              color = `rgb(${r}, ${g}, ${b})`;
            }
          }
        }
      }
      
      // Handle line breaks and paragraphs
      if (tagName === 'BR') {
        segments.push({ text: '\n' });
        return;
      }
      
      if (tagName === 'P') {
        if (segments.length > 0) {
          segments.push({ text: '\n' });
        }
      }
      
      // Process child nodes
      for (const child of Array.from(node.childNodes)) {
        processNode(child, isBold, isItalic);
      }
      
      // Add line break after paragraphs
      if (tagName === 'P' && element.nextSibling) {
        segments.push({ text: '\n' });
      }
    }
  };
  
  processNode(tempDiv);
  return segments.filter(segment => segment.text.trim() !== '');
};

// Helper function to strip HTML and preserve basic formatting  
const stripHtml = (html: string): string => {
  return html
    .replace(/<br\s*\/?>(?=.)/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
};

const renderMathToText = (latex: string): string => {
  // Convert common LaTeX to readable text
  return latex
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/\^\{([^}]+)\}/g, '^($1)')
    .replace(/\_\{([^}]+)\}/g, '_($1)')
    .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)')
    .replace(/\\sum/g, 'Σ')
    .replace(/\\int/g, '∫')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\pi/g, 'π')
    .replace(/\\infty/g, '∞')
    .replace(/\\pm/g, '±')
    .replace(/\\/g, '');
};

// Split long text into chunks that fit within page constraints
const splitTextIntoChunks = (text: string, maxLength: number = 800): string[] => {
  if (text.length <= maxLength) {
    return [text];
  }
  
  const chunks: string[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxLength) {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = sentence;
      } else {
        // If single sentence is too long, split by words
        const words = sentence.split(' ');
        let wordChunk = '';
        for (const word of words) {
          if ((wordChunk + word).length <= maxLength) {
            wordChunk += (wordChunk ? ' ' : '') + word;
          } else {
            if (wordChunk) {
              chunks.push(wordChunk);
              wordChunk = word;
            } else {
              chunks.push(word);
            }
          }
        }
        if (wordChunk) {
          currentChunk = wordChunk;
        }
      }
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
};

// Distribute items across columns more evenly
const distributeItemsToColumns = (items: ContentItem[], columns: PdfColumnCount): ContentItem[][] => {
  const columnArrays: ContentItem[][] = Array.from({ length: columns }, () => []);
  
  // Simple round-robin distribution
  items.forEach((item, index) => {
    const columnIndex = index % columns;
    columnArrays[columnIndex].push(item);
  });
  
  return columnArrays;
};

const CheatSheetPDF = ({ data, columns }: { data: CheatSheetData; columns: PdfColumnCount }) => {
  const palette = getPdfPalette(data.customCategory ? 'other' : data.category);
  
  // Estimate content size and split into pages more intelligently
  const maxItemsPerPage = columns === 2 ? 8 : 12;
  const pages: ContentItem[][] = [];
  
  for (let i = 0; i < data.content.items.length; i += maxItemsPerPage) {
    pages.push(data.content.items.slice(i, i + maxItemsPerPage));
  }

  return (
    <Document>
      {pages.map((pageItems, pageIndex) => {
        const columnItems = distributeItemsToColumns(pageItems, columns);
        
        return (
          <Page key={pageIndex} size="A4" style={styles.page}>
            {pageIndex === 0 && (
              <View style={[styles.header, { backgroundColor: palette.headerBg }]}>
                <Text style={styles.title}>{data.title}</Text>
                {data.description && (
                  <Text style={styles.description}>{data.description}</Text>
                )}
                <Text style={[styles.category, { backgroundColor: palette.badgeBg }]}>
                  {(data.customCategory || data.category).toUpperCase()}
                </Text>
              </View>
            )}

            {pageIndex > 0 && (
              <View style={styles.pageBreak}>
                <Text style={styles.continuationHeader}>
                  {data.title} (continued - Page {pageIndex + 1})
                </Text>
              </View>
            )}

            <View style={styles.columnsContainer}>
              {columnItems.map((columnContent, colIndex) => (
                <View key={colIndex} style={styles.column}>
                  {columnContent.map((item) => {
                    // For text content, preserve HTML formatting; for others, strip HTML
                    const contentForProcessing = item.type === 'text' ? item.content : stripHtml(item.content);
                    const textChunks = item.type === 'text' 
                      ? splitTextIntoChunks(contentForProcessing, 400) 
                      : splitTextIntoChunks(contentForProcessing, 600);
                    
                    return textChunks.map((chunk, chunkIndex) => (
                      <View key={`${item.id}-${chunkIndex}`} style={styles.section} wrap={false}>
                        {chunkIndex === 0 && item.title && (
                          <Text style={[styles.sectionTitle, { borderLeftColor: palette.accent }]}>
                            {item.title}
                          </Text>
                        )}
                        
                        <View style={styles.contentBox}>
                          {item.type === 'text' && (
                            <>
                              {parseHtmlContent(chunk).map((segment, segIndex) => (
                                <Text 
                                  key={segIndex}
                                  style={[
                                    styles.textContent,
                                    segment.bold && { fontFamily: 'Helvetica-Bold' },
                                    segment.italic && { fontFamily: segment.bold ? 'Helvetica-BoldOblique' : 'Helvetica-Oblique' },
                                    segment.color && { color: segment.color },
                                  ]}
                                >
                                  {segment.text}
                                </Text>
                              ))}
                            </>
                          )}
                          
                          {item.type === 'math' && (
                            <Text style={styles.mathContent}>
                              {renderMathToText(chunk)}
                            </Text>
                          )}
                          
                          {item.type === 'code' && (
                            <Text style={styles.codeContent}>
                              {stripHtml(chunk)}
                            </Text>
                          )}
                        </View>
                        
                        {chunkIndex < textChunks.length - 1 && (
                          <Text style={{ fontSize: 8, color: '#6b7280', textAlign: 'center', marginTop: 3 }}>
                            (continued...)
                          </Text>
                        )}
                      </View>
                    ));
                  })}
                </View>
              ))}
            </View>
          </Page>
        );
      })}
    </Document>
  );
};

export const exportToPDF = async (data: CheatSheetData, options?: { columns?: PdfColumnCount }): Promise<void> => {
  try {
    const columns: PdfColumnCount = (options?.columns ?? 3) as PdfColumnCount;
    const blob = await pdf(<CheatSheetPDF data={data} columns={columns} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};