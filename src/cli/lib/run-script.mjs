import { spawn } from 'node:child_process';
import { repoRoot, resolveFromRepo } from './paths.mjs';

export function runScript(scriptPath, args = [], options = {}) {
  const commandArgs = [resolveFromRepo(scriptPath), ...args];

  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, commandArgs, {
      cwd: options.cwd ?? repoRoot,
      env: { ...process.env, ...(options.env ?? {}) },
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      const error = new Error(`Script exited with code ${code}`);
      error.exitCode = code;
      reject(error);
    });
  });
}
