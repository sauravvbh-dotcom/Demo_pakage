import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar.js';
import Header from './components/Header.js';
import Toast from './components/Toast.js';
import DashboardPage from './pages/DashboardPage.js';
import ScannerPage from './pages/ScannerPage.js';
import SecurityPage from './pages/SecurityPage.js';
import ManagerPage from './pages/ManagerPage.js';
import CliPage from './pages/CliPage.js';
import DocsPage from './pages/DocsPage.js';
import {
  fetchScenarios,
  fetchScenario,
  scanEnvironment,
  syncEnvironment,
  uploadAndScanEnv
} from './services/api.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState('');
  const [scenarioDetail, setScenarioDetail] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [backendOnline, setBackendOnline] = useState(true);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', title, message }) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Run scan for active scenario or custom files
  const runScan = useCallback(async (scenarioId, customData = null) => {
    try {
      setIsScanning(true);
      const payload = customData || { scenarioId };
      const res = await scanEnvironment(payload);

      if (res.success && res.analysis) {
        setAnalysis(res.analysis);
        setBackendOnline(true);
      }
    } catch (err) {
      console.error('Scan error:', err);
      setBackendOnline(false);
      addToast({
        type: 'error',
        title: 'Scan Error',
        message: err.message || 'Failed to scan environment with npm package'
      });
    } finally {
      setIsScanning(false);
    }
  }, [addToast]);

  // Load scenarios on mount
  useEffect(() => {
    async function init() {
      try {
        const data = await fetchScenarios();
        if (data.success && data.scenarios.length > 0) {
          setScenarios(data.scenarios);
          const initialId = data.scenarios[0].id;
          setSelectedScenarioId(initialId);

          const detail = await fetchScenario(initialId);
          if (detail.success) {
            setScenarioDetail(detail.scenario);
          }

          runScan(initialId);
        }
      } catch (err) {
        console.error('Initialization error:', err);
        setBackendOnline(false);
      }
    }

    init();
  }, [runScan]);

  // Switch scenario
  const handleSelectScenario = async (id) => {
    setSelectedScenarioId(id);
    try {
      const detail = await fetchScenario(id);
      if (detail.success) {
        setScenarioDetail(detail.scenario);
      }
      runScan(id);
      addToast({
        type: 'info',
        title: 'Workspace Loaded',
        message: `Switched to "${detail.scenario.name}"`
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Load Error',
        message: err.message
      });
    }
  };

  // Run CLI sync command
  const handleTriggerSync = async () => {
    try {
      setIsScanning(true);
      const res = await syncEnvironment({
        scenarioId: selectedScenarioId,
        codeFiles: scenarioDetail?.codeFiles,
        envContent: scenarioDetail?.envContent,
        exampleContent: scenarioDetail?.exampleContent
      });

      if (res.success) {
        addToast({
          type: 'success',
          title: 'syncEnv() Complete',
          message: res.output || 'Synchronized missing variables into .env.example'
        });
        // Re-scan to update health status
        runScan(selectedScenarioId);
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Sync Failed',
        message: err.message
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Upload and scan .env file directly
  const handleUploadEnvFile = async (file) => {
    try {
      setIsScanning(true);
      const res = await uploadAndScanEnv(file, selectedScenarioId);
      if (res.success && res.analysis) {
        setAnalysis(res.analysis);
        addToast({
          type: 'success',
          title: 'File Uploaded & Scanned',
          message: `Successfully analyzed ${file.name} against source code.`
        });
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Upload Failed',
        message: err.message
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        backendOnline={backendOnline}
        healthStatus={analysis?.status || 'optimal'}
      />

      {/* Main View Area */}
      <div className="app-main">
        {/* Header with breadcrumbs, scenario selector and quick actions */}
        <Header
          activeTab={activeTab}
          scenarios={scenarios}
          selectedScenarioId={selectedScenarioId}
          onSelectScenario={handleSelectScenario}
          onTriggerCheck={() => runScan(selectedScenarioId)}
          onTriggerSync={handleTriggerSync}
          isScanning={isScanning}
          healthScore={analysis?.healthScore ?? 100}
        />

        {/* Viewport for Active Page */}
        <main className="app-viewport">
          {activeTab === 'dashboard' && (
            <DashboardPage
              analysis={analysis}
              scenario={scenarioDetail}
              onNavigate={setActiveTab}
              onTriggerSync={handleTriggerSync}
              onTriggerCheck={() => runScan(selectedScenarioId)}
              isScanning={isScanning}
            />
          )}

          {activeTab === 'scanner' && (
            <ScannerPage
              scenario={scenarioDetail}
              analysis={analysis}
              onScanCustom={(data) => runScan(selectedScenarioId, data)}
              onUploadEnvFile={handleUploadEnvFile}
              onTriggerSync={handleTriggerSync}
              isScanning={isScanning}
              addToast={addToast}
            />
          )}

          {activeTab === 'security' && (
            <SecurityPage
              analysis={analysis}
              scenario={scenarioDetail}
              onTriggerSync={handleTriggerSync}
              isScanning={isScanning}
              addToast={addToast}
            />
          )}

          {activeTab === 'manager' && (
            <ManagerPage addToast={addToast} />
          )}

          {activeTab === 'cli' && (
            <CliPage
              scenarios={scenarios}
              selectedScenarioId={selectedScenarioId}
              onSelectScenario={handleSelectScenario}
              scenario={scenarioDetail}
              addToast={addToast}
            />
          )}

          {activeTab === 'docs' && (
            <DocsPage addToast={addToast} />
          )}
        </main>
      </div>

      {/* Floating Toast Notification Stack */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
