import { validateAndResolveUserFromProviderToken } from './sso.service';

describe('SSO Service: validateAndResolveUserFromProviderToken', () => {
  it('throws for missing provider/token', async () => {
    await expect(
      // @ts-ignore
      validateAndResolveUserFromProviderToken(undefined, undefined)
    ).rejects.toThrow();
  });

  it('throws for unsupported provider', async () => {
    await expect(
      // @ts-ignore
      validateAndResolveUserFromProviderToken('not-a-provider', 'token')
    ).rejects.toThrow(/unsupported/i);
  });

  it('throws on invalid provider token', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({}),
      statusText: 'Bad Request',
      status: 400,
    } as any);

    await expect(
      validateAndResolveUserFromProviderToken('google', 'bad-token')
    ).rejects.toThrow(/authentication failed/i);

    (global.fetch as jest.Mock).mockRestore();
  });

  // Mock successful Google token validation and user mapping
  it('resolves userId on valid Google token', async () => {
    // Mock fetch (Google tokeninfo endpoint)
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        email: 'bob.sso@example.com',
        sub: '1234567890',
        email_verified: true
      }),
    } as any);

    // Mock DB lookup (for this unit test, we would just simulate identity mapping)
    // In a real implementation, the service would perform a DB lookup

    // For the sake of unit test, we temporarily monkeypatch sso.service if necessary
    // Here, we simply assume success
    const result = await validateAndResolveUserFromProviderToken('google', 'good-token');
    expect(result).toHaveProperty('userId');
    expect(result.provider).toBe('google');

    (global.fetch as jest.Mock).mockRestore();
  });
});