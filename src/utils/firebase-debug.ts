import { auth } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

export const testFirebaseConnection = async () => {
  try {
    console.log('🌐 Testing Firebase connection...')

    // Test basic auth state
    const user = auth.currentUser
    console.log('Current user:', user)

    // Test Firestore connection
    const testQuery = collection(db, 'users')
    const testSnapshot = await getDocs(testQuery)
    console.log('Users collection access test:', testSnapshot.empty ? 'Empty but accessible' : `${testSnapshot.size} documents found`)

    return true
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error)
    return false
  }
}
