"""
MCP Dice Rolling Server

A Model Context Protocol server that provides dice rolling functionality.
This server exposes tools for rolling various types of dice commonly used in games.

Usage:
    python mcp.py
    or
    uv run mcp dev mcp.py
"""

import random
from typing import Optional, List, Dict, Any
from mcp.server.fastmcp import FastMCP, Context
from mcp.server.session import ServerSession
from pydantic import BaseModel, Field


# Data models for structured output
class DiceResult(BaseModel):
    """Result of a dice roll operation."""
    dice_type: str = Field(description="Type of dice rolled (e.g., 'd6', 'd20')")
    sides: int = Field(description="Number of sides on the dice")
    rolls: List[int] = Field(description="Individual dice roll results")
    total: int = Field(description="Sum of all dice rolls")
    modifier: int = Field(description="Modifier added to the total")
    final_result: int = Field(description="Final result after applying modifier")


class DiceRollSummary(BaseModel):
    """Summary of multiple dice roll operations."""
    operations: List[DiceResult] = Field(description="List of all dice roll operations")
    grand_total: int = Field(description="Sum of all final results")
    operation_count: int = Field(description="Number of dice operations performed")


# Create the MCP server
mcp = FastMCP("Dice Rolling Server", instructions="A server that provides dice rolling functionality for games and simulations")


@mcp.tool()
def roll_dice(
    sides: int = 6,
    count: int = 1,
    modifier: int = 0,
    ctx: Context[ServerSession, None]
) -> DiceResult:
    """
    Roll one or more dice with optional modifier.
    
    Args:
        sides: Number of sides on each die (default: 6)
        count: Number of dice to roll (default: 1)
        modifier: Modifier to add to the total (default: 0)
    
    Returns:
        DiceResult with individual rolls, total, and final result
    """
    await ctx.info(f"Rolling {count}d{sides} with modifier {modifier:+d}")
    
    # Validate inputs
    if sides < 2:
        raise ValueError("Dice must have at least 2 sides")
    if count < 1:
        raise ValueError("Must roll at least 1 die")
    if count > 100:
        raise ValueError("Cannot roll more than 100 dice at once")
    
    # Roll the dice
    rolls = [random.randint(1, sides) for _ in range(count)]
    total = sum(rolls)
    final_result = total + modifier
    
    dice_type = f"d{sides}" if count == 1 else f"{count}d{sides}"
    
    await ctx.debug(f"Rolled: {rolls}, Total: {total}, Final: {final_result}")
    
    return DiceResult(
        dice_type=dice_type,
        sides=sides,
        rolls=rolls,
        total=total,
        modifier=modifier,
        final_result=final_result
    )


@mcp.tool()
def roll_advantage(
    sides: int = 20,
    modifier: int = 0,
    ctx: Context[ServerSession, None]
) -> DiceResult:
    """
    Roll with advantage (roll twice, take higher).
    
    Args:
        sides: Number of sides on the die (default: 20)
        modifier: Modifier to add to the result (default: 0)
    
    Returns:
        DiceResult with both rolls and the higher result
    """
    await ctx.info(f"Rolling d{sides} with advantage (modifier {modifier:+d})")
    
    if sides < 2:
        raise ValueError("Dice must have at least 2 sides")
    
    # Roll twice
    roll1 = random.randint(1, sides)
    roll2 = random.randint(1, sides)
    higher_roll = max(roll1, roll2)
    final_result = higher_roll + modifier
    
    await ctx.debug(f"Rolled: {roll1} and {roll2}, taking {higher_roll}, final: {final_result}")
    
    return DiceResult(
        dice_type=f"d{sides} (advantage)",
        sides=sides,
        rolls=[roll1, roll2],
        total=higher_roll,
        modifier=modifier,
        final_result=final_result
    )


@mcp.tool()
def roll_disadvantage(
    sides: int = 20,
    modifier: int = 0,
    ctx: Context[ServerSession, None]
) -> DiceResult:
    """
    Roll with disadvantage (roll twice, take lower).
    
    Args:
        sides: Number of sides on the die (default: 20)
        modifier: Modifier to add to the result (default: 0)
    
    Returns:
        DiceResult with both rolls and the lower result
    """
    await ctx.info(f"Rolling d{sides} with disadvantage (modifier {modifier:+d})")
    
    if sides < 2:
        raise ValueError("Dice must have at least 2 sides")
    
    # Roll twice
    roll1 = random.randint(1, sides)
    roll2 = random.randint(1, sides)
    lower_roll = min(roll1, roll2)
    final_result = lower_roll + modifier
    
    await ctx.debug(f"Rolled: {roll1} and {roll2}, taking {lower_roll}, final: {final_result}")
    
    return DiceResult(
        dice_type=f"d{sides} (disadvantage)",
        sides=sides,
        rolls=[roll1, roll2],
        total=lower_roll,
        modifier=modifier,
        final_result=final_result
    )


@mcp.tool()
def roll_dice_expression(
    expression: str,
    ctx: Context[ServerSession, None]
) -> DiceResult:
    """
    Roll dice using a dice expression (e.g., "2d6+3", "1d20-1", "4d4").
    
    Args:
        expression: Dice expression to parse and roll (e.g., "2d6+3", "1d20-1")
    
    Returns:
        DiceResult with the parsed and rolled dice
    """
    await ctx.info(f"Parsing and rolling dice expression: {expression}")
    
    # Simple dice expression parser
    import re
    
    # Match patterns like "2d6+3", "1d20-1", "4d4", "d6"
    pattern = r'^(\d*)d(\d+)([+-]\d+)?$'
    match = re.match(pattern, expression.lower().replace(' ', ''))
    
    if not match:
        raise ValueError(f"Invalid dice expression: {expression}. Use format like '2d6+3' or '1d20'")
    
    count_str, sides_str, modifier_str = match.groups()
    
    count = int(count_str) if count_str else 1
    sides = int(sides_str)
    modifier = int(modifier_str) if modifier_str else 0
    
    if sides < 2:
        raise ValueError("Dice must have at least 2 sides")
    if count < 1:
        raise ValueError("Must roll at least 1 die")
    if count > 100:
        raise ValueError("Cannot roll more than 100 dice at once")
    
    # Roll the dice
    rolls = [random.randint(1, sides) for _ in range(count)]
    total = sum(rolls)
    final_result = total + modifier
    
    await ctx.debug(f"Expression '{expression}' -> {count}d{sides}{modifier:+d} -> {rolls} -> {final_result}")
    
    return DiceResult(
        dice_type=expression,
        sides=sides,
        rolls=rolls,
        total=total,
        modifier=modifier,
        final_result=final_result
    )


@mcp.tool()
def roll_multiple_operations(
    operations: List[Dict[str, Any]],
    ctx: Context[ServerSession, None]
) -> DiceRollSummary:
    """
    Perform multiple dice roll operations in sequence.
    
    Args:
        operations: List of operation dictionaries with keys:
                   - type: "normal", "advantage", "disadvantage", or "expression"
                   - sides: number of sides (for normal/advantage/disadvantage)
                   - count: number of dice (for normal)
                   - modifier: modifier to add
                   - expression: dice expression (for expression type)
    
    Returns:
        DiceRollSummary with all operations and grand total
    """
    await ctx.info(f"Performing {len(operations)} dice roll operations")
    
    results = []
    grand_total = 0
    
    for i, op in enumerate(operations):
        await ctx.debug(f"Operation {i+1}: {op}")
        
        op_type = op.get("type", "normal")
        
        try:
            if op_type == "normal":
                result = roll_dice(
                    sides=op.get("sides", 6),
                    count=op.get("count", 1),
                    modifier=op.get("modifier", 0),
                    ctx=ctx
                )
            elif op_type == "advantage":
                result = roll_advantage(
                    sides=op.get("sides", 20),
                    modifier=op.get("modifier", 0),
                    ctx=ctx
                )
            elif op_type == "disadvantage":
                result = roll_disadvantage(
                    sides=op.get("sides", 20),
                    modifier=op.get("modifier", 0),
                    ctx=ctx
                )
            elif op_type == "expression":
                result = roll_dice_expression(
                    expression=op.get("expression", "1d6"),
                    ctx=ctx
                )
            else:
                raise ValueError(f"Unknown operation type: {op_type}")
            
            results.append(result)
            grand_total += result.final_result
            
        except Exception as e:
            await ctx.error(f"Operation {i+1} failed: {str(e)}")
            # Create a failed result
            failed_result = DiceResult(
                dice_type=f"FAILED: {op_type}",
                sides=0,
                rolls=[],
                total=0,
                modifier=0,
                final_result=0
            )
            results.append(failed_result)
    
    await ctx.info(f"Completed {len(operations)} operations, grand total: {grand_total}")
    
    return DiceRollSummary(
        operations=results,
        grand_total=grand_total,
        operation_count=len(operations)
    )


@mcp.tool()
def roll_character_stats(
    method: str = "4d6_drop_lowest",
    ctx: Context[ServerSession, None]
) -> Dict[str, Any]:
    """
    Roll character ability scores using various methods.
    
    Args:
        method: Rolling method - "4d6_drop_lowest", "3d6", "1d20", or "point_buy"
    
    Returns:
        Dictionary with ability scores and modifiers
    """
    await ctx.info(f"Rolling character stats using method: {method}")
    
    abilities = ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"]
    scores = {}
    modifiers = {}
    
    if method == "4d6_drop_lowest":
        for ability in abilities:
            # Roll 4d6 and drop the lowest
            rolls = [random.randint(1, 6) for _ in range(4)]
            rolls.sort()
            score = sum(rolls[1:])  # Drop the lowest
            scores[ability] = score
            modifiers[ability] = (score - 10) // 2
            
    elif method == "3d6":
        for ability in abilities:
            score = sum([random.randint(1, 6) for _ in range(3)])
            scores[ability] = score
            modifiers[ability] = (score - 10) // 2
            
    elif method == "1d20":
        for ability in abilities:
            score = random.randint(1, 20)
            scores[ability] = score
            modifiers[ability] = (score - 10) // 2
            
    elif method == "point_buy":
        # Standard point buy: 27 points, scores 8-15
        point_buy_costs = {8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9}
        # For simplicity, roll random scores in the 8-15 range
        for ability in abilities:
            score = random.randint(8, 15)
            scores[ability] = score
            modifiers[ability] = (score - 10) // 2
            
    else:
        raise ValueError(f"Unknown method: {method}. Use '4d6_drop_lowest', '3d6', '1d20', or 'point_buy'")
    
    await ctx.debug(f"Generated scores: {scores}")
    
    return {
        "method": method,
        "scores": scores,
        "modifiers": modifiers,
        "total_points": sum(scores.values()) if method != "point_buy" else None
    }


# Add some useful resources
@mcp.resource("dice://common-dice")
def get_common_dice_info() -> str:
    """Get information about common dice types used in games."""
    return """
Common Dice Types:
- d4: 4-sided die (pyramid shape)
- d6: 6-sided die (cube) - most common
- d8: 8-sided die (octahedron)
- d10: 10-sided die (pentagonal trapezohedron)
- d12: 12-sided die (dodecahedron)
- d20: 20-sided die (icosahedron) - used for D&D
- d100: 100-sided die (or 2d10 for percentage)

Dice Notation:
- 1d6: Roll one 6-sided die
- 2d6+3: Roll two 6-sided dice, add 3
- 1d20-1: Roll one 20-sided die, subtract 1
- 4d6: Roll four 6-sided dice

Advantage/Disadvantage:
- Advantage: Roll twice, take higher (D&D 5e)
- Disadvantage: Roll twice, take lower (D&D 5e)
"""


@mcp.resource("dice://probability")
def get_dice_probability_info() -> str:
    """Get basic probability information for dice rolling."""
    return """
Dice Probability Basics:

Single Die:
- d6: Average = 3.5, Range = 1-6
- d20: Average = 10.5, Range = 1-20

Multiple Dice:
- 2d6: Average = 7, Range = 2-12, Most common = 7
- 3d6: Average = 10.5, Range = 3-18, Bell curve distribution

Advantage/Disadvantage (d20):
- Advantage: Average ≈ 13.8, Range = 1-20
- Disadvantage: Average ≈ 7.2, Range = 1-20
- Normal: Average = 10.5, Range = 1-20

Character Stats (4d6 drop lowest):
- Average score ≈ 12.24
- Range = 3-18
- Most common = 13-14
"""


@mcp.prompt(title="Roll Initiative")
def roll_initiative(character_name: str = "Character", modifier: int = 0) -> str:
    """Generate a prompt for rolling initiative in combat."""
    return f"""
Roll initiative for {character_name}!

Initiative determines the order of combat. Roll 1d20 and add your Dexterity modifier.

{character_name}'s Dexterity modifier: {modifier:+d}

Roll: 1d20{modifier:+d}

The higher the result, the earlier you act in combat. In case of ties, characters with higher Dexterity scores go first.
"""


@mcp.prompt(title="Attack Roll")
def roll_attack(weapon: str = "sword", attack_bonus: int = 0, damage_dice: str = "1d8") -> str:
    """Generate a prompt for making an attack roll."""
    return f"""
Make an attack roll with your {weapon}!

Attack Roll: 1d20+{attack_bonus}
- Roll 1d20 and add your attack bonus
- If the result meets or exceeds the target's Armor Class (AC), you hit!

If you hit, roll for damage:
Damage: {damage_dice}
- Roll the damage dice and add your Strength modifier (for melee) or Dexterity modifier (for ranged)

Example: If you roll 15 on the d20 and your attack bonus is +5, your total is 20. If the target's AC is 18, you hit!
"""


if __name__ == "__main__":
    # Run the server
    mcp.run()
