const contentCache = new Map<string, Promise<string>>();

export function getArticleContent(id: string): Promise<string> {
  const cached = contentCache.get(id);
  if (cached) return cached;

  const promise = fetchArticleContent(id);
  contentCache.set(id, promise);
  return promise;
}

export function fetchArticleContent(id: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    setTimeout(() => {
      if (id === "1") {
        // bad id
        reject("Bad id");
      } else {
        resolve(
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus nibh mauris, aliquet vel commodo non, dignissim id massa. Quisque eget est dui. Interdum et malesuada fames ac ante ipsum primis in faucibus. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur dolor erat, faucibus ultricies arcu pretium, lacinia volutpat lorem. Curabitur vitae mi volutpat, lacinia justo id, convallis nulla. Cras venenatis eleifend tellus, ac convallis arcu fermentum non. Donec rutrum aliquet maximus. Nulla purus lacus, tristique vitae varius ut, fringilla sit amet sapien. Aliquam facilisis venenatis lectus, at laoreet enim luctus nec. Donec imperdiet semper lacus, non placerat tellus bibendum quis. Fusce sit amet sapien a felis vestibulum condimentum. Donec consequat, lacus eget placerat mattis, purus dolor dignissim sem, et aliquet erat ante at ipsum. Cras posuere nibh in nulla tempus eleifend. Nulla id bibendum risus, luctus varius nisi. Phasellus in fringilla lacus, non posuere libero. Pellentesque eu sodales lectus. Ut lacus ante, sodales at sollicitudin hendrerit, pretium vitae lacus. Proin commodo nibh id massa convallis vulputate eget quis odio. Sed quis ullamcorper est. Integer tempus neque vel nisi aliquet, in aliquet urna faucibus. Aenean eget nibh maximus, dictum sapien sed, accumsan lacus. Nullam in felis lectus. In a ullamcorper ante, sit amet mollis mi. Pellentesque a orci quam. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Duis tempus tristique libero ut volutpat. Pellentesque mattis tortor id mauris iaculis, non cursus neque efficitur. Duis non lorem feugiat, fringilla metus in, elementum mi. Sed pretium libero ac efficitur laoreet. Donec eu feugiat purus. Praesent convallis sapien et massa auctor dictum. Quisque eu sem ornare, tristique elit ac, semper urna. Vestibulum commodo volutpat rhoncus. Proin nec enim elit. Pellentesque pellentesque, dui id sagittis eleifend, eros massa porttitor enim, ut aliquet ante sem in mauris. Mauris convallis velit felis, quis gravida nisl mollis vitae. Sed facilisis vitae odio mattis pulvinar. Vivamus accumsan pharetra semper. Integer blandit dictum mi a dignissim. Proin nec sodales risus. Aliquam interdum sem et metus efficitur volutpat vel at odio. Fusce hendrerit erat ut est accumsan auctor. Nulla diam nisi, imperdiet ut placerat vel, egestas vitae arcu. Curabitur mattis tempus nibh sit amet porta. Sed sed velit a lacus pellentesque condimentum. Donec ac lorem felis. Nunc mollis dignissim ex vel finibus. Sed dui augue, pharetra quis laoreet sed, consectetur ut mi. Ut sed mollis turpis. Nunc dignissim, magna vel maximus rutrum, enim magna malesuada nisl, in dapibus mauris sem ullamcorper est. Nullam neque justo, posuere vel orci vel, placerat aliquet neque.",
        );
      }
    }, 3000);
  });
}
