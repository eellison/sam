package edu.brown.cs.yk46.autocorrect.suggestion;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import edu.brown.cs.yk46.autocorrect.ranking.ngram.Ngram;
import edu.brown.cs.yk46.autocorrect.ranking.ngram.Unigram;
import edu.brown.cs.yk46.autocorrect.suggestion.Trie.TrieNode;

public class LevenshteinEditDistance extends SuggestionStrategy {

  private int maxDistance;

  public LevenshteinEditDistance(Trie trie, int maxDistance) {
    super(trie);

    if(maxDistance < 0) {
      throw new IllegalArgumentException();
    }

    this.maxDistance = maxDistance;
  }

  @Override
  /**
   * 
   */
  public List<Ngram> provideSuggestions(String last) {
    List<Ngram> suggestions = new ArrayList<>();
    TrieNode root = getTrie().getRoot();
    int[] initialLedArr = initialLedArr(last.length() + 1);

    TrieNode child;
    for(int i = 0; i < root.children.size(); i++) {
      child = root.children.get(i);
      suggestions.addAll(calcLed(last, child, initialLedArr, "" + child.datum));
    }

    return suggestions;
  }

  private int[] initialLedArr(int length) {
    int[] ledArr = new int[length];
    for(int i = 0; i < length; i++) {
      ledArr[i] = i;
    }

    return ledArr;
  }

  private List<Ngram> calcLed(final String input, TrieNode currNode, int[] prevLedArr, String currWord) {
    List<Ngram> words = new ArrayList<>();
    int[] currLedArr = calcCurrLedArr(input, currNode.datum, prevLedArr);

    if(currNode.wordCount > 0 && currLedArr[input.length()] <= maxDistance) {
      words.add(new Unigram(currWord));
    }

    if(maxLedReached(currLedArr)) {
      return words;
    }

    TrieNode nextNode;
    for(int i = 0; i < currNode.children.size(); i++) {
      nextNode = currNode.children.get(i);
      words.addAll(calcLed(input, nextNode, currLedArr, currWord + nextNode.datum));
    }

    return words;
  }

  private int[] calcCurrLedArr(final String input, char datum, int[] prevLedArr) {
    int[] currLedArr = Arrays.copyOf(prevLedArr, prevLedArr.length);
    currLedArr[0]++;

    for(int j = 1; j < currLedArr.length; j++) {
      int delDist = prevLedArr[j] + 1;
      int insertDist = currLedArr[j-1] + 1;
      int subDist = prevLedArr[j - 1] + 1;

      if(datum == input.charAt(j - 1)) {
        subDist--;
      }

      currLedArr[j] = minOfThree(delDist, subDist, insertDist);
    }

    return currLedArr;
  }

  private boolean maxLedReached(int[] ledArr) {
    for(int i = 0; i < ledArr.length; i++) {
      if(ledArr[i] <= maxDistance) {
        return false;
      }
    }

    return true;
  }

  /**
   * 
   * 
   * @param a
   * @param b
   * @param c
   * @return
   */
  private int minOfThree(int a, int b, int c) {
    return Math.min(Math.min(a, b), c);
  }

}
