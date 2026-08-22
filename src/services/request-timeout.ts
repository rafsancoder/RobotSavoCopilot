export const DEFAULT_REQUEST_TIMEOUT_MS = 15_000;

export async function fetchWithTimeout(
    input: string,
    init: RequestInit = {},
    timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
    fetchImpl: typeof fetch = fetch,
): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetchImpl(input, { ...init, signal: controller.signal });
    } catch (error) {
        if (controller.signal.aborted) throw new Error(`Request timed out after ${timeoutMs} ms.`);
        throw error;
    } finally {
        clearTimeout(timer);
    }
}
