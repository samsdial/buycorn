import { getRedisClient, testRedisConnection } from '@/lib/redis';

async function testRedis() {
  console.error('Probando conexion');

  const connected = await testRedisConnection();
  console.error('Redis connected:', connected ? 'OK' : 'Fallo');

  if (connected) {
    const redis = getRedisClient();
    await redis.set('test-key', 'Hola desde Next.js');
    console.error('Dato guardado');

    const value = await redis.get('test-key');
    console.error('Dato leido:', value);

    await redis.del('test-key');
    console.error('dato eleminado');
  }
}

testRedis();
