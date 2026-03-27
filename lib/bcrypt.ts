import bcrypt from "bcryptjs";

export async function hashValue(value: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(value, salt);
}

export async function compareValue(value: string, hash: string): Promise<boolean> {
  return bcrypt.compare(value, hash);
}
