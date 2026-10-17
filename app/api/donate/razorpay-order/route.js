import { NextResponse } from "next/server";
import { getRazorpay, isRazorpayConfigured } from "@/lib/payments/razorpay";

export async function POST(request) {
  try {
    const { amount } = await request.json();   // amount in ₹
    if (!amount || amount < 1) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    if (!isRazorpayConfigured()) {
      return NextResponse.json(
        { error: "Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your environment variables." },
        { status: 503 }
      );
    }

    const order = await getRazorpay().orders.create({
      amount:   Math.round(amount * 100),  // Razorpay uses paise
      currency: "INR",
      receipt:  `hm-${Date.now()}`,
    });

    return NextResponse.json({ id: order.id, amount: order.amount }, { status: 200 });
  } catch (err) {
    console.error("Razorpay order error:", err);
    return NextResponse.json({ error: err.message || "Could not create order" }, { status: 500 });
  }
}
