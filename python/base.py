import time
import random

import jsonpickle

class Node():
  def __init__(self, parent, action):
    self.parent = parent
    self.action = action
    self.children = []
    self.score = 0
    self.visits = 0
  
  def expected_value(self):
    return self.score / self.visits if self.visits > 0 else 0 # Should the default value be 0 or None?

  def is_leaf(self):
    return len(self.children) == 0
  
  def is_terminal(self):
    if not self.is_leaf():
      return False
    
    return len(legal_actions(self.history())) == 0
  
  def history(self):
    history = []
    node = self

    # Ignore the root node as it has no action associated with it
    while node.parent is not None:
      history.append(node.action)
      node = node.parent

    return history
  
  def backpropagate(self, score):
    self.visits += 1
    self.score += score

    if self.parent is not None:
      self.parent.backpropagate(score)
  
  def expand(self):
    for action in legal_actions(self.history()):
      child = Node(parent=self, action=action)
      self.children.append(child)

def simulate(node):
  # Simulate a random game from the current node
  current = node
  while not current.is_terminal():
    action = random.choice(legal_actions(current.history()))
    current = Node(parent=current, action=action)

  return current

def breadth_first_search(node, on_visit):
  queue = [node]

  while len(queue) > 0:
    current = queue.pop(0)
    on_visit(current)

    for child in current.children:
      queue.append(child)

def monte_carlo_tree_search(max_runtime, max_iterations):
  root = Node(parent=None, action=None)

  start_time = time.time()
  for iteration in range(max_iterations):
    if time.time() - start_time > max_runtime:
      break
    
    # Select Node to Expand
    current = root
    while not current.is_leaf():
      current = select(current)
    
    # Expand the Leaf Node & Select a Child Node if Present
    current.expand()
    if not current.is_leaf():
      current = select(current)
    
    # Simulate (Rollout & Score)
    terminal_node = simulate(current)
    simulation_score = score(terminal_node.history())
    
    # Backpropagate
    current = current.backpropagate(simulation_score)

  best_move = None
  for move in root.children:
    if best_move is None or move.expected_value() > best_move.expected_value():
      best_move = move

  best_action = best_move.action if best_move is not None else None

  return root, best_action


def mcts_json(max_iterations=1000, max_runtime=1.0):
  start = time.time()
  tree, solution = monte_carlo_tree_search(max_runtime, max_iterations)
  end = time.time()

  # Remove parent references for JSON serialization as it causes a circular reference
  breadth_first_search(tree, lambda node: delattr(node, "parent"))
  # Convert the expected value to a JSON-serializable value
  breadth_first_search(tree, lambda node: setattr(node, "expected_value", node.expected_value()))
  # Convert the action to a string for JSON serialization
  breadth_first_search(tree, lambda node: setattr(node, "action", str(node.action)))

  return jsonpickle.encode({
    "solution": str(solution),
    "tree": tree,
    "time": end - start
  }, unpicklable=False)