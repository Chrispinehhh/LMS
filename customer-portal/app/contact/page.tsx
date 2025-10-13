// customer-portal/app/contact/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

type FormData = {
  name: string;
  email: string;
  message: string;
};

export default function ContactPage() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log(data);
    toast.success("Thank you for your message! We'll be in touch soon.");
    reset();
  };

  return (
    // --- THIS IS THE FIX: Removed 'relative' from this div ---
    <div className="bg-gray-900 text-white">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/hero-background.jpg')" }}></div>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>

      {/* The 'relative' class is needed here to stack the content on top of the background */}
      <div className="relative z-10 container mx-auto px-6 py-24">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Get In Touch
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-300">
            Have a question or a special request? We&apos;re here and ready to help.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="mt-20 grid md:grid-cols-2 gap-12 items-start">
          
          {/* Column 1: Contact Information */}
          <div className="space-y-10">
            <div>
              <h2 className="text-3xl font-bold">Contact Information</h2>
              <p className="mt-2 text-gray-400">Find us at our office or reach out via phone or email for a prompt response.</p>
            </div>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-white/10 p-3 rounded-lg"><MapPin className="h-6 w-6 text-blue-400" /></div>
                <div>
                  <h3 className="font-semibold text-lg">Our Office</h3>
                  <p className="text-gray-300">123 Logistics Ave, Suite 100<br />Metropolis, USA 12345</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-white/10 p-3 rounded-lg"><Phone className="h-6 w-6 text-blue-400" /></div>
                <div>
                  <h3 className="font-semibold text-lg">Phone</h3>
                  <p className="text-gray-300">(123) 456-7890</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-white/10 p-3 rounded-lg"><Mail className="h-6 w-6 text-blue-400" /></div>
                <div>
                  <h3 className="font-semibold text-lg">Email</h3>
                  <p className="text-gray-300">contact@logipro.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Contact Form with Glassmorphism */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                <Input 
                  id="name" 
                  {...register("name", { required: "Name is required." })}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 mt-2" 
                  placeholder="John Doe"
                />
                {errors.name && <p className="text-sm text-red-400 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  {...register("email", { required: "Email is required." })} 
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 mt-2" 
                  placeholder="you@example.com"
                />
                {errors.email && <p className="text-sm text-red-400 mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="message" className="text-gray-300">Message</Label>
                <Textarea 
                  id="message" 
                  rows={5} 
                  {...register("message", { required: "Message is required." })} 
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 mt-2"
                  placeholder="Your message..." 
                />
                {errors.message && <p className="text-sm text-red-400 mt-1">{errors.message.message}</p>}
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6">
                Send Message <Send className="ml-2 h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}