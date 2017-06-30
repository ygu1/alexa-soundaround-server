const awsModel = require('../models/aws.js');

module.exports = (app) => {
  const getItemByUserId = async (req, res) => {
    try {
      const response = await awsModel.getItemByUserId(req.params.userId);
      res.status(200).send(response);
    } catch (e) {
      res.status(400).send(e);
    }
  };
  const putItem = async (req, res) => {
    try {
      const response = await awsModel.putItem(req.body);
      res.status(200).send(response);
    } catch (e) {
      res.status(400).send(e);
    }
  };
  const deleteItem = async (req, res) => {
    try {
      const response = await awsModel.deleteItem(req.params.userId);
      res.status(200).send(response);
    } catch (e) {
      res.status(400).send(e);
    }
  };
  const updateItem = async (req, res) => {
    try {
      const response = await awsModel.updateItem(req.body);
      res.status(200).send(response);
    } catch (e) {
      res.status(400).send(e);
    }
  };
  app.get('/api/aws/:userId', getItemByUserId);
  app.post('/api/aws/', putItem);
  app.delete('/api/aws/:userId', deleteItem);
  app.put('/api/aws', updateItem);
};
