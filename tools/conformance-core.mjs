export function validateManifest(ledger, manifest) {
  if (!ledger || !Array.isArray(ledger.requirements)) throw new TypeError('ledger.requirements must be an array');
  if (!manifest || !Array.isArray(manifest.tests)) throw new TypeError('manifest.tests must be an array');

  const columns = ledger.columns ?? [];
  const idIndex = columns.indexOf('id');
  const testIdIndex = columns.indexOf('testId');
  const statusIndex = columns.indexOf('status');
  if ([idIndex, testIdIndex, statusIndex].some((index) => index < 0)) {
    throw new Error('ledger must declare id, testId, and status columns');
  }

  const requirements = new Map(ledger.requirements.map((row) => [row[idIndex], {
    id: row[idIndex],
    testId: row[testIdIndex],
    status: row[statusIndex],
  }]));

  const seenTests = new Set();
  for (const entry of manifest.tests) {
    if (!entry.id || !entry.requirementId || !entry.file) throw new Error('every conformance entry requires id, requirementId, and file');
    if (seenTests.has(entry.id)) throw new Error(`duplicate conformance id: ${entry.id}`);
    seenTests.add(entry.id);

    const requirement = requirements.get(entry.requirementId);
    if (!requirement) throw new Error(`unknown requirement: ${entry.requirementId}`);
    if (requirement.testId !== entry.id) {
      throw new Error(`${entry.requirementId} reserves ${requirement.testId}, not ${entry.id}`);
    }
    if (!Array.isArray(entry.environments) || entry.environments.length === 0) {
      throw new Error(`${entry.id} must declare at least one environment`);
    }
    if (new Set(entry.environments).size !== entry.environments.length) {
      throw new Error(`${entry.id} declares duplicate environments`);
    }
  }

  for (const requirement of requirements.values()) {
    if (requirement.status === 'passing' && !seenTests.has(requirement.testId)) {
      throw new Error(`${requirement.id} is passing without public test ${requirement.testId}`);
    }
  }

  return { requirements, tests: seenTests };
}

export function selectTests(manifest, ids = []) {
  const selected = ids.length === 0 ? manifest.tests : manifest.tests.filter((entry) => ids.includes(entry.id));
  if (ids.length > 0) {
    const selectedIds = new Set(selected.map((entry) => entry.id));
    const missing = ids.filter((id) => !selectedIds.has(id));
    if (missing.length) throw new Error(`unknown conformance ids: ${missing.join(', ')}`);
  }
  return selected;
}

export function promotableRequirement(entry, environmentResults) {
  if (!entry || !Array.isArray(entry.environments) || entry.environments.length === 0) return false;
  return entry.environments.every((environment) => environmentResults?.[environment] === 'passed');
}
