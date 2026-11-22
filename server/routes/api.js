import express from 'express';
import multer from 'multer';
import { getAllScenarios, getScenarioById } from '../controllers/scenarioController.js';
import { handleScan, handleSync } from '../controllers/scannerController.js';
import { handleCliExecute, getSupportedCommands } from '../controllers/cliController.js';
import {
  getSampleEnvironments,
  compareEnvironments,
  getPackageInfo
} from '../controllers/managerController.js';

const router = express.Router();

// Configure memory storage for safe file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 // 500 KB limit for env files
  }
});

// Scenario routes
router.get('/scenarios', getAllScenarios);
router.get('/scenarios/:id', getScenarioById);

// Scanner routes (integrating checkEnv, scanVariables, parseEnvFile)
router.post('/scan', handleScan);
router.post('/sync', handleSync);

// File upload for scanning .env directly
router.post('/upload-env', upload.single('envFile'), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    const envContent = req.file.buffer.toString('utf8');
    req.body.envContent = envContent;
    return handleScan(req, res);
  } catch (err) {
    return next(err);
  }
});

// CLI execution routes (safe child_process execution of real CLI)
router.post('/cli/execute', handleCliExecute);
router.get('/cli/commands', getSupportedCommands);

// Environment Manager & Comparison
router.get('/manager/environments', getSampleEnvironments);
router.post('/manager/compare', compareEnvironments);

// Package metadata & documentation info
router.get('/package/info', getPackageInfo);

export default router;
