import { useState } from 'react';
import { addStyles, EditableMathField } from 'react-mathquill';
import RichTextEditor from './RichTextEditor';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Calculator, Type } from 'lucide-react';

// Initialize MathQuill
addStyles();

interface MathRichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const MathRichTextEditor = ({ value, onChange, placeholder, className }: MathRichTextEditorProps) => {
  const [activeTab, setActiveTab] = useState('text');
  const [mathValue, setMathValue] = useState('');

  const handleMathInsert = () => {
    const mathHtml = `<span class="math-formula" data-latex="${mathValue}">\\(${mathValue}\\)</span>`;
    const newContent = value + mathHtml;
    onChange(newContent);
    setMathValue('');
  };

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="text" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Text Editor
          </TabsTrigger>
          <TabsTrigger value="math" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Math Formula
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="text" className="mt-4">
          <RichTextEditor
            value={value}
            onChange={onChange}
            placeholder={placeholder}
          />
        </TabsContent>
        
        <TabsContent value="math" className="mt-4 space-y-4">
          <div className="border rounded-md p-4 bg-background">
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">Enter Math Formula:</label>
              <div className="border rounded-md p-3 bg-background min-h-[60px] flex items-center">
                <EditableMathField
                  latex={mathValue}
                  onChange={(mathField) => {
                    setMathValue(mathField.latex());
                  }}
                  config={{
                    spaceBehavesLikeTab: true,
                    leftRightIntoCmdGoes: 'up',
                    restrictMismatchedBrackets: true,
                    sumStartsWithNEquals: true,
                    supSubsRequireOperand: true,
                    charsThatBreakOutOfSupSub: '+-=<>',
                    autoSubscriptNumerals: true,
                    autoCommands: 'pi theta sqrt sum prod alpha beta gamma delta epsilon zeta eta lambda mu nu xi rho sigma tau phi chi psi omega',
                    autoOperatorNames: 'sin cos tan log ln exp lim max min',
                  }}
                  style={{
                    fontSize: '18px',
                    width: '100%',
                    minHeight: '40px',
                    border: 'none',
                    outline: 'none'
                  }}
                />
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Use keyboard shortcuts: ^ for superscript, _ for subscript, sqrt for square root, frac for fractions
              </div>
            </div>
            
            {mathValue && (
              <div className="mb-4 p-3 border rounded-md bg-muted/50">
                <label className="text-xs text-muted-foreground block mb-2">Preview:</label>
                <div className="text-lg" dangerouslySetInnerHTML={{ __html: `\\(${mathValue}\\)` }} />
              </div>
            )}
            
            <Button onClick={handleMathInsert} disabled={!mathValue} className="w-full">
              Insert Formula into Text
            </Button>
          </div>
          
          <div className="border rounded-md p-4 bg-muted/50">
            <label className="text-sm font-medium mb-2 block">Current Text Content:</label>
            <RichTextEditor
              value={value}
              onChange={onChange}
              placeholder="Math formulas will be inserted here..."
            />
          </div>
        </TabsContent>
      </Tabs>
      
      <style>{`
        .math-formula {
          display: inline-block;
          margin: 0 2px;
          padding: 2px 4px;
          background: hsl(var(--muted));
          border-radius: 4px;
          border: 1px solid hsl(var(--border));
        }
      `}</style>
    </div>
  );
};

export default MathRichTextEditor;