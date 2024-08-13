import { LambdaHandler } from '../../src/index';

export async function applicationHandler(event: any, context: any): Promise<unknown> {
  const _handler = await LambdaHandler();
  const result = await _handler(event, context);

  return result;
}
