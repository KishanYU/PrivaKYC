const algosdk = require('algosdk');

const getAlgodClient = () => {
    const server = process.env.ALGOD_SERVER;
    const token = process.env.ALGOD_TOKEN;
    const port = process.env.ALGOD_PORT;

    if (!server) {
        throw new Error('ALGOD_SERVER must be set');
    }

    return new algosdk.Algodv2(token, server, port);
};

const getIndexerClient = () => {
    const server = process.env.INDEXER_SERVER;
    const token = process.env.INDEXER_TOKEN;
    const port = process.env.INDEXER_PORT;

    if (!server) {
        throw new Error('INDEXER_SERVER must be set');
    }

    return new algosdk.Indexer(token || '', server, port);
};

const buildNote = (payload) => {
    const noteStr = JSON.stringify(payload);
    return new Uint8Array(Buffer.from(noteStr, 'utf-8'));
};

const buildUnsignedTxn = async ({ sender, note, receiver }) => {
    const algodClient = getAlgodClient();
    const params = await algodClient.getTransactionParams().do();

    // Use zero-ALGO payment with note as registry metadata
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: sender,
        to: receiver,
        amount: 0,
        note,
        suggestedParams: params
    });

    const txnBytes = txn.toByte();
    return {
        txId: txn.txID().toString(),
        unsignedTxn: Buffer.from(txnBytes).toString('base64')
    };
};

const submitSignedTxn = async (signedTxnBase64) => {
    const algodClient = getAlgodClient();
    const signedBytes = Buffer.from(signedTxnBase64, 'base64');
    const { txId } = await algodClient.sendRawTransaction(signedBytes).do();
    return txId;
};

const getTxnInfo = async (txId) => {
    const indexerClient = getIndexerClient();
    const result = await indexerClient.lookupTransactionByID(txId).do();
    return result?.transaction;
};

const isTxnConfirmed = async (txId) => {
    try {
        const txn = await getTxnInfo(txId);
        return Boolean(txn?.['confirmed-round']);
    } catch (error) {
        return false;
    }
};

const waitForConfirmation = async (txId, timeout = 4) => {
    const client = getAlgodClient();
    const status = await client.status().do();
    const startRound = status['last-round'];
    let currentRound = startRound;

    while (currentRound < startRound + timeout) {
        const pendingInfo = await client.pendingTransactionInformation(txId).do();
        if (pendingInfo['confirmed-round']) {
            return pendingInfo;
        }
        await client.statusAfterBlock(currentRound).do();
        currentRound++;
    }
    throw new Error(`Transaction ${txId} not confirmed after ${timeout} rounds`);
};

module.exports = {
    buildNote,
    buildUnsignedTxn,
    submitSignedTxn,
    getTxnInfo,
    isTxnConfirmed,
    waitForConfirmation
};
