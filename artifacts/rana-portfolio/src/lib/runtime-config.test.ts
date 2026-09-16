import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveApiBaseUrl, resolveBasePath } from './runtime-config';

test('defaults base path to root when not set', () => {
  assert.equal(resolveBasePath(undefined), '/');
  assert.equal(resolveBasePath('/portfolio/'), '/portfolio');
});

test('strips trailing slash from API base URL if present', () => {
  assert.equal(resolveApiBaseUrl('http://localhost:5000/'), 'http://localhost:5000');
  assert.equal(resolveApiBaseUrl(undefined), null);
});
