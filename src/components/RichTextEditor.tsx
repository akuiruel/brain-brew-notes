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
  console.log('RichTextEditor rendered with value:', value);
  
  const modules = {
    toolbar: {
      container: [
        [{ 'color': ['#000000', '#e60000', '#ff9900', '#ffff00', '#008a00', '#0066cc', '#9933ff', '#ffffff', '#facccc', '#ffebcc', '#ffffcc', '#cce8cc', '#cce0f5', '#ebd6ff', '#bbbbbb', '#f06666', '#ffc266', '#ffff66', '#66b966', '#66a3e0', '#c285ff', '#888888', '#a10000', '#b26b00', '#b2b200', '#006100', '#0047b2', '#6b24b2', '#444444', '#5c0000', '#663d00', '#666600', '#003700', '#002966', '#3d1466'] }, { 'background': ['#000000', '#e60000', '#ff9900', '#ffff00', '#008a00', '#0066cc', '#9933ff', '#ffffff', '#facccc', '#ffebcc', '#ffffcc', '#cce8cc', '#cce0f5', '#ebd6ff', '#bbbbbb', '#f06666', '#ffc266', '#ffff66', '#66b966', '#66a3e0', '#c285ff', '#888888', '#a10000', '#b26b00', '#b2b200', '#006100', '#0047b2', '#6b24b2', '#444444', '#5c0000', '#663d00', '#666600', '#003700', '#002966', '#3d1466'] }],
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean']
      ]
    },
  };

  const formats = [
    'color', 'background', 'bold', 'italic', 'underline',
    'list', 'bullet', 'link', 'image'
  ];

  const handleChange = (content: string) => {
    console.log('RichTextEditor content changed:', content);
    onChange(content);
  };

  return (
    <div className={className}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{
          backgroundColor: 'hsl(var(--background))',
        }}
      />
      <style>{`
        .ql-toolbar {
          border: 1px solid hsl(var(--border));
          border-bottom: none;
          border-radius: 0.375rem 0.375rem 0 0;
          background: hsl(var(--background));
        }
        .ql-container {
          border: 1px solid hsl(var(--border));
          border-radius: 0 0 0.375rem 0.375rem;
          font-family: inherit;
          background: hsl(var(--background));
        }
        .ql-editor {
          min-height: 100px;
          font-family: inherit;
          color: hsl(var(--foreground));
          background: hsl(var(--background));
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
        .ql-snow .ql-picker-options {
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
        }
        .ql-snow .ql-picker-item:hover {
          background: hsl(var(--muted));
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;