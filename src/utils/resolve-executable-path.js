const { runCommand } = require('./process-executor')

const DEFAULT_SHELL_PATH = '/bin/zsh'
const DEFAULT_RESOLVE_EXECUTABLE_TIMEOUT_MS = 5_000

const extractPathCandidates = (output) => {
  if (typeof output !== 'string' || output.trim().length === 0) {
    return []
  }

  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      if (!line.includes('/')) {
        return []
      }

      const matches = line.match(/\/[^\s"'`]+/g)
      return Array.isArray(matches) ? matches : []
    })
}

const resolveCandidateExecutablePath = ({ output, commandName } = {}) => {
  const normalizedCommandName = typeof commandName === 'string'
    ? commandName.trim().toLowerCase()
    : ''
  if (!normalizedCommandName) {
    return ''
  }

  const candidates = extractPathCandidates(output)
  const matchingCandidates = candidates.filter((candidate) => {
    const normalizedCandidate = candidate.toLowerCase()
    return normalizedCandidate.includes(`/${normalizedCommandName}`)
  })

  return matchingCandidates[matchingCandidates.length - 1] || ''
}

const resolveExecutablePath = async (commandName, {
  logger = console,
  runCommandImpl = runCommand,
  shellPath = DEFAULT_SHELL_PATH,
  timeoutMs = DEFAULT_RESOLVE_EXECUTABLE_TIMEOUT_MS
} = {}) => {
  const normalizedCommandName = typeof commandName === 'string' ? commandName.trim() : ''
  if (!normalizedCommandName) {
    return ''
  }

  // This intentionally spawns a login shell so tools installed via shell init
  // systems like nvm can be discovered from GUI-launched app processes.
  const commandResult = await runCommandImpl({
    command: shellPath,
    args: [
      '-ilc',
      'command -v "$1"',
      'resolve-executable-path',
      normalizedCommandName
    ],
    timeoutMs,
    logger
  })

  if (!commandResult.ok) {
    return ''
  }

  const resolvedPath = resolveCandidateExecutablePath({
    output: commandResult.stdout,
    commandName: normalizedCommandName
  })

  if (!resolvedPath.startsWith('/')) {
    return ''
  }

  return resolvedPath
}

module.exports = {
  DEFAULT_RESOLVE_EXECUTABLE_TIMEOUT_MS,
  DEFAULT_SHELL_PATH,
  extractPathCandidates,
  resolveCandidateExecutablePath,
  resolveExecutablePath
}
