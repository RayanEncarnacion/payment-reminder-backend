import * as crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { db } from '@db'
import 'dotenv/config'
import { refreshTokens } from '@db/schemas'

class JwtService {
  createAccessToken(payload: Record<string, any>) {
    try {
      return jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: process.env.JWT_EXPIRES_IN!,
      })
    } catch (error: any) {
      console.error(error)
      throw new Error('There was an error creating the JWT')
    }
  }

  async createRefreshToken(userId: number) {
    try {
      return await db.transaction(async (tx) => {
        const currentDate = new Date()
        const oneDayFromNow = new Date(
          currentDate.getTime() + 24 * 60 * 60 * 1000,
        )
        const tokenId = crypto.randomBytes(16).toString('hex')

        await tx.insert(refreshTokens).values({
          userId,
          tokenId,
          expiresAt: oneDayFromNow,
        })

        return jwt.sign({ tokenId, userId }, process.env.JWT_REFRESH_SECRET!, {
          expiresIn: '1d',
        })
      })
    } catch (error: any) {
      console.error(error)
      throw new Error('There was an error creating the refresh token')
    }
  }

  decryptAccessToken(token: string) {
    return jwt.verify(token, process.env.JWT_SECRET!)
  }

  createExpiredToken() {
    try {
      return jwt.sign({}, process.env.JWT_SECRET!, {
        expiresIn: 0,
      })
    } catch (error) {
      console.error(error)
      throw new Error('There was an error deleting the auth token')
    }
  }
}

export default new JwtService()
