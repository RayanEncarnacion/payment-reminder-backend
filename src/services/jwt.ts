import * as crypto from 'crypto'
import { eq } from 'drizzle-orm'
import { StatusCodes } from 'http-status-codes'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { db } from '@db'
import 'dotenv/config'
import { refreshTokensTable } from '@db/schemas'
import { APIError } from '@utils/classes'

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

        const [{ id }] = await tx
          .insert(refreshTokensTable)
          .values({
            userId,
            tokenId,
            expiresAt: oneDayFromNow,
          })
          .$returningId()

        return jwt.sign(
          { tokenId, userId, id },
          process.env.JWT_REFRESH_SECRET!,
          {
            expiresIn: '1d',
          },
        )
      })
    } catch (error: any) {
      console.error(error)
      throw new Error('There was an error creating the refresh token')
    }
  }

  decodeAccessToken(token: string) {
    return jwt.decode(token) as JwtPayload
  }

  verifyAccessToken(token: string) {
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
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

  async getRefreshToken(token: string) {
    try {
      const decoded = jwt.decode(token) as JwtPayload

      const result = await db
        .select({
          id: refreshTokensTable.id,
          used: refreshTokensTable.used,
        })
        .from(refreshTokensTable)
        .where(eq(refreshTokensTable.tokenId, decoded.tokenId))
        .limit(1)

      if (!result.length) {
        throw new APIError(StatusCodes.NOT_FOUND, 'Refresh token not found')
      }

      return decoded
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }

      throw new Error('There was an error getting the refresh token')
    }
  }

  async markRefreshTokenAsUsed(id: number) {
    try {
      await db
        .update(refreshTokensTable)
        .set({ used: 1 })
        .where(eq(refreshTokensTable.id, id))
    } catch (error) {
      console.error(error)
      throw new Error('There was an error marking the refresh token as used')
    }
  }
}

export default new JwtService()
