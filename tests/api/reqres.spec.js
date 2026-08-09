const { test, expect } = require('@playwright/test');
const config = require('../../config/config');

/**
 * ReqRes API Tests — Persistent Collections Workflow
 *
 * Uses the ReqRes Project API (/api/collections/{slug}/records) which
 * provides genuine persistence: a record created via POST is retrievable
 * via GET using the same ID.
 *
 * Required environment variable:
 *   REQRES_PROJECT_KEY  — manage key (pro_* prefix) from https://app.reqres.in/api-keys
 *   REQRES_COLLECTION   — collection slug (default: "products")
 *
 * Response structure from the persistent API:
 *   POST  → { data: { id, collection_id, project_id, data: { name, job, ... }, ... } }
 *   GET   → { data: { id, ..., data: { name, job, ... } } }
 *   PUT   → { data: { id, ..., data: { name, job, ... } } }
 *
 * All three tests use the SAME dynamic id returned by POST.
 * The describe block runs serially so state flows correctly across tests.
 */

test.describe.configure({ mode: 'serial' });

test.describe('ReqRes Persistent API — Create → Get Created User → Update', () => {

  let createdRecordId;

  const BASE    = config.reqres.baseUrl;
  const SLUG    = config.reqres.collection;
  const HEADERS = {
    'x-api-key':    config.reqres.projectKey,
    'Content-Type': 'application/json'
  };

  // Guard — fail immediately with a clear message if the project key is missing
  test.beforeAll(() => {
    if (!config.reqres.projectKey) {
      throw new Error(
        'REQRES_PROJECT_KEY is not set.\n\n' +
        'The persistent collections API requires the manage key (pro_* prefix).\n' +
        'Steps:\n' +
        '  1. Go to https://app.reqres.in\n' +
        '  2. Open your project → API Keys\n' +
        '  3. Copy the MANAGE key (pro_* prefix)\n' +
        '  4. Set: REQRES_PROJECT_KEY=pro_xxxx'
      );
    }
  });

  // Cleanup — delete the test record so the collection stays clean
  test.afterAll(async ({ request }) => {
    if (createdRecordId) {
      await request.delete(
        `${BASE}/api/collections/${SLUG}/records/${createdRecordId}`,
        { headers: HEADERS }
      );
      console.log(`[CLEANUP] Deleted test record id=${createdRecordId}`);
    }
  });

  // -------------------------------------------------------------------------
  // Test 1: CREATE — POST /api/collections/{slug}/records
  // Validate 201, response echoes name/job, store dynamic id
  // -------------------------------------------------------------------------
  test('POST — create user, validate 201, store dynamic userId', async ({ request }) => {
    const response = await request.post(
      `${BASE}/api/collections/${SLUG}/records`,
      {
        headers: HEADERS,
        data: {
          data: {
            name: 'FinacPlus QA',
            job:  'Automation Engineer'
          }
        }
      }
    );

    expect(response.status(), 'POST should return 201 Created').toBe(201);

    const body = await response.json();
    console.log('[POST] Response:', JSON.stringify(body));

    // The persistent API returns: { data: { id, ..., data: { name, job } } }
    const record     = body.data;
    const recordData = record.data;

    expect(record.id,     'Response must include an id').toBeTruthy();
    expect(recordData.name, 'name must match payload').toBe('FinacPlus QA');
    expect(recordData.job,  'job must match payload').toBe('Automation Engineer');

    createdRecordId = record.id;
    console.log(`[POST] User created. Dynamic userId stored: ${createdRecordId}`);
  });

  // -------------------------------------------------------------------------
  // Test 2: GET CREATED USER — GET /api/collections/{slug}/records/{id}
  // Uses the EXACT id returned by POST.
  // Validates the persisted record matches what was created.
  // -------------------------------------------------------------------------
  test('GET created user — validate 200 and persisted data matches POST payload', async ({ request }) => {
    expect(createdRecordId, 'createdRecordId must be set by POST test').toBeTruthy();

    console.log(`[GET] Fetching created user id=${createdRecordId}`);

    const response = await request.get(
      `${BASE}/api/collections/${SLUG}/records/${createdRecordId}`,
      { headers: HEADERS }
    );

    expect(response.status(), 'GET should return 200 OK').toBe(200);

    const body = await response.json();
    console.log('[GET] Response:', JSON.stringify(body));

    const record     = body.data;
    const recordData = record.data;

    // Validate the exact same id returned by POST
    expect(record.id).toBe(createdRecordId);

    // Validate the created user's details match the POST payload
    expect(recordData.name, 'GET name must match created name').toBe('FinacPlus QA');
    expect(recordData.job,  'GET job must match created job').toBe('Automation Engineer');

    console.log(`[GET] Created user validated — id=${record.id}, name=${recordData.name}, job=${recordData.job}`);
  });

  // -------------------------------------------------------------------------
  // Test 3: UPDATE — PUT /api/collections/{slug}/records/{id}
  // Uses the EXACT same dynamic id. Validates updated name and job.
  // -------------------------------------------------------------------------
  test('PUT — update user name, validate 200 and updated fields', async ({ request }) => {
    expect(createdRecordId, 'createdRecordId must be set by POST test').toBeTruthy();

    const response = await request.put(
      `${BASE}/api/collections/${SLUG}/records/${createdRecordId}`,
      {
        headers: HEADERS,
        data: {
          data: {
            name: 'FinacPlus QA Updated',
            job:  'Senior Automation Engineer'
          }
        }
      }
    );

    expect(response.status(), 'PUT should return 200 OK').toBe(200);

    const body = await response.json();
    console.log('[PUT] Response:', JSON.stringify(body));

    const recordData = body.data.data;

    expect(recordData.name, 'Updated name must match').toBe('FinacPlus QA Updated');
    expect(recordData.job,  'Updated job must match').toBe('Senior Automation Engineer');

    console.log(`[PUT] User updated — name=${recordData.name}, job=${recordData.job}`);
  });

});
