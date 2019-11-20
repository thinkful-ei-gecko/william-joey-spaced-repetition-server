const { LinkedList, size, display } = require('../../Utils/LinkedList');

const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score',
      )
      .where('language.user_id', user_id)
      .first();
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count',
      )
      .where({ language_id });
  },

  getHeadWord(db, headId) {
    return db
      .from('word')
      .select('*')
      .where('id', headId)
      .then(word => {
        return {
          nextWord: word[0].original,
          wordCorrectCount: word[0].correct_count,
          wordIncorrectCount: word[0].incorrect_count
        };
      });
  },

  populateLinkedList(array) {
    const list = new LinkedList();
    if(list.head === null) {
      list.insertFirst(array[0]);
    }

    let newArray = array.slice(1);
    newArray.map(word => {
      list.insertLast(word);
    });

    return list;
  },

  updateLanguage(db, language_id, newLanguageFields) {
    console.log(language_id);
    console.log(newLanguageFields);
    return db('language').where('id', language_id).update(newLanguageFields);
    // .update(newLanguageFields)
    // .from('language')
    // .where('id', language_id);
  },

  updateWord(db, word_id, newWordFields) {
    console.log(word_id);
    console.log(newWordFields);
    return db
      .update(newWordFields)
      .from('word')
      .where('id', word_id);
  },

  memoryAlgorithm(list, userAnswer, language, res, db) {
    let head = list.head.value;
    if(head.translation === userAnswer) {
      head.memory_value *= 2;
      language.total_score++;
      head.correct_count++;
      
      const removedHead = head; // Store value of the head we will remove

      list.remove(head); // Removing the current head from the LL

      let currNode = list.head.value; // This is the value of the NEW head

      // Insert the removed head back into the LL. If the memory value exceeds the size of the list, insert the removed HEAD at the END of the LL
      if(removedHead.memory_value >= size(list)) {
        list.insertLast(removedHead);

        //Updating Language table to refelct new HEAD and total score
        this.updateLanguage(db, language.id, {total_score: language.total_score, head: currNode.id});
        //Updating Word table to reflect removed HEAD being inserted at the END of the LL
        this.updateWord(db, removedHead.id, {memory_value: removedHead.memory_value, correct_count: removedHead.correct_count++, next: null});

      } else {
        list.insertAt(removedHead, removedHead.memory_value + 1);

        //Updating Language table to refelct new HEAD and total score
        this.updateLanguage(db, language.id, {total_score: language.total_score, head: currNode.id});
        //How will we get the NEXT value?
        this.updateWord(db, currNode.id, {memory_value: removedHead.memory_value, correct_count: removedHead.correct_count++, next: null});
      }

      return res.status(200).json({
        nextWord: list.head.value.original,
        totalScore: language.total_score,
        wordCorrectCount: list.head.value.correct_count,
        wordIncorrectCount: list.head.value.incorrect_count,
        answer: removedHead.translation,
        isCorrect: true
      });


    // IF THE USER GETS THE QUESTION WRONG  
    } else {
      head.memory_value = 1;
      head.incorrect_count++;

      const removedHead = head; // Store value of the head we will remove

      list.remove(head); // Removing the current head from the LL

      let currNode = list.head.value; // This is the value of the NEW head

      // The removed HEAD will always be inserted at the SECOND position in the LL
      list.insertAt(removedHead, head.memory_value + 1);

      // console.log(display(list));

      //Updating Language table to refelct new HEAD...Total score is unaffected since answer is wrong
      this.updateLanguage(db, language.id, {head: currNode.id});

      //Updating Word table to reflect removed HEAD being inserted at the SECOND POSITION in the LL...Next is now pointing to the current HEAD's next
      // this.updateWord(db, removedHead.id, {memory_value: removedHead.memory_value, incorrect_count: removedHead.incorrect_count, next: currNode.next});

      // Now that we have pointed the removed HEAD's next to the current HEAD's next, we can now update the current HEAD's next to point to the removed HEAD's next
      // this.updateWord(db, currNode.id, {next: removedHead.id});

      // return res.status(200).json({
      //   nextWord: list.head.value.original,
      //   totalScore: language.total_score,
      //   wordCorrectCount: list.head.value.correct_count,
      //   wordIncorrectCount: list.head.value.incorrect_count,
      //   // answer: list.head.value.translation,
      //   answer: removedHead.translation,
      //   isCorrect: false
      // });
    }
  },


  // IGNORE!!!!!
  // memoryAlgorithm(list, userAnswer, language, res, db) {
  //   const head = list.head.value;
  //   let M = head.memory_value;

  //   if(head.translation === userAnswer) {
  //     M *= 2;
  //     head.correct_count++;
  //     language.total_score++;
  //   } else {
  //     M = 1;
  //     head.incorrect_count++;
  //   }

  //   let removedHead = list.head; // We are storing current HEAD into a variable because we will be removing it, but need to insert it back into the LL

  //   list.remove(head); // After we store the value of the HEAD, we will remove it from the LL

  //   if(M >= size(list)) { // Then we want to insert our removed HEAD back into the LL, depending on the "M" or memory_value
  //     list.insertLast(removedHead.value);
  //   } else {
  //     list.insertAt(removedHead.value, M + 1);
  //   }

  //   let currNode = list.head; // currNode will be the value of the NEW HEAD

  //   // Now that we've removed the old HEAD and inserted it back into the LL, we want to update the TABLES
  //   // Update the Language table to reflect the NEW TOTAL SCORE AND HEAD
  //   LanguageService.updateLanguage(db, language.id, {total_score: language.total_score, head: currNode.value.id});

  //   // Update the Word table to reflect the OLD HEAD added back into the LL
  //   LanguageService.updateWord(db, removedHead.value.id, 
  //     {
  //       memory_value: removedHead.value.memory_value, 
  //       correct_count: removedHead.value.correct_count,
  //       incorrect_count: removedHead.value.incorrect_count,
  //       next: currNode.next.value.id
  //     });
    
  //   //Update the Word table to reflect the NEW HEAD changing
  //   LanguageService.updateWord(db, currNode.value.id, {
  //     memory_value: currNode.value.memory_value, 
  //     correct_count: currNode.value.correct_count,
  //     incorrect_count: currNode.value.incorrect_count,
  //     next: removedHead.value.id
  //   });
  // },

};

module.exports = LanguageService;

// IGNORE!!!!
// memoryAlgorithm(list, userAnswer, language, res, db) {
//   const head = list.head.value;

//   if(head.translation === userAnswer) {
//     head.memory_value *= 2;
    
//     // language.total_score++; // Need to update this into the database
//     LanguageService.updateLanguage(db, language.id, {total_score: language.total_score++});

//     const removedHead = list.head.value;
//     let currNode = list.head;
//     while(currNode !== null) {
//       currNode = currNode.next;
//     }

//     list.remove(head);

//     if(head.memory_value >= size(list)) {
//       list.insertLast(removedHead);
//       // removedHead.correct_count++;
//       // removedHead.next = null;
//       // currNode.next = removedHead;
//       LanguageService.updateLanguage(db, language.id, {total_score: language.total_score++, head: language.id});
//       LanguageService.updateWord(db, removedHead.id, {correct_count: removedHead.correct_count++, next: null});
//       LanguageService.updateWord(db, currNode.id, {next: removedHead.id});
//     } else {
//       list.insertAt(removedHead, head.memory_value + 1);
//       removedHead.correct_count++;
//       // removedHead.next = 
//       LanguageService.updateLanguage(db, language.id, {total_score: language.total_score++, head: language.head});
//       LanguageService.updateWord(db, currNode.id, {next: removedHead.id});
//     }


//     return res.status(200).json({
//       nextWord: list.head.value.original,
//       totalScore: language.total_score,
//       wordCorrectCount: list.head.value.correct_count,
//       wordIncorrectCount: list.head.value.incorrect_count,
//       answer: removedHead.translation,
//       isCorrect: true
//     });

//   } else {
//     head.memory_value = 1;
//     head.incorrect_count++;

//     const removedHead = list.head.value;
//     // removedHead.incorrect_count++;


//     list.remove(head);

//     list.insertAt(removedHead, head.memory_value + 1);

//     let currNode = list.head;

//     // console.log(display(list));
//     LanguageService.updateLanguage(db, language.id, {head: language.head});
//     LanguageService.updateWord(db, removedHead.id, {memory_value: removedHead.memory_value, incorrect_count: removedHead.incorrect_count, next: currNode.next.value.id}); //WORD WE REMOVED
//     LanguageService.updateWord(db, currNode.value.id, {next: removedHead.id}); // NEW HEAD
//     removedHead.incorrect_count++;

//     return res.status(200).json({
//       nextWord: list.head.value.original,
//       totalScore: language.total_score,
//       wordCorrectCount: list.head.value.correct_count,
//       wordIncorrectCount: list.head.value.incorrect_count,
//       // answer: list.head.value.translation,
//       answer: removedHead.translation,
//       isCorrect: false
//     });
//   }
// },
