import 'dotenv/config'
import bcrypt from 'bcrypt'

class AuthService {
  async hashPassword(password: string) {
    try {
      return await bcrypt.hash(password, +process.env.SALT_ROUNDS!)
    } catch (error) {
      console.error(error)
      throw new Error('There was an error hashing the password')
    }
  }

  async checkUserPassword(password: string, hash: string) {
    try {
      return await bcrypt.compare(password, hash)
    } catch (error: any) {
      console.error(error)
      throw new Error('There was an error comparing the passwords')
    }
  }
}

export default new AuthService()
