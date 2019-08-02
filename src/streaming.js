import StellarSDK from 'stellar-sdk';
import { createAccount } from './create_account.js';
import { HORIZON_URL } from './utils.js';

const { Asset, Server, TransactionBuilder, Networks, Operation } = StellarSDK;

async function * transfer(server, from, to) {
  while (true) {
    const account = await server.loadAccount(from.publicKey());

    const transaction = new TransactionBuilder(account, { fee: 100, networkPassphrase: Networks.TESTNET })
          .addOperation(
            Operation.payment({
              destination: to.publicKey(),
              asset: Asset.native(),
              amount: "100"
            })
        )
        .setTimeout(30)
        .build();


    transaction.sign(from);

    console.log('sending');
    const result = await server.submitTransaction(transaction);
    console.log('sent');

    yield result;
  }
}

async function stream() {
  const server = new Server(HORIZON_URL);

  const destination = await createAccount();
  const keypair = await createAccount();

  const builder = server.transactions().cursor('now').forAccount(keypair.publicKey());

  const stopper = builder.stream({
    onmessage: () => {
      console.log('received event')
    },
    onerror: (error) => {
      console.log('some error', error)
    }
  });

  const generator = await transfer(server, keypair, destination);

  while(true) {
    await generator.next();
  }

  return "done";
}

stream().then(()=> console.log("done"), (e) => console.log(e))
