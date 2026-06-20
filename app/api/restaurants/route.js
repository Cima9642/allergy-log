import connectToDatabase from '@/lib/mongodb';
import Restaurant from '@/models/Restaurant';
import { NextResponse } from 'next/server';

// ===== RATE LIMITING =====
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const oneHourAgo = now - 3600000; // 1 hour
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }
  
  // Clean old submissions (older than 1 hour)
  const submissions = rateLimitMap
    .get(ip)
    .filter(time => time > oneHourAgo);
  
  rateLimitMap.set(ip, submissions);
  
  // Allow 5 submissions per hour per IP
  return submissions.length < 5;
}

function recordSubmission(ip) {
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }
  rateLimitMap.get(ip).push(Date.now());
}

// ===== GET CLIENT IP =====
function getClientIp(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

// ===== POST: Add Restaurant =====
export async function POST(request) {
  try {
    const ip = getClientIp(request);
    
    // ===== CHECK RATE LIMIT =====
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many submissions. Please try again later. (Limit: 5 per hour)'
        },
        { status: 429 }
      );
    }
    
    // ===== VALIDATE INPUT =====
    const body = await request.json();
    const { name, oilType } = body;
    
    if (!name || !oilType) {
      return NextResponse.json(
        { success: false, error: 'Restaurant name and oil type are required' },
        { status: 400 }
      );
    }
    
    if (name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Restaurant name must be at least 2 characters' },
        { status: 400 }
      );
    }
    
    // ===== CONNECT TO DATABASE =====
    await connectToDatabase();
    
    // ===== NORMALIZE NAME =====
    const normalizedName = name.trim().toLowerCase();
    
    // ===== CROWDSOURCED VERIFICATION LOGIC =====
    let restaurant = await Restaurant.findOne({ name: normalizedName });
    
    if (restaurant) {
      // Restaurant exists - add vote
      
      // Check if this IP already voted for this restaurant
      const existingVote = restaurant.votes.find(
        v => v.ipAddress === ip && v.oilType === oilType
      );
      
      if (existingVote) {
        // Same IP voting twice for same oil - reject to prevent abuse
        return NextResponse.json(
          { 
            success: false, 
            error: 'You have already submitted this restaurant with this oil type'
          },
          { status: 400 }
        );
      }
      
      // Add new vote
      restaurant.votes.push({
        oilType,
        ipAddress: ip,
        timestamp: new Date()
      });
      
      // ===== CHECK IF CONSENSUS REACHED =====
      // Count votes for each oil type
      const oilVoteCounts = {};
      restaurant.votes.forEach(vote => {
        oilVoteCounts[vote.oilType] = (oilVoteCounts[vote.oilType] || 0) + 1;
      });
      
      // Find oil with most votes
      const topOil = Object.entries(oilVoteCounts).sort(
        (a, b) => b[1] - a[1]
      )[0];
      
      // If top oil has 2+ votes, mark verified
      if (topOil && topOil[1] >= 2) {
        restaurant.verified = true;
        restaurant.consensusOilType = topOil[0];
      } else {
        restaurant.verified = false;
        restaurant.consensusOilType = null;
      }
      
      await restaurant.save();
      
      // Record submission for rate limiting
      recordSubmission(ip);
      
      return NextResponse.json(
        { 
          success: true, 
          data: restaurant,
          message: restaurant.verified 
            ? `✅ Community Verified! ${restaurant.consensusOilType} oil confirmed by ${restaurant.votes.length} people`
            : `Vote recorded! Needs ${2 - restaurant.votes.length} more verification to be trusted`
        },
        { status: 200 }
      );
      
    } else {
      // New restaurant - create it
      restaurant = await Restaurant.create({
        name: normalizedName,
        votes: [
          {
            oilType,
            ipAddress: ip,
            timestamp: new Date()
          }
        ],
        verified: false,
        consensusOilType: null
      });
      
      // Record submission for rate limiting
      recordSubmission(ip);
      
      return NextResponse.json(
        { 
          success: true, 
          data: restaurant,
          message: 'Restaurant submitted! ⏳ Waiting for 1 more verification from someone else to confirm.'
        },
        { status: 201 }
      );
    }
    
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
}

// ===== OTHER METHODS =====
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}