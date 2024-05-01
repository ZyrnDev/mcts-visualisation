import math
import random

BOARD_SIDE_LENGTH = 3
BOARD_LENGTH = BOARD_SIDE_LENGTH * BOARD_SIDE_LENGTH

MAX_TURNS = BOARD_LENGTH

EMPTY_CELL = ' '
PLAYERS = ['X', 'O'] # The first player is the player who has the initial move
AI_PLAYER = 'X'

# Board State is stored as a row major 1D array of charccaters.
# The characters are either 'X', 'O' or ' '.
class Board():
  def __init__(self, action_sequence):
    self.cells = [' '] * BOARD_LENGTH
    
    for action in action_sequence:
      self[action.position] = PLAYERS[action.player]

  def __str__(self):
    rows = self.rows()
    return "\n".join(["|".join(row) for row in rows]) + "\n"
  
  def __getitem__(self, position):
    x, y = position
    return self.cells[x + y * BOARD_SIDE_LENGTH]
  
  def __setitem__(self, position, value):
    x, y = position
    if self.cells[x + y * BOARD_SIDE_LENGTH] != EMPTY_CELL:
      raise Exception(f"Cell ({x}, {y}) is already occupied by {self.cells[x * BOARD_SIDE_LENGTH + y]}")
    
    self.cells[x + y * BOARD_SIDE_LENGTH] = value
  
  # This function should return
  def current_player(self):
    player_move_counts = [0 for _ in PLAYERS]

    for cell in self.cells:
      if cell in PLAYERS:
        player_move_counts[PLAYERS.index(cell)] += 1
    
    return player_move_counts.index(min(player_move_counts))

  # This function should return the board as a 2D array of characters. The 2D array should be row major.
  def rows(self):
    rows = []
    for i in range(BOARD_SIDE_LENGTH):
      lower = i * BOARD_SIDE_LENGTH
      upper = lower + BOARD_SIDE_LENGTH

      rows.append(self.cells[lower:upper])

    return rows
  
  # This function should return the board as a 2D array of characters. The 2D array should be column major.
  def columns(self):
    columns = []
    for i in range(BOARD_SIDE_LENGTH):
      columns.append(self.cells[i::BOARD_SIDE_LENGTH]) # Slicing the array to get the columns

    return columns
  
  def diagonals(self):
    diagonals = []
    diagonals.append([self[i, BOARD_SIDE_LENGTH - i - 1] for i in range(BOARD_SIDE_LENGTH)]) # The main diagonal
    diagonals.append([self[BOARD_SIDE_LENGTH - i - 1, i] for i in range(BOARD_SIDE_LENGTH)]) # The other diagonal

    return diagonals


class Action():
  def __init__(self, player, position):
    x, y = position
    self.id = player * BOARD_LENGTH + x * BOARD_SIDE_LENGTH + y

  @property
  def player(self):
    return self.id // BOARD_LENGTH
  
  @property
  def position(self):
    move = self.id % BOARD_LENGTH
    x = move // BOARD_SIDE_LENGTH
    y = move % BOARD_SIDE_LENGTH
    return x, y
  

  def __repr__(self) -> str:
    return f"{PLAYERS[self.player]}{self.position}"

# The function will receive a list of actions to a terminal state and should return the score of the state.
def score(action_sequence):
  board = Board(action_sequence)

  lines = board.rows() + board.columns() + board.diagonals()

  for line in lines:
    for player in PLAYERS:
      if all([cell == player for cell in line]): # A player has claimed all the cells in a line
        if player == AI_PLAYER:
          return 0.8 + (MAX_TURNS - len(action_sequence)) / MAX_TURNS * 0.2
        else:
          return 0
    
  if EMPTY_CELL not in board.cells:
    return 0.5
  
  raise Exception("The game is not in a terminal state:\nBoard:\n" + str(board))

def upper_confidence_bound(node, exploration_exploitation_parameter):
  if node.visits == 0:
    return float("inf")

  exploitation = node.score / node.visits
  exploration = exploration_exploitation_parameter * math.sqrt(2 * math.log(node.parent.visits) / node.visits)
  return exploitation + exploration

# This function should return the child node with the highest UCB score. 
def select(node):
  if len(node.children) == 0:
    raise Exception("The current node is a leaf node, cannot select a child node.")
  
  board = Board(node.history())
  player = PLAYERS[board.current_player()]

  best_child = []
  best_score = float("-inf")

  for child in node.children:
    score = upper_confidence_bound(child, exploration_exploitation_parameter=1.5)
    if player != AI_PLAYER and child.visits > 0:
      score = -score # The AI player is trying to maximize the score, the other player is trying to minimize it

    if score > best_score:
      best_score = score
      best_child = [child]
    elif score == best_score:
      best_child.append(child)

  return random.choice(best_child) if len(best_child) > 0 else node

# This function should return a list of legal actions given the current state of the game, if the game is in a terminal state, return an empty list.
def legal_actions(action_sequence):
  # If the board is full, then the game is a tie (a terminal state as no more actions can be taken)
  if len(action_sequence) == MAX_TURNS:
    return []
  
  board = Board(action_sequence)
  player = board.current_player()

  # Check if someone has won, then the game is in a terminal state (no more actions can be taken)
  lines = board.rows() + board.columns() + board.diagonals()
  for line in lines:
    for p in PLAYERS:
      if all([cell == p for cell in line]):
        return []

  # If the game is not in a terminal state, then there are still legal actions to take
  actions = []
  for x in range(BOARD_SIDE_LENGTH):
    for y in range(BOARD_SIDE_LENGTH):
      if board[x, y] == EMPTY_CELL:
        action = Action(player, (x, y))
        actions.append(action)

  return actions