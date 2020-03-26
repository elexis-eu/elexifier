export class PathBuilder {
  private pathJson;

  public constructor(pathJson) {
    this.pathJson = pathJson;
  }

  public getPathsForTag(tag: string) {
    const base = tag;

    const splitTags = tag.split('/');

    const parentTag = splitTags[splitTags.length - 2];
    const lastTag = splitTags[splitTags.length - 1];

    if (parentTag && this.pathJson[parentTag]) {
      const slicedBase = base.substring(0, base.lastIndexOf('/'));

      return this.pathJson[parentTag].child
        .filter(c => c.indexOf(lastTag) >= 0)
        .map(c => `${slicedBase}/${c}`);
    }

    const availableElements = Object.keys(this.pathJson);

    const newAvailableElements = [];
    availableElements.forEach((e) => {
      if (e.indexOf(lastTag) >= 0) {
        newAvailableElements.push(e);
      }
    });

    return newAvailableElements;
  }
}
