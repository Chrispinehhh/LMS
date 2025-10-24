# apps/notifications/views.py
from rest_framework import views, status
from rest_framework.response import Response
from .serializers import SMSSerializer
from .services import send_sms
from apps.core.permissions import IsAdminUser


class SendTestSMSView(views.APIView):
    """
    An endpoint for admins to send a test SMS message.
    """

    permission_classes = [IsAdminUser]  # Only admins can use this!
    serializer_class = SMSSerializer

    def post(self, request, *args, **kwargs):
        serializer = SMSSerializer(data=request.data)
        if serializer.is_valid():
            to_number = serializer.validated_data["to_number"]
            body = serializer.validated_data["body"]

            message_sid = send_sms(to_number, body)

            if message_sid:
                return Response(
                    {"status": "success", "message_sid": message_sid},
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"status": "error", "message": "Failed to send SMS."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
