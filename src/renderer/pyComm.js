import { PythonShell } from 'python-shell'
import path from 'path'

const pythonPathBase =
  path.join(
    (process.env.NODE_ENV !== 'development' ? path.join('resources/') : './'),
    'engine/'
  )

const pyOptions = {
  pythonPath: path.join(pythonPathBase, 'python'),
  mode: 'text',
  pythonOptions: [],
  scriptPath: path.join(pythonPathBase, 'ror/'),
  args: null
}

const calcPyOptions = {
  pythonPath: path.join(pythonPathBase, 'python/'),
  mode: 'text',
  pythonOptions: [],
  scriptPath: path.join(pythonPathBase, 'ror/'),
  args: null
}

export default {
  PythonShell,
  pyOptions,
  calcPyOptions
}
