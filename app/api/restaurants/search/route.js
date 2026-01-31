import connectToDatabase from '@/lib/mongodb';
import Restaurant from '@/models/Restaurant';
import {assessRisk} from '@/lib/riskAssessment';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        // Extract search parameters from the request URL
        const {searchParams} = new URL(request.url);
        const searchName = searchParams.get('name');
        
        // Validate the searchName parameter
        if(!searchName || searchName.trimEnd() == '') {
            return NextResponse.json(
                {success: false,
                    error: 'Search name is required'},
                    {status: 400}
            );
        }
        
        // Connect to the database
        await connectToDatabase();

        // Perform a case-insensitive search for restaurants matching the name
        const restaurants = await Restaurant.find({
            name: {
                $regex: searchName,
                $options: 'i'
            }
        }).sort({submittedDate: -1});

        if (restaurants.length === 0){
            return NextResponse.json({
                success: true,
                data: [],
                message: 'No restaurants found matching the search criteria'
            });
        }
        const restaurantWithRisk = restaurants.map(restaurant => {
            const risk = assessRisk(restaurant.oilType);

            return {
                ...restaurant.toObject(),
                risk
            };
        });
        //Return results
        return NextResponse.json({
            success: true,
            data: restaurantWithRisk,
            count: restaurantWithRisk.length
        });
    } catch (error) {
        console.error('Error searching restaurants:', error);
        return NextResponse.json(
            {success: false,
                error:error.message},
            {status: 500}
        );
    }
}