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

  memoryAlgorithm(list, userAnswer, language, res) {
    const head = list.head.value;
    let M = head.memory_value;

    if(head.translation === userAnswer) {
      M *= 2;
      // head.correct_count++;
      language.total_score++;

      const removedHead = list.head.value;

      list.remove(head);

      list.insertAt(removedHead, M);

      return res.status(200).json({
        nextWord: list.head.value.original,
        totalScore: language.total_score,
        wordCorrectCount: removedHead.correct_count,
        wordIncorrectCount: removedHead.incorrect_count,
        answer: removedHead.translation,
        isCorrect: true
      });

    } else {
      M = 1;
      // head.incorrect_count++;

      const removedHead = list.head.value;

      list.remove(head);

      list.insertAt(removedHead, M);

      return res.status(200).json({
        nextWord: list.head.value.original,
        totalScore: language.total_score,
        wordCorrectCount: removedHead.correct_count,
        wordIncorrectCount: removedHead.incorrect_count,
        answer: removedHead.translation,
        isCorrect: false
      });
    }
  }

};

module.exports = LanguageService;
