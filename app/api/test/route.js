import connectToDatabase from '@/lib/mongodb';
import Restaurant from '@/models/Restaurant';
import { assessRisk } from '@/lib/riskAssessment';

/*
export async function GET() {
  try {
    await connectToDatabase();
    
    // Try creating a test restaurant
    const testRestaurant = await Restaurant.create({
      name: 'Test Diner',
      oilType: 'Canola'
    });
    
    return Response.json({ 
      success: true,
      message: 'Model works!',
      restaurant: testRestaurant
    });
    
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}


// Test different oils
console.log(assessRisk('Peanut'));
// { riskLevel: 'High', message: '...', color: 'red' }

console.log(assessRisk('CANOLA'));
// { riskLevel: 'Low', message: '...', color: 'green' }

console.log(assessRisk('Vegetable'));
// { riskLevel: 'Medium', message: '...', color: 'orange' }
*/