import connectToDatabase from '@/lib/mongodb';
import Restaurant from '@/models/Restaurant';
import { assessRisk } from '@/lib/riskAssessment';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchName = searchParams.get('name');
    
    if (!searchName || searchName.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Search term is required' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Search by name (case-insensitive)
    const restaurants = await Restaurant.find({ 
      name: { $regex: searchName.toLowerCase(), $options: 'i' } 
    }).sort({ submittedDate: -1 });
    
    if (restaurants.length === 0) {
      return NextResponse.json({ 
        success: true, 
        data: [], 
        message: 'No restaurants found' 
      });
    }
    
    // ===== ADD RISK & VERIFICATION INFO =====
    const restaurantsWithInfo = restaurants.map(r => {
      // Use consensus oil type if verified, otherwise use most recent vote
      const oilType = r.consensusOilType || r.votes[r.votes.length - 1]?.oilType || 'Unknown';
      
      return {
        ...r.toObject(),
        oilType,
        risk: assessRisk(oilType),
        // ===== VERIFICATION INFO =====
        verified: r.verified,
        voteCount: r.votes.length,
        verificationStatus: r.verified ? 'Community Verified ✅' : `Needs ${2 - r.votes.length} more vote${2 - r.votes.length === 1 ? '' : 's'}`,
        verificationBadge: r.verified ? 'verified' : 'unverified'
      };
    });
    
    return NextResponse.json({
      success: true,
      data: restaurantsWithInfo,
      count: restaurantsWithInfo.length
    });
    
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}