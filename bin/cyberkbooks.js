#!/usr/bin/env node

import('../src/cli/index.mjs').catch((error) => {
  console.error(error);
  process.exitCode = 1;});
