# apps/billing/views.py
import stripe
from django.conf import settings
from rest_framework import status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Invoice
from apps.core.permissions import IsAdminOrManagerUser

stripe.api_key = settings.STRIPE_SECRET_KEY


class CreatePaymentIntentView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            invoice_id = request.data.get("invoice_id")
            invoice = Invoice.objects.get(id=invoice_id)

            # Ensure the user making the request is the customer on the invoice
            # or an admin/manager
            if not (
                request.user == invoice.order.customer
                or request.user.role in ["ADMIN", "MANAGER"]
            ):
                return Response(
                    {"error": "You are not authorized to pay for this invoice."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            if invoice.status == "PAID":
                return Response(
                    {"error": "This invoice has already been paid."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Create a PaymentIntent with the order amount and currency
            intent = stripe.PaymentIntent.create(
                amount=int(invoice.total_amount * 100),  # Amount in cents
                currency="usd",
                description=f"Invoice {invoice.id} for Order {invoice.order.id}",
                metadata={"invoice_id": str(invoice.id)},
            )

            # Save the payment intent ID to our invoice
            invoice.stripe_payment_intent_id = intent.id
            invoice.save()

            return Response(
                {"clientSecret": intent.client_secret}, status=status.HTTP_200_OK
            )

        except Invoice.DoesNotExist:
            return Response(
                {"error": "Invoice not found."}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class StripeWebhookView(views.APIView):
    # No permissions needed, as Stripe will be the one calling this
    permission_classes = []

    def post(self, request, *args, **kwargs):
        payload = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")
        endpoint_secret = settings.STRIPE_WEBHOOK_SECRET
        event = None

        try:
            event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
        except ValueError as e:
            # Invalid payload
            return Response(status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError as e:
            # Invalid signature
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # Handle the event
        if event["type"] == "payment_intent.succeeded":
            payment_intent = event["data"]["object"]
            invoice_id = payment_intent["metadata"].get("invoice_id")

            try:
                invoice = Invoice.objects.get(id=invoice_id)
                invoice.status = Invoice.InvoiceStatus.PAID
                invoice.save()

                # Here you would trigger notifications or next steps
                print(f"Invoice {invoice_id} has been paid successfully!")

            except Invoice.DoesNotExist:
                # Log an error, the invoice from the metadata was not found
                print(
                    f"ERROR: Webhook received for non-existent invoice ID: {invoice_id}"
                )

        else:
            print(f"Unhandled event type {event['type']}")

        return Response(status=status.HTTP_200_OK)
