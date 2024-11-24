def american_to_decimal(odds):
    if odds > 0:
        return odds / 100 + 1
    else:
        return 1 - (100 / odds)

def calculate_edge(prob, odds, convert_to_decimal=True):
    """
    Calculate the edge given the probability and odds.
    Args:
        prob (float): The probability of the event occurring.
        odds (float): The odds of the event, typically in American format.
        convert_to_decimal (bool, optional): Flag to indicate if the odds should be converted to decimal format. Defaults to True.
    Returns:
        float: The calculated edge.
    """
    
    if convert_to_decimal:
        odds = american_to_decimal(odds)
    
    return (prob * odds) - 1

def calculate_kelly_criterion(edge, odds, convert_to_decimal=False):
    """
    Calculate the Kelly Criterion given the probability and odds.
    Args:
        edge (float): The edge of the event.
        odds (float): The odds of the event, typically in American format.
        convert_to_decimal (bool, optional): Flag to indicate if the odds should be converted to decimal format. Defaults to True.
    Returns:
        float: The calculated Kelly Criterion.
    """
    
    if convert_to_decimal:
        odds = american_to_decimal(odds)
    
    return (edge / (odds - 1))

def normalize_kelly(kelly_list):
    """
    Normalize a list of Kelly fractions by setting negative values to 0, applying
    minimum and maximum caps, and redistributing their weight to positive values 
    so that the total sum equals 1.
    
    Parameters:
    kelly_list (list of float): List of Kelly fractions for each game.
    
    Returns:
    list of float: Normalized list where each element is within the bounds and 
                   the sum of all positive elements equals 1.
    """
    # Set negative Kelly values to 0
    adjusted_kelly = [max(k, 0) for k in kelly_list]
    
    # Sum of the positive Kelly values
    total = sum(adjusted_kelly)
    
    # If all Kelly values are non-positive, return a list of zeros
    if total == 0:
        return [0] * len(kelly_list)
    
    # Normalize positive Kelly values to sum to 1
    normalized_list = [k / total if k > 0 else 0 for k in adjusted_kelly]
    
    # Apply minimum and maximum bounds
    bounded_list = [min(max(k, 0.02), 0.14) for k in normalized_list]
    
    # Adjust to ensure sum equals 1 after applying bounds
    final_total = sum(bounded_list)
    adjusted_final_list = [k / final_total for k in bounded_list]
    
    return adjusted_final_list