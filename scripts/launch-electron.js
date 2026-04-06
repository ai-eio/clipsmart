#!/usr/bin/env node
// Launches Electron with ELECTRON_RUN_AS_NODE removed from the environment.
// This is necessary when running inside VS Code / Cursor, which sets
// ELECTRON_RUN_AS_NODE=1 and would otherwise cause Electron to behave
// like plain Node.js instead of launching the GUI app.

const { spawn } = require('child_process')
const path = require('path')

const electronExe = require('electron') // returns path to the binary
const appDir = path.resolve(__dirname, '..')
const args = [appDir, ...process.argv.slice(2)]

const env = { ...process.env }
delete env.ELECTRON_RUN_AS_NODE

const child = spawn(electronExe, args, { stdio: 'inherit', env, windowsHide: false })
child.on('close', (code) => process.exit(code ?? 0))
