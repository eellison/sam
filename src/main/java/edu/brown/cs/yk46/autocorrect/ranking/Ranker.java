package edu.brown.cs.yk46.autocorrect.ranking;

import java.util.Comparator;
import java.util.Map;

import edu.brown.cs.yk46.autocorrect.ranking.ngram.Bigram;
import edu.brown.cs.yk46.autocorrect.ranking.ngram.Ngram;
import edu.brown.cs.yk46.autocorrect.ranking.ngram.Unigram;

public class Ranker implements Comparator<Ngram> {

  private static final int FIRST_BEFORE_SECOND = -1; 
  private static final int EQUAL = 0;
  private static final int SECOND_BEFORE_FIRST = 1;

  private Map<Ngram, Integer> ngramFreqMap;
  private String previous;
  private String last;
  private boolean isSmart;

  public Ranker(Map<Ngram, Integer> ngramFreqMap, String previous, String last, boolean isSmart) {
    this.ngramFreqMap = ngramFreqMap;
    this.previous = previous;
    this.last = last;
    this.isSmart = isSmart;
  }

  @Override
  public int compare(Ngram n1, Ngram n2) {
    String n1Str = n1.getWordA();
    String n2Str = n2.getWordA();

    if(n1.equals(n2)) {
      return EQUAL;
    }

    //If there is an exact match, this should always be the first suggestion.
    if(n1Str.equals(last)) {
      return FIRST_BEFORE_SECOND;
    } else if(n2Str.equals(last)) {
      return SECOND_BEFORE_FIRST;
    }

    //If there are multiple words in the input field it should check the previous word, and rank suggestions
    //based on how likely they are to appear after the previous word (based on the text file).
    if(!previous.equals("") && ngramFreqMap.getOrDefault(new Bigram(previous, n1Str), 0) > ngramFreqMap.getOrDefault(new Bigram(previous, n2Str), 0)) {
      return FIRST_BEFORE_SECOND;
    } else if(!previous.equals("") && ngramFreqMap.getOrDefault(new Bigram(previous, n1Str), 0) < ngramFreqMap.getOrDefault(new Bigram(previous, n2Str), 0)) {
      return SECOND_BEFORE_FIRST;
    } 

    //If there is a tie in the likelihood the word is going to appear next,
    //the words should be ranked according to the smart ranking (if applicable)
    if(isSmart) {
      SmartRanker sr = new SmartRanker(last);
      int smartVal = sr.compare(n1, n2);

      if(smartVal != EQUAL) {
        return smartVal;
      }
    }

    //and then by how often the word appears in the corpus (unigram frequency)
    if(ngramFreqMap.getOrDefault(new Unigram(n1Str), 0) > ngramFreqMap.getOrDefault(new Unigram(n2Str), 0)) {
      return FIRST_BEFORE_SECOND;
    } else if(ngramFreqMap.getOrDefault(new Unigram(n1Str), 0) < ngramFreqMap.getOrDefault(new Unigram(n2Str), 0)) {
      return SECOND_BEFORE_FIRST;
    }

    //Finally, if there is a tie in both above cases then the words should be ranked by alphabetical order.
    return n1.getAllWords().compareTo(n2.getAllWords());
  }
}
