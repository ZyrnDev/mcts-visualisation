# Your Python code should produce a single JSON-serializable result
import time
import copy
import random

import jsonpickle

class Node():
  def __init__(self, parent, action):
    self.parent = parent
    self.children = []
    self.action = action
    self.expected_value = 0
    self.visits = 0
    
  def __repr__(self) -> str:
    return f"Node({jsonpickle.encode(self, unpicklable=False)})"

  def is_leaf(self):
    return len(self.children) == 0
  
  def history(self):
    history = []
    node = self

    while node.parent is not None:
      history.append(node)
      node = node.parent

    return history

    # def is_terminal(self):
    #   history = self.history()
    #   if len(history) == 9:
    #     return True  


  # def select(self, actions):
  #   actions = copy.deepcopy(actions)
  #   action = random.choice(actions)

  #   while action in self.children && len(actions) > 0:
  #     actions.remove(action)
  #     action = random.choice(actions)
    
  #   if len(actions) == 0:
  #     return None
  #   return action




class Action():
  def __init__(self, id, cost):
    self.id = id
    self.cost = cost

def monte_carlo_tree_search(actions, exploration_exploitation_parameter, max_runtime=1.0, max_iterations=1000):
  root = Node(parent=None, action=None)
  root.remaining_actions = copy.deepcopy(actions)

  start_time = time.time()
  for iteration in range(max_iterations):
    if time.time() - start_time > max_runtime:
      break

    # print("Select Subtree")
    current = root
    while not current.is_leaf():
      # print("Select Child")
      current = select(current, exploration_exploitation_parameter)
      
    # print("Expand Subtree")
    
    print("Simulate")
    print("Backpropagate")
    break

def 
    

def select(node, exploration_exploitation_parameter):
  children = node.children
  if len(children) == 0:
    return None # No children to select from

  best_child = None
  best_score = float("-inf")

  for child in children:
    exploitation = child.expected_value / child.visits
    exploration = exploration_exploitation_parameter * math.sqrt(2 * math.log(node.visits) / child.visits)
    score = exploitation + exploration

    if score > best_score:
      best_score = score
      best_child = child

  return best_child

def expand(node, actions):
    actions = copy.deepcopy(actions)
    for action in [child.action for child in node.children]:
      actions.remove(action)

    if len(actions) == 0:
      return None # No actions to expand
    
    action = random.choice(actions)
    child = Node(parent=node, action=action)


def main():
  actions = []
  for i in range(3):
    actions.append(Action(id=i, cost=i))

  start = time.time()
  monte_carlo_tree_search(actions, 1.0)
  end = time.time()

  return jsonpickle.encode({
    "actions": actions,
    "time": end - start
  }, unpicklable=False)

main()