export function createArticle(url: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    setTimeout(() => {
      const roll = Math.random();
      if (roll > 0.5) {
        resolve(
          `created new article from ${url} of id: ${String(Math.floor(Math.random() * 1000))}`,
        );
      } else {
        reject(`Failed to create article from ${url}`);
      }
    });
  });
}
