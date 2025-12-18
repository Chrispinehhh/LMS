'use client';

import React from 'react';
import { User, Mail, Phone, Lock, Bell, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Account Settings</h1>
                <p className="text-muted-foreground">Manage your account preferences and security.</p>
            </div>

            {/* Personal Information */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 bg-blue-100 dark:bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground">Personal Information</h2>
                </div>

                <form className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="firstName" className="text-foreground">First Name</Label>
                            <Input id="firstName" defaultValue="John" className="mt-1 bg-background border-input text-foreground" />
                        </div>
                        <div>
                            <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
                            <Input id="lastName" defaultValue="Doe" className="mt-1 bg-background border-input text-foreground" />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="email" className="text-foreground">Email Address</Label>
                        <Input id="email" type="email" defaultValue="john@example.com" className="mt-1 bg-background border-input text-foreground" />
                    </div>

                    <div>
                        <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                        <Input id="phone" type="tel" defaultValue="(555) 123-4567" className="mt-1 bg-background border-input text-foreground" />
                    </div>

                    <div className="pt-4">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-primary dark:hover:bg-primary/90 dark:text-primary-foreground">Save Changes</Button>
                    </div>
                </form>
            </div>

            {/* Security */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 bg-red-100 dark:bg-red-500/10 rounded-lg flex items-center justify-center">
                        <Lock className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground">Security</h2>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-foreground mb-2">Change Password</h3>
                        <p className="text-sm text-muted-foreground mb-4">Update your password to keep your account secure.</p>
                        <Button variant="outline" className="border-input hover:bg-accent text-foreground">Update Password</Button>
                    </div>

                    <div className="pt-6 border-t border-border">
                        <h3 className="font-semibold text-foreground mb-2">Two-Factor Authentication</h3>
                        <p className="text-sm text-muted-foreground mb-4">Add an extra layer of security to your account.</p>
                        <Button variant="outline" className="border-input hover:bg-accent text-foreground">Enable 2FA</Button>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 bg-purple-100 dark:bg-purple-500/10 rounded-lg flex items-center justify-center">
                        <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                        <div>
                            <p className="font-medium text-foreground">Order Updates</p>
                            <p className="text-sm text-muted-foreground">Receive notifications about your shipment status.</p>
                        </div>
                        <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-input" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                        <div>
                            <p className="font-medium text-foreground">Promotional Emails</p>
                            <p className="text-sm text-muted-foreground">Get updates about special offers and discounts.</p>
                        </div>
                        <input type="checkbox" className="h-5 w-5 rounded border-input" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                        <div>
                            <p className="font-medium text-foreground">SMS Notifications</p>
                            <p className="text-sm text-muted-foreground">Receive text messages for delivery updates.</p>
                        </div>
                        <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-input" />
                    </div>
                </div>
            </div>

            {/* Preferences */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 bg-green-100 dark:bg-green-500/10 rounded-lg flex items-center justify-center">
                        <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground">Preferences</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="language" className="text-foreground">Language</Label>
                        <Select defaultValue="en">
                            <SelectTrigger id="language" className="mt-1 bg-background border-input text-foreground">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Español</SelectItem>
                                <SelectItem value="fr">Français</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="timezone" className="text-foreground">Timezone</Label>
                        <Select defaultValue="est">
                            <SelectTrigger id="timezone" className="mt-1 bg-background border-input text-foreground">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="est">Eastern Time (ET)</SelectItem>
                                <SelectItem value="cst">Central Time (CT)</SelectItem>
                                <SelectItem value="mst">Mountain Time (MT)</SelectItem>
                                <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div>
    );
}
