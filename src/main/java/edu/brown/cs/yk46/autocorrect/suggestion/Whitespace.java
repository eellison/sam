package edu.brown.cs.yk46.autocorrect.suggestion;

import java.util.ArrayList;
import java.util.List;

import edu.brown.cs.yk46.autocorrect.ranking.ngram.Bigram;
import edu.brown.cs.yk46.autocorrect.ranking.ngram.Ngram;

public class Whitespace extends SuggestionStrategy {

  public Whitespace(Trie trie) {
    super(trie);
  }

  @Override
  public List<Ngram> provideSuggestions(String last) {
    Trie t = getTrie();

    List<Ngram> suggestions = new ArrayList<>();

    for(int i = 1; i < last.length(); i++) {
      String word1 = last.substring(0, i);
      String word2 = last.substring(i);

      if(t.isValidWord(word1) && t.isValidWord(word2)) {
        suggestions.add(new Bigram(word1, word2));
      }
    }

    return suggestions;
  }


}
