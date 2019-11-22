/* eslint-disable quotes */
const express = require('express');
const LanguageService = require('./language-service');
const { requireAuth } = require('../middleware/jwt-auth');
const { LinkedList } = require('../../Utils/LinkedList');

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
        nextWord: head[0].original,
        wordCorrectCount: head[0].correct_count,
        wordIncorrectCount: head[0].incorrect_count,
        totalScore: req.language.total_score
      });
      
      next();
    } catch(error) {
      next(error);
    }
  });

languageRouter
  .post('/guess', async (req, res, next) => {
    try {
      const { guess } = req.body;

      if(!guess) {
        return res.status(400).json( {error: `Missing 'guess' in request body`} );
      }

      // Creating our Linked List class to populate
      const list = new LinkedList();
      const db = req.app.get('db');

      // Need to find the head and insert that first in our linked list. Our language object contains the head, so we will reference that value
      let headWord = await LanguageService.getHeadWord(db, req.language.head);
      let words = await LanguageService.getLanguageWords(db, req.language.id);
      list.insertFirst(headWord[0]);


      // Need to populate the rest of the linked list according to the "next" values
      while(headWord[0].next !== null) {
        let currNode = words.find(word => word.id === headWord[0].next);
        list.insertLast(currNode);
        headWord = [currNode];
      }


      let isCorrect;
      if(list.head.value.translation.toLowerCase() === guess.toLowerCase()) {
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
      //Now we have finished organizing the LINKED LIST...We still need to organize the DB to reflect the changes to the linked list

      
      //Now that we removed the previous head, we are storing the value of the new head
      let tempNode = list.head;
      let head = tempNode.value.id;
      
      //This while loop will organize our DB to reflect the changes in our linked list
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
        req.user.id,
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


      return res.status(200).json(response);
    } catch(error) {
      next(error);
    }
  });

module.exports = languageRouter;