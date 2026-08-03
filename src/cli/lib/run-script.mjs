import { spawn } from 'node:child_process';
import { repoRoot, resolveFromRepo } from './paths.mjs';

export function runScript(scriptPath, args = [], options = {}) {
  const commandArgs = [resolveFromRepo(scriptPath), ...args];
  const captureOutput = options.stdio === 'pipe';

  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, commandArgs, {
      cwd: options.cwd ?? repoRoot,
      env: { ...process.env, ...(options.env ?? {}) },
      stdio: captureOutput ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    });
    let stdout = '';
    let stderr = '';

    if (captureOutput) {
      child.stdout?.on('data', (chunk) => {
        stdout += chunk.toString();
      });
      child.stderr?.on('data', (chunk) => {
        stderr += chunk.toString();
      });
    }

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve(captureOutput ? { stdout, stderr } : undefined);
        return;
      }

      const error = new Error(`Script exited with code ${code}`);
      error.exitCode = code;
      if (captureOutput) {
        error.stdout = stdout;
        error.stderr = stderr;
      }
      reject(error);
    });
  });
}
