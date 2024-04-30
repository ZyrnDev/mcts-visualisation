import copy
import math
import random

BOARD_SIZE = 3
BOARD_LENGTH = BOARD_SIZE * BOARD_SIZE

# Board State is stored as a row major 1D array of charccaters.
# The characters are either 'X', 'O' or ' '.
class Board():
  def __init__(self, action_sequence):
    self.board = [' '] * BOARD_LENGTH
    
    for action in action_sequence:
      x, y = action.position
      self.board[x * BOARD_SIZE + y] = 'X' if action.player == 0 else 'O'

  def rows(self):
    for x in range(BOARD_SIZE):


class Action():
  def __init__(self, id):
    self.id = id

  @property
  def player(self):
    return math.floor(self.id / BOARD_SIZE)
  
  @property
  def position(self):
    move = self.id % BOARD_SIZE
    x = math.floor(move / BOARD_SIZE)
    y = move % BOARD_SIZE
    return x, y
  

  def __repr__(self) -> str:
    return f"Action({self.id})"

# The function will receive a list of actions to a terminal state and should return the score of the state.
def score(action_sequence):
  board = get_board(action_sequence)

  # Check Verticals
  for x in range()

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
for i in range(0, 2 * BOARD_SIZE):
  total_actions.append(Action(id=i))

# This function should return a list of legal actions given the current state of the game, if the game is in a terminal state, return an empty list.
def legal_actions(action_sequence):
  actions = []
  for i, state in enumerate(get_board(action_sequence)):
    if state == ' ':
      actions.append(Action(id=i))

  return actions