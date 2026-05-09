const express = require('express');
const router = express.Router();
const {
	registerToken,
	revokeToken,
	emergencyRevoke,
	buildRegisterTxn,
	submitRegisterTxn,
	buildRevokeTxn,
	submitRevokeTxn,
	getTxnInfo
} = require('../controllers/algorand.controller');

router.post('/register-token', registerToken);
router.post('/emergency-revoke', emergencyRevoke);
router.post('/build-register-txn', buildRegisterTxn);
router.post('/submit-register-txn', submitRegisterTxn);
router.post('/revoke-token', revokeToken);
router.post('/build-revoke-txn', buildRevokeTxn);
router.post('/submit-revoke-txn', submitRevokeTxn);
router.get('/tx/:txId', async (req, res, next) => {
	try {
		const txId = req.params.txId;
		const txn = await getTxnInfo(txId);
		res.status(200).json({ success: true, transaction: txn });
	} catch (error) {
		next(error);
	}
});

module.exports = router;
