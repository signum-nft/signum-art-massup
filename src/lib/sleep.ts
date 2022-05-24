export function sleep(millies: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, millies);
  });
}
