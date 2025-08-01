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
    marginBottom: 20,
    borderBottom: 1,
    borderBottomColor: '#1e3a8a',
    paddingBottom: 10,
    backgroundColor: '#1e3a8a',
    padding: 20,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#ffffff',
  },
  description: {
    fontSize: 12,
    color: '#e0e7ff',
    marginBottom: 5,
  },
  category: {
    fontSize: 10,
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    padding: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  section: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f9f9f9',
    border: '1 solid #e0e0e0',
    borderRadius: 6,
    breakInside: 'avoid',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e3a8a',
    backgroundColor: '#ffffff',
    padding: 6,
    borderRadius: 4,
  },
  contentBox: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 4,
    border: '1 solid #d1d5db',
  },
  text: {
    fontSize: 11,
    lineHeight: 1.5,
    textAlign: 'justify',
  },
  code: {
    fontSize: 10,
    fontFamily: 'Courier',
    backgroundColor: '#f8f9fa',
    lineHeight: 1.4,
  },
  math: {
    fontSize: 11,
    lineHeight: 1.4,
    backgroundColor: '#f0f8ff',
  },
  pageBreak: {
    marginTop: 20,
    borderTop: '1 solid #e0e0e0',
    paddingTop: 20,
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