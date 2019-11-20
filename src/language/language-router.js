/* eslint-disable quotes */
const express = require('express');
const LanguageService = require('./language-service');
const { requireAuth } = require('../middleware/jwt-auth');

const languageRouter = express.Router();
const jsonParser = express.json();

languageRouter
  .use(requireAuth)
  .use(jsonParser)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id,
      );

      if (!language)
        return res.status(404).json({
          error: 'You don\'t have any languages',
        });

      req.language = language;
      next();
    } catch (error) {
      next(error);
    }
  });

languageRouter
  .get('/', async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      );

      res.json({
        language: req.language,
        words,
      });
      next();
    } catch (error) {
      next(error);
    }
  });

languageRouter
  .get('/head', async (req, res, next) => {
    try {
      const db = req.app.get('db');
      const headId = req.language.head;

      const head = await LanguageService.getHeadWord(db, headId);
      
      res.json({
        ...head,
        totalScore: req.language.total_score
      });

      next();
    } catch(error) {
      next(error);
    }
  });

languageRouter
  .post('/guess', async (req, res, next) => {
    try{
      const { guess } = req.body;

      if(!guess) {
        return res.status(400).json( {error: `Missing 'guess' in request body`} );
      }

      const db = req.app.get('db');
      const words = await LanguageService.getLanguageWords(db, req.language.id);
      const list = await LanguageService.populateLinkedList(words);

      LanguageService.memoryAlgorithm(list, guess, req.language, res, db);

      next();
    } catch(error) {
      next(error);
    }

    // res.send('implement me!');
  });

module.exports = languageRouter;
