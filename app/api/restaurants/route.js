import connectToDatabase from '@/lib/mongodb';
import Restaurant from '@/models/Restaurant';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, oilType } = body;

        //Validate input
        if (!name || !oilType) {
            return NextResponse.json(
                { success:false, error: 'Name and oilType are required fields.' }, 
                { status: 400 }
            );
        }
        //Database connector
        await connectToDatabase();

        const restaurant = await Restaurant.create({
            name,
            oilType
        });

        return NextResponse.json(
            {
                success:true,
                data: restaurant
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating restaurant:', error);

        return NextResponse.json(
            {
                success:false,
                error: error.message
            },
            { status: 500}
        );
    }
}    

