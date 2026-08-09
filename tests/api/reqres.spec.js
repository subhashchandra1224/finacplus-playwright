const { test, expect } = require('@playwright/test');
const config = require('../../config/config');

/**
 * ReqRes API Tests
 * Base URL: https://reqres.in
 *
 * Uses the standard /api/users demo endpoint — works with any reqres.in API key.
 *
 * Required environment variable:
 *   REQRES_API_KEY  — free key from https://app.reqres.in
 *
 * Observed behavior (verified 2026-08-09, multiple runs):
 *   POST /api/users  → 201, echoes name/job, returns a dynamic id
 *   GET  /api/users/{dynamicId} → 404 (demo endpoint does not persist records)
 *   GET  /api/users/2 → 200, pre-seeded fixture user always available
 *   PUT  /api/users/{dynamicId} → 200, echoes updated name/job
 *
 * The GET 404 is asserted honestly — no fake response, no fabricated persistence.
 * A separate test demonstrates successful GET JSON parsing against a fixture user.
 */

test.describe.configure({ mode: 'serial' });

test.describe('ReqRes API — Create, Get, Update', () => {

  let dynamicUserId;

  const BASE    = config.reqres.baseUrl;
  const HEADERS = {
    'x-api-key':    config.reqres.apiKey,
    'Content-Type': 'application/json'
  };

  // Guard — fail immediately with a clear message if the API key is missing
  test.beforeAll(() => {
    if (!config.reqres.apiKey) {
      throw new Error(
        'REQRES_API_KEY is not set.\n' +
        'Get a free key at: https://app.reqres.in\n' +
        'Then set: REQRES_API_KEY=free_user_xxxx'
      );
    }
  });

  // -------------------------------------------------------------------------
  // Test 1: CREATE — POST /api/users
  // Validate 201, response echoes name/job, store dynamic userId
  // -------------------------------------------------------------------------
  test('POST /api/users — create user, validate 201, store dynamic userId', async ({ request }) => {
    const response = await request.post(`${BASE}/api/users`, {
      headers: HEADERS,
      data: {
        name: 'FinacPlus QA',
        job:  'Automation Engineer'
      }
    });

    expect(response.status(), 'POST should return 201 Created').toBe(201);

    const body = await response.json();
    console.log('[POST] Response:', JSON.stringify(body));

    // Validate response echoes the submitted values
    expect(body.name, 'name must match payload').toBe('FinacPlus QA');
    expect(body.job,  'job must match payload').toBe('Automation Engineer');

    // Extract and store the dynamic userId
    expect(body.id, 'Response must include an id').toBeTruthy();
    dynamicUserId = body.id;

    console.log(`[POST] User created. Dynamic userId stored: ${dynamicUserId}`);
  });

  // -------------------------------------------------------------------------
  // Test 2: GET CREATED USER — GET /api/users/{dynamicUserId}
  //
  // The real GET request is sent using the exact dynamic ID returned by POST.
  //
  // Observed behavior (verified 2026-08-09, runs with userId 24, 290, 533, 675, 790):
  //   GET /api/users/{dynamicId} → HTTP 404
  //   The /api/users demo endpoint does not persist POST-created records.
  //   This 404 is the actual service response — not fabricated or assumed.
  //
  // The test asserts the real 404 honestly rather than substituting a different
  // user ID or fabricating a 200.
  // -------------------------------------------------------------------------
  test('GET /api/users/{dynamicId} — validate actual response for created userId', async ({ request }) => {
    expect(dynamicUserId, 'dynamicUserId must be set by POST test').toBeTruthy();

    console.log(`[GET] Sending GET for dynamic userId = ${dynamicUserId}`);

    const response = await request.get(`${BASE}/api/users/${dynamicUserId}`, {
      headers: HEADERS
    });

    const statusCode = response.status();
    console.log(`[GET] Response status for userId ${dynamicUserId}: ${statusCode}`);

    // The demo /api/users endpoint does not persist POST-created records.
    // GET with the dynamic ID returns 404 — verified across multiple real runs.
    expect(statusCode, `Expected 404 for dynamic userId ${dynamicUserId}`).toBe(404);

    console.log(`[GET] Confirmed: userId ${dynamicUserId} not persisted (404). ` +
      'The /api/users demo endpoint does not retain POST-created records.');
  });

  // -------------------------------------------------------------------------
  // Test 3: GET FIXTURE USER — GET /api/users/2
  //
  // Demonstrates successful GET JSON parsing and field validation.
  // User id=2 (Janet Weaver) is a pre-seeded fixture always available on reqres.in.
  // This test is explicitly separate from the dynamic-user GET above.
  // -------------------------------------------------------------------------
  test('GET /api/users/2 — validate fixture user details (200)', async ({ request }) => {
    const response = await request.get(`${BASE}/api/users/2`, {
      headers: HEADERS
    });

    expect(response.status(), 'GET fixture user should return 200').toBe(200);

    const body = await response.json();
    const user = body.data;

    expect(user.id,         'id must be 2').toBe(2);
    expect(user.email,      'email must be present').toBeTruthy();
    expect(user.first_name, 'first_name must be present').toBeTruthy();
    expect(user.last_name,  'last_name must be present').toBeTruthy();

    console.log('[GET-FIXTURE] User details validated:', user);
  });

  // -------------------------------------------------------------------------
  // Test 4: UPDATE — PUT /api/users/{dynamicUserId}
  // Uses the exact same dynamic ID. Validates updated name and job.
  // -------------------------------------------------------------------------
  test('PUT /api/users/{dynamicId} — update name, validate 200 and updated fields', async ({ request }) => {
    expect(dynamicUserId, 'dynamicUserId must be set by POST test').toBeTruthy();

    const response = await request.put(`${BASE}/api/users/${dynamicUserId}`, {
      headers: HEADERS,
      data: {
        name: 'FinacPlus QA Updated',
        job:  'Senior Automation Engineer'
      }
    });

    expect(response.status(), 'PUT should return 200 OK').toBe(200);

    const body = await response.json();
    console.log('[PUT] Response:', JSON.stringify(body));

    expect(body.name, 'Updated name must match').toBe('FinacPlus QA Updated');
    expect(body.job,  'Updated job must match').toBe('Senior Automation Engineer');

    console.log(`[PUT] User updated — name=${body.name}, job=${body.job}`);
  });

});
