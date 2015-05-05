package edu.brown.cs.yk46.autocorrect.suggestion;

import java.util.List;

import edu.brown.cs.yk46.autocorrect.ranking.ngram.Ngram;

public abstract class SuggestionStrategy {

  private Trie trie;

  protected SuggestionStrategy(Trie trie) {
    this.trie = trie;
  }

  protected Trie getTrie() {
    return new Trie(trie);
  }

  /**
   * 
   * @param last
   * @return
   */
  public abstract List<Ngram> provideSuggestions(String last);
}
