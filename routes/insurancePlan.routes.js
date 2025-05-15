module.exports = app => {
  const insurancePlans = require('../controllers/insurancePlan.controller');
  const router = require('express').Router();

  router.post('/suggest-plan', insurancePlans.suggestPlan);

  router.get('/recommend/:userId', insurancePlans.recommendForUser);

  router.post('/', insurancePlans.create);

  router.get('/', insurancePlans.findAll);

  router.get('/:id', insurancePlans.findOne);

  router.put('/:id', insurancePlans.update);

  router.delete('/:id', insurancePlans.delete);

  app.use('/api/insurance-plans', router);
};