import { describe, expect, it } from 'vitest';

import { applicationName, applicationVersion } from '../src/index.js';

describe('project scaffold', () => {
  it('exposes the application identity', () => {
    expect(applicationName).toBe('xmind-md-ts');
    expect(applicationVersion).toBe('0.1.0');
  });
});
