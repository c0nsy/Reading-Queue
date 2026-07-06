export function assertUnreachable(x: never): never {
  throw new Error(`Unexpected object: ${x}`);
}
