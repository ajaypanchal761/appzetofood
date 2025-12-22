import { useState, useRef, useEffect } from "react"
import { FileText } from "lucide-react"

export default function TermsAndCondition() {
  const [activeLanguage, setActiveLanguage] = useState("default")
  const editorRef = useRef(null)
  const [content, setContent] = useState(`This is a test Teams & Conditions

Terms of Use

This Terms of Use ("Terms") applies to your access to and use of the website (www.StackFood.6amtech.com) and the "StackFood" mobile application (collectively, the "Platform"). Please read these Terms carefully. If you do not agree with these Terms, please do not download, install, access, or use the Platform. By downloading, installing, accessing, or using the Platform, you agree to be bound by these Terms of Use and other StackFood policies (including but not limited to Cancellation & Refund, Privacy Policy) as may be applicable to you. These Terms are effective from the date you download, install, access, or use the Platform.

The Platforms are for (i) natural persons aged 18 years or older and (ii) corporate legal entities. The terms may be subject to country-specific provisions.

USE OF PLATFORM AND SERVICES`)

  // Initialize editor content on mount
  useEffect(() => {
    if (editorRef.current) {
      const formattedContent = content.split('\n').map(line => {
        if (line.trim() === '') return '<br>'
        if (line === line.toUpperCase() && line.length > 5 && !line.includes('(')) {
          return `<strong>${line}</strong>`
        }
        return line
      }).join('<br>')
      editorRef.current.innerHTML = formattedContent
    }
  }, [])

  const languages = [
    { id: "default", label: "Default" },
    { id: "en", label: "English(EN)" },
    { id: "bn", label: "Bengali - বাংলা(BN)" },
    { id: "ar", label: "Arabic - العربية (AR)" },
    { id: "es", label: "Spanish - español(ES)" }
  ]

  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  const handleContentChange = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Content:", content)
    // Handle form submission
  }

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Terms And Condition</h1>
        </div>

        {/* Language Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-2 mb-4">
          <div className="flex gap-2 border-b border-slate-200 pb-2">
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setActiveLanguage(lang.id)}
                className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                  activeLanguage === lang.id
                    ? "text-blue-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {lang.label}
                {activeLanguage === lang.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Rich Text Editor */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          {/* Toolbar */}
          <div className="border-b border-slate-200 p-2 bg-slate-50">
            {/* Row 1 */}
            <div className="flex flex-wrap gap-1 mb-2">
              <button
                type="button"
                onClick={() => executeCommand("formatBlock", "div")}
                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white"
                title="Source"
              >
                Source
              </button>
              <button
                type="button"
                onClick={() => executeCommand("cut")}
                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white"
                title="Cut"
              >
                ✂
              </button>
              <button
                type="button"
                onClick={() => executeCommand("copy")}
                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white"
                title="Copy"
              >
                📋
              </button>
              <button
                type="button"
                onClick={() => executeCommand("paste")}
                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white"
                title="Paste"
              >
                📄
              </button>
              <button
                type="button"
                onClick={() => executeCommand("undo")}
                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white"
                title="Undo"
              >
                ↶
              </button>
              <button
                type="button"
                onClick={() => executeCommand("redo")}
                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white"
                title="Redo"
              >
                ↷
              </button>
              <button
                type="button"
                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white"
                title="Spell Check"
              >
                ABC-
              </button>
            </div>

            {/* Row 2 */}
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => executeCommand("bold")}
                className="px-2 py-1 text-xs font-bold border border-slate-300 rounded hover:bg-white"
                title="Bold"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => executeCommand("italic")}
                className="px-2 py-1 text-xs italic border border-slate-300 rounded hover:bg-white"
                title="Italic"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => executeCommand("underline")}
                className="px-2 py-1 text-xs underline border border-slate-300 rounded hover:bg-white"
                title="Underline"
              >
                U
              </button>
              <button
                type="button"
                onClick={() => executeCommand("strikeThrough")}
                className="px-2 py-1 text-xs line-through border border-slate-300 rounded hover:bg-white"
                title="Strikethrough"
              >
                S
              </button>
              <button
                type="button"
                onClick={() => executeCommand("subscript")}
                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white"
                title="Subscript"
              >
                x₂
              </button>
              <button
                type="button"
                onClick={() => executeCommand("superscript")}
                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white"
                title="Superscript"
              >
                x²
              </button>
              <button
                type="button"
                onClick={() => executeCommand("removeFormat")}
                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white"
                title="Remove Format"
              >
                ⚡
              </button>
              <div className="w-px h-6 bg-slate-300 mx-1"></div>
              <button
                type="button"
                onClick={() => executeCommand("justifyLeft")}
                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white"
                title="Align Left"
              >
                ⬅
              </button>
              <button
                type="button"
                onClick={() => executeCommand("justifyCenter")}
                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white"
                title="Align Center"
              >
                ⬌
              </button>
              <button
                type="button"
                onClick={() => executeCommand("justifyRight")}
                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white"
                title="Align Right"
              >
                ➡
              </button>
              <button
                type="button"
                onClick={() => executeCommand("justifyFull")}
                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white"
                title="Justify"
              >
                ⬄
              </button>
              <div className="w-px h-6 bg-slate-300 mx-1"></div>
              <button
                type="button"
                onClick={() => executeCommand("insertUnorderedList")}
                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white"
                title="Bullet List"
              >
                •
              </button>
              <button
                type="button"
                onClick={() => executeCommand("insertOrderedList")}
                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white"
                title="Numbered List"
              >
                1.
              </button>
              <button
                type="button"
                onClick={() => executeCommand("outdent")}
                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white"
                title="Decrease Indent"
              >
                ⬅
              </button>
              <button
                type="button"
                onClick={() => executeCommand("indent")}
                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white"
                title="Increase Indent"
              >
                ➡
              </button>
              <button
                type="button"
                onClick={() => executeCommand("formatBlock", "blockquote")}
                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white"
                title="Blockquote"
              >
                "
              </button>
              <div className="w-px h-6 bg-slate-300 mx-1"></div>
              <button
                type="button"
                onClick={() => {
                  const url = prompt("Enter URL:")
                  if (url) executeCommand("createLink", url)
                }}
                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white"
                title="Link"
              >
                🔗
              </button>
              <button
                type="button"
                onClick={() => executeCommand("unlink")}
                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white"
                title="Unlink"
              >
                🔗✕
              </button>
              <button
                type="button"
                onClick={() => {
                  const url = prompt("Enter image URL:")
                  if (url) executeCommand("insertImage", url)
                }}
                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white"
                title="Image"
              >
                🖼
              </button>
              <button
                type="button"
                onClick={() => {
                  const rows = prompt("Number of rows:", "2")
                  const cols = prompt("Number of columns:", "2")
                  if (rows && cols && editorRef.current) {
                    let tableHTML = "<table border='1' style='border-collapse: collapse; width: 100%;'><tbody>"
                    for (let i = 0; i < parseInt(rows); i++) {
                      tableHTML += "<tr>"
                      for (let j = 0; j < parseInt(cols); j++) {
                        tableHTML += "<td style='border: 1px solid #ccc; padding: 8px;'>&nbsp;</td>"
                      }
                      tableHTML += "</tr>"
                    }
                    tableHTML += "</tbody></table>"
                    const selection = window.getSelection()
                    const range = selection.getRangeAt(0)
                    range.deleteContents()
                    const tempDiv = document.createElement('div')
                    tempDiv.innerHTML = tableHTML
                    const fragment = document.createDocumentFragment()
                    while (tempDiv.firstChild) {
                      fragment.appendChild(tempDiv.firstChild)
                    }
                    range.insertNode(fragment)
                    editorRef.current.focus()
                  }
                }}
                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white"
                title="Table"
              >
                ⧉
              </button>
              <button
                type="button"
                onClick={() => executeCommand("insertHorizontalRule")}
                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white"
                title="Horizontal Rule"
              >
                ─
              </button>
              <button
                type="button"
                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white"
                title="Special Character"
              >
                Ω
              </button>
              <div className="w-px h-6 bg-slate-300 mx-1"></div>
              <select
                onChange={(e) => executeCommand("formatBlock", e.target.value)}
                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white bg-white"
                title="Styles"
              >
                <option value="div">Styles</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="p">Paragraph</option>
              </select>
              <select
                onChange={(e) => executeCommand("formatBlock", e.target.value)}
                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white bg-white"
                title="Format"
              >
                <option value="div">Format</option>
                <option value="p">Normal</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="pre">Preformatted</option>
              </select>
              <button
                type="button"
                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white"
                title="Maximize"
              >
                ⛶
              </button>
              <button
                type="button"
                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white"
                title="Help"
              >
                ?
              </button>
            </div>
          </div>

          {/* Editor Content Area */}
          <div className="p-4">
            <div
              ref={editorRef}
              contentEditable
              onInput={handleContentChange}
              suppressContentEditableWarning
              className="min-h-[400px] p-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-700 leading-relaxed overflow-y-auto"
              style={{
                whiteSpace: "pre-wrap",
                wordWrap: "break-word"
              }}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}
