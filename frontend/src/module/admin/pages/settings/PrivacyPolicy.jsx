import { useState, useRef, useEffect } from "react"

export default function PrivacyPolicy() {
  const [activeLanguage, setActiveLanguage] = useState("default")
  const editorRef = useRef(null)
  const [content, setContent] = useState(`StackFood is a complete Multi-vendor Foodkind of products delivery system developed with powerful admin panel will help you to control your business smartly.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`)

  useEffect(() => {
    if (editorRef.current) {
      const formattedContent = content.split('\n').map(line => {
        if (line.trim() === '') return '<br>'
        return line
      }).join('<br>')
      editorRef.current.innerHTML = formattedContent
    }
  }, [])

  const languages = [
    { id: "default", label: "Default" },
    { id: "en", label: "English(EN)" },
    { id: "bn", label: "Bengali - বাংলা (BN)" },
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
  }

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Privacy Policy</h1>
        </div>

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

        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="border-b border-slate-200 p-2 bg-slate-50">
            <div className="flex flex-wrap gap-1 mb-2">
              <button type="button" onClick={() => executeCommand("formatBlock", "div")} className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white">Source</button>
              <button type="button" onClick={() => executeCommand("cut")} className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white">✂</button>
              <button type="button" onClick={() => executeCommand("copy")} className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white">📋</button>
              <button type="button" onClick={() => executeCommand("paste")} className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white">📄</button>
              <button type="button" onClick={() => executeCommand("undo")} className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white">↶</button>
              <button type="button" onClick={() => executeCommand("redo")} className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white">↷</button>
              <button type="button" className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white">ABC-</button>
            </div>
            <div className="flex flex-wrap gap-1">
              <button type="button" onClick={() => executeCommand("bold")} className="px-2 py-1 text-xs font-bold border border-slate-300 rounded hover:bg-white">B</button>
              <button type="button" onClick={() => executeCommand("italic")} className="px-2 py-1 text-xs italic border border-slate-300 rounded hover:bg-white">I</button>
              <button type="button" onClick={() => executeCommand("underline")} className="px-2 py-1 text-xs underline border border-slate-300 rounded hover:bg-white">U</button>
              <button type="button" onClick={() => executeCommand("strikeThrough")} className="px-2 py-1 text-xs line-through border border-slate-300 rounded hover:bg-white">S</button>
              <button type="button" onClick={() => executeCommand("subscript")} className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white">x₂</button>
              <button type="button" onClick={() => executeCommand("superscript")} className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white">x²</button>
              <button type="button" onClick={() => executeCommand("removeFormat")} className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white">⚡</button>
              <div className="w-px h-6 bg-slate-300 mx-1"></div>
              <button type="button" onClick={() => executeCommand("justifyLeft")} className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white">⬅</button>
              <button type="button" onClick={() => executeCommand("justifyCenter")} className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white">⬌</button>
              <button type="button" onClick={() => executeCommand("justifyRight")} className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white">➡</button>
              <button type="button" onClick={() => executeCommand("justifyFull")} className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white">⬄</button>
              <div className="w-px h-6 bg-slate-300 mx-1"></div>
              <button type="button" onClick={() => executeCommand("insertUnorderedList")} className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white">•</button>
              <button type="button" onClick={() => executeCommand("insertOrderedList")} className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white">1.</button>
              <button type="button" onClick={() => executeCommand("outdent")} className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white">⬅</button>
              <button type="button" onClick={() => executeCommand("indent")} className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white">➡</button>
              <button type="button" onClick={() => executeCommand("formatBlock", "blockquote")} className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white">"</button>
              <div className="w-px h-6 bg-slate-300 mx-1"></div>
              <button type="button" onClick={() => { const url = prompt("Enter URL:"); if (url) executeCommand("createLink", url) }} className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white">🔗</button>
              <button type="button" onClick={() => executeCommand("unlink")} className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white">🔗✕</button>
              <button type="button" onClick={() => { const url = prompt("Enter image URL:"); if (url) executeCommand("insertImage", url) }} className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white">🖼</button>
              <button type="button" onClick={() => {
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
              }} className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white">⧉</button>
              <button type="button" onClick={() => executeCommand("insertHorizontalRule")} className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white">─</button>
              <button type="button" className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white">Ω</button>
              <div className="w-px h-6 bg-slate-300 mx-1"></div>
              <select onChange={(e) => executeCommand("formatBlock", e.target.value)} className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white bg-white">
                <option value="div">Styles</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="p">Paragraph</option>
              </select>
              <select onChange={(e) => executeCommand("formatBlock", e.target.value)} className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white bg-white">
                <option value="div">Format</option>
                <option value="p">Normal</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="pre">Preformatted</option>
              </select>
              <button type="button" className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white">⛶</button>
              <button type="button" className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white">?</button>
            </div>
          </div>
          <div className="p-4">
            <div ref={editorRef} contentEditable onInput={handleContentChange} suppressContentEditableWarning className="min-h-[400px] p-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-700 leading-relaxed overflow-y-auto" style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }} />
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button type="button" onClick={handleSubmit} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">Submit</button>
        </div>
      </div>
    </div>
  )
}
