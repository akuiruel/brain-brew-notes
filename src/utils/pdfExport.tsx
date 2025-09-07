import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer';

// Register fonts for better formatting support
Font.register({
  family: 'Helvetica',
  fonts: [
    { fontWeight: 'normal' },
    { fontWeight: 'bold' },
    { fontStyle: 'italic' },
    { fontWeight: 'bold', fontStyle: 'italic' },
  ]
});

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

export type PdfColumnCount = 1 | 2 | 3;

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
  singleColumn: {
    flexDirection: 'column',
    gap: 12,
  },
  column: {
    flex: 1,
    paddingHorizontal: 5,
  },
  section: {
    marginBottom: 15,
    padding: 0,
    backgroundColor: 'transparent',
    borderRadius: 6,
    breakInside: 'avoid',
    orphans: 3,
    widows: 3,
    minHeight: 50,
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
    marginBottom: 2,
    fontFamily: 'Helvetica',
    fontWeight: 'normal',
  },
  boldText: {
    fontSize: 11,
    lineHeight: 1.5,
    color: '#1f2937',
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  italicText: {
    fontSize: 11,
    lineHeight: 1.5,
    color: '#1f2937',
    fontFamily: 'Helvetica',
    fontStyle: 'italic',
    marginBottom: 2,
  },
  boldItalicText: {
    fontSize: 11,
    lineHeight: 1.5,
    color: '#1f2937',
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
    fontStyle: 'italic',
    marginBottom: 2,
  },
  codeContent: {
    fontSize: 10,
    fontFamily: 'Courier',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    lineHeight: 1.4,
    padding: 8,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginBottom: 3,
  },
  codeContentBold: {
    fontSize: 10,
    fontFamily: 'Courier',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    lineHeight: 1.4,
    padding: 8,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginBottom: 3,
    fontWeight: 'bold',
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
    marginTop: 20,
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 20,
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
      return { headerBg: '#6366f1', badgeBg: '#4338ca', accent: '#8b5cf6' };
  }
};

// Enhanced HTML parsing with better bold detection for code content
const parseHtmlContent = (html: string, isCodeContent: boolean = false): Array<{ text: string; bold?: boolean; italic?: boolean; color?: string }> => {
  const segments: Array<{ text: string; bold?: boolean; italic?: boolean; color?: string }> = [];
  
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  const processNode = (node: Node, parentBold = false, parentItalic = false, parentColor?: string): void => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (text.trim()) {
        segments.push({ 
          text, 
          bold: parentBold, 
          italic: parentItalic,
          color: parentColor 
        });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const style = element.getAttribute('style') || '';
      const className = element.getAttribute('class') || '';
      const tagName = element.tagName.toUpperCase();
      
      let color: string | undefined = parentColor;
      let isBold = parentBold;
      let isItalic = parentItalic;
      
      // Enhanced bold detection - especially important for code content
      if (tagName === 'B' || tagName === 'STRONG' || 
          style.includes('font-weight: bold') || 
          style.includes('font-weight:bold') || 
          style.includes('font-weight: 700') || 
          style.includes('font-weight:700') ||
          style.includes('font-weight: bolder') ||
          style.includes('font-weight:bolder') ||
          className.includes('ql-font-weight-bold') ||
          className.includes('bold') ||
          element.hasAttribute('data-bold')) {
        isBold = true;
      }
      
      // Check for italic styling
      if (tagName === 'I' || tagName === 'EM' || 
          style.includes('font-style: italic') || 
          style.includes('font-style:italic') ||
          className.includes('ql-font-style-italic') ||
          className.includes('italic') ||
          element.hasAttribute('data-italic')) {
        isItalic = true;
      }
      
      // Extract color from inline style
      if (style) {
        const colorMatch = style.match(/color:\s*([^;]+)/i);
        if (colorMatch) {
          color = colorMatch[1].trim();
        }
      }
      
      // Handle line breaks and paragraphs
      if (tagName === 'BR') {
        segments.push({ text: '\n' });
        return;
      }
      
      if (tagName === 'P' && segments.length > 0) {
        segments.push({ text: '\n' });
      }
      
      // Process child nodes
      for (const child of Array.from(node.childNodes)) {
        processNode(child, isBold, isItalic, color);
      }
      
      // Add line break after paragraphs
      if (tagName === 'P' && element.nextSibling) {
        segments.push({ text: '\n' });
      }
    }
  };
  
  processNode(tempDiv);
  
  // Filter out empty segments and merge consecutive segments with same formatting
  const filteredSegments = segments.filter(seg => seg.text.trim() !== '' || seg.text === '\n');
  
  // Merge consecutive segments with identical formatting
  const mergedSegments: Array<{ text: string; bold?: boolean; italic?: boolean; color?: string }> = [];
  
  for (const segment of filteredSegments) {
    const lastSegment = mergedSegments[mergedSegments.length - 1];
    
    if (lastSegment && 
        lastSegment.bold === segment.bold && 
        lastSegment.italic === segment.italic && 
        lastSegment.color === segment.color &&
        segment.text !== '\n' && lastSegment.text !== '\n') {
      // Merge with previous segment
      lastSegment.text += segment.text;
    } else {
      // Add as new segment
      mergedSegments.push({ ...segment });
    }
  }
  
  return mergedSegments;
};

// Helper function to strip HTML and preserve basic formatting  
const stripHtml = (html: string): string => {
  return html
    .replace(/<br\s*\/?>(?=.)/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
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

// Improved item distribution for better page breaks
const distributeItemsToColumns = (items: ContentItem[], columns: PdfColumnCount): ContentItem[][] => {
  if (columns === 1) {
    return [items];
  }

  const columnArrays: ContentItem[][] = Array.from({ length: columns }, () => []);
  
  // Estimate content size for better distribution
  const itemSizes = items.map(item => {
    const contentLength = stripHtml(item.content).length;
    const titleLength = item.title ? item.title.length : 0;
    return contentLength + titleLength + 50; // Base size for styling
  });
  
  // Distribute items more evenly by size
  const columnSizes = Array(columns).fill(0);
  
  items.forEach((item, index) => {
    const smallestColumnIndex = columnSizes.indexOf(Math.min(...columnSizes));
    columnArrays[smallestColumnIndex].push(item);
    columnSizes[smallestColumnIndex] += itemSizes[index];
  });
  
  return columnArrays;
};

const CheatSheetPDF = ({ data, columns }: { data: CheatSheetData; columns: PdfColumnCount }) => {
  const palette = getPdfPalette(data.customCategory ? 'custom' : data.category);
  
  // Adjust items per page based on column count
  const maxItemsPerPage = columns === 1 ? 15 : columns === 2 ? 10 : 8;
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
                  {data.customCategory ? `CUSTOM: ${data.customCategory.toUpperCase()}` : data.category.toUpperCase()}
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

            <View style={columns === 1 ? styles.singleColumn : styles.columnsContainer}>
              {columnItems.map((columnContent, colIndex) => (
                <View key={colIndex} style={columns === 1 ? {} : styles.column}>
                  {columnContent.map((item) => (
                    <View key={item.id} style={styles.section} wrap={false}>
                      {item.title && (
                        <Text style={[styles.sectionTitle, { borderLeftColor: palette.accent }]}>
                          {item.title}
                        </Text>
                      )}
                      
                      <View style={styles.contentBox}>
                        {item.type === 'text' && (
                          <View>
                            {parseHtmlContent(item.content).map((segment, segIndex) => {
                              if (segment.text === '\n') {
                                return <Text key={segIndex} style={styles.textContent}>{'\n'}</Text>;
                              }
                              
                              let textStyle = styles.textContent;
                              if (segment.bold && segment.italic) {
                                textStyle = styles.boldItalicText;
                              } else if (segment.bold) {
                                textStyle = styles.boldText;
                              } else if (segment.italic) {
                                textStyle = styles.italicText;
                              }
                              
                              return (
                                <Text 
                                  key={segIndex} 
                                  style={[
                                    textStyle,
                                    segment.color && { color: segment.color },
                                  ]}
                                >
                                  {segment.text}
                                </Text>
                              );
                            })}
                          </View>
                        )}
                       
                       {item.type === 'math' && (
                         <Text style={styles.mathContent}>
                           {renderMathToText(stripHtml(item.content))}
                         </Text>
                       )}
                       
                       {item.type === 'code' && (
                         <View>
                           {parseHtmlContent(item.content, true).map((segment, segIndex) => {
                             if (segment.text === '\n') {
                               return <Text key={segIndex} style={styles.codeContent}>{'\n'}</Text>;
                             }
                             
                             const codeStyle = segment.bold ? styles.codeContentBold : styles.codeContent;
                             
                             return (
                               <Text 
                                 key={segIndex} 
                                 style={[
                                   codeStyle,
                                   segment.color && { color: segment.color },
                                 ]}
                               >
                                 {segment.text}
                               </Text>
                             );
                           })}
                         </View>
                       )}
                     </View>
                   </View>
                  ))}
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