import { NextResponse } from "next/server";

type ApiError = {
  code: string;
  message: string;
};

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true as const,
      data,
    },
    { status },
  );
}

export function apiError(status: number, error: ApiError) {
  return NextResponse.json(
    {
      success: false as const,
      error,
    },
    { status },
  );
}
