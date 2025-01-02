export const parseSvgString2ImageSrc = (svgString: string) => {
  return 'data:image/svg+xml;charset=utf8,' + encodeURIComponent(svgString);
};

export const parseSvgString = (svgContent: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, 'image/svg+xml');
  return doc;
};
