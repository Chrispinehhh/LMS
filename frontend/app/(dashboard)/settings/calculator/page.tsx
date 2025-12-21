'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, TrendingUp, Package, Save, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getQuoteConfig, updateQuoteConfig, calculatePreviewQuote, QuoteConfig } from '@/services/quotesService';

export default function CalculatorSettingsPage() {
    const [config, setConfig] = useState<QuoteConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [previewQuote, setPreviewQuote] = useState<string | null>(null);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const data = await getQuoteConfig();
            setConfig(data);
        } catch (error) {
            toast.error('Failed to load settings');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!config) return;

        setIsSaving(true);
        try {
            await updateQuoteConfig(config);
            toast.success('Settings saved successfully!');
        } catch (error) {
            toast.error('Failed to save settings');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        if (confirm('Reset to default values?')) {
            loadConfig();
            toast.success('Settings reset');
        }
    };

    const calculatePreview = async () => {
        try {
            const result = await calculatePreviewQuote({
                origin: 'New York',
                destination: 'Boston',
                job_type: 'RESIDENTIAL',
                service_type: 'RESIDENTIAL_MOVING',
                weight: 500,
                room_count: 3,
            });
            setPreviewQuote(result.estimated_price);
        } catch (error) {
            console.error('Preview calculation failed:', error);
        }
    };

    useEffect(() => {
        if (config) {
            calculatePreview();
        }
    }, [config]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!config) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Calculator className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white">Quote Calculator Settings</h1>
                            <p className="text-gray-400 mt-1">Configure pricing parameters for customer quotes</p>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Settings */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Base Pricing Card */}
                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <DollarSign className="w-6 h-6 text-emerald-400" />
                                <h2 className="text-2xl font-bold text-white">Base Pricing</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Base Rate per Mile ($)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={config.base_rate_per_mile}
                                        onChange={(e) => setConfig({ ...config, base_rate_per_mile: e.target.value })}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Minimum Charge ($)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={config.minimum_charge}
                                        onChange={(e) => setConfig({ ...config, minimum_charge: e.target.value })}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Weight Factor (per lb)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        value={config.weight_factor}
                                        onChange={(e) => setConfig({ ...config, weight_factor: e.target.value })}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Service Multipliers Card */}
                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <TrendingUp className="w-6 h-6 text-purple-400" />
                                <h2 className="text-2xl font-bold text-white">Service Multipliers</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Residential Moving (×)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={config.service_multipliers.RESIDENTIAL_MOVING}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            service_multipliers: {
                                                ...config.service_multipliers,
                                                RESIDENTIAL_MOVING: e.target.value
                                            }
                                        })}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Office Relocation (×)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={config.service_multipliers.OFFICE_RELOCATION}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            service_multipliers: {
                                                ...config.service_multipliers,
                                                OFFICE_RELOCATION: e.target.value
                                            }
                                        })}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Small Deliveries (×)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={config.service_multipliers.SMALL_DELIVERIES}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            service_multipliers: {
                                                ...config.service_multipliers,
                                                SMALL_DELIVERIES: e.target.value
                                            }
                                        })}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Pallet Delivery (×)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={config.service_multipliers.PALLET_DELIVERY}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            service_multipliers: {
                                                ...config.service_multipliers,
                                                PALLET_DELIVERY: e.target.value
                                            }
                                        })}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-blue-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Save className="w-5 h-5" />
                                {isSaving ? 'Saving...' : 'Save Settings'}
                            </button>

                            <button
                                onClick={handleReset}
                                className="bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 border border-white/20 flex items-center gap-2"
                            >
                                <RotateCcw className="w-5 h-5" />
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Preview Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-gradient-to-br from-orange-500/20 to-purple-500/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl sticky top-8">
                            <div className="flex items-center gap-3 mb-6">
                                <Package className="w-6 h-6 text-orange-400" />
                                <h2 className="text-2xl font-bold text-white">Quote Preview</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <p className="text-sm text-gray-400">Example Route</p>
                                    <p className="text-white font-medium">New York → Boston</p>
                                </div>

                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <p className="text-sm text-gray-400">Service Type</p>
                                    <p className="text-white font-medium">Residential Moving</p>
                                </div>

                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <p className="text-sm text-gray-400">Details</p>
                                    <p className="text-white font-medium">500 lbs • 3 rooms</p>
                                </div>

                                <div className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl p-6 border border-emerald-500/30 mt-6">
                                    <p className="text-sm text-emerald-300 mb-2">Estimated Price</p>
                                    <p className="text-4xl font-black text-white">
                                        ${previewQuote || '---'}
                                    </p>
                                </div>

                                <p className="text-xs text-gray-500 text-center mt-4">
                                    Preview updates automatically as you adjust settings
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
