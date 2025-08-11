'use client';

import React, { useEffect, useRef } from 'react';
import EditorJS from '@editorjs/editorjs';
// @ts-ignore
import Header from '@editorjs/header';
// @ts-ignore
import List from '@editorjs/list';
// @ts-ignore
import ImageTool from '@editorjs/image';
// @ts-ignore
import Quote from '@editorjs/quote';


interface RichTextEditorProps {
    id?: string;
    data: any;
    onChange: (data: any) => void;
    placeholder?: string;
}

const RichTextEditor = ({ id = "editorjs", data, onChange, placeholder }: RichTextEditorProps) => {
    const editorRef = useRef<EditorJS | null>(null);

    useEffect(() => {
        if (!editorRef.current) {
            const editor = new EditorJS({
                holder: id,
                tools: { 
                    header: Header, 
                    list: List,
                    quote: {
                        class: Quote,
                        inlineToolbar: true,
                        config: {
                          quotePlaceholder: 'Iqtibos matnini kiriting',
                          captionPlaceholder: 'Muallif (ixtiyoriy)',
                        },
                    },
                    image: {
                        class: ImageTool,
                        config: {
                          /**
                           * Custom uploader
                           */
                          uploader: {
                            /**
                             * Upload file to the server and return an uploaded image data
                             */
                            async uploadByFile(file: File) {
                              const reader = new FileReader();
                              
                              return new Promise((resolve, reject) => {
                                reader.onload = (event) => {
                                   resolve({
                                    success: 1,
                                    file: {
                                      url: event.target?.result,
                                    }
                                  });
                                };
                                
                                reader.onerror = (error) => {
                                  reject(error);
                                };
                                
                                reader.readAsDataURL(file);
                              });
                            },
                          },
                        },
                      },
                },
                data: data || undefined,
                placeholder: placeholder || "Yozishni boshlang...",
                async onChange(api) {
                    const savedData = await api.saver.save();
                    onChange(savedData);
                },
            });
            editorRef.current = editor;
        }

        return () => {
            if (editorRef.current && editorRef.current.destroy) {
                editorRef.current.destroy();
                editorRef.current = null;
            }
        };
    }, []);

    return (
        <div id={id} className="prose dark:prose-invert max-w-none border rounded-md p-2 sm:p-4 min-h-[400px] bg-background" />
    );
};

export default RichTextEditor;
