import bcrypt from 'bcrypt'

export async function hashPassword(password: string) {
  try {
    return await bcrypt.hash(password, 10)
  } catch (error) {
    console.error(error)
    throw new Error('There was an error hashing the password')
  }
}

export async function comparePassword(password: string, hash: string) {
  try {
    return await bcrypt.compare(password, hash)
  } catch (error: any) {
    console.error(error)
    throw new Error('There was an error comparing the passwords')
  }
}
