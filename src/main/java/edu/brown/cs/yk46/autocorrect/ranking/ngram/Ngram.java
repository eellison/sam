package edu.brown.cs.yk46.autocorrect.ranking.ngram;

public abstract class Ngram {

  @Override
  public abstract int hashCode();

  @Override
  public abstract boolean equals(Object o);

  public abstract String getWordA();

  public abstract String getAllWords();
}
