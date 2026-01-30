import connectToDatabase from '@/lib/mongodb';
import Restaurant from '@/models/Restaurant';

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