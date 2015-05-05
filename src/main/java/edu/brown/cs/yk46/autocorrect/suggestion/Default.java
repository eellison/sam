package edu.brown.cs.yk46.autocorrect.suggestion;

import java.util.ArrayList;
import java.util.List;

import edu.brown.cs.yk46.autocorrect.ranking.ngram.Ngram;
import edu.brown.cs.yk46.autocorrect.ranking.ngram.Unigram;

public class Default extends SuggestionStrategy {

  public Default(Trie trie) {
    super(trie);
  }

  @Override
  public List<Ngram> provideSuggestions(String last) {
    List<Ngram> ret = new ArrayList<>();
    Trie trie = getTrie();

    if(trie.isValidWord(last)) {
      ret.add(new Unigram(last));
    }

    return ret;
  }

}
