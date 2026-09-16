import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/pyodide.mjs";

const PYODIDE_INDEX_URL = "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/";
const MAX_OUTPUT_LENGTH = 50_000;
let running = false;
let validateUserCode;
let currentRunId = null;
let pendingStdin = null;

function requestStdin(prompt) {
  if (!currentRunId || pendingStdin) {
    return Promise.reject(new Error("The active input request is unavailable."));
  }
  const requestId = crypto.randomUUID();
  return new Promise((resolve) => {
    pendingStdin = { runId: currentRunId, requestId, resolve };
    self.postMessage({ type: "stdin-request", runId: currentRunId, requestId, prompt: String(prompt ?? "") });
  });
}

const runtimePromise = loadPyodide({ indexURL: PYODIDE_INDEX_URL }).then((pyodide) => {
  validateUserCode = pyodide.runPython(`
import ast

def validate_user_code(source):
    tree = ast.parse(source, filename="main.py")
    for node in ast.walk(tree):
        if isinstance(node, (ast.Import, ast.ImportFrom)):
            raise PermissionError("Imports are disabled in this beginner sandbox.")
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == "__import__":
            raise PermissionError("Imports are disabled in this beginner sandbox.")

validate_user_code
  `);
  pyodide.registerJsModule("robin_stdin", { request: requestStdin });
  pyodide.runPython(`
import builtins
from pyodide.ffi import run_sync
from robin_stdin import request as request_stdin

def robin_input(prompt=""):
    return str(run_sync(request_stdin(str(prompt))))

builtins.input = robin_input
  `);
  self.postMessage({ type: "ready" });
  return pyodide;
}).catch((error) => {
  self.postMessage({ type: "init-error", error: String(error?.message ?? error) });
  throw error;
});

function appendOutput(current, next) {
  if (current.length >= MAX_OUTPUT_LENGTH) return current;
  const combined = current ? `${current}\n${next}` : String(next);
  if (combined.length <= MAX_OUTPUT_LENGTH) return combined;
  return `${combined.slice(0, MAX_OUTPUT_LENGTH)}\n[output truncated]`;
}

function formatPythonError(error) {
  const message = String(error?.message ?? error).trim();
  const lines = message.split("\n");
  const userCodeFrame = lines.findIndex((line) => line.includes('File "main.py"'));

  if (userCodeFrame >= 0) return lines.slice(userCodeFrame).join("\n").trim();
  if (lines[0]?.startsWith("Traceback")) return lines.at(-1)?.trim() || message;
  return message;
}

self.onmessage = async (event) => {
  const message = event.data;
  if (message?.type === "stdin-response") {
    if (!pendingStdin || message.runId !== pendingStdin.runId ||
        message.requestId !== pendingStdin.requestId || typeof message.value !== "string") return;
    const { resolve } = pendingStdin;
    pendingStdin = null;
    resolve(message.value.slice(0, 10_000));
    return;
  }
  if (!message || message.type !== "run" || typeof message.id !== "string" ||
      typeof message.code !== "string" || running) return;

  running = true;
  currentRunId = message.id;
  let stdout = "";
  let stderr = "";
  let globals;
  try {
    const pyodide = await runtimePromise;
    pyodide.setStdout({ batched: (line) => { stdout = appendOutput(stdout, line); } });
    pyodide.setStderr({ batched: (line) => { stderr = appendOutput(stderr, line); } });
    validateUserCode(message.code);
    globals = pyodide.globals.get("dict")();
    await pyodide.runPythonAsync(message.code, { globals, filename: "main.py" });
    self.postMessage({ type: "result", id: message.id, stdout, stderr, error: null });
  } catch (error) {
    self.postMessage({
      type: "result",
      id: message.id,
      stdout,
      stderr,
      error: formatPythonError(error),
    });
  } finally {
    pendingStdin = null;
    currentRunId = null;
    globals?.destroy?.();
    running = false;
  }
};
