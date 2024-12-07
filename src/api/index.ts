import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Levie Art API');
});

export default router