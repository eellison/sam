package edu.brown.cs.yk46.autocorrect;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

import edu.brown.cs.yk46.autocorrect.ranking.Ranker;
import edu.brown.cs.yk46.autocorrect.ranking.ngram.Ngram;
import edu.brown.cs.yk46.autocorrect.suggestion.SuggestionContext;
import edu.brown.cs.yk46.autocorrect.suggestion.SuggestionStrategy;
import edu.brown.cs.yk46.util.CommandLineRepl;

public class AutocorrectLineRepl extends CommandLineRepl {

  private static final int NUMBER_OF_SUGGESTIONS = Integer.MAX_VALUE;

  private List<SuggestionStrategy> strategies;
  private Map<Ngram, Integer> ngramFreqMap;
  private boolean isSmart;

  public AutocorrectLineRepl(List<SuggestionStrategy> strategies, Map<Ngram, Integer> ngramFreqMap, boolean isSmart) {
    this.strategies = strategies;
    this.ngramFreqMap = ngramFreqMap;
    this.isSmart = isSmart;
  }

  @Override
  public String evaluateInput(String input) {
    if(Character.isWhitespace(input.charAt(input.length() - 1))) {
      return "\n";
    }

    String[] inputArr = input.toLowerCase().split(CorpusDataStore.PUNCTUATION_WHITESPACE_REGEX);
    String baseInput = getBaseInput(inputArr);
    String previous = "";
    String last = "";

    if(inputArr.length == 0) {
      return "\n";
    } else if(inputArr.length == 1) {
      last = inputArr[0];
    } else {
      previous = inputArr[inputArr.length - 2];
      last = inputArr[inputArr.length - 1];
    }

    List<Ngram> suggestions = new ArrayList<>();
    for(SuggestionStrategy ss : strategies) {
      SuggestionContext sc = new SuggestionContext(ss);
      suggestions.addAll(sc.generateSuggestions(last));
    }

    suggestions = new ArrayList<>(new HashSet<>(suggestions));

    Collections.sort(suggestions, new Ranker(ngramFreqMap, previous, last, isSmart));

    String ret = "";
    int iterNum = Math.min(NUMBER_OF_SUGGESTIONS, suggestions.size());
    for(int i = 0; i < iterNum; i++) {
      ret += baseInput + suggestions.get(i).getAllWords() + "\n";
    }

    return ret;
  }

  private String getBaseInput(String[] inputArr) {
    String ret = "";
    for(int i = 0; i < inputArr.length - 1; i++) {
      ret += inputArr[i] + " ";
    }

    return ret;
  }

}
