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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundColor: '#667eea',
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
    backgroundColor: '#4c1d95',
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
    color: '#1e293b',
    backgroundColor: '#f1f5f9',
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderLeft: '4 solid #667eea',
  },
  contentBox: {
    backgroundColor: '#fefefe',
    padding: 16,
    borderRadius: 8,
    border: '1 solid #e2e8f0',
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
    border: '1 solid #d1fae5',
  },
  math: {
    fontSize: 12,
    lineHeight: 1.5,
    backgroundColor: '#fef3e2',
    color: '#d97706',
    padding: 8,
    borderRadius: 6,
    border: '1 solid #fed7aa',
  },
  pageBreak: {
    marginTop: 25,
    borderTop: '2 solid #e5e7eb',
    paddingTop: 25,
  },
});

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
    .replace(/<br\s*\/?>/gi, '\n')
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

const CheatSheetPDF = ({ data }: { data: CheatSheetData }) => {
  // Split content into chunks for better page management
  const itemsPerPage = 6; // Adjust based on content density
  const pages: ContentItem[][] = [];
  
  for (let i = 0; i < data.content.items.length; i += itemsPerPage) {
    pages.push(data.content.items.slice(i, i + itemsPerPage));
  }

  return (
    <Document>
      {pages.map((pageItems, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page} wrap>
          {pageIndex === 0 && (
            <View style={styles.header}>
              <Text style={styles.title}>{data.title}</Text>
              {data.description && (
                <Text style={styles.description}>{data.description}</Text>
              )}
              <Text style={styles.category}>{data.category.toUpperCase()}</Text>
            </View>
          )}

          {pageIndex > 0 && (
            <View style={styles.pageBreak}>
              <Text style={[styles.title, { color: '#1e3a8a', fontSize: 18 }]}>
                {data.title} (continued)
              </Text>
            </View>
          )}

          {pageItems.map((item, index) => (
            <View key={item.id} style={styles.section} wrap={false}>
              {item.title && (
                <Text style={styles.sectionTitle}>{item.title}</Text>
              )}
              
              <View style={styles.contentBox}>
                {item.type === 'text' && (
                  <View>
                    {parseHtmlContent(item.content).map((segment, segIndex) => (
                      <Text 
                        key={segIndex}
                        style={[
                          styles.text, 
                          { color: segment.color || item.color || '#000000' }
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
                          { color: segment.color || item.color || '#000000' }
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
                          { color: segment.color || item.color || '#000000' }
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
        </Page>
      ))}
    </Document>
  );
};

export const exportToPDF = async (data: CheatSheetData): Promise<void> => {
  try {
    const blob = await pdf(<CheatSheetPDF data={data} />).toBlob();
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