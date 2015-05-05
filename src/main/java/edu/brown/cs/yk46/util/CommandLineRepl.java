package edu.brown.cs.yk46.util;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public abstract class CommandLineRepl {

  private BufferedReader br;

  public CommandLineRepl() {
    this.br = new BufferedReader(new InputStreamReader(System.in));
  }

  public void run() throws IOException {
    while(true) {
      String input = br.readLine();

      if(input == null || input.equals("")) {
        break;
      }

      String output = evaluateInput(input);

      System.out.println(output);
    }
  }

  /**
   * An abstract method which evalutes the given input and returns a response as a String to be printed.
   * 
   * @param input
   * @return
   */
  protected abstract String evaluateInput(String input);
}
