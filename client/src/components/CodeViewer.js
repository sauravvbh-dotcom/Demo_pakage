import React, { useState } from 'react';
import { CopyIcon, CheckIcon, FileCodeIcon } from './Icons.js';

export default function CodeViewer({
  code = '',
  fileName = 'code.js',
  language = 'javascript',
  highlightProcessEnv = true,
  maxHeight = '320px',
  onCopySuccess
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    if (onCopySuccess) onCopySuccess();
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = (code || '').split('\n');

  return (
    <div className="code-viewer-container">
      <div className="code-viewer-header">
        <div className="code-viewer-file">
          <FileCodeIcon size={14} className="text-secondary" />
          <span className="file-name">{fileName}</span>
          <span className="file-lang">{language}</span>
        </div>
        <button
          className="code-copy-btn"
          onClick={handleCopy}
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <CheckIcon size={13} className="text-success" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <CopyIcon size={13} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="code-viewer-body" style={{ maxHeight }}>
        <pre className="code-pre">
          <code>
            {lines.map((line, idx) => {
              // Highlight process.env.VAR_NAME occurrences
              let renderedLine = line;
              if (highlightProcessEnv && line.includes('process.env.')) {
                const parts = line.split(/(process\.env\.[A-Za-z0-9_]+)/g);
                return (
                  <div key={idx} className="code-line">
                    <span className="line-num">{idx + 1}</span>
                    <span className="line-text">
                      {parts.map((p, pIdx) => {
                        if (p.startsWith('process.env.')) {
                          return (
                            <span key={pIdx} className="token-env-var">
                              {p}
                            </span>
                          );
                        }
                        return <span key={pIdx}>{p}</span>;
                      })}
                    </span>
                  </div>
                );
              }

              return (
                <div key={idx} className="code-line">
                  <span className="line-num">{idx + 1}</span>
                  <span className="line-text">{line}</span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
}
