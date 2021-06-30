import { PrismaClient } from '@prisma/client';
import express from 'express';
import { verify } from 'jsonwebtoken';
import { RefreshTokenPayload } from '../types/backingTypes';
import { JWT } from './jwt';

export function refreshTokenRoute(prisma: PrismaClient) {
  const router = express.Router();
  router.post('/refresh_token', async (req, res) => {
    const token = req.cookies[process.env.JWT_COKKIE_NAME!];
    if (!token) {
      return res
        .status(401)
        .send({ ok: false, accessToken: '', message: 'token does not exits' });
    }
    try {
      console.log(process.env.JWT_REFRESH_SECRET);
      const payload = verify(
        token,
        process.env.JWT_REFRESH_SECRET!,
      ) as RefreshTokenPayload;
      //token is valid
      // but for security we are also checking in database.
      console.log(payload);

      const user = await prisma.user.findFirst({
        where: {
          id: payload.id,
          email: payload.email,
          tokenVersion: payload.tokenVersion,
        },
      });
      console.log(user);
      if (!user) {
        return res.send({
          ok: false,
          accessToken: '',
          message: 'user payload is not correct',
        });
      } else {
        // creates new refresh token and sets into the cookie.
        const user = await prisma.user.update({
          where: { id: payload.id },
          data: {
            tokenVersion: {
              increment: 1,
            },
          },
        });
        JWT.CREATE_REFRESH_TOKEN(user, res);

        return res.send({
          ok: true,
          accessToken: JWT.CREATE_ACCESS_TOKEN(user),
        });
      }
    } catch (e) {
      res.send({ status: 401, message: e });
    }
  });
  return router;
}
