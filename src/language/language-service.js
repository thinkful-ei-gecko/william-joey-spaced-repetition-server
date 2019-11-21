const { LinkedList } = require('../../Utils/LinkedList');

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

  updateLanguage(db, id, user_id, newLanguageFields) {
    return db('language')
      .where(id, user_id)
      .update(newLanguageFields);
    // .catch(err => console.log(err));
  },

  updateWord(db, word_id, newWordFields) {
    return db('word')
      .where('id', word_id)
      .update(newWordFields);
    // .catch(err => console.log(err));
  },

  // async memoryAlgorithm(list, userAnswer, language, db) {
  //   let isCorrect;
  //   if(list.head.value.translation.toLowerCase() === userAnswer.toLowerCase()) {
  //     isCorrect = true;
  //     list.head.value.memory_value *= 2;
  //     language.total_score++;
  //     list.head.value.correct_count++;
  //   } else {
  //     isCorrect = false;
  //     list.head.value.memory_value = 1;
  //     list.head.value.incorrect_count++;
  //   }

  //   //Storing the value of the head we are about to remove
  //   const removedHead = list.head.value;
  //   list.remove(head);
  //   list.insertAt(list, removedHead, removedHead.memory_value);
  //   //Now the Linked List reflects the new order. BUT we need to reflect the order change in the database 
    
    
  //   //Now that we removed the previous head, we are storing the value of the new head
  //   let currNode = list.head;
  //   let head = currNode.value.id;

  //   while(currNode !== null) {
  //     await this.updateWord(
  //       db, 
  //       currNode.value.id, 
  //       {
  //         memory_value: currNode.value.memory_value,
  //         correct_count: currNode.value.correct_count,
  //         incorrect_count: currNode.value.incorrect_count,
  //         next: currNode.next !== null ? currNode.next.value.id : null
  //       }
  //     );
  //     currNode = currNode.next;
  //   }

  //   await this.updateLanguage(
  //     db,
  //     language.id,
  //     language.user_id,
  //     {
  //       total_score: language.total_score,
  //       head
  //     }
  //   );
    
  //   const response = {
  //     nextWord: list.head.value.original,
  //     wordCorrectCount: list.head.value.correct_count,
  //     wordIncorrectCount: list.head.value.incorrect_count,
  //     totalScore: language.total_score,
  //     answer: removedHead.translation,
  //     isCorrect
  //   };

  //   return response;
  // }
};

module.exports = LanguageService;


//JUST IN CASE:
// getWordById(db, id) {
//   return db
//     .from('word')
//     .select('*')
//     .where({ id });
// },