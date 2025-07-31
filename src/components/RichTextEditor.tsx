import { useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor = ({ value, onChange, placeholder, className }: RichTextEditorProps) => {
  const quillRef = useRef<ReactQuill>(null);

  const modules = {
    toolbar: [
      [{ 'color': [] }, { 'background': [] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ],
  };

  const formats = [
    'color', 'background', 'bold', 'italic', 'underline',
    'list', 'bullet'
  ];

  return (
    <div className={className}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{
          '--ql-font-family': 'inherit',
        } as any}
      />
      <style>{`
        .ql-toolbar {
          border: 1px solid hsl(var(--border));
          border-bottom: none;
          border-radius: 0.375rem 0.375rem 0 0;
        }
        .ql-container {
          border: 1px solid hsl(var(--border));
          border-radius: 0 0 0.375rem 0.375rem;
          font-family: inherit;
        }
        .ql-editor {
          min-height: 100px;
          font-family: inherit;
          color: hsl(var(--foreground));
        }
        .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
          font-style: normal;
        }
        .ql-snow .ql-picker-label {
          color: hsl(var(--foreground));
        }
        .ql-snow .ql-stroke {
          stroke: hsl(var(--foreground));
        }
        .ql-snow .ql-fill {
          fill: hsl(var(--foreground));
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;