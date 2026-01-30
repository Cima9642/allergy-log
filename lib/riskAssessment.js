export function assessRisk(oilType) {
    
    const oil = oilType.toLowerCase().trim();
    
    
    const highRisk = ['peanut'];
    const mediumRisk = ['vegetable', 'mixed/other'];
    const lowRisk = ['canola', 'olive', 'coconut', 'sunflower', 'sesame', 'avocado', 'grapeseed', 'walnut', 'almond', 'corn', 'soybean'];
    
    // Risk assessment logic 
    if (highRisk.includes(oil)) {
        return {
            riskLevel: 'High',
            message: 'High Risk - Restaurant uses peanut oil. Avoid if you have a peanut allergy.',
            color: 'red'
        };
    }
    
    if (mediumRisk.includes(oil)) {
        return {
            riskLevel: 'Medium',
            message: 'Medium Risk - Restaurant uses vegetable or mixed oil. Exercise caution if you have multiple allergies.',
            color: 'orange'
        };
    }
    
    if (lowRisk.includes(oil)) {
        return {
            riskLevel: 'Low',
            message: 'Low Risk - Restaurant uses oils with lower allergenic potential.',
            color: 'green'
        };
    }
    
    // Default case
    return {
        riskLevel: 'Unknown',
        message: 'Unknown Risk - Oil type not recognized. Please verify with the restaurant.',
        color: 'gray'
    };
}  