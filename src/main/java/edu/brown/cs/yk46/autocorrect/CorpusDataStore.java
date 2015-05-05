package edu.brown.cs.yk46.autocorrect;

import java.util.HashMap;
import java.util.Map;

import edu.brown.cs.yk46.autocorrect.ranking.ngram.Bigram;
import edu.brown.cs.yk46.autocorrect.ranking.ngram.Ngram;
import edu.brown.cs.yk46.autocorrect.ranking.ngram.Unigram;
import edu.brown.cs.yk46.autocorrect.suggestion.Trie;
import edu.brown.cs.yk46.util.DataStore;

public class CorpusDataStore extends DataStore {

  public static final String PUNCTUATION_WHITESPACE_REGEX = "[\\p{Punct}\\s]+";

  private String bigramNewlineBuffer;

  private Map<Ngram, Integer> ngramFreqMap = new HashMap<>();
  private Trie trie = new Trie();

  protected void storeData(String dataLine) {
    String[] dataLineArr = dataLine.toLowerCase().split(PUNCTUATION_WHITESPACE_REGEX);
    storeInTrie(dataLineArr);
    storeInNgramFreqMap(dataLineArr);
  }

  private void storeInTrie(String[] inputStrArr) {
    for(String s : inputStrArr) {
      trie.insert(s);
    }
  }

  private void storeInNgramFreqMap(String[] inputStrArr) {
    for(int i = 0; i < inputStrArr.length; i++) {
      if(i == 0 && bigramNewlineBuffer != null) {
        Ngram bigram = new Bigram(bigramNewlineBuffer, inputStrArr[0]);
        ngramFreqMap.put(bigram, ngramFreqMap.getOrDefault(bigram, 0) + 1);
      }

      Ngram unigram = new Unigram(inputStrArr[i]);
      ngramFreqMap.put(unigram, ngramFreqMap.getOrDefault(unigram, 0) + 1);

      if((i + 1) >= inputStrArr.length) {
        bigramNewlineBuffer = inputStrArr[i];
        break;
      }

      Ngram bigram = new Bigram(inputStrArr[i], inputStrArr[i+1]);
      ngramFreqMap.put(bigram, ngramFreqMap.getOrDefault(bigram, 0) + 1);
    }
  }

  public Map<Ngram, Integer> getNgramFreqMap() {
    return new HashMap<>(ngramFreqMap);
  }

  public Trie getTrie() {
    return new Trie(trie);
  }

}
