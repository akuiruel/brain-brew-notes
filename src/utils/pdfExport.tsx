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
    minHeight: 30,
    flexWrap: 'wrap',
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

// Helper function to parse HTML and extract text with proper formatting
const parseHtmlContent = (html: string): Array<{ text: string; color?: string; bold?: boolean; italic?: boolean }> => {
  const segments: Array<{ text: string; color?: string; bold?: boolean; italic?: boolean }> = [];
  
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  const processNode = (node: Node, parentFormatting: { bold?: boolean; italic?: boolean; color?: string } = {}): void => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        segments.push({ 
          text, 
          bold: parentFormatting.bold,
          italic: parentFormatting.italic,
          color: parentFormatting.color
        });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const style = element.getAttribute('style');
      let formatting = { ...parentFormatting };
      
      // Check for bold formatting
      if (element.tagName === 'STRONG' || element.tagName === 'B' || 
          (style && style.includes('font-weight: bold'))) {
        formatting.bold = true;
      }
      
      // Check for italic formatting
      if (element.tagName === 'EM' || element.tagName === 'I' || 
          (style && style.includes('font-style: italic'))) {
        formatting.italic = true;
      }
      
      // Extract color from inline style
      if (style) {
        const colorMatch = style.match(/color:\s*([^;]+)/i);
        if (colorMatch) {
          formatting.color = colorMatch[1].trim();
        }
      }
      
      // Handle line breaks and paragraphs
      if (element.tagName === 'BR') {
        segments.push({ text: '\n' });
      } else if (element.tagName === 'P') {
        if (segments.length > 0) {
          segments.push({ text: '\n' });
        }
      }
      
      // Process child nodes with inherited formatting
      for (const child of Array.from(node.childNodes)) {
        processNode(child, formatting);
      }
      
      // Add line break after paragraphs
      if (element.tagName === 'P' && element.nextSibling) {
        segments.push({ text: '\n' });
      }
    }
  };
  
  processNode(tempDiv);
  return segments;
};

// Helper function to render formatted text segments
const renderFormattedText = (segments: Array<{ text: string; color?: string; bold?: boolean; italic?: boolean }>, baseStyle: any) => {
  return segments.map((segment, index) => {
    const style = {
      ...baseStyle,
      fontWeight: segment.bold ? 'bold' : 'normal',
      fontStyle: segment.italic ? 'italic' : 'normal',
      color: segment.color || baseStyle.color,
    };
    
    return (
      <Text key={index} style={style}>
        {segment.text}
      </Text>
    );
  });
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

// Split content segments into chunks that fit within page constraints
const splitContentIntoChunks = (segments: Array<{ text: string; color?: string; bold?: boolean; italic?: boolean }>, maxLength: number = 600): Array<Array<{ text: string; color?: string; bold?: boolean; italic?: boolean }>> => {
  const chunks: Array<Array<{ text: string; color?: string; bold?: boolean; italic?: boolean }>> = [];
  let currentChunk: Array<{ text: string; color?: string; bold?: boolean; italic?: boolean }> = [];
  let currentLength = 0;
  
  for (const segment of segments) {
    if (currentLength + segment.text.length <= maxLength) {
      currentChunk.push(segment);
      currentLength += segment.text.length;
    } else {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = [segment];
        currentLength = segment.text.length;
      } else {
        // If single segment is too long, split it
        const words = segment.text.split(' ');
        let wordChunk = '';
        for (const word of words) {
          if ((wordChunk + word).length <= maxLength) {
            wordChunk += (wordChunk ? ' ' : '') + word;
          } else {
            if (wordChunk) {
              currentChunk.push({ ...segment, text: wordChunk });
              chunks.push(currentChunk);
              currentChunk = [];
              wordChunk = word;
              currentLength = word.length;
            } else {
              currentChunk.push({ ...segment, text: word });
              chunks.push(currentChunk);
              currentChunk = [];
              currentLength = 0;
            }
          }
        }
        if (wordChunk) {
          currentChunk.push({ ...segment, text: wordChunk });
          currentLength = wordChunk.length;
        }
      }
    }
  }
  
  if (currentChunk.length > 0) {
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
  const palette = getPdfPalette(data.category);
  
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
                  {data.category.toUpperCase()}
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
                    const contentSegments = parseHtmlContent(item.content);
                    const contentChunks = splitContentIntoChunks(contentSegments, 400);
                    
                    return contentChunks.map((chunk, chunkIndex) => (
                      <View key={`${item.id}-${chunkIndex}`} style={styles.section} wrap={false}>
                        {chunkIndex === 0 && item.title && (
                          <Text style={[styles.sectionTitle, { borderLeftColor: palette.accent }]}>
                            {item.title}
                          </Text>
                        )}
                        
                        <View style={styles.contentBox}>
                          {item.type === 'text' && (
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                              {renderFormattedText(chunk, styles.textContent)}
                            </View>
                          )}
                          
                          {item.type === 'math' && (
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                              {renderFormattedText(chunk, styles.mathContent)}
                            </View>
                          )}
                          
                          {item.type === 'code' && (
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                              {renderFormattedText(chunk, styles.codeContent)}
                            </View>
                          )}
                        </View>
                        
                        {chunkIndex < contentChunks.length - 1 && (
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