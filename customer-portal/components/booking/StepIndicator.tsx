import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
    number: number;
    title: string;
}

interface StepIndicatorProps {
    steps: Step[];
    currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
                {steps.map((step, index) => (
                    <React.Fragment key={step.number}>
                        {/* Step Circle */}
                        <div className="flex flex-col items-center flex-1">
                            <div
                                className={cn(
                                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300',
                                    step.number < currentStep
                                        ? 'bg-green-500 text-white'
                                        : step.number === currentStep
                                            ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                                            : 'bg-gray-200 text-gray-500'
                                )}
                            >
                                {step.number < currentStep ? (
                                    <Check className="h-5 w-5" />
                                ) : (
                                    step.number
                                )}
                            </div>
                            <span
                                className={cn(
                                    'text-sm font-medium mt-2 text-center',
                                    step.number <= currentStep ? 'text-gray-900' : 'text-gray-500'
                                )}
                            >
                                {step.title}
                            </span>
                        </div>

                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                            <div className="flex-1 h-0.5 mx-2 mb-8">
                                <div
                                    className={cn(
                                        'h-full transition-all duration-300',
                                        step.number < currentStep ? 'bg-green-500' : 'bg-gray-200'
                                    )}
                                />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}
