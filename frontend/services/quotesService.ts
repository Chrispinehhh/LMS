import apiClient from './apiClient';

export interface QuoteConfig {
    id: number;
    base_rate_per_mile: string;
    service_multipliers: {
        RESIDENTIAL_MOVING: string;
        OFFICE_RELOCATION: string;
        SMALL_DELIVERIES: string;
        PALLET_DELIVERY: string;
    };
    weight_factor: string;
    minimum_charge: string;
}

export const getQuoteConfig = async (): Promise<QuoteConfig> => {
    const response = await apiClient.get('/quotes/config/');
    return response.data;
};

export const updateQuoteConfig = async (config: Partial<QuoteConfig>): Promise<QuoteConfig> => {
    const response = await apiClient.put('/quotes/config/', config);
    return response.data;
};

export const calculatePreviewQuote = async (params: {
    origin: string;
    destination: string;
    job_type: string;
    service_type: string;
    weight: number;
    room_count?: number;
    pallet_count?: number;
}) => {
    const response = await apiClient.post('/quotes/calculate/', params);
    return response.data;
};
