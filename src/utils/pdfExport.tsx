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
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333333',
  },
  text: {
    fontSize: 11,
    lineHeight: 1.4,
    textAlign: 'justify',
  },
  code: {
    fontSize: 10,
    fontFamily: 'Courier',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 4,
    lineHeight: 1.3,
  },
  math: {
    fontSize: 12,
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 4,
    marginVertical: 5,
  },
});

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

const CheatSheetPDF = ({ data }: { data: CheatSheetData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{data.title}</Text>
        {data.description && (
          <Text style={styles.description}>{data.description}</Text>
        )}
        <Text style={styles.category}>{data.category.toUpperCase()}</Text>
      </View>

      {data.content.items.map((item, index) => (
        <View key={item.id} style={styles.section}>
          {item.title && (
            <Text style={styles.sectionTitle}>{item.title}</Text>
          )}
          
          {item.type === 'text' && (
            <Text style={[styles.text, { color: item.color || '#000000' }]}>{item.content}</Text>
          )}
          
          {item.type === 'math' && (
            <Text style={[styles.math, { color: item.color || '#000000' }]}>
              {renderMathToText(item.content)}
            </Text>
          )}
          
          {item.type === 'code' && (
            <Text style={[styles.code, { color: item.color || '#000000' }]}>{item.content}</Text>
          )}
        </View>
      ))}
    </Page>
  </Document>
);

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