// This function is a workaround for the limitation of btoa() which only supports ASCII characters.
// It correctly encodes Unicode strings to Base64.
export function b64EncodeUnicode(str: string): string {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode(Number(`0x${p1}`));
    })
  );
}

// This function decodes a Base64 string that was encoded with b64EncodeUnicode.
export function b64DecodeUnicode(str: string): string {
  return decodeURIComponent(
    atob(str)
      .split('')
      .map((c) => {
        return `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`;
      })
      .join('')
  );
} 