# MCP Dice Rolling Server

A Model Context Protocol (MCP) server that provides comprehensive dice rolling functionality for tabletop games, RPGs, and simulations.

## Features

### 🎲 Dice Rolling Tools
- **Basic Dice Rolling**: Roll any number of dice with any number of sides
- **Advantage/Disadvantage**: Roll twice and take higher/lower (D&D 5e style)
- **Dice Expressions**: Parse expressions like "2d6+3" or "1d20-1"
- **Multiple Operations**: Perform multiple dice operations in sequence
- **Character Stats**: Generate ability scores using various methods

### 📊 Structured Output
All tools return structured data with:
- Individual roll results
- Totals and modifiers
- Final calculated results
- Detailed breakdowns

### 🎯 Game-Specific Features
- Initiative rolling prompts
- Attack roll prompts
- Character stat generation
- Common dice information resources

## Installation

### Using pip
```bash
pip install -r requirements.txt
```

### Using uv (recommended)
```bash
uv add "mcp[cli]"
```

## Usage

### Running the MCP Server

#### Development Mode (with MCP Inspector)
```bash
uv run mcp dev mcp.py
```

#### Install in Claude Desktop
```bash
uv run mcp install mcp.py
```

#### Direct Execution
```bash
python mcp.py
```

### Testing the Functionality
```bash
python test_dice.py
```

## Available Tools

### 1. `roll_dice`
Roll one or more dice with optional modifier.

**Parameters:**
- `sides` (int): Number of sides on each die (default: 6)
- `count` (int): Number of dice to roll (default: 1)
- `modifier` (int): Modifier to add to the total (default: 0)

**Example:**
```python
# Roll 2d6+3
result = roll_dice(sides=6, count=2, modifier=3)
# Returns: DiceResult with rolls=[4, 5], total=9, final_result=12
```

### 2. `roll_advantage`
Roll with advantage (roll twice, take higher).

**Parameters:**
- `sides` (int): Number of sides on the die (default: 20)
- `modifier` (int): Modifier to add to the result (default: 0)

**Example:**
```python
# Roll d20+5 with advantage
result = roll_advantage(sides=20, modifier=5)
# Returns: DiceResult with both rolls and the higher result
```

### 3. `roll_disadvantage`
Roll with disadvantage (roll twice, take lower).

**Parameters:**
- `sides` (int): Number of sides on the die (default: 20)
- `modifier` (int): Modifier to add to the result (default: 0)

### 4. `roll_dice_expression`
Parse and roll dice expressions.

**Parameters:**
- `expression` (str): Dice expression like "2d6+3", "1d20-1", "4d4"

**Examples:**
- `"2d6+3"` - Roll two 6-sided dice, add 3
- `"1d20-1"` - Roll one 20-sided die, subtract 1
- `"4d4"` - Roll four 4-sided dice

### 5. `roll_multiple_operations`
Perform multiple dice operations in sequence.

**Parameters:**
- `operations` (List[Dict]): List of operation dictionaries

**Example:**
```python
operations = [
    {"type": "normal", "sides": 6, "count": 2, "modifier": 3},
    {"type": "advantage", "sides": 20, "modifier": 5},
    {"type": "expression", "expression": "1d4+1"}
]
```

### 6. `roll_character_stats`
Generate character ability scores.

**Parameters:**
- `method` (str): Rolling method - "4d6_drop_lowest", "3d6", "1d20", or "point_buy"

## Available Resources

### `dice://common-dice`
Information about common dice types and notation.

### `dice://probability`
Basic probability information for dice rolling.

## Available Prompts

### `roll_initiative`
Generate a prompt for rolling initiative in combat.

### `roll_attack`
Generate a prompt for making an attack roll.

## Data Models

### `DiceResult`
```python
class DiceResult(BaseModel):
    dice_type: str          # Type of dice rolled (e.g., 'd6', 'd20')
    sides: int              # Number of sides on the dice
    rolls: List[int]        # Individual dice roll results
    total: int              # Sum of all dice rolls
    modifier: int           # Modifier added to the total
    final_result: int       # Final result after applying modifier
```

### `DiceRollSummary`
```python
class DiceRollSummary(BaseModel):
    operations: List[DiceResult]  # List of all dice roll operations
    grand_total: int              # Sum of all final results
    operation_count: int          # Number of dice operations performed
```

## Examples

### Basic Usage
```python
# Roll a d20
result = roll_dice(sides=20, count=1, modifier=0)

# Roll 3d6+2
result = roll_dice(sides=6, count=3, modifier=2)

# Roll with advantage
result = roll_advantage(sides=20, modifier=5)
```

### Character Creation
```python
# Generate character stats
stats = roll_character_stats("4d6_drop_lowest")
print(f"Strength: {stats['scores']['Strength']} ({stats['modifiers']['Strength']:+d})")
```

### Complex Operations
```python
# Multiple dice operations
operations = [
    {"type": "normal", "sides": 6, "count": 2, "modifier": 3},
    {"type": "advantage", "sides": 20, "modifier": 5},
    {"type": "expression", "expression": "1d4+1"}
]
summary = roll_multiple_operations(operations)
```

## Integration with Claude Desktop

1. Install the server:
   ```bash
   uv run mcp install mcp.py
   ```

2. The server will be available in Claude Desktop with all tools, resources, and prompts.

3. Use natural language to interact with the dice rolling functionality:
   - "Roll 2d6+3 for damage"
   - "Roll initiative for my character"
   - "Generate character stats using 4d6 drop lowest"

## Development

### Running Tests
```bash
python test_dice.py
```

### Adding New Features
The server is built using FastMCP, making it easy to add new tools, resources, or prompts. Simply add new functions with the appropriate decorators:

```python
@mcp.tool()
def new_dice_function(param: int) -> str:
    """Description of the new function."""
    return "result"
```

## License

This project is part of the PremierSoft Hackathon and follows the same license terms.