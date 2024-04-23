# Your Python code should produce a single JSON-serializable result
import time
import copy
import random
import math

import jsonpickle

class Node():
  def __init__(self, parent, action):
    self.parent = parent
    self.action = action
    self.children = []
    self.score = 0
    self.visits = 0
    
  def __repr__(self) -> str:
    return f"Node({jsonpickle.encode(self, unpicklable=False)})"
  
  def expected_value(self):
    return self.score / self.visits if self.visits > 0 else 0 # Should the default value be 0 or None?

  def is_leaf(self):
    return len(self.children) == 0
  
  def is_terminal(self):
    if len(self.children) != 0:
      return False
    
    return len(legal_actions(self)) == 0
  
  def history(self):
    history = []
    node = self

    while node.parent is not None:
      history.append(node)
      node = node.parent

    return history
  
  def backpropagate(self, score):
    self.visits += 1
    self.score += score

    if self.parent is not None:
      self.parent.backpropagate(score)
  
  def expand(self):
    for action in legal_actions(self):
      child = Node(parent=self, action=action)
      self.children.append(child)

class Action():
  def __init__(self, id, cost):
    self.id = id
    self.description = f"Action {id}"
    self.cost = cost

def upper_confidence_bound(node, exploration_exploitation_parameter):
  if node.visits == 0:
    return 0.5

  exploitation = node.score / node.visits
  exploration = exploration_exploitation_parameter * math.sqrt(2 * math.log(node.parent.visits) / node.visits)
  return exploitation + exploration

def select(node):
  children = node.children
  if len(children) == 0:
    return node # The current node is a leaf node

  best_child = []
  best_score = float("-inf")

  for child in children:
    score = upper_confidence_bound(child, exploration_exploitation_parameter=1.5)

    if score > best_score:
      best_score = score
      best_child = [child]
    elif score == best_score:
      best_child.append(child)

  return random.choice(best_child) if len(best_child) > 0 else node

def rollout(node):
  # Simulate a random game from the current node
  current = node
  while not current.is_terminal():
    action = random.choice(legal_actions(current))
    current = Node(parent=current, action=action)

  # Score the game
  score = 0
  for node in current.history():
    score += node.action.id
  
  # You win if the score is greater than 4
  return 1 if score > 4 else 0


total_actions = []
for i in range(3):
  total_actions.append(Action(id=i, cost=i))

def legal_actions(node):
  history = node.history()

  if len(history) >= 3: # A legal game is 3 actions
    return []

  # actions = copy.deepcopy(total_actions)
  # for node in history:
  #   actions.remove(node.action)

  return copy.deepcopy(total_actions)

def breadth_first_search(node, on_visit):
  queue = [node]

  while len(queue) > 0:
    current = queue.pop(0)
    on_visit(current)

    for child in current.children:
      queue.append(child)

def monte_carlo_tree_search(max_runtime=1.0, max_iterations=1000):
  root = Node(parent=None, action=None)

  start_time = time.time()
  for iteration in range(max_iterations):
    if time.time() - start_time > max_runtime:
      break
    
    # Select Node to Expand
    current = root
    while not current.is_leaf():
      current = select(current)
    
    # Expand Node
    current.expand()
    current = select(current)
    
    # Simulate
    score = rollout(current)
    
    # Backpropagate
    current = current.backpropagate(score)

  best_move = None
  for move in root.children:
    if best_move is None or move.expected_value() > best_move.expected_value():
      best_move = move

  best_action = best_move.action if best_move is not None else None

  return root, best_action


def main():
  actions = []
  for i in range(3):
    actions.append(Action(id=i, cost=i))

  start = time.time()
  tree, solution = monte_carlo_tree_search()
  end = time.time()

  # Remove parent references for JSON serialization as it causes a circular reference
  breadth_first_search(tree, lambda node: delattr(node, "parent"))

  return jsonpickle.encode({
    "actions": actions,
    "solution": solution,
    "tree": tree,
    "time": end - start
  }, unpicklable=False)

main()