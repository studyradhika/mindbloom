def test_memory_scoring():
    """Test the memory exercise scoring logic to identify potential issues"""
    
    def calculate_score_original(sequence, user_sequence):
        """Original scoring logic from MemoryExercise.tsx"""
        # Position-based scoring (exact sequence match) - FIXED VERSION
        position_correct = 0
        for i in range(min(len(sequence), len(user_sequence))):
            if sequence[i] == user_sequence[i]:
                position_correct += 1
        
        # Content-based scoring (right items, any position)
        content_correct = 0
        sequence_copy = sequence.copy()
        user_seq_copy = user_sequence.copy()
        
        for item in user_seq_copy:
            if item in sequence_copy:
                content_correct += 1
                sequence_copy.remove(item)  # Remove to avoid double counting
        
        # Weighted scoring: 70% for position accuracy, 30% for content accuracy
        position_score = (position_correct / len(sequence)) * 70
        content_score = (content_correct / len(sequence)) * 30
        percentage = round(position_score + content_score)
        
        return {
            'percentage': percentage,
            'position_correct': position_correct,
            'content_correct': content_correct,
            'position_score': position_score,
            'content_score': content_score
        }
    
    # Test cases that might reveal scoring issues
    test_cases = [
        {
            'name': 'Perfect sequence',
            'sequence': ['CAT', 'DOG', 'SUN'],
            'user_sequence': ['CAT', 'DOG', 'SUN'],
            'expected_score': 100
        },
        {
            'name': 'Completely wrong',
            'sequence': ['CAT', 'DOG', 'SUN'],
            'user_sequence': ['MOON', 'TREE', 'FISH'],
            'expected_score': 0
        },
        {
            'name': 'Right items, wrong order',
            'sequence': ['CAT', 'DOG', 'SUN'],
            'user_sequence': ['SUN', 'CAT', 'DOG'],
            'expected_score': 30  # Only content score
        },
        {
            'name': 'Partial correct positions',
            'sequence': ['CAT', 'DOG', 'SUN'],
            'user_sequence': ['CAT', 'MOON', 'SUN'],
            'expected_score': 67  # 2/3 position (46.7) + 2/3 content (20) = 66.7 ≈ 67
        },
        {
            'name': 'Word sequence with duplicates',
            'sequence': ['CAT', 'CAT', 'DOG'],
            'user_sequence': ['CAT', 'DOG', 'CAT'],
            'expected_score': 53  # 1/3 position (23.3) + 3/3 content (30) = 53.3 ≈ 53
        },
        {
            'name': 'User selects fewer items',
            'sequence': ['CAT', 'DOG', 'SUN'],
            'user_sequence': ['CAT', 'DOG'],
            'expected_score': 67  # 2/3 position (46.7) + 2/3 content (20) = 66.7 ≈ 67
        }
    ]
    
    print("🧪 TESTING MEMORY EXERCISE SCORING LOGIC")
    print("=" * 60)
    
    issues_found = []
    
    for test in test_cases:
        result = calculate_score_original(test['sequence'], test['user_sequence'])
        
        print(f"\n📝 Test: {test['name']}")
        print(f"   Sequence: {test['sequence']}")
        print(f"   User Input: {test['user_sequence']}")
        print(f"   Position Correct: {result['position_correct']}/{len(test['sequence'])}")
        print(f"   Content Correct: {result['content_correct']}/{len(test['sequence'])}")
        print(f"   Position Score: {result['position_score']:.1f}%")
        print(f"   Content Score: {result['content_score']:.1f}%")
        print(f"   Final Score: {result['percentage']}%")
        print(f"   Expected: {test['expected_score']}%")
        
        if result['percentage'] != test['expected_score']:
            discrepancy = abs(result['percentage'] - test['expected_score'])
            if discrepancy > 5:  # Allow small rounding differences
                issues_found.append({
                    'test': test['name'],
                    'expected': test['expected_score'],
                    'actual': result['percentage'],
                    'discrepancy': discrepancy
                })
                print(f"   ⚠️  SIGNIFICANT DISCREPANCY: {discrepancy}% difference!")
    
    print(f"\n🔍 SUMMARY:")
    if issues_found:
        print(f"❌ Found {len(issues_found)} scoring issues:")
        for issue in issues_found:
            print(f"   - {issue['test']}: Expected {issue['expected']}%, got {issue['actual']}%")
    else:
        print("✅ All test cases passed within acceptable range")
    
    return issues_found

if __name__ == "__main__":
    test_memory_scoring()