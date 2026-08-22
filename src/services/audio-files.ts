import { File, Paths } from 'expo-file-system';

export function writeBase64Audio(base64: string, extension = 'wav'): File {
    const binary = globalThis.atob(base64);
    const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
    const safeExtension = extension.toLowerCase().replace(/^audio\//, '').replace(/^\./, '').replace(/[^a-z0-9]/g, '') || 'wav';
    const file = new File(Paths.cache, `savomind-reply-${Date.now()}.${safeExtension}`);
    file.create({ overwrite: true });
    file.write(bytes);
    return file;
}
