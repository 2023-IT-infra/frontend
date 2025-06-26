import { mapDeviceFromApi } from '../api';

// Mock the global fetch function
const globalAny: any = global;

describe('deviceService', () => {
  beforeEach(() => {
    globalAny.fetch = jest.fn();
    localStorage.clear();
  });

  it('fetches all devices with auth headers', async () => {
    localStorage.setItem('auth_token', 'test-token');
    const originalUrl = process.env.NEXT_PUBLIC_API_URL;
    process.env.NEXT_PUBLIC_API_URL = 'https://svr.yukey.site';
    jest.resetModules();
    const { deviceService } = await import('../api');
    const devices = [{ id: 1 }];
    globalAny.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => devices,
      text: async () => JSON.stringify(devices),
    });

    const result = await deviceService.getAll();

    expect(globalAny.fetch).toHaveBeenCalledWith(
      'https://svr.yukey.site/api/v1/user/devices',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    );
    expect(result).toEqual(devices);
    process.env.NEXT_PUBLIC_API_URL = originalUrl;
  });
});

describe('mapDeviceFromApi', () => {
  it('maps API device to client model', () => {
    const apiDevice = {
      id: 1,
      name: 'Device',
      mac: '00:11:22:33:44:55',
      tx_power: -50,
      type: 'car',
      status: 1,
      add_date: '2024-01-01T00:00:00Z',
    };
    expect(mapDeviceFromApi(apiDevice)).toEqual({
      id: '1',
      name: 'Device',
      mac: '00:11:22:33:44:55',
      txPower: '-50',
      type: 'car',
      status: 'active',
      addDate: '2024-01-01T00:00:00Z',
    });
  });
});
