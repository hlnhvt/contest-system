const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

function generateId() {
  return crypto.randomBytes(8).toString('hex');
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

function cleanup(...files) {
  for (const f of files) {
    try { fs.unlinkSync(f); } catch {}
  }
}

function execute(command, args, input, timeLimit) {
  return new Promise((resolve) => {
    const proc = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      proc.kill('SIGKILL');
    }, timeLimit);

    proc.stdout.on('data', (d) => { stdout += d.toString(); });
    proc.stderr.on('data', (d) => { stderr += d.toString(); });

    if (input !== null && input !== undefined) {
      proc.stdin.write(input);
      proc.stdin.end();
    }

    proc.on('close', (code) => {
      clearTimeout(timer);
      resolve({ stdout: stdout.trim(), stderr: stderr.trim(), exitCode: code, timedOut });
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      resolve({ stdout: '', stderr: err.message, exitCode: -1, timedOut: false });
    });
  });
}

async function judgeSubmission(code, language, testCases, timeLimit) {
  const id = generateId();
  const tmpDir = os.tmpdir();
  const filesToClean = [];

  try {
    let runCmd, runArgs;

    if (language === 'cpp') {
      const src = path.join(tmpDir, `${id}.cpp`);
      const bin = path.join(tmpDir, id);
      filesToClean.push(src, bin);
      writeFile(src, code);

      const cmp = await execute('g++', ['-O2', '-std=c++17', '-o', bin, src], null, 15000);
      if (cmp.exitCode !== 0) {
        return { verdict: 'compilation_error', message: cmp.stderr, time: 0 };
      }
      runCmd = bin;
      runArgs = [];

    } else if (language === 'python') {
      const src = path.join(tmpDir, `${id}.py`);
      filesToClean.push(src);
      writeFile(src, code);
      runCmd = 'python3';
      runArgs = [src];

    } else if (language === 'javascript') {
      const src = path.join(tmpDir, `${id}.js`);
      filesToClean.push(src);
      writeFile(src, code);
      runCmd = 'node';
      runArgs = [src];

    } else if (language === 'java') {
      const className = `Sol${id}`;
      const src = path.join(tmpDir, `${className}.java`);
      filesToClean.push(src);
      // Replace public class name
      const javaCode = code.replace(/public\s+class\s+\w+/, `public class ${className}`);
      writeFile(src, javaCode);

      const cmp = await execute('javac', [src], null, 20000);
      if (cmp.exitCode !== 0) {
        return { verdict: 'compilation_error', message: cmp.stderr, time: 0 };
      }
      runCmd = 'java';
      runArgs = ['-cp', tmpDir, className];
      filesToClean.push(path.join(tmpDir, `${className}.class`));
    } else {
      return { verdict: 'compilation_error', message: 'Unsupported language', time: 0 };
    }

    let maxTime = 0;

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const start = Date.now();
      const result = await execute(runCmd, runArgs, tc.input, timeLimit);
      const elapsed = Date.now() - start;
      maxTime = Math.max(maxTime, elapsed);

      if (result.timedOut) {
        return { verdict: 'time_limit_exceeded', time: elapsed };
      }
      if (result.exitCode !== 0) {
        return { verdict: 'runtime_error', message: result.stderr.slice(0, 500), time: elapsed };
      }

      const expected = tc.expected_output.trim().replace(/\r\n/g, '\n');
      const actual = result.stdout.trim().replace(/\r\n/g, '\n');
      if (actual !== expected) {
        return { verdict: 'wrong_answer', time: elapsed };
      }
    }

    return { verdict: 'accepted', time: maxTime };
  } finally {
    cleanup(...filesToClean);
  }
}

module.exports = { judgeSubmission };
