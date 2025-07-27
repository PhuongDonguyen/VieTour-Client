import React from 'react';
import { Editor } from '@tinymce/tinymce-react';
import type { Editor as TinyMCEEditorType } from 'tinymce';

interface TinyMCEEditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
    className?: string;
}

const TinyMCEEditor: React.FC<TinyMCEEditorProps> = ({
    value,
    onChange,
    placeholder = "Nội dung bài viết...",
    className = ""
}) => {
    return (
        <div className={className}>
            <Editor
                apiKey={`${import.meta.env.VITE_TINYMCE_API_KEY}`} // Use environment variable for API key
                value={value}
                onEditorChange={(content) => onChange(content)}
                init={{
                    height: 400,
                    menubar: false,
                    plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
                        'emoticons', 'template', 'codesample'
                    ],
                    toolbar: 'undo redo | blocks | ' +
                        'bold italic forecolor | alignleft aligncenter ' +
                        'alignright alignjustify | bullist numlist outdent indent | ' +
                        'removeformat | link image media | code preview | help',
                    content_style: `
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
              font-size: 14px;
              line-height: 1.6;
              margin: 1rem;
            }
            h1, h2, h3, h4, h5, h6 {
              margin-top: 1.5rem;
              margin-bottom: 0.5rem;
              font-weight: 600;
            }
            p {
              margin-bottom: 1rem;
            }
            blockquote {
              border-left: 4px solid #e5e7eb;
              margin: 1.5rem 0;
              padding-left: 1rem;
              font-style: italic;
              color: #6b7280;
            }
            ul, ol {
              margin-bottom: 1rem;
              padding-left: 1.5rem;
            }
            li {
              margin-bottom: 0.25rem;
            }
          `,
                    placeholder: placeholder,
                    branding: false,
                    resize: false,
                    statusbar: false,
                    skin: 'oxide',
                    content_css: 'default',
                    setup: (editor: TinyMCEEditorType) => {
                        editor.on('init', () => {
                            // Custom styling after editor loads
                            const editorDoc = editor.getDoc();
                            const editorBody = editorDoc.body;

                            // Apply dark mode styles if needed
                            if (document.documentElement.classList.contains('dark')) {
                                editorBody.style.backgroundColor = '#1f2937';
                                editorBody.style.color = '#f9fafb';
                            }
                        });
                    }
                }}
            />
        </div>
    );
};

export default TinyMCEEditor;
