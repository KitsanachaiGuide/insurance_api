module.exports = app => {
    const users = require('../controllers/user.controller');
    const router = require('express').Router();
  
    router.post('/', users.create);
  
    router.get('/', users.findAll);
  
    router.get('/:id', users.findOne);
  
    router.put('/:id', users.update);
  
    // Soft Delete
    router.delete('/:id', users.delete);
    
    router.patch('/:id/activate', users.activate);
  
    app.use('/api/users', router);
  };