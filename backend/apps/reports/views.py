from rest_framework import views, status
from rest_framework.response import Response
from django.db.models import Count, Sum
from django.db.models.functions import TruncDate
from datetime import datetime, timedelta

from apps.core.permissions import IsAdminOrManagerUser
from apps.orders.models import Job  # <-- Import Job instead of Order
from apps.transportation.models import Shipment
from apps.users.models import User
# REMOVED: from logistics.models import Product # This line is no longer needed

class DashboardSummaryView(views.APIView):
    """
    Provides a high-level summary of key metrics for the dashboard.
    Updated to use the Job model.
    """
    permission_classes = [IsAdminOrManagerUser]

    def get(self, request, *args, **kwargs):
        total_customers = User.objects.filter(role=User.Role.CUSTOMER).count()
        total_jobs = Job.objects.count()  # <-- Changed from total_orders
        shipments_in_transit = Shipment.objects.filter(status=Shipment.ShipmentStatus.IN_TRANSIT).count()

        # Calculate revenue for the last 30 days from COMPLETED jobs
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_sales = Job.objects.filter(
            status=Job.JobStatus.COMPLETED,
            # We assume the completion date is related to the shipment's actual_arrival
            shipment__actual_arrival__gte=thirty_days_ago
        ).aggregate(
            total_revenue=Sum('invoice__total_amount')
        )['total_revenue'] or 0

        summary_data = {
            'total_customers': total_customers,
            'total_jobs': total_jobs,  # <-- Changed from total_orders
            'shipments_in_transit': shipments_in_transit,
            'recent_revenue_30d': f"{recent_sales:.2f}",
            # 'total_products' is no longer relevant to this business model
        }

        return Response(summary_data, status=status.HTTP_200_OK)

class RecentJobsChartView(views.APIView):
    """
    Provides data for a chart of jobs created over the last N days.
    Renamed from RecentOrdersChartView.
    """
    permission_classes = [IsAdminOrManagerUser]

    def get(self, request, *args, **kwargs):
        try:
            days_ago = int(request.query_params.get('days', 7))
        except (ValueError, TypeError):
            days_ago = 7

        start_date = datetime.now() - timedelta(days=days_ago)
        
        # Query jobs, group by date, and count them
        jobs_by_day = Job.objects.filter(
            created_at__gte=start_date  # Use created_at from BaseModel
        ).annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            count=Count('id')
        ).order_by('date')

        date_map = {item['date'].strftime('%Y-%m-%d'): item['count'] for item in jobs_by_day}
        
        chart_data = []
        # Generate data for the last 'days_ago' + today
        for i in range(days_ago + 1):
            date = (start_date + timedelta(days=i)).date()
            date_str = date.strftime('%Y-%m-%d')
            chart_data.append({
                'date': date_str,
                'short_date': date.strftime('%b %d'), 
                'jobs': date_map.get(date_str, 0) # <-- Changed to 'jobs'
            })

        return Response(chart_data, status=status.HTTP_200_OK)

class JobStatusReportView(views.APIView):
    """
    Provides a report on job counts and revenue grouped by status.
    Renamed from SalesReportView.
    """
    permission_classes = [IsAdminOrManagerUser]

    def get(self, request, *args, **kwargs):
        jobs_by_status = Job.objects.values('status').annotate(
            job_count=Count('id'),
            total_revenue=Sum('invoice__total_amount')
        ).order_by('status')

        return Response(jobs_by_status, status=status.HTTP_200_OK)