"use strict"
const express = require('express');
const slackConcoction = require('../models/slackTriggerModel');
const userController = require('./userController');
const Promise = require('bluebird');
// generate new concoction
const getTriggerParams = (api, username, res) => {
  if (api === 'slack') {
    return userController.getSlackId(username).then((slackId) => {
      console.log(slackId);
      if (slackId !== "No slack ID" && slackId !== "No user") {
        return slackId;
      } else {
        throw new error 
      }
    })
  } else {
    return userController.getUserData(username).then((user) => {
      return user.api;
    })
  } 
}

const getActionParams = (actionApi, actionParams, username) => { 
  return userController.getUserData(username).then((user) => {
    actionParams[actionApi] ='dummytest'; 
    return //needs to be evernote api
  });
}

const writeSlackModel = (trigger, slackUserId, actionApi, actionFunction, actionParams, res) => {
  slackConcoction.findOne({trigger: trigger}).then((doc) => {
    if(doc !== null) {
      console.log('updating trigger document');
      doc.action.push({
        slackUserId: slackUserId,
        actionApi: actionApi,
        actionFunction: actionFunction,
        actionParams: actionParams
      });
      doc.save((err, updated) => err ? res.status(402).send(err) : res.status(201).send(updated));
    } else {
      console.log('new trigger document about to be created!');
      slackConcoction.create({
        trigger: trigger,
        action: [{
          slackUserId: slackUserId,
          actionApi: actionApi,
          actionFunction: actionFunction,
          actionParams: actionParams
        }]
      },(err,doc) => err ? res.status(402).send(err) : res.status(201).send(doc));
    }
  })
}
exports.getSlackEvent = (eventName) => {
  return slackConcoction.findOne({trigger: eventName}).then((event)=>event.action);
}

exports.createSlackTrigger = (req,res) => {
  const testObj = {test: 'test'};
  const trigger = req.body.trigger;
  const username = req.body.username;
  const actionApi = req.body.actionApi
  const actionFunction = req.body.actionFunction;
  let actionParams = testObj;//this needs to be reset to req.body.actionParams;
  let slackUserId;
  getTriggerParams('slack', username, res)
  .then((slackId) => {
    slackUserId = slackId;
    return getActionParams(actionApi, actionParams, username)
  })
  .then(() => {
    actionParams = JSON.stringify(actionParams);
    writeSlackModel(trigger, slackUserId, actionApi, actionFunction, actionParams, res);
  })
  .catch(function(error) {
    res.status(404).send('no slack user or id');
  })
}

