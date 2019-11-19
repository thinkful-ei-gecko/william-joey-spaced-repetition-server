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
      const db = req.app.get('db');
      const language_id = req.language.id;

      const words = await LanguageService.getLanguageWords(db, language_id);
      const list = await LanguageService.populateLinkedList(words);

      const { guess } = req.body;
  
      if(!guess) {
        return res.status(400).json( {error: `Missing 'guess' in request body`} );
      }

      const language = req.language;


      LanguageService.memoryAlgorithm(list, guess, language, res);

      next();
    } catch(error) {
      next(error);
    }

    // res.send('implement me!');
  });

module.exports = languageRouter;


// Question:       1   2   3   4   5

// Memory_value:   1   1   1   1   1


// Question:       2   3   1   4   5

// Memory_value:   1   1   2   1   1


//Is the head going to constantly change? Do we need to look at the other "nodes" in our Linked List
//Is the correct approach to use the remove() and insertAt() methods in the Linked List and insertAt("M")?
//Are we only looking at the head, checking to see if the user's input === head.translation?
//What does it mean by move back the question "M" places in the list?? What happens if "M" is 1000, for example...
