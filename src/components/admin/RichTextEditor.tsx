import { useRef, useEffect, useState } from 'react';
import { Bold, Italic, List, ListOrdered, Link, Image, AlignLeft, AlignCenter, AlignRight, Heading2 } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isInitialized.current) {
      // Set initial content
      editorRef.current.innerHTML = value || '<p><br></p>';

      // Force left-to-right text direction
      editorRef.current.style.direction = 'ltr';
      editorRef.current.style.textAlign = 'left';
      editorRef.current.setAttribute('dir', 'ltr');

      isInitialized.current = true;
    }

    // Set default paragraph separator
    try {
      document.execCommand('defaultParagraphSeparator', false, 'p');
    } catch (e) {
      console.log('Could not set paragraph separator');
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleFocus = () => {
    if (editorRef.current && !value) {
      editorRef.current.innerHTML = '<p><br></p>';

      const range = document.createRange();
      const sel = window.getSelection();
      const p = editorRef.current.querySelector('p');
      if (p && sel) {
        range.setStart(p, 0);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      document.execCommand('formatBlock', false, 'p');
    }
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const formatButtons = [
    { icon: Bold, command: 'bold', title: 'Bold (Ctrl+B)' },
    { icon: Italic, command: 'italic', title: 'Italic (Ctrl+I)' },
    { icon: Heading2, command: 'formatBlock', value: 'h2', title: 'Heading' },
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
    { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left' },
    { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center' },
    { icon: AlignRight, command: 'justifyRight', title: 'Align Right' },
  ];

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
        {formatButtons.map((btn, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => execCommand(btn.command, btn.value)}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title={btn.title}
          >
            <btn.icon size={18} className="text-gray-700" />
          </button>
        ))}
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={insertLink}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Insert Link"
        >
          <Link size={18} className="text-gray-700" />
        </button>
        <button
          type="button"
          onClick={insertImage}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Insert Image"
        >
          <Image size={18} className="text-gray-700" />
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        className="min-h-[400px] p-4 focus:outline-none prose prose-lg max-w-none article-content"
        suppressContentEditableWarning
        style={{
          wordWrap: 'break-word',
          direction: 'ltr',
          textAlign: 'left',
          unicodeBidi: 'embed'
        }}
        dir="ltr"
        lang="en"
        data-placeholder={!value ? (placeholder || 'Start writing your article...') : ''}
      />

      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
        Tip: Select text and use the toolbar to format. Press Enter for new paragraphs.
      </div>
    </div>
  );
}
