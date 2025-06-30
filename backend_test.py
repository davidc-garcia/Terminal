import requests
import unittest
import socketio
import asyncio
import os
import sys
from datetime import datetime

# Get the backend URL from the frontend .env file
BACKEND_URL = "https://effda875-c4d5-4803-b53c-85fbfcb7547d.preview.emergentagent.com"
API_URL = f"{BACKEND_URL}/api"

class KittyWarpTerminalTester(unittest.TestCase):
    """Test the KittyWarp Terminal backend API functionality"""
    
    def test_root_endpoint(self):
        """Test the root endpoint returns the expected message"""
        response = requests.get(f"{API_URL}/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["message"], "Advanced Terminal with AI - Backend Server")
        print("✅ Root endpoint test passed")
    
    def test_system_info_endpoint(self):
        """Test the system info endpoint returns system information"""
        response = requests.get(f"{API_URL}/system/info")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check that essential system info fields are present
        required_fields = ['platform', 'platform_version', 'platform_release', 
                          'architecture', 'processor', 'hostname', 
                          'python_version', 'cpu_count', 'memory_total', 
                          'memory_available']
        
        for field in required_fields:
            self.assertIn(field, data)
            
        print("✅ System info endpoint test passed")
    
    def test_execute_command_endpoint(self):
        """Test the execute command endpoint with a simple command"""
        payload = {
            "command": "echo 'Hello KittyWarp'",
            "session_id": "test-session",
            "working_directory": "."
        }
        
        response = requests.post(f"{API_URL}/execute", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertTrue(data["success"])
        self.assertIn("Hello KittyWarp", data["stdout"])
        self.assertEqual(data["return_code"], 0)
        
        print("✅ Execute command endpoint test passed")
    
    def test_ai_analyze_endpoint(self):
        """Test the AI analyze endpoint with a mock API key"""
        payload = {
            "message": "How do I list files in Linux?",
            "context": "I'm trying to see files in my directory",
            "api_key": "test-api-key",
            "provider": "openai"
        }
        
        response = requests.post(f"{API_URL}/ai/analyze", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertIn("analysis", data)
        self.assertTrue(len(data["analysis"]) > 0)
        
        print("✅ AI analyze endpoint test passed")
    
    def test_ai_analyze_no_key(self):
        """Test the AI analyze endpoint with no API key"""
        payload = {
            "message": "How do I list files in Linux?",
            "context": "I'm trying to see files in my directory",
            "api_key": "",
            "provider": "openai"
        }
        
        response = requests.post(f"{API_URL}/ai/analyze", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertIn("analysis", data)
        self.assertIn("API key", data["analysis"])
        
        print("✅ AI analyze with no key test passed")

async def test_socket_connection():
    """Test the Socket.IO connection and basic functionality"""
    try:
        # Create a Socket.IO client
        sio = socketio.AsyncClient()
        connected = False
        command_result_received = False
        system_info_received = False
        
        @sio.event
        async def connect():
            nonlocal connected
            connected = True
            print("✅ Socket.IO connected successfully")
            
        @sio.event
        async def disconnect():
            print("Socket.IO disconnected")
            
        @sio.event
        async def command_result(data):
            nonlocal command_result_received
            command_result_received = True
            print(f"✅ Command result received: {data['command']}")
            
        @sio.event
        async def system_info(data):
            nonlocal system_info_received
            system_info_received = True
            print("✅ System info received")
            
        # Connect to the server
        await sio.connect(BACKEND_URL)
        
        # Wait for connection
        await asyncio.sleep(2)
        
        if connected:
            # Request system info
            await sio.emit('get_system_info', {})
            await asyncio.sleep(2)
            
            # Execute a command
            await sio.emit('execute_command_event', {
                'command': 'echo "Testing socket command"',
            })
            await asyncio.sleep(2)
            
            # Test AI analysis
            await sio.emit('ai_analyze', {
                'message': 'What is Linux?',
                'context': '',
                'api_key': 'test-key',
                'provider': 'openai'
            })
            await asyncio.sleep(2)
            
            # Disconnect
            await sio.disconnect()
            
            # Check results
            if system_info_received and command_result_received:
                print("✅ Socket.IO functionality tests passed")
            else:
                print("❌ Some Socket.IO tests failed")
                if not system_info_received:
                    print("  - System info not received")
                if not command_result_received:
                    print("  - Command result not received")
        else:
            print("❌ Socket.IO connection failed")
            
    except Exception as e:
        print(f"❌ Socket.IO test error: {str(e)}")

def run_tests():
    """Run all tests"""
    print("\n🔍 Testing KittyWarp Terminal Backend API")
    print("=" * 50)
    
    # Run unittest tests
    suite = unittest.TestLoader().loadTestsFromTestCase(KittyWarpTerminalTester)
    unittest.TextTestRunner(verbosity=2).run(suite)
    
    # Run Socket.IO tests
    print("\n🔍 Testing Socket.IO functionality")
    print("=" * 50)
    asyncio.run(test_socket_connection())
    
    print("\n✨ Backend tests completed")

if __name__ == "__main__":
    run_tests()