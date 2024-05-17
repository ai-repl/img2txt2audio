export function decodeBase64Image(dataString: string) {
  const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

  return {
    type: matches?.[1],
    data: matches?.[2],
  };
}
