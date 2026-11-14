// Escape filesystem-sensitive tags while keeping ordinary Chinese tags readable.
export function tagKey(tag: string) {
  if (/^[\p{L}\p{N}-]+$/u.test(tag) && tag === tag.toLowerCase() && !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(tag)) return tag;
  return '~' + Buffer.from(tag, 'utf8').toString('hex');
}
export const tagUrl = (tag: string) => '/tags/' + encodeURIComponent(tagKey(tag)) + '/';
