'use client';

import React from 'react';
import { CreditCard, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentMethodsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Payment Methods</h1>
                    <p className="text-muted-foreground">Manage your saved credit cards and billing details.</p>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Add Payment Method
                </Button>
            </div>

            <div className="bg-card rounded-xl border border-border p-12 text-center shadow-sm">
                <div className="h-16 w-16 bg-blue-100 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No payment methods saved</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                    You haven&apos;t saved any payment methods yet. Add a card to speed up your checkout process.
                </p>
                <div className="flex justify-center gap-3">
                    <div className="h-8 w-12 bg-muted rounded border border-input flex items-center justify-center text-xs font-semibold text-muted-foreground">VISA</div>
                    <div className="h-8 w-12 bg-muted rounded border border-input flex items-center justify-center text-xs font-semibold text-muted-foreground">MC</div>
                </div>
            </div>
        </div>
    );
}
