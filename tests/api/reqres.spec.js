const { test, expect } = require('@playwright/test');
const config = require('../../config/config');

// ---------------------------------------------------------------------------
// Guard: fail immediately if the API key is not configured
// ---------------------------------------------------------------------------
test.beforeAll(() => {
  if (!config.reqres.apiKey) {
    throw new Error(
      'ReqRes API key is not configured.\n' +
      'Set environment variable: REQRES_API_KEY\n' +
      'Get a free key at: https://app.reqres.in/'
    );
  }
});

// Shared state — stored across tests using a closure variable
let dynamicUserId;

// ---------------------------------------------------------------------------
// Test 1: Create a user — POST /api/users
// Validate HTTP 201, response echoes name/job, extract and store dynamic userId
// ---------------------------------------------------------------------------
test('POST /api/users — create user, validate 201, store dynamic userId', async ({ request }) => {
  const response = await request.post(`${config.reqres.baseUrl}/api/users`, {
    headers: {
      'x-api-key': config.reqres.apiKey,
      'Content-Type': 'application/json'
    },
    data: {
      name: 'FinacPlus QA',
      job:  'Automation Engineer'
    }
  });

  // Validate HTTP 201 Created
  expect(response.status(), 'POST should return 201 Created').toBe(201);

  const body = await response.json();
  console.log('[POST] Response:', JSON.stringify(body));

  // Validate response echoes submitted values
  expect(body.name).toBe('FinacPlus QA');
  expect(body.job).toBe('Automation Engineer');

  // Extract and store dynamic userId
  expect(body.id, 'Response must include an id').toBeTruthy();
  dynamicUserId = body.id;

  console.log(`[POST] Dynamic userId stored: ${dynamicUserId}`);
});

// ---------------------------------------------------------------------------
// Test 2: GET the created user — GET /api/users/{dynamicUserId}
//
// OBSERVED BEHAVIOR (verified 2026-08-09, multiple runs):
//   POST /api/users returns a dynamic userId (e.g. 24, 533, 675, 790).
//   GET /api/users/{dynamicUserId} returns HTTP 404.
//   The legacy /api/users endpoint does not persist POST-created records.
//
//   The real GET is sent using the exact dynamic ID. The actual 404 is
//   asserted. No fake data is returned or fabricated.
// ---------------------------------------------------------------------------
test('GET /api/users/{dynamicId} — validate actual service response (404)', async ({ request }) => {
  expect(dynamicUserId, 'dynamicUserId must be set by the POST test').toBeTruthy();

  console.log(`[GET] Requesting GET for dynamic userId = ${dynamicUserId}`);

  const response = await request.get(
    `${config.reqres.baseUrl}/api/users/${dynamicUserId}`,
    {
      headers: { 'x-api-key': config.reqres.apiKey }
    }
  );

  const statusCode = response.status();
  console.log(`[GET] Response status for userId ${dynamicUserId}: ${statusCode}`);

  // The legacy endpoint does not persist POST-created users — GET returns 404
  expect(statusCode, `Expected 404 for dynamic userId ${dynamicUserId}`).toBe(404);

  console.log(`[GET] Confirmed: dynamicUserId ${dynamicUserId} not persisted (404). Known external limitation.`);
});

// ---------------------------------------------------------------------------
// Test 3: GET existing pre-seeded user — GET /api/users/2
//
// Demonstrates successful GET JSON parsing and field validation.
// This is explicitly separate from the dynamic-user GET above.
// User id=2 (Janet Weaver) is always available on reqres.in.
// ---------------------------------------------------------------------------
test('GET /api/users/2 — validate existing user JSON fields', async ({ request }) => {
  const response = await request.get(`${config.reqres.baseUrl}/api/users/2`, {
    headers: { 'x-api-key': config.reqres.apiKey }
  });

  expect(response.status()).toBe(200);

  const body = await response.json();
  const user = body.data;

  expect(user.id).toBe(2);
  expect(user.email).toBeTruthy();
  expect(user.first_name).toBeTruthy();
  expect(user.last_name).toBeTruthy();

  console.log('[GET-EXISTING] Validated:', user);
});

// ---------------------------------------------------------------------------
// Test 4: Update user — PUT /api/users/{dynamicUserId}
// Validate HTTP 200, response reflects updated name and job
// ---------------------------------------------------------------------------
test('PUT /api/users/{dynamicId} — update name, validate 200 and updated fields', async ({ request }) => {
  expect(dynamicUserId, 'dynamicUserId must be set by the POST test').toBeTruthy();

  const response = await request.put(
    `${config.reqres.baseUrl}/api/users/${dynamicUserId}`,
    {
      headers: {
        'x-api-key': config.reqres.apiKey,
        'Content-Type': 'application/json'
      },
      data: {
        name: 'FinacPlus QA Updated',
        job:  'Senior Automation Engineer'
      }
    }
  );

  expect(response.status(), 'PUT should return 200 OK').toBe(200);

  const body = await response.json();
  console.log('[PUT] Response:', JSON.stringify(body));

  expect(body.name).toBe('FinacPlus QA Updated');
  expect(body.job).toBe('Senior Automation Engineer');

  console.log(`[PUT] User ${dynamicUserId} updated. name=${body.name}, job=${body.job}`);
});
