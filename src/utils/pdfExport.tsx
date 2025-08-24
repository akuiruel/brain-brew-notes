import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import katex from 'katex';

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
  content: {
    items: ContentItem[];
  };
}

export type PdfColumnCount = 2 | 3;

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 25,
    padding: 25,

    backgroundColor: '#2563eb',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 13,
    color: '#f8fafc',
    marginBottom: 8,
    lineHeight: 1.4,
  },
  category: {
    fontSize: 11,
    backgroundColor: '#1e3a8a',
    color: '#ffffff',
    padding: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  section: {
    marginBottom: 18,
    padding: 0,
    backgroundColor: 'transparent',
    borderRadius: 12,
    breakInside: 'avoid',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#0f172a',
    backgroundColor: '#eff6ff',
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  contentBox: {
    backgroundColor: '#fefefe',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 5,
  },
  text: {
    fontSize: 12,
    lineHeight: 1.6,
    textAlign: 'justify',
    color: '#1f2937',
  },
  code: {
    fontSize: 11,
    fontFamily: 'Courier',
    backgroundColor: '#f3f4f6',
    color: '#059669',
    lineHeight: 1.5,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  math: {
    fontSize: 12,
    lineHeight: 1.5,
    backgroundColor: '#fef3e2',
    color: '#d97706',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  pageBreak: {
    marginTop: 25,
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
    paddingTop: 25,
  },
  columnsContainer: {
    flexDirection: 'row',
  },
  column: {
    flex: 1,
    paddingHorizontal: 6,
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

// Helper function to parse HTML and extract text with color information
const parseHtmlContent = (html: string): Array<{ text: string; color?: string }> => {
  const segments: Array<{ text: string; color?: string }> = [];
  
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  const processNode = (node: Node): void => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        segments.push({ text });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const style = element.getAttribute('style');
      let color: string | undefined;
      
      // Extract color from inline style
      if (style) {
        const colorMatch = style.match(/color:\s*([^;]+)/i);
        if (colorMatch) {
          color = colorMatch[1].trim();
        }
      }
      
      // Process child nodes
      for (const child of Array.from(node.childNodes)) {
        if (child.nodeType === Node.TEXT_NODE) {
          const text = child.textContent?.trim();
          if (text) {
            segments.push({ text, color });
          }
        } else {
          processNode(child);
        }
      }
    }
  };
  
  processNode(tempDiv);
  return segments;
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

const CheatSheetPDF = ({ data, columns }: { data: CheatSheetData; columns: PdfColumnCount }) => {
  // Determine items per page based on column count (approximate for layout balance)
  const itemsPerPage = columns * 6;
  const pages: ContentItem[][] = [];
  const palette = getPdfPalette(data.category);
  
  for (let i = 0; i < data.content.items.length; i += itemsPerPage) {
    pages.push(data.content.items.slice(i, i + itemsPerPage));
  }

  return (
    <Document>
      {pages.map((pageItems, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page} wrap>
          {pageIndex === 0 && (
            <View style={[styles.header, { backgroundColor: palette.headerBg }]}>
              <Text style={styles.title}>{data.title}</Text>
              {data.description && (
                <Text style={styles.description}>{data.description}</Text>
              )}
              <Text style={[styles.category, { backgroundColor: palette.badgeBg }]}>{data.category.toUpperCase()}</Text>
            </View>
          )}

          {pageIndex > 0 && (
            <View style={styles.pageBreak}>
              <Text style={[styles.title, { color: palette.badgeBg, fontSize: 18 }]}>
                {data.title} (continued)
              </Text>
            </View>
          )}

          <View style={styles.columnsContainer}>
            {Array.from({ length: columns }).map((_, col) => (
              <View key={col} style={[styles.column, col > 0 ? { marginLeft: 12 } : {}]}>
                {pageItems
                  .filter((_, idx) => idx % columns === col)
                  .map((item) => (
                    <View key={item.id} style={styles.section} wrap={false}>
                      {item.title && (
                        <Text style={[styles.sectionTitle, { borderLeftColor: palette.accent }]}>{item.title}</Text>
                      )}
                      <View style={styles.contentBox}>
                        {item.type === 'text' && (
                          <View>
                            {parseHtmlContent(item.content).map((segment, segIndex) => (
                              <Text
                                key={segIndex}
                                style={[
                                  styles.text,
                                  { color: segment.color || item.color || '#000000' },
                                ]}
                              >
                                {segment.text}
                              </Text>
                            ))}
                          </View>
                        )}
                        {item.type === 'math' && (
                          <View>
                            {parseHtmlContent(item.content).map((segment, segIndex) => (
                              <Text
                                key={segIndex}
                                style={[
                                  styles.math,
                                  { color: segment.color || item.color || '#000000' },
                                ]}
                              >
                                {segment.text}
                              </Text>
                            ))}
                          </View>
                        )}
                        {item.type === 'code' && (
                          <View>
                            {parseHtmlContent(item.content).map((segment, segIndex) => (
                              <Text
                                key={segIndex}
                                style={[
                                  styles.code,
                                  { color: segment.color || item.color || '#000000' },
                                ]}
                              >
                                {segment.text}
                              </Text>
                            ))}
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
              </View>
            ))}
          </View>
        </Page>
      ))}
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