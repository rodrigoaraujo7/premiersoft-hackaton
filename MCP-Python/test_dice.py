"""
Test script for the MCP Dice Rolling Server

This script demonstrates how to use the dice rolling tools directly
without going through the MCP protocol.
"""

import random
from typing import List, Dict, Any
from pydantic import BaseModel, Field


class DiceResult(BaseModel):
    """Result of a dice roll operation."""
    dice_type: str = Field(description="Type of dice rolled (e.g., 'd6', 'd20')")
    sides: int = Field(description="Number of sides on the dice")
    rolls: List[int] = Field(description="Individual dice roll results")
    total: int = Field(description="Sum of all dice rolls")
    modifier: int = Field(description="Modifier added to the total")
    final_result: int = Field(description="Final result after applying modifier")


def roll_dice(sides: int = 6, count: int = 1, modifier: int = 0) -> DiceResult:
    """Roll one or more dice with optional modifier."""
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
    
    return DiceResult(
        dice_type=dice_type,
        sides=sides,
        rolls=rolls,
        total=total,
        modifier=modifier,
        final_result=final_result
    )


def roll_advantage(sides: int = 20, modifier: int = 0) -> DiceResult:
    """Roll with advantage (roll twice, take higher)."""
    if sides < 2:
        raise ValueError("Dice must have at least 2 sides")
    
    # Roll twice
    roll1 = random.randint(1, sides)
    roll2 = random.randint(1, sides)
    higher_roll = max(roll1, roll2)
    final_result = higher_roll + modifier
    
    return DiceResult(
        dice_type=f"d{sides} (advantage)",
        sides=sides,
        rolls=[roll1, roll2],
        total=higher_roll,
        modifier=modifier,
        final_result=final_result
    )


def roll_disadvantage(sides: int = 20, modifier: int = 0) -> DiceResult:
    """Roll with disadvantage (roll twice, take lower)."""
    if sides < 2:
        raise ValueError("Dice must have at least 2 sides")
    
    # Roll twice
    roll1 = random.randint(1, sides)
    roll2 = random.randint(1, sides)
    lower_roll = min(roll1, roll2)
    final_result = lower_roll + modifier
    
    return DiceResult(
        dice_type=f"d{sides} (disadvantage)",
        sides=sides,
        rolls=[roll1, roll2],
        total=lower_roll,
        modifier=modifier,
        final_result=final_result
    )


def roll_character_stats(method: str = "4d6_drop_lowest") -> Dict[str, Any]:
    """Roll character ability scores using various methods."""
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
    else:
        raise ValueError(f"Unknown method: {method}")
    
    return {
        "method": method,
        "scores": scores,
        "modifiers": modifiers,
        "total_points": sum(scores.values())
    }


def main():
    """Demonstrate the dice rolling functionality."""
    print("🎲 MCP Dice Rolling Server - Test Demo\n")
    
    # Test basic dice rolling
    print("1. Basic Dice Rolling:")
    result = roll_dice(sides=6, count=2, modifier=3)
    print(f"   {result.dice_type}+{result.modifier}: {result.rolls} = {result.total} + {result.modifier} = {result.final_result}")
    
    # Test advantage
    print("\n2. Advantage Roll:")
    result = roll_advantage(sides=20, modifier=5)
    print(f"   {result.dice_type}+{result.modifier}: rolled {result.rolls}, taking {result.total}, final = {result.final_result}")
    
    # Test disadvantage
    print("\n3. Disadvantage Roll:")
    result = roll_disadvantage(sides=20, modifier=5)
    print(f"   {result.dice_type}+{result.modifier}: rolled {result.rolls}, taking {result.total}, final = {result.final_result}")
    
    # Test character stats
    print("\n4. Character Stats (4d6 drop lowest):")
    stats = roll_character_stats("4d6_drop_lowest")
    print("   Ability Scores:")
    for ability, score in stats["scores"].items():
        modifier = stats["modifiers"][ability]
        print(f"   {ability}: {score} ({modifier:+d})")
    print(f"   Total Points: {stats['total_points']}")
    
    # Test multiple rolls
    print("\n5. Multiple Rolls:")
    for i in range(3):
        result = roll_dice(sides=20, count=1, modifier=0)
        print(f"   Roll {i+1}: {result.rolls[0]}")
    
    print("\n🎲 Demo complete! The MCP server provides all these functions and more.")


if __name__ == "__main__":
    main()
