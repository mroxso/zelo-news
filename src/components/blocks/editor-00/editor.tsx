"use client"

import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { EditorState, SerializedEditorState } from "lexical"
import { $convertFromMarkdownString, TRANSFORMERS } from "@lexical/markdown"

import { editorTheme } from "@/components/editor/themes/editor-theme"
import { TooltipProvider } from "@/components/ui/tooltip"

import { nodes } from "./nodes"
import { Plugins } from "./plugins"

const editorConfig: InitialConfigType = {
  namespace: "Editor",
  theme: editorTheme,
  nodes,
  onError: (error: Error) => {
    console.error(error)
  },
}

export function Editor({
  editorState,
  editorSerializedState,
  initialMarkdown,
  onChange,
  onSerializedChange,
}: {
  editorState?: EditorState
  editorSerializedState?: SerializedEditorState
  initialMarkdown?: string
  onChange?: (editorState: EditorState) => void
  onSerializedChange?: (editorSerializedState: SerializedEditorState) => void
}) {
  const resolvedInitialEditorState = editorState
    ? editorState
    : initialMarkdown !== undefined
      ? () => {
          $convertFromMarkdownString(initialMarkdown, TRANSFORMERS)
        }
      : editorSerializedState
        ? JSON.stringify(editorSerializedState)
        : undefined

  return (
    <div className="bg-background overflow-hidden rounded-lg border shadow">
      <LexicalComposer
        initialConfig={{
          ...editorConfig,
          ...(resolvedInitialEditorState
            ? { editorState: resolvedInitialEditorState }
            : {}),
        }}
      >
        <TooltipProvider>
          <Plugins />

          <OnChangePlugin
            ignoreSelectionChange={true}
            onChange={(editorState) => {
              onChange?.(editorState)
              onSerializedChange?.(editorState.toJSON())
            }}
          />
        </TooltipProvider>
      </LexicalComposer>
    </div>
  )
}
