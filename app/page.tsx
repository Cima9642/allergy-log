'use client';
import { useState } from 'react';

interface Restaurant {
  _id: string;
  name: string;
  oitType: string;
  submittedDate: string;
  __v?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface RestaurantWithRisk extends Restaurant {
  risk: RiskAssessment;
}

interface RiskAssessment {
  riskLevel: string;
  message: string;
  color: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

const OIL_TYPES = [
    'Peanut',
    'Canola',
    'Vegetable',
    'Olive',
    'Coconut',
    'Sunflower',
    'Sesame',
    'Avocado',
    'Grapeseed',
    'Walnut',
    'Almond',
    'Corn',
    'Soybean',
    'Mixed/Other'
] as const;

type OilType = typeof OIL_TYPES[number];