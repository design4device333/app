#!/usr/bin/env python3
"""
ViPallá Backend API Testing Script
Tests all backend APIs for the delivery app
"""

import requests
import json
import sys
from datetime import datetime

# Backend URL from environment
BACKEND_URL = "https://mercado-express-7.preview.emergentagent.com/api"

class ViPallaAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.test_results = []
        self.created_order_id = None
        self.driver_id = None
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_health_check(self):
        """Test basic health check"""
        try:
            response = self.session.get(f"{self.base_url}/health")
            if response.status_code == 200:
                data = response.json()
                self.log_test("Health Check", True, f"API is healthy: {data}")
                return True
            else:
                self.log_test("Health Check", False, f"Health check failed with status {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Health Check", False, f"Health check failed: {str(e)}")
            return False
    
    def test_get_stores(self):
        """Test GET /api/stores - should return 4 stores"""
        try:
            response = self.session.get(f"{self.base_url}/stores")
            if response.status_code == 200:
                stores = response.json()
                if len(stores) == 4:
                    self.log_test("Get Stores", True, f"Retrieved {len(stores)} stores as expected")
                    return stores
                else:
                    self.log_test("Get Stores", False, f"Expected 4 stores, got {len(stores)}", stores)
                    return stores
            else:
                self.log_test("Get Stores", False, f"Failed with status {response.status_code}", response.text)
                return None
        except Exception as e:
            self.log_test("Get Stores", False, f"Exception: {str(e)}")
            return None
    
    def test_get_drivers(self):
        """Test GET /api/drivers - should return 1 driver"""
        try:
            response = self.session.get(f"{self.base_url}/drivers")
            if response.status_code == 200:
                drivers = response.json()
                if len(drivers) == 1:
                    self.log_test("Get Drivers", True, f"Retrieved {len(drivers)} driver as expected")
                    self.driver_id = drivers[0]['id']  # Store for later tests
                    return drivers
                else:
                    self.log_test("Get Drivers", False, f"Expected 1 driver, got {len(drivers)}", drivers)
                    if drivers:
                        self.driver_id = drivers[0]['id']
                    return drivers
            else:
                self.log_test("Get Drivers", False, f"Failed with status {response.status_code}", response.text)
                return None
        except Exception as e:
            self.log_test("Get Drivers", False, f"Exception: {str(e)}")
            return None
    
    def test_get_stats(self):
        """Test GET /api/stats - should show correct counts"""
        try:
            response = self.session.get(f"{self.base_url}/stats")
            if response.status_code == 200:
                stats = response.json()
                expected_keys = ['total_orders', 'pending_orders', 'active_orders', 'delivered_orders', 
                               'total_drivers', 'available_drivers', 'total_stores']
                
                missing_keys = [key for key in expected_keys if key not in stats]
                if not missing_keys:
                    self.log_test("Get Stats", True, f"Stats API working correctly", stats)
                    return stats
                else:
                    self.log_test("Get Stats", False, f"Missing keys in stats: {missing_keys}", stats)
                    return stats
            else:
                self.log_test("Get Stats", False, f"Failed with status {response.status_code}", response.text)
                return None
        except Exception as e:
            self.log_test("Get Stats", False, f"Exception: {str(e)}")
            return None
    
    def test_create_order(self, stores):
        """Test POST /api/orders - Create a new order"""
        if not stores:
            self.log_test("Create Order", False, "No stores available for testing")
            return None
            
        try:
            # Use first store for testing
            store = stores[0]
            order_data = {
                "store_id": store['id'],
                "store_name": store['name'],
                "customer_name": "María García",
                "customer_phone": "612345678",
                "customer_address": "Calle Mayor 123, Madrid",
                "items": [
                    {
                        "name": "Pizza Margarita",
                        "quantity": 2,
                        "notes": "Sin cebolla"
                    },
                    {
                        "name": "Coca Cola",
                        "quantity": 1,
                        "notes": "Fría"
                    }
                ],
                "payment_method": "bizum",
                "total_amount": 25.50,
                "notes": "Llamar al llegar"
            }
            
            response = self.session.post(f"{self.base_url}/orders", json=order_data)
            if response.status_code == 200:
                order = response.json()
                self.created_order_id = order['id']  # Store for later tests
                self.log_test("Create Order", True, f"Order created successfully with ID: {order['id']}")
                return order
            else:
                self.log_test("Create Order", False, f"Failed with status {response.status_code}", response.text)
                return None
        except Exception as e:
            self.log_test("Create Order", False, f"Exception: {str(e)}")
            return None
    
    def test_get_orders(self):
        """Test GET /api/orders - List all orders"""
        try:
            response = self.session.get(f"{self.base_url}/orders")
            if response.status_code == 200:
                orders = response.json()
                self.log_test("Get Orders", True, f"Retrieved {len(orders)} orders")
                return orders
            else:
                self.log_test("Get Orders", False, f"Failed with status {response.status_code}", response.text)
                return None
        except Exception as e:
            self.log_test("Get Orders", False, f"Exception: {str(e)}")
            return None
    
    def test_get_pending_orders(self):
        """Test GET /api/orders/pending - List pending orders"""
        try:
            response = self.session.get(f"{self.base_url}/orders/pending")
            if response.status_code == 200:
                orders = response.json()
                self.log_test("Get Pending Orders", True, f"Retrieved {len(orders)} pending orders")
                return orders
            else:
                self.log_test("Get Pending Orders", False, f"Failed with status {response.status_code}", response.text)
                return None
        except Exception as e:
            self.log_test("Get Pending Orders", False, f"Exception: {str(e)}")
            return None
    
    def test_accept_order(self):
        """Test POST /api/orders/{order_id}/accept - Accept order by driver"""
        if not self.created_order_id or not self.driver_id:
            self.log_test("Accept Order", False, "No order ID or driver ID available for testing")
            return None
            
        try:
            url = f"{self.base_url}/orders/{self.created_order_id}/accept"
            params = {
                "driver_id": self.driver_id,
                "driver_name": "Carlos Repartidor"
            }
            
            response = self.session.post(url, params=params)
            if response.status_code == 200:
                order = response.json()
                if order['status'] == 'accepted' and order['driver_id'] == self.driver_id:
                    self.log_test("Accept Order", True, f"Order accepted successfully by driver {self.driver_id}")
                    return order
                else:
                    self.log_test("Accept Order", False, f"Order status or driver not updated correctly", order)
                    return order
            else:
                self.log_test("Accept Order", False, f"Failed with status {response.status_code}", response.text)
                return None
        except Exception as e:
            self.log_test("Accept Order", False, f"Exception: {str(e)}")
            return None
    
    def test_update_order_status(self):
        """Test POST /api/orders/{order_id}/status - Update order status"""
        if not self.created_order_id:
            self.log_test("Update Order Status", False, "No order ID available for testing")
            return None
            
        try:
            # Test different status updates
            statuses_to_test = ["picking_up", "delivering", "delivered"]
            
            for status in statuses_to_test:
                url = f"{self.base_url}/orders/{self.created_order_id}/status"
                params = {"status": status}
                
                response = self.session.post(url, params=params)
                if response.status_code == 200:
                    order = response.json()
                    if order['status'] == status:
                        self.log_test(f"Update Status to {status}", True, f"Status updated to {status} successfully")
                    else:
                        self.log_test(f"Update Status to {status}", False, f"Status not updated correctly", order)
                        return False
                else:
                    self.log_test(f"Update Status to {status}", False, f"Failed with status {response.status_code}", response.text)
                    return False
            
            return True
        except Exception as e:
            self.log_test("Update Order Status", False, f"Exception: {str(e)}")
            return None
    
    def test_get_payment_info(self):
        """Test GET /api/payment-info - Get payment information"""
        try:
            response = self.session.get(f"{self.base_url}/payment-info")
            if response.status_code == 200:
                payment_info = response.json()
                expected_keys = ['bizum_phone', 'card_info', 'cash_note']
                
                missing_keys = [key for key in expected_keys if key not in payment_info]
                if not missing_keys:
                    self.log_test("Get Payment Info", True, f"Payment info retrieved successfully", payment_info)
                    return payment_info
                else:
                    self.log_test("Get Payment Info", False, f"Missing keys: {missing_keys}", payment_info)
                    return payment_info
            else:
                self.log_test("Get Payment Info", False, f"Failed with status {response.status_code}", response.text)
                return None
        except Exception as e:
            self.log_test("Get Payment Info", False, f"Exception: {str(e)}")
            return None
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print(f"🚀 Starting ViPallá Backend API Tests")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Basic health check
        if not self.test_health_check():
            print("❌ Health check failed - aborting tests")
            return False
        
        # Test existing data
        stores = self.test_get_stores()
        drivers = self.test_get_drivers()
        self.test_get_stats()
        self.test_get_payment_info()
        
        # Test order creation and management
        order = self.test_create_order(stores)
        self.test_get_orders()
        self.test_get_pending_orders()
        
        # Test order flow
        self.test_accept_order()
        self.test_update_order_status()
        
        # Final stats check
        print("\n" + "=" * 60)
        print("📊 Final Test Summary:")
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"✅ Passed: {passed}/{total}")
        print(f"❌ Failed: {total - passed}/{total}")
        
        if total - passed > 0:
            print("\n🔍 Failed Tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   • {result['test']}: {result['message']}")
        
        return passed == total

def main():
    """Main test execution"""
    tester = ViPallaAPITester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All tests passed!")
        sys.exit(0)
    else:
        print("\n💥 Some tests failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()