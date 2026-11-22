import React, { useState, useRef, useEffect } from 'react';
import Badge from '../components/Badge.js';
import {
  TerminalIcon,
  PlayIcon,
  CopyIcon,
  CheckIcon,
  RefreshIcon
} from '../components/Icons.js';
import { executeCliCommand } from '../services/api.js';

export default function CliPage({
  scenarios = [],
  selectedScenarioId,
  onSelectScenario,
  scenario,
  addToast
}) {
  const [commandInput, setCommandInput] = useState('npx @sauravvbh/env-guard-cli --check');
  const [history, setHistory] = useState([
    {
      id: 'welcome',
      type: 'system',
      text: `@sauravvbh/env-guard-cli Interactive Terminal [v1.0.0]
Child Process Sandbox: Node.js ${typeof process !== 'undefined' ? process.version : 'v24.14.0'}
Active Project Workspace: ${scenario?.name || 'Default Project'}

Click any quick command chip below or type a command and hit Enter:`
    }
  ]);
  const [commandHistoryList, setCommandHistoryList] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);

  const terminalEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isRunning]);

  const quickCommands = [
    {
      label: '--check',
      cmd: 'npx @sauravvbh/env-guard-cli --check',
      desc: 'Validate code vs .env'
    },
    {
      label: '--sync',
      cmd: 'npx @sauravvbh/env-guard-cli --sync',
      desc: 'Generate/update .env.example'
    },
    {
      label: '--help',
      cmd: 'npx @sauravvbh/env-guard-cli --help',
      desc: 'Show CLI documentation'
    },
    {
      label: 'Short: -h',
      cmd: 'env-guard-cli -h',
      desc: 'Alias for --help'
    },
    {
      label: 'Test Invalid Flag',
      cmd: 'npx @sauravvbh/env-guard-cli --invalid-test',
      desc: 'Test package error handling'
    }
  ];

  const handleRunCommand = async (cmdToRun) => {
    const cmd = (cmdToRun || commandInput).trim();
    if (!cmd || isRunning) return;

    // Append command to visual terminal
    const userEntryId = `cmd_${Date.now()}`;
    setHistory((prev) => [
      ...prev,
      {
        id: userEntryId,
        type: 'command',
        text: cmd,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);

    // Save to command history list for arrow key navigation
    setCommandHistoryList((prev) => [cmd, ...prev]);
    setHistoryIndex(-1);
    setIsRunning(true);

    try {
      // Execute genuine CLI via backend child process
      const res = await executeCliCommand({
        command: cmd,
        scenarioId: selectedScenarioId,
        codeFiles: scenario?.codeFiles,
        envContent: scenario?.envContent,
        exampleContent: scenario?.exampleContent
      });

      if (res.success && res.result) {
        const { stdout, stderr, exitCode, durationMs } = res.result;
        setHistory((prev) => [
          ...prev,
          {
            id: `out_${Date.now()}`,
            type: 'output',
            stdout: stdout || '',
            stderr: stderr || '',
            exitCode,
            durationMs,
            command: cmd
          }
        ]);
      } else {
        setHistory((prev) => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            type: 'error',
            text: res.error || 'Failed to execute CLI command'
          }
        ]);
      }
    } catch (err) {
      setHistory((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          type: 'error',
          text: err.message || 'Execution error'
        }
      ]);
    } finally {
      setIsRunning(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRunCommand(commandInput);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistoryList.length > 0) {
        const nextIndex = Math.min(historyIndex + 1, commandHistoryList.length - 1);
        setHistoryIndex(nextIndex);
        setCommandInput(commandHistoryList[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setCommandInput(commandHistoryList[nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommandInput('');
      }
    }
  };

  const handleClearTerminal = () => {
    setHistory([
      {
        id: 'cleared',
        type: 'system',
        text: 'Terminal cleared. Ready for next command.'
      }
    ]);
  };

  const handleCopyHistory = () => {
    const text = history
      .map((item) => {
        if (item.type === 'command') return `$ ${item.text}`;
        if (item.type === 'output') return item.stdout || item.stderr;
        return item.text || '';
      })
      .join('\n');

    navigator.clipboard.writeText(text);
    addToast({
      type: 'success',
      title: 'Terminal Copied',
      message: 'Terminal logs copied to clipboard.'
    });
  };

  return (
    <div className="page-content cli-page">
      {/* Workspace Scenario Bar */}
      <div className="cli-workspace-bar">
        <div className="workspace-info">
          <span className="workspace-label">Execution Target:</span>
          <select
            className="workspace-select"
            value={selectedScenarioId || ''}
            onChange={(e) => onSelectScenario(e.target.value)}
          >
            {scenarios.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.name} ({sc.badge})
              </option>
            ))}
          </select>
        </div>

        <div className="workspace-desc text-muted text-sm">
          Commands execute directly against this workspace's source files and .env configuration.
        </div>
      </div>

      {/* Quick Command Chips */}
      <div className="quick-chips-row">
        <span className="chips-label">Quick Run:</span>
        <div className="chips-list">
          {quickCommands.map((qc) => (
            <button
              key={qc.cmd}
              className="quick-chip-btn"
              onClick={() => {
                setCommandInput(qc.cmd);
                handleRunCommand(qc.cmd);
              }}
              disabled={isRunning}
              title={qc.desc}
            >
              <span className="chip-badge">{qc.label}</span>
              <span className="chip-cmd font-mono">{qc.cmd}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Window */}
      <div className="terminal-window">
        {/* Terminal Header */}
        <div className="terminal-header">
          <div className="terminal-buttons">
            <span className="term-btn term-close" />
            <span className="term-btn term-min" />
            <span className="term-btn term-max" />
          </div>

          <div className="terminal-title font-mono">
            guest@envguard: ~/{scenario?.id || 'project'}
          </div>

          <div className="terminal-actions">
            <button
              className="term-action-btn"
              onClick={handleCopyHistory}
              title="Copy terminal session"
            >
              <CopyIcon size={13} />
              <span>Copy</span>
            </button>
            <button
              className="term-action-btn"
              onClick={handleClearTerminal}
              title="Clear terminal output"
            >
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="terminal-body font-mono" onClick={() => inputRef.current?.focus()}>
          {history.map((entry) => {
            if (entry.type === 'system') {
              return (
                <div key={entry.id} className="term-line term-system">
                  <pre>{entry.text}</pre>
                </div>
              );
            }

            if (entry.type === 'command') {
              return (
                <div key={entry.id} className="term-line term-command-line">
                  <span className="term-prompt">guest@envguard:~$</span>
                  <span className="term-cmd-text">{entry.text}</span>
                  {entry.timestamp && <span className="term-cmd-time">[{entry.timestamp}]</span>}
                </div>
              );
            }

            if (entry.type === 'output') {
              const isSuccess = entry.exitCode === 0;
              return (
                <div key={entry.id} className="term-line term-output-block">
                  {entry.stdout && (
                    <pre className="term-stdout">{entry.stdout}</pre>
                  )}
                  {entry.stderr && (
                    <pre className="term-stderr text-danger">{entry.stderr}</pre>
                  )}
                  <div className="term-meta-row">
                    <span className={`term-exit-code ${isSuccess ? 'exit-ok' : 'exit-fail'}`}>
                      Exit code: {entry.exitCode} {isSuccess ? '(SUCCESS)' : '(FAILED)'}
                    </span>
                    <span className="term-duration">Duration: {entry.durationMs}ms</span>
                  </div>
                </div>
              );
            }

            if (entry.type === 'error') {
              return (
                <div key={entry.id} className="term-line term-error">
                  <pre className="text-danger">Error: {entry.text}</pre>
                </div>
              );
            }

            return null;
          })}

          {isRunning && (
            <div className="term-line term-loading">
              <span className="term-prompt">guest@envguard:~$</span>
              <span className="term-spinner spin">◒</span>
              <span className="term-loading-text">
                Executing Node.js child process...
              </span>
            </div>
          )}

          {/* Interactive Prompt Input */}
          <div className="term-line term-input-line">
            <span className="term-prompt">guest@envguard:~$</span>
            <input
              ref={inputRef}
              type="text"
              className="term-input"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isRunning}
              autoFocus
              spellCheck={false}
              autoComplete="off"
            />
            <button
              className="term-run-inline-btn"
              onClick={() => handleRunCommand()}
              disabled={isRunning}
            >
              <PlayIcon size={12} />
              <span>Execute</span>
            </button>
          </div>

          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
}
