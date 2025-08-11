'use client';

import React, { useEffect, useRef } from 'react';
import EditorJS from '@editorjs/editorjs';
// @ts-ignore
import Header from '@editorjs/header';
// @ts-ignore
import List from '@editorjs/list';

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
                    list: List 
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
        <div id={id} className="prose dark:prose-invert max-w-none border rounded-md p-4 min-h-[400px] bg-background" />
    );
};

export default RichTextEditor;
