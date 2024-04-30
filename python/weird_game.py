import copy
import math
import random

GAME_LENGTH = 4
MAXIMUM_MOVE = 3
WINNING_SCORE = GAME_LENGTH * MAXIMUM_MOVE - 2 # You can win by playing up if you score between the maximum possible score and 2 less than the maximum possible score
print(WINNING_SCORE)

class Action():
  def __init__(self, id):
    self.id = id

  def __repr__(self) -> str:
    return f"Action({self.id})"

# The function will receive a list of actions to a terminal state and should return the score of the state.
def score(action_sequence):
  score = 0
  for action in action_sequence:
    score += action.id

  return 1 if score >= WINNING_SCORE else 0

def upper_confidence_bound(node, exploration_exploitation_parameter):
  if node.visits == 0:
    return 0.5

  exploitation = node.score / node.visits
  exploration = exploration_exploitation_parameter * math.sqrt(2 * math.log(node.parent.visits) / node.visits)
  return exploitation + exploration

# This function should return the child node with the highest UCB score. 
def select(node):
  if len(node.children) == 0:
    raise Exception("The current node is a leaf node, cannot select a child node.")

  best_child = []
  best_score = float("-inf")

  for child in node.children:
    score = upper_confidence_bound(child, exploration_exploitation_parameter=1.5)

    if score > best_score:
      best_score = score
      best_child = [child]
    elif score == best_score:
      best_child.append(child)

  return random.choice(best_child) if len(best_child) > 0 else node


total_actions = []
for i in range(1, MAXIMUM_MOVE + 1):
  total_actions.append(Action(id=i))

# This function should return a list of legal actions given the current state of the game, if the game is in a terminal state, return an empty list.
def legal_actions(action_sequence):
  if len(action_sequence) >= GAME_LENGTH: # A legal game is 3 actions
    return []

  return copy.deepcopy(total_actions)