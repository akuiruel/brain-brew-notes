import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathEditorProps {
  initialValue?: string;
  onChange: (latex: string) => void;
}

const MathEditor = ({ initialValue = '', onChange }: MathEditorProps) => {
  const [latex, setLatex] = useState(initialValue);
  const [error, setError] = useState<string>('');
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (previewRef.current && latex) {
      try {
        katex.render(latex, previewRef.current, {
          throwOnError: true,
          displayMode: true,
        });
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid LaTeX');
      }
    } else if (previewRef.current) {
      previewRef.current.innerHTML = '';
    }
  }, [latex]);

  const handleLatexChange = (value: string) => {
    setLatex(value);
    onChange(value);
  };

  const insertSymbol = (symbol: string) => {
    setLatex(prev => prev + symbol);
    onChange(latex + symbol);
  };

  const commonSymbols = [
    { label: 'Fraction', latex: '\\frac{a}{b}' },
    { label: 'Power', latex: '^{n}' },
    { label: 'Subscript', latex: '_{n}' },
    { label: 'Square root', latex: '\\sqrt{x}' },
    { label: 'Nth root', latex: '\\sqrt[n]{x}' },
    { label: 'Sum', latex: '\\sum_{i=1}^{n}' },
    { label: 'Integral', latex: '\\int_{a}^{b}' },
    { label: 'Alpha', latex: '\\alpha' },
    { label: 'Beta', latex: '\\beta' },
    { label: 'Pi', latex: '\\pi' },
    { label: 'Infinity', latex: '\\infty' },
    { label: 'Plus/minus', latex: '\\pm' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="latex-input">LaTeX Formula</Label>
        <Input
          id="latex-input"
          value={latex}
          onChange={(e) => handleLatexChange(e.target.value)}
          placeholder="Enter LaTeX formula (e.g., \\frac{a}{b})"
          className="font-mono"
        />
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </div>
      )}

      <div className="border border-border rounded-lg p-4 min-h-[100px] bg-card">
        <Label className="text-sm text-muted-foreground">Preview:</Label>
        <div 
          ref={previewRef} 
          className="mt-2 text-center"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {commonSymbols.map((symbol) => (
          <Button
            key={symbol.label}
            variant="outline"
            size="sm"
            onClick={() => insertSymbol(symbol.latex)}
            className="text-xs"
          >
            {symbol.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MathEditor;