package edu.brown.cs.yk46.autocorrect.suggestion;

import java.util.ArrayList;
import java.util.List;


public class Trie {

  static class TrieNode {
    char datum;
    int wordCount;
    List<TrieNode> children;

    TrieNode(char datum) {
      this.datum = datum;
      this.children = new ArrayList<>();
    }

    TrieNode(TrieNode node) {
      this.datum = node.datum;
      this.wordCount = node.wordCount;
      this.children = new ArrayList<>(node.children);
    }
  }

  protected static final char ROOT_DATUM = (char)0;

  private TrieNode root;

  public Trie() {
    this.root = new TrieNode(ROOT_DATUM);
  }

  public Trie(Trie trie) {
    this.root = new TrieNode(trie.root);
  }

  TrieNode getRoot() {
    return new TrieNode(root);
  }

  /**
   * Inserts str into the trie. If str already exists, insert will just update the word count of the node.
   * Otherwise, it will create a new node, adding it to the trie appropriately, and update the count.
   * 
   * @param str
   */
  public void insert(String str) {
    insertHelper(str, root);
  }

  /**
   * Helper method for the exposed insert method.
   * 
   * @param str
   * @param trieNode
   */
  private void insertHelper(String str, TrieNode trieNode) {
    if(str.equals("")) {
      trieNode.wordCount++;
      return;
    }

    char nodeDatum = str.charAt(0);

    for(int i = 0; i < trieNode.children.size(); i++) {
      if(nodeDatum == trieNode.children.get(i).datum) {
        insertHelper(getSuffix(str), trieNode.children.get(i));
        return;
      }
    }

    TrieNode newNode = new TrieNode(nodeDatum);
    trieNode.children.add(newNode);
    insertHelper(getSuffix(str), newNode);

  }

  /**
   * Returns the substring that excludes the first character of the input, str (i.e. the 'suffix').
   * 
   * @param str - the input string
   * @return the substring that excludes the first character of
   */
  private String getSuffix(String str) {
    return str.substring(1, str.length());
  }

  /**
   * 
   * @param str
   * @param trieNode
   * @return
   */
  TrieNode search(String str) {
    return searchHelper(str, root);
  }

  private TrieNode searchHelper(String str, TrieNode trieNode) {
    if(str.equals("")) {
      return trieNode;
    }

    char nodeDatum = str.charAt(0);

    for(int i = 0; i < trieNode.children.size(); i++) {
      if(nodeDatum == trieNode.children.get(i).datum) {
        return searchHelper(getSuffix(str), trieNode.children.get(i));
      }
    }

    return null;
  }

  public boolean isValidWord(String str) {
    TrieNode node = search(str);

    if(node == null) {
      return false;
    }

    return node.wordCount > 0;
  }

}
