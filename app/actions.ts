'use server'

export async function verifyPin(pin: string): Promise<boolean> {
  return pin === process.env.KITCHEN_PIN
}
