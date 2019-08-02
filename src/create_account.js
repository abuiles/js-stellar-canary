import StellarSDK from 'stellar-sdk';
import request from 'request-promise';

import { HORIZON_URL } from './utils.js';

const { Keypair } = StellarSDK;

export async function createAccount() {
  const pair = Keypair.random();

  const response = await request.get({
    url: `${HORIZON_URL}/friendbot`,
    qs: { addr: pair.publicKey() },
    json: true
  });

  console.log('You have a new account :)\n', pair.publicKey());

  return pair;
}
