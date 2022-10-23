export function cleanJson(payload: string): string {
  try {
    return JSON.stringify(JSON.parse(payload))
  } catch (e) {
    throw new Error('JSON payload is invalid')
  }
}