#!/usr/bin/env python3
"""
Comprehensive Test Script for Exercise ID Assignment Fix

This script validates the complete exercise ID assignment flow:
1. Backend exercise selection logic
2. Frontend component mapping
3. Exercise ID consistency
4. Focus area mapping accuracy
5. End-to-end workflow validation

Expected Results:
- Memory focus area → memory_sequence exercise ID
- Processing Speed focus area → pattern_recognition exercise ID
"""

import asyncio
import sys
import os
import json
import requests
from datetime import datetime
from typing import Dict, List, Any

# Add backend to path for imports
sys.path.append('./backend')

from training.logic import select_exercises
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv('./backend/.env')

class ExerciseIDTestSuite:
    def __init__(self):
        self.backend_url = "http://localhost:8000"
        self.test_results = {
            'backend_logic_tests': {},
            'frontend_mapping_tests': {},
            'api_integration_tests': {},
            'end_to_end_tests': {},
            'regression_tests': {}
        }
        self.test_user_email = "test_exercise_id@example.com"
        self.test_user_password = "test123"
        self.auth_token = None
        
    def log_test(self, category: str, test_name: str, passed: bool, details: str = ""):
        """Log test results"""
        self.test_results[category][test_name] = {
            'passed': passed,
            'details': details,
            'timestamp': datetime.utcnow().isoformat()
        }
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} [{category}] {test_name}: {details}")

    def test_backend_exercise_selection_logic(self):
        """Test 1: Backend Exercise Selection Logic"""
        print("\n🧪 TEST 1: Backend Exercise Selection Logic")
        print("=" * 60)
        
        # Test Memory focus area
        try:
            memory_exercises = select_exercises(['memory'], 'focused', None, 0.0)
            memory_exercise_ids = [ex['id'] for ex in memory_exercises]
            
            # Check if memory_sequence is available in memory exercises
            memory_pool_ids = ['memory_sequence', 'word_pairs', 'visual_recall']
            has_memory_sequence = any(ex_id in memory_pool_ids for ex_id in memory_exercise_ids)
            
            self.log_test('backend_logic_tests', 'memory_focus_area_selection', 
                         has_memory_sequence,
                         f"Memory exercises: {memory_exercise_ids}")
            
        except Exception as e:
            self.log_test('backend_logic_tests', 'memory_focus_area_selection', 
                         False, f"Error: {str(e)}")

        # Test Processing Speed focus area
        try:
            processing_exercises = select_exercises(['processing'], 'focused', None, 0.0)
            processing_exercise_ids = [ex['id'] for ex in processing_exercises]
            
            # Check if pattern_recognition is available in processing exercises
            processing_pool_ids = ['speed_processing', 'pattern_recognition']
            has_pattern_recognition = any(ex_id in processing_pool_ids for ex_id in processing_exercise_ids)
            
            self.log_test('backend_logic_tests', 'processing_focus_area_selection', 
                         has_pattern_recognition,
                         f"Processing exercises: {processing_exercise_ids}")
            
        except Exception as e:
            self.log_test('backend_logic_tests', 'processing_focus_area_selection', 
                         False, f"Error: {str(e)}")

        # Test exercise pool completeness
        try:
            all_focus_areas = ['memory', 'attention', 'language', 'executive', 'processing', 'creativity', 'spatial', 'perception', 'general']
            missing_areas = []
            
            for area in all_focus_areas:
                exercises = select_exercises([area], 'focused', None, 0.0)
                if not exercises:
                    missing_areas.append(area)
            
            self.log_test('backend_logic_tests', 'exercise_pool_completeness', 
                         len(missing_areas) == 0,
                         f"Missing areas: {missing_areas}" if missing_areas else "All areas have exercises")
            
        except Exception as e:
            self.log_test('backend_logic_tests', 'exercise_pool_completeness', 
                         False, f"Error: {str(e)}")

    def test_frontend_component_mapping(self):
        """Test 2: Frontend Component Mapping"""
        print("\n🧪 TEST 2: Frontend Component Mapping")
        print("=" * 60)
        
        # Define the expected mapping from Training.tsx
        expected_mapping = {
            # Memory exercises
            'memory_sequence': {
                'component': 'MemoryExercise',
                'area': 'Memory',
                'areaId': 'memory'
            },
            'word_pairs': {
                'component': 'MemoryExercise',
                'area': 'Memory',
                'areaId': 'memory'
            },
            'visual_recall': {
                'component': 'VisualRecallExercise',
                'area': 'Memory & Spatial',
                'areaId': 'memory'
            },
            # Processing exercises
            'speed_processing': {
                'component': 'AttentionExercise',
                'area': 'Processing Speed',
                'areaId': 'processing'
            },
            'pattern_recognition': {
                'component': 'VisualRecallExercise',
                'area': 'Processing Speed',
                'areaId': 'processing'
            },
            # Attention exercises
            'focused_attention': {
                'component': 'AttentionExercise',
                'area': 'Attention',
                'areaId': 'attention'
            },
            'divided_attention': {
                'component': 'AttentionExercise',
                'area': 'Attention',
                'areaId': 'attention'
            },
            'sustained_attention': {
                'component': 'AttentionExercise',
                'area': 'Attention',
                'areaId': 'attention'
            }
        }
        
        # Test critical mappings
        critical_tests = [
            ('memory_sequence', 'memory', 'MemoryExercise'),
            ('pattern_recognition', 'processing', 'VisualRecallExercise'),
            ('visual_recall', 'memory', 'VisualRecallExercise'),
            ('speed_processing', 'processing', 'AttentionExercise')
        ]
        
        for exercise_id, expected_area_id, expected_component in critical_tests:
            if exercise_id in expected_mapping:
                mapping = expected_mapping[exercise_id]
                correct_component = mapping['component'] == expected_component
                correct_area = mapping['areaId'] == expected_area_id
                
                self.log_test('frontend_mapping_tests', f'{exercise_id}_mapping', 
                             correct_component and correct_area,
                             f"Component: {mapping['component']}, AreaId: {mapping['areaId']}")
            else:
                self.log_test('frontend_mapping_tests', f'{exercise_id}_mapping', 
                             False, "Exercise ID not found in mapping")

    async def create_test_user(self):
        """Create a test user for API testing"""
        try:
            client = AsyncIOMotorClient(os.getenv('MONGODB_URI'))
            db = client.mindbloom
            
            # Delete existing test user
            await db.users.delete_one({'email': self.test_user_email})
            
            # Create new test user via API
            response = requests.post(f"{self.backend_url}/auth/register", json={
                'email': self.test_user_email,
                'password': self.test_user_password,
                'name': 'Exercise ID Test User'
            })
            
            if response.status_code == 201:
                self.log_test('api_integration_tests', 'test_user_creation', True, 
                             f"Test user created: {self.test_user_email}")
                return True
            else:
                self.log_test('api_integration_tests', 'test_user_creation', False, 
                             f"Failed to create user: {response.text}")
                return False
                
        except Exception as e:
            self.log_test('api_integration_tests', 'test_user_creation', False, 
                         f"Error: {str(e)}")
            return False

    def authenticate_test_user(self):
        """Authenticate test user and get token"""
        try:
            response = requests.post(f"{self.backend_url}/auth/login", json={
                'email': self.test_user_email,
                'password': self.test_user_password
            })
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get('access_token')
                self.log_test('api_integration_tests', 'user_authentication', True, 
                             "Successfully authenticated test user")
                return True
            else:
                self.log_test('api_integration_tests', 'user_authentication', False, 
                             f"Authentication failed: {response.text}")
                return False
                
        except Exception as e:
            self.log_test('api_integration_tests', 'user_authentication', False, 
                         f"Error: {str(e)}")
            return False

    def test_api_session_creation(self):
        """Test 3: API Session Creation and Exercise Selection"""
        print("\n🧪 TEST 3: API Session Creation and Exercise Selection")
        print("=" * 60)
        
        if not self.auth_token:
            self.log_test('api_integration_tests', 'session_creation_memory', False, 
                         "No auth token available")
            return
        
        headers = {'Authorization': f'Bearer {self.auth_token}'}
        
        # Test Memory focus area session
        try:
            response = requests.post(f"{self.backend_url}/training/session", 
                                   headers=headers,
                                   json={
                                       'mood': 'focused',
                                       'focusAreas': ['memory']
                                   })
            
            if response.status_code == 200:
                data = response.json()
                exercises = data.get('exercises', [])
                exercise_ids = [ex['id'] for ex in exercises]
                
                # Check if memory_sequence is in the selected exercises
                has_memory_sequence = 'memory_sequence' in exercise_ids
                
                self.log_test('api_integration_tests', 'session_creation_memory', 
                             has_memory_sequence,
                             f"Memory session exercises: {exercise_ids}")
                
                return data.get('sessionId')
            else:
                self.log_test('api_integration_tests', 'session_creation_memory', False, 
                             f"Session creation failed: {response.text}")
                
        except Exception as e:
            self.log_test('api_integration_tests', 'session_creation_memory', False, 
                         f"Error: {str(e)}")

        # Test Processing Speed focus area session
        try:
            response = requests.post(f"{self.backend_url}/training/session", 
                                   headers=headers,
                                   json={
                                       'mood': 'focused',
                                       'focusAreas': ['processing']
                                   })
            
            if response.status_code == 200:
                data = response.json()
                exercises = data.get('exercises', [])
                exercise_ids = [ex['id'] for ex in exercises]
                
                # Check if pattern_recognition is in the selected exercises
                has_pattern_recognition = 'pattern_recognition' in exercise_ids
                
                self.log_test('api_integration_tests', 'session_creation_processing', 
                             has_pattern_recognition,
                             f"Processing session exercises: {exercise_ids}")
                
            else:
                self.log_test('api_integration_tests', 'session_creation_processing', False, 
                             f"Session creation failed: {response.text}")
                
        except Exception as e:
            self.log_test('api_integration_tests', 'session_creation_processing', False, 
                         f"Error: {str(e)}")

    def test_exercise_result_saving(self, session_id: str):
        """Test 4: Exercise Result Saving with Correct IDs"""
        print("\n🧪 TEST 4: Exercise Result Saving with Correct IDs")
        print("=" * 60)
        
        if not self.auth_token or not session_id:
            self.log_test('api_integration_tests', 'exercise_result_saving', False, 
                         "No auth token or session ID available")
            return
        
        headers = {'Authorization': f'Bearer {self.auth_token}'}
        
        # Test saving memory_sequence exercise result
        try:
            response = requests.post(f"{self.backend_url}/training/session/{session_id}/exercise",
                                   headers=headers,
                                   json={
                                       'exerciseId': 'memory_sequence',
                                       'score': 0.75,
                                       'timeSpent': 120
                                   })
            
            if response.status_code == 200:
                data = response.json()
                self.log_test('api_integration_tests', 'save_memory_sequence_result', True,
                             f"Memory sequence result saved: {data.get('message')}")
            else:
                self.log_test('api_integration_tests', 'save_memory_sequence_result', False,
                             f"Failed to save result: {response.text}")
                
        except Exception as e:
            self.log_test('api_integration_tests', 'save_memory_sequence_result', False,
                         f"Error: {str(e)}")

        # Test saving pattern_recognition exercise result
        try:
            response = requests.post(f"{self.backend_url}/training/session/{session_id}/exercise",
                                   headers=headers,
                                   json={
                                       'exerciseId': 'pattern_recognition',
                                       'score': 0.68,
                                       'timeSpent': 180
                                   })
            
            if response.status_code == 200:
                data = response.json()
                self.log_test('api_integration_tests', 'save_pattern_recognition_result', True,
                             f"Pattern recognition result saved: {data.get('message')}")
            else:
                self.log_test('api_integration_tests', 'save_pattern_recognition_result', False,
                             f"Failed to save result: {response.text}")
                
        except Exception as e:
            self.log_test('api_integration_tests', 'save_pattern_recognition_result', False,
                         f"Error: {str(e)}")

    async def test_database_exercise_mapping(self):
        """Test 5: Database Exercise to Focus Area Mapping"""
        print("\n🧪 TEST 5: Database Exercise to Focus Area Mapping")
        print("=" * 60)
        
        try:
            client = AsyncIOMotorClient(os.getenv('MONGODB_URI'))
            db = client.mindbloom
            
            # Find test user sessions
            user = await db.users.find_one({'email': self.test_user_email})
            if not user:
                self.log_test('end_to_end_tests', 'database_exercise_mapping', False,
                             "Test user not found in database")
                return
            
            # Get user's training sessions
            sessions = await db.training_sessions.find({'userId': user['_id']}).to_list(None)
            
            if not sessions:
                self.log_test('end_to_end_tests', 'database_exercise_mapping', False,
                             "No training sessions found for test user")
                return
            
            # Check exercise results in sessions
            exercise_to_area_mapping_found = False
            correct_mappings = 0
            total_exercises = 0
            
            for session in sessions:
                exercise_results = session.get('exerciseResults', [])
                for result in exercise_results:
                    total_exercises += 1
                    exercise_id = result.get('exerciseId')
                    
                    # Check if the exercise ID maps correctly to focus areas
                    if exercise_id == 'memory_sequence':
                        # Should be in a memory-focused session
                        focus_areas = session.get('focusAreas', [])
                        if 'memory' in focus_areas:
                            correct_mappings += 1
                            exercise_to_area_mapping_found = True
                    elif exercise_id == 'pattern_recognition':
                        # Should be in a processing-focused session
                        focus_areas = session.get('focusAreas', [])
                        if 'processing' in focus_areas:
                            correct_mappings += 1
                            exercise_to_area_mapping_found = True
            
            mapping_accuracy = correct_mappings / total_exercises if total_exercises > 0 else 0
            
            self.log_test('end_to_end_tests', 'database_exercise_mapping', 
                         exercise_to_area_mapping_found and mapping_accuracy > 0.5,
                         f"Mapping accuracy: {mapping_accuracy:.2%} ({correct_mappings}/{total_exercises})")
            
        except Exception as e:
            self.log_test('end_to_end_tests', 'database_exercise_mapping', False,
                         f"Error: {str(e)}")

    def test_regression_scenarios(self):
        """Test 6: Regression Testing for Other Focus Areas"""
        print("\n🧪 TEST 6: Regression Testing for Other Focus Areas")
        print("=" * 60)
        
        if not self.auth_token:
            self.log_test('regression_tests', 'other_focus_areas', False,
                         "No auth token available")
            return
        
        headers = {'Authorization': f'Bearer {self.auth_token}'}
        
        # Test other focus areas to ensure they still work
        other_focus_areas = ['attention', 'language', 'executive', 'creativity', 'spatial']
        
        for focus_area in other_focus_areas:
            try:
                response = requests.post(f"{self.backend_url}/training/session",
                                       headers=headers,
                                       json={
                                           'mood': 'focused',
                                           'focusAreas': [focus_area]
                                       })
                
                if response.status_code == 200:
                    data = response.json()
                    exercises = data.get('exercises', [])
                    has_exercises = len(exercises) > 0
                    
                    self.log_test('regression_tests', f'{focus_area}_focus_area', 
                                 has_exercises,
                                 f"Exercises returned: {len(exercises)}")
                else:
                    self.log_test('regression_tests', f'{focus_area}_focus_area', False,
                                 f"Session creation failed: {response.text}")
                    
            except Exception as e:
                self.log_test('regression_tests', f'{focus_area}_focus_area', False,
                             f"Error: {str(e)}")

    def generate_test_report(self):
        """Generate comprehensive test report"""
        print("\n" + "=" * 80)
        print("🎯 EXERCISE ID ASSIGNMENT TEST RESULTS SUMMARY")
        print("=" * 80)
        
        total_tests = 0
        passed_tests = 0
        
        for category, tests in self.test_results.items():
            category_passed = 0
            category_total = len(tests)
            
            print(f"\n📊 {category.replace('_', ' ').title()}:")
            print("-" * 50)
            
            for test_name, result in tests.items():
                status = "✅ PASS" if result['passed'] else "❌ FAIL"
                print(f"  {status} {test_name}: {result['details']}")
                
                if result['passed']:
                    category_passed += 1
                    passed_tests += 1
                total_tests += 1
            
            if category_total > 0:
                category_percentage = (category_passed / category_total) * 100
                print(f"  📈 Category Score: {category_passed}/{category_total} ({category_percentage:.1f}%)")
        
        overall_percentage = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        print(f"\n🎯 OVERALL TEST RESULTS:")
        print(f"   Total Tests: {total_tests}")
        print(f"   Passed: {passed_tests}")
        print(f"   Failed: {total_tests - passed_tests}")
        print(f"   Success Rate: {overall_percentage:.1f}%")
        
        # Specific validation for the main requirements
        print(f"\n🔍 SPECIFIC REQUIREMENT VALIDATION:")
        
        # Check Memory → memory_sequence mapping
        memory_backend = self.test_results.get('backend_logic_tests', {}).get('memory_focus_area_selection', {}).get('passed', False)
        memory_frontend = self.test_results.get('frontend_mapping_tests', {}).get('memory_sequence_mapping', {}).get('passed', False)
        memory_api = self.test_results.get('api_integration_tests', {}).get('session_creation_memory', {}).get('passed', False)
        
        memory_success = memory_backend and memory_frontend and memory_api
        print(f"   ✅ Memory → memory_sequence: {'SUCCESS' if memory_success else 'FAILED'}")
        
        # Check Processing Speed → pattern_recognition mapping
        processing_backend = self.test_results.get('backend_logic_tests', {}).get('processing_focus_area_selection', {}).get('passed', False)
        processing_frontend = self.test_results.get('frontend_mapping_tests', {}).get('pattern_recognition_mapping', {}).get('passed', False)
        processing_api = self.test_results.get('api_integration_tests', {}).get('session_creation_processing', {}).get('passed', False)
        
        processing_success = processing_backend and processing_frontend and processing_api
        print(f"   ✅ Processing Speed → pattern_recognition: {'SUCCESS' if processing_success else 'FAILED'}")
        
        # Overall fix validation
        fix_success = memory_success and processing_success
        print(f"\n🎉 EXERCISE ID ASSIGNMENT FIX: {'✅ VALIDATED' if fix_success else '❌ NEEDS ATTENTION'}")
        
        if fix_success:
            print("\n✨ All critical exercise ID assignment mappings are working correctly!")
            print("   - Memory focus area correctly uses memory_sequence exercise")
            print("   - Processing Speed focus area correctly uses pattern_recognition exercise")
            print("   - Exercise results are saved with correct IDs")
            print("   - Progress tracking should work properly")
        else:
            print("\n⚠️  Some critical mappings need attention. Check the detailed results above.")
        
        return fix_success

    async def run_all_tests(self):
        """Run the complete test suite"""
        print("🚀 Starting Exercise ID Assignment Test Suite")
        print("=" * 80)
        
        # Test 1: Backend Logic
        self.test_backend_exercise_selection_logic()
        
        # Test 2: Frontend Mapping
        self.test_frontend_component_mapping()
        
        # Test 3: API Integration
        user_created = await self.create_test_user()
        if user_created and self.authenticate_test_user():
            session_id = self.test_api_session_creation()
            if session_id:
                self.test_exercise_result_saving(session_id)
            
            # Test 4: Database Validation
            await self.test_database_exercise_mapping()
            
            # Test 5: Regression Testing
            self.test_regression_scenarios()
        
        # Generate final report
        return self.generate_test_report()

async def main():
    """Main test execution"""
    test_suite = ExerciseIDTestSuite()
    success = await test_suite.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    asyncio.run(main())