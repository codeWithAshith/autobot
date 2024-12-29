import { getScripts } from "@/service/scripts";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  try {
    return NextResponse.json({ data: await getScripts() }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message, status: error.status },
      { status: error.code }
    );
  }
};
