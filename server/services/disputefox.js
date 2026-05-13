/**
 * DisputeFox integration stub.
 *
 * Real DisputeFox API integration will populate disputes by parsing
 * uploaded credit reports. For now this returns sample data so the
 * dashboard table can render.
 *
 * TODO:
 *  - Add DISPUTEFOX_API_KEY env var
 *  - Implement uploadReport(customerId, reportBuffer)
 *  - Implement listDisputes(customerId) -> [{ bureau, account, status, openedAt }]
 *  - Persist results to a Dispute table (separate Prisma model)
 */

async function listDisputes(_customerId) {
  // Return an empty list by default. Sample data can be enabled for demos.
  return [];
}

async function syncFromReport(_customerId, _reportBuffer) {
  // No-op stub
  return { imported: 0 };
}

module.exports = { listDisputes, syncFromReport };
