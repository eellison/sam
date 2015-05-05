package edu.brown.cs.yk46.autocorrect.suggestion;

import java.util.List;

import edu.brown.cs.yk46.autocorrect.ranking.ngram.Ngram;

public class SuggestionContext {

  private SuggestionStrategy strategy;

  public SuggestionContext(SuggestionStrategy strategy) {
    this.strategy = strategy;
  }

  public List<Ngram> generateSuggestions(String input) {
    return strategy.provideSuggestions(input);
  }

}
