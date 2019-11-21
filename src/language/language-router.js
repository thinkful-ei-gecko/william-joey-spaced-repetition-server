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

      // eslint-disable-next-line require-atomic-updates
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
    const db = req.app.get('db');

    try {
      const { guess } = req.body;

      if(!guess) {
        return res.status(400).json( {error: `Missing 'guess' in request body`} );
      }

      //DOUBLE-CHECK TO SEE IF THIS APPLIES CORRECTLY WHEN QUERIED WITH A NEW USER!!!!
      let words = await LanguageService.getLanguageWords(db, req.language.id);
      let list = await LanguageService.populateLinkedList(words);


      let isCorrect;
      if(guess.toLowerCase() === list.head.value.translation.toLowerCase()) {
        isCorrect = true;
        list.head.value.memory_value *= 2;
        list.head.value.correct_count++;
        req.language.total_score++;        
      } else {
        isCorrect = false;
        list.head.value.memory_value = 1;
        list.head.value.incorrect_count++;
      }
      
      //Storing the value of the head we are about to remove
      const removedHead = list.head.value;
      list.remove(list.head.value);
      list.insertAt(list, removedHead, removedHead.memory_value);
      //Now we have finished organizing the LINKED LIST...We still need to organize the DB to reflect the changes to the LL

      //Now that we removed the previous head, we are storing the value of the new head
      let tempNode = list.head;
      let head = tempNode.value.id;
      
      //This WHILE loop will organize our DB to reflect the changes in our LL
      //It is applying an update to EVERY word, so that the order does not change
      while(tempNode !== null) {
        await LanguageService.updateWord(
          db, 
          tempNode.value.id,
          {
            memory_value: tempNode.value.memory_value,
            correct_count: tempNode.value.correct_count,
            incorrect_count: tempNode.value.incorrect_count,
            next: tempNode.next !== null ? tempNode.next.value.id : null
          }
        );
        tempNode = tempNode.next;
      }

      //Updating the Language table so that the new HEAD is reflected and total score is updated
      await LanguageService.updateLanguage(
        db,
        req.language.id,
        req.language.user_id,
        {
          total_score: req.language.total_score,
          head
        }
      );

      const response = {
        nextWord: list.head.value.original,
        wordCorrectCount: list.head.value.correct_count,
        wordIncorrectCount: list.head.value.incorrect_count,
        totalScore: req.language.total_score,
        answer: removedHead.translation,
        isCorrect
      };

      // const response = await LanguageService.memoryAlgorithm(list, guess, req.language, db);

      return res.status(200).json(response);
    } catch(error) {
      next(error);
    }
  });

module.exports = languageRouter;



// JUST IN CASE (PUT BENEATH LINE 78):
// const list = new LinkedList();
// // .getWordById returns an array from the DB...we use ARRAY DESTRUCTURING to get the HEAD object.
// let [ headNode ] = await LanguageService.getWordById(db, req.language.head);
// list.insertFirst(headNode);

// while(headNode.next !== null) {
//   // We use ARRAY DESTRUCTURING here again as well
//   let [ lastNode ] = await LanguageService.getWordById(db, headNode.next);
//   list.insertLast(lastNode);
//   headNode = lastNode;
// }

