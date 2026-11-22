import { SCENARIO_PRESETS } from '../scenarios/presets.js';

export function getAllScenarios(req, res) {
  try {
    const list = SCENARIO_PRESETS.map((p) => ({
      id: p.id,
      name: p.name,
      badge: p.badge,
      badgeVariant: p.badgeVariant,
      description: p.description,
      fileCount: p.codeFiles.length
    }));
    return res.json({ success: true, scenarios: list });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function getScenarioById(req, res) {
  try {
    const { id } = req.params;
    const scenario = SCENARIO_PRESETS.find((p) => p.id === id);
    if (!scenario) {
      return res.status(404).json({ success: false, error: 'Scenario not found' });
    }
    return res.json({ success: true, scenario });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
