import React from "react";

import { Editor } from "@tinymce/tinymce-react";

interface Props {
  notes: string | undefined;
  handleEditorUpdate: (note: string, type: string) => void;
}

export const NoteEditor = ({ notes, handleEditorUpdate }: Props) => {
  return (
    <div>
      <Editor
        initialValue={notes}
        apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
        init={{
          setup(editor) {
            editor.on("init", () => {
              handleEditorUpdate(editor.getContent(), "init");
            });
            editor.on("change", () => {
              handleEditorUpdate(editor.getContent(), "change");
            });
            editor.on("submit", (event) => {
              event.preventDefault();
              handleEditorUpdate(editor.getContent(), "submit");
            });
          },

          content_css: "dark",
          skin: "oxide-dark",
          resize: false,
          min_height: 480,
          max_height: 480,

          menubar: true,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "help",
            "wordcount",
            "emoticons",
            // "save",
          ],
          toolbar:
            "bold italic backcolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "removeformat | help | emoticons",
          content_style:
            "body { font-family:monospace,Arial,sans-serif; font-size:16px }",
        }}
      />
    </div>
  );
};
