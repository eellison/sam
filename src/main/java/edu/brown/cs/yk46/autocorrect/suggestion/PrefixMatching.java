package edu.brown.cs.yk46.autocorrect.suggestion;

import java.util.ArrayList;
import java.util.List;

import edu.brown.cs.yk46.autocorrect.ranking.ngram.Ngram;
import edu.brown.cs.yk46.autocorrect.ranking.ngram.Unigram;
import edu.brown.cs.yk46.autocorrect.suggestion.Trie.TrieNode;

public class PrefixMatching extends SuggestionStrategy {

  public PrefixMatching(Trie trie) {
    super(trie);
  }

  @Override
  public List<Ngram> provideSuggestions(String last) {
    Trie trie = getTrie();
    List<Ngram> suggestions = traverse(last.substring(0, last.length() - 1), trie.search(last));

    return suggestions;
  }

  private List<Ngram> traverse(String prefix, TrieNode node) {
    if(node == null) {
      return new ArrayList<>();
    }

    List<Ngram> words = new ArrayList<>();
    String currPrefix = prefix + node.datum;
    if(node.datum == (char)0) {
      currPrefix = prefix;
    }

    if(node.wordCount > 0) {
      words.add(new Unigram(currPrefix));
    }

    for(int i = 0; i < node.children.size(); i++) {
      words.addAll(traverse(currPrefix, node.children.get(i)));
    }

    return words;
  }


}
