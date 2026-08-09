const { test, expect } = require('@playwright/test');
const config = require('../../config/config');

/**
 * ReqRes API Tests — Persistent Collections Workflow
 * Base URL: https://reqres.in
 *
 * Uses the ReqRes Project API (/api/collections/{slug}/records).
 * Records created via POST are genuinely persisted and retrievable via GET
 * using the exact same ID — satisfying the assignment requirement:
 * "Get the created user details and validate the same."
 *
 * Required environment variables:
 *   REQRES_PROJECT_KEY  — manage key (pro_* prefix) from https://app.reqres.in/api-keys
 *   REQRES_COLLECTION   — collection slug (default: "products")
 *
 * Workflow:
 *   POST   /api/collections/{slug}/records        → 201, dynamic id returned
 *   GET    /api/collections/{slug}/records/{id}   → 200, same record retrieved
 *   PUT    /api/collections/{slug}/records/{id}   → 200, record updated
 *   DELETE /api/collections/{slug}/records/{id}   → cleanup (afterAll)
 *
 * Response envelope from the persistent API:
 *   { data: { id, ..., data: { name, job } } }
 */

test.describe.configure({ mode: 'serial' });

test.describe('ReqRes API — Create → Get Created User → Update', () => {

  let createdRecordId;

  const BASE    = config.reqres.baseUrl;
  const SLUG    = config.reqres.collection;
  const HEADERS = {
    'x-api-key':    config.reqres.projectKey,
    'Content-Type': 'application/json'
  };

  // Guard — fail immediately with a clear message if project key is missing
  test.beforeAll(() => {
    if (!config.reqres.projectKey) {
      throw new Error(
        'REQRES_PROJECT_KEY is not set.\n\n' +
        'Steps:\n' +
        '  1. Go to https://app.reqres.in → your project → API Keys\n' +
        '  2. Copy the MANAGE key (pro_* prefix)\n' +
        '  3. Set: REQRES_PROJECT_KEY=pro_xxxx\n' +
        '  4. Set: REQRES_COLLECTION=products'
      );
    }
  });

  // Cleanup — delete the test record after all tests complete
  test.afterAll(async ({ request }) => {
    if (createdRecordId) {
      await request.delete(
        `${BASE}/api/collections/${SLUG}/records/${createdRecordId}`,
        { headers: HEADERS }
      );
      console.log(`[CLEANUP] Deleted record id=${createdRecordId}`);
    }
  });

  // -----------------------------------------------------------------------
  // Test 1: POST — create user record, validate 201, store dynamic id
  // -----------------------------------------------------------------------
  test('POST — create user, validate 201, store dynamic userId', async ({ request }) => {
    const response = await request.post(
      `${BASE}/api/collections/${SLUG}/records`,
      {
        headers: HEADERS,
        data: { data: { name: 'FinacPlus QA', job: 'Automation Engineer' } }
      }
    );

    expect(response.status(), 'POST should return 201 Created').toBe(201);

    const body       = await response.json();
    const record     = body.data;
    const recordData = record.data;

    expect(record.id,       'POST response must include an id').toBeTruthy();
    expect(recordData.name, 'POST name must match payload').toBe('FinacPlus QA');
    expect(recordData.job,  'POST job must match payload').toBe('Automation Engineer');

    createdRecordId = record.id;
    console.log(`[POST] User created. Dynamic id stored: ${createdRecordId}`);
    console.log(`[POST] Full response: ${JSON.stringify(body)}`);
  });

  // -----------------------------------------------------------------------
  // Test 2: GET the SAME created user — validate 200 and created fields
  // Uses createdRecordId set by POST above. Proves genuine persistence.
  // -----------------------------------------------------------------------
  test('GET created user — validate 200, id/name/job match POST payload', async ({ request }) => {
    expect(createdRecordId, 'createdRecordId must be set by POST test').toBeTruthy();

    console.log(`[GET] Requesting GET for id=${createdRecordId}`);

    const response = await request.get(
      `${BASE}/api/collections/${SLUG}/records/${createdRecordId}`,
      { headers: HEADERS }
    );

    expect(response.status(), 'GET should return 200 OK').toBe(200);

    const body       = await response.json();
    const record     = body.data;
    const recordData = record.data;

    console.log(`[GET] Response id:   ${record.id}`);
    console.log(`[GET] POST id:       ${createdRecordId}`);
    console.log(`[GET] IDs match:     ${record.id === createdRecordId}`);
    console.log(`[GET] name: ${recordData.name}, job: ${recordData.job}`);

    // The GET id MUST equal the id returned by POST
    expect(record.id,       'GET id must equal POST id').toBe(createdRecordId);
    expect(recordData.name, 'GET name must match created name').toBe('FinacPlus QA');
    expect(recordData.job,  'GET job must match created job').toBe('Automation Engineer');
  });

  // -----------------------------------------------------------------------
  // Test 3: PUT the SAME record — validate 200 and updated fields
  // -----------------------------------------------------------------------
  test('PUT — update user name, validate 200 and updated fields', async ({ request }) => {
    expect(createdRecordId, 'createdRecordId must be set by POST test').toBeTruthy();

    const response = await request.put(
      `${BASE}/api/collections/${SLUG}/records/${createdRecordId}`,
      {
        headers: HEADERS,
        data: { data: { name: 'FinacPlus QA Updated', job: 'Senior Automation Engineer' } }
      }
    );

    expect(response.status(), 'PUT should return 200 OK').toBe(200);

    const body       = await response.json();
    const recordData = body.data.data;

    expect(recordData.name, 'Updated name must match').toBe('FinacPlus QA Updated');
    expect(recordData.job,  'Updated job must match').toBe('Senior Automation Engineer');

    console.log(`[PUT] Updated id=${createdRecordId} — name=${recordData.name}, job=${recordData.job}`);
  });

});
