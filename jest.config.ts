import { createDefaultPreset } from 'ts-jest'
import { pathsToModuleNameMapper } from 'ts-jest'
import type { JestConfigWithTsJest } from 'ts-jest'
import { compilerOptions } from './tsconfig.json'

const jestConfig: JestConfigWithTsJest = {
  ...createDefaultPreset(),
  testEnvironment: 'node',
  roots: ['.'],
  modulePaths: [compilerOptions.baseUrl],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
  transform: {
    '^.+.ts?$': ['ts-jest', {}],
  },
}

export default jestConfig
