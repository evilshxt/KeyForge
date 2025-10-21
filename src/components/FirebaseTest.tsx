import React from 'react'
import { auth, db, rtdb } from '../firebase'

const FirebaseTest: React.FC = () => {
  const testFirebaseConnection = async () => {
    try {
      console.log('Testing Firebase Auth...')
      console.log('Auth instance:', auth)

      console.log('Testing Firestore...')
      console.log('Firestore instance:', db)

      console.log('Testing Realtime Database...')
      console.log('RTDB instance:', rtdb)

      // Try to get current user
      const currentUser = auth.currentUser
      console.log('Current user:', currentUser)

    } catch (error) {
      console.error('Firebase connection test failed:', error)
    }
  }

  React.useEffect(() => {
    testFirebaseConnection()
  }, [])

  return (
    <div className="p-4 bg-slate-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Firebase Connection Test</h3>
      <button
        onClick={testFirebaseConnection}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
      >
        Test Connection
      </button>
      <p className="text-sm text-slate-400 mt-2">
        Check browser console for Firebase connection details
      </p>
    </div>
  )
}

export default FirebaseTest
