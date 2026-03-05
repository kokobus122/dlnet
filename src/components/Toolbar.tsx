import { type Editor } from "@tiptap/react";
import { Toggle } from "./ui/toggle";
import { LinkDialog } from "./LinkDialog";
import { useState } from "react";
import {
  Bold,
  Heading2,
  Italic,
  List,
  ListOrdered,
  StrikethroughIcon,
  Link,
} from "lucide-react";

type Props = {
  editor: Editor | null;
};

function ToolBar({ editor }: Props) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);

  if (!editor) {
    return null;
  }

  return (
    <>
      <div className="flex gap-3 border border-input rounded-lg p-1 my-2">
        <Toggle
          size="sm"
          pressed={editor.isActive("heading")}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("strike")}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        >
          <StrikethroughIcon className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("link")}
          onPressedChange={() => {
            if (editor.isActive("link")) {
              editor.chain().focus().unsetLink().run();
            } else {
              setLinkDialogOpen(true);
            }
          }}
        >
          <Link className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("bulletList")}
          onPressedChange={() =>
            editor.chain().focus().toggleBulletList().run()
          }
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("orderedList")}
          onPressedChange={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
      </div>
      <LinkDialog
        editor={editor}
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
      />
    </>
  );
}

export default ToolBar;
