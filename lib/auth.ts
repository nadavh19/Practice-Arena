import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import type { User } from "@/app/generated/prisma/client";

type TokenPayload = {
  userId: string;
};

function getJwtSecret() {
  return process.env.JWT_SECRET;
}

function extractBearerToken(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return null;
  }

  const [scheme, token] = authHeader.split(" ");
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
    return null;
  }

  return token;
}

export function createToken(userId: string) {
  const jwtSecret = getJwtSecret();
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not set");
  }

  return jwt.sign({ userId }, jwtSecret, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  const jwtSecret = getJwtSecret();
  if (!jwtSecret) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    if (!decoded || typeof decoded !== "object" || !("userId" in decoded)) {
      return null;
    }

    const userId = decoded.userId;
    if (typeof userId !== "string") {
      return null;
    }

    return { userId };
  } catch {
    return null;
  }
}

export async function getAuthenticatedUserFromRequest(request: Request): Promise<User | null> {
  const token = extractBearerToken(request);
  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: payload.userId,
    },
  });

  return user;
}

export async function getRegularUserFromRequest(request: Request): Promise<User | null> {
  const user = await getAuthenticatedUserFromRequest(request);
  return user?.role === "user" ? user : null;
}

export async function getAdminFromRequest(request: Request): Promise<User | null> {
  const user = await getAuthenticatedUserFromRequest(request);
  return user?.role === "admin" ? user : null;
}

export const getUserFromRequest = getRegularUserFromRequest;
